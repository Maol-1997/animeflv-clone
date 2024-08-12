import * as cheerio from 'cheerio'
import { Browser, Page, firefox } from 'playwright-firefox'
import fs from 'fs'

interface Video {
  link: string;
  url: string;
  date: number;
  lastResolvedUrl: string;
  lastResolvedDate: number;
}

interface Anime {
  link: string;
  date: number;
  episodes: any[];
  animeInfo: any[];
  description: string;
  listAnmRel: RelatedAnime[];
}

interface RelatedAnime {
  title: string;
  link: string;
}

interface BrowseAnime {
  title: string;
  link: string;
  img: string;
  description: string;
}

interface BrowseAnimesCache {
  page: number;
  list: BrowseAnime[];
  lastUpdate: number;
  pageMaxId: number;
}

let videoDB: Video[] = []
let animeDB: Anime[] = []
const browseAnimes: BrowseAnimesCache[] = []
let pageMaxId: number = 0

// Load databases
function loadDatabases (): void {
  videoDB = JSON.parse(fs.readFileSync('./tools/mediaLinks.json', 'utf8') || '[]')
  animeDB = JSON.parse(fs.readFileSync('./tools/animeDB.json', 'utf8') || '[]')
}

loadDatabases()

async function fetchHTML (url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch ${url}`)
    return await response.text()
  } catch (error) {
    console.error(error)
    return null
  }
}

async function getVideo (link: string): Promise<string> {
  const video = videoDB.find(v => v.link === link)
  if (video && video.date + 1000 * 60 * 60 * 24 > Date.now()) {
    if (video.lastResolvedDate + 1000 * 60 * 5 > Date.now()) {
      return video.lastResolvedUrl
    }
    if (video.url.includes('streamtape')) {
      return await resolveStreamtape(link, video.url, 'update')
    }
    if (video.url.includes('streamwish')) {
      return await resolveStreamWish(link, video.url, 'update')
    }
  }

  const htmlData = await fetchHTML(`https://www3.animeflv.net/ver/${link}`)
  if (!htmlData) return ''

  const $ = cheerio.load(htmlData)
  try {
    const script = $('script').toArray().find(s => $(s).html()?.includes('var videos ='))
    const videoScriptHtml = $(script).html()
    const videos = JSON.parse(videoScriptHtml?.split('var videos = ')[1].split(';')[0] || '[]')
    const streamWishVideo = videos.SUB.find((v: any) => v.server === 'sw')
    if (streamWishVideo) {
      return await resolveStreamWish(link, streamWishVideo.code.replace('/e/', '/f/') + '_h', 'new')
    }
    const streamtapeVideo = videos.SUB.find((v: any) => v.server === 'stape')
    if (streamtapeVideo) {
      return await resolveStreamtape(link, streamtapeVideo.code, 'new')
    }
  } catch (e) {
    console.error('Error resolving video', e)
  }
  return ''
}

async function getAnimeEpisodes (link: string): Promise<{
  animeInfo: any[];
  episodes: any[];
  description: string;
  listAnimeRel: RelatedAnime[];
}> {
  const anime = animeDB.find(a => a.link === link)
  if (anime && anime.date + 1000 * 60 * 60 > Date.now()) {
    return {
      animeInfo: anime.animeInfo,
      episodes: anime.episodes,
      description: anime.description,
      listAnimeRel: anime.listAnmRel
    }
  }

  const htmlData = await fetchHTML(`https://www3.animeflv.net/anime/${link}`)
  if (!htmlData) return { animeInfo: [], episodes: [], description: '', listAnimeRel: [] }

  const $ = cheerio.load(htmlData)
  const script = $('script').toArray().find(s => $(s).html()?.includes('var episodes ='))
  if (!script || !script.childNodes || script.childNodes.length === 0) {
    throw new Error('Episodes script not found')
  }
  const scriptContent = script.childNodes[0] && (script.childNodes[0] as unknown as Text).nodeValue || ''
  const animeInfo = JSON.parse(scriptContent.split('var anime_info = ')[1].split('];')[0] + ']' || '[]')
  const episodes = JSON.parse(scriptContent.split('var episodes = ')[1].split('];')[0] + ']' || '[]')
  const description = $('.Description p').text()
  const listAnmRel = $('.ListAnmRel li').map((_, el) => {
    const href = $(el).find('a').attr('href')
    return {
      title: $(el).last().text(),
      link: href ? href.split('/anime/')[1] : ''
    }
  }).get()

  const newAnime: Anime = { link, date: Date.now(), episodes, animeInfo, description, listAnmRel }
  const index = animeDB.findIndex(a => a.link === link)
  if (index !== -1) {
    animeDB[index] = newAnime
  } else {
    animeDB.push(newAnime)
  }
  fs.writeFileSync('./tools/animeDB.json', JSON.stringify(animeDB))

  return { animeInfo, episodes, description, listAnimeRel: listAnmRel }
}

async function resolveStreamWish (link: string, codeUrl: string, option: 'update' | 'new'): Promise<string> {
  const browser: Browser = await firefox.launch({ headless: true })
  let url: string
  const page: Page = await browser.newPage()
  try {
    await page.goto(codeUrl)
    await page.click('button.g-recaptcha.btn.btn-primary.submit-btn.py-3.px-4.justify-content-start')
    await page.waitForSelector('.dwnlonk', { timeout: 20000 })
    url = await page.evaluate(() => (document.querySelector('.dwnlonk') as HTMLAnchorElement).href)
    await page.close()
  } catch (e) {
    await page.screenshot({ path: 'error.png' })
    await page.close()
    console.error(e)
    await browser.close()
    return await resolveStreamWish(link, codeUrl, option)
  }
  await browser.close()

  const newVideo: Video = { link, url: codeUrl, date: Date.now(), lastResolvedUrl: url, lastResolvedDate: Date.now() }
  if (option === 'update') {
    const index = videoDB.findIndex(v => v.link === link)
    videoDB[index] = newVideo
  } else {
    videoDB.push(newVideo)
  }
  fs.writeFileSync('./tools/mediaLinks.json', JSON.stringify(videoDB))

  return newVideo.lastResolvedUrl
}

async function resolveStreamtape (link: string, codeUrl: string, option: 'update' | 'new'): Promise<string> {
  const browser: Browser = await firefox.launch({ headless: true })
  let url: string
  try {
    const page: Page = await browser.newPage()
    await page.goto(codeUrl)
    url = await page.evaluate(() => (document.querySelector('video') as HTMLVideoElement)?.src || '')
    await page.close()
  } catch (e) {
    console.error(e)
    await browser.close()
    return await resolveStreamtape(link, codeUrl, option)
  }
  await browser.close()

  const resolvedUrl = await fetch(url).then(res => res.url)
  const newVideo: Video = { link, url: codeUrl, date: Date.now(), lastResolvedUrl: resolvedUrl, lastResolvedDate: Date.now() }
  if (option === 'update') {
    const index = videoDB.findIndex(v => v.link === link)
    videoDB[index] = newVideo
  } else {
    videoDB.push(newVideo)
  }
  fs.writeFileSync('./tools/mediaLinks.json', JSON.stringify(videoDB))

  return newVideo.lastResolvedUrl
}

async function browse (page: number = 1): Promise<{ list: BrowseAnime[]; pages: number }> {
  const alreadyVisited = browseAnimes.find(a => a.page === page)
  if (alreadyVisited && alreadyVisited.lastUpdate + 1000 * 60 * 60 > Date.now()) {
    alreadyVisited.lastUpdate = Date.now()
    return { list: alreadyVisited.list, pages: alreadyVisited.pageMaxId }
  }

  const htmlData = await fetchHTML(`https://www3.animeflv.net/browse${page ? '?page=' + page : ''}`)
  if (!htmlData) return { list: [], pages: 0 }

  const $ = cheerio.load(htmlData)
  const anime = $('.Anime.alt.B')
  const list: BrowseAnime[] = anime.map((_, el) => {
    const href = $(el).find('a').attr('href')
    return {
      title: $(el).find('.Title').last().text(),
      link: href ? href.split('/anime/')[1] : '',
      img: $(el).find('img').attr('src') || '',
      description: $(el).find('.Description p').last().text() || ''
    }
  }).get()

  const pageLinks = $('.pagination li a')
  pageMaxId = parseInt(pageLinks.eq(pageLinks.length - 2).text(), 10) || 1
  browseAnimes.push({ page, list, lastUpdate: Date.now(), pageMaxId })

  return { list, pages: pageMaxId }
}

async function searchList (search: string): Promise<BrowseAnime[]> {
  try {
    const data = await fetch('https://www3.animeflv.net/api/animes/search', {
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      body: 'value=' + search,
      method: 'POST'
    }).then(res => res.json())

    return data.slice(0, 5).map((anime: any) => ({
      title: anime.title,
      link: anime.slug,
      img: `https://www3.animeflv.net/uploads/animes/covers/80x80/${anime.id}.jpg`
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}

export { getVideo, getAnimeEpisodes, browse, searchList }
