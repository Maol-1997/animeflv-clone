// @ts-nocheck
import * as cheerio from 'cheerio'
import { firefox } from 'playwright-firefox'
import fs from 'fs'

let videoDB
let animeDB

const browseAnimes = []
let pageMaxId = 0

async function getVideo (link) {
  // check if the video url is already scraped looking in db.json
  videoDB = JSON.parse(fs.readFileSync('./tools/mediaLinks.json', 'utf8'))
  const video = videoDB.find(v => v.link === link)
  if (video && video.date + 1000 * 60 * 60 * 24 > Date.now()) {
    if (video.lastResolvedDate + 1000 * 60 * 5 > Date.now()) {
      return video.lastResolvedUrl
    }

    if (video.url.includes('streamwish')) {
      return await streamWish(link, video.url, 'update')
    }
    if (video.url.includes('streamtape')) {
      return await stape(link, video.url, 'update')
    }
  }
  // -----------------
  const htmlData = await fetch('https://www3.animeflv.net/ver/' + link).then((res) => res.text())
  const $ = cheerio.load(htmlData)
  try {
    const scripts = $('script')
    const videoScript = scripts.toArray().find((script) => {
      return $(script).html()?.includes('var videos =')
    })
    const videoScriptHtml = $(videoScript).html()
    const videos = JSON.parse(videoScriptHtml?.split('var videos = ')[1].split(';')[0] || '[]')
    const STREAMWISH = videos.SUB.find(v => v.server === 'sw')
    if (STREAMWISH) {
      return await streamWish(link, STREAMWISH.code.replace('/e/', '/f/') + '_h', 'new')
    }
    const STAPE = videos.SUB.find(v => v.server === 'stape')
    if (STAPE) {
      return await stape(link, STAPE.code, 'new')
    }
  } catch (e) {
    console.log('error streamtape', e)
  }
  return ''
}

async function getAnimeEpisodes (link) {
  animeDB = JSON.parse(fs.readFileSync('./tools/animeDB.json', 'utf8'))
  const anime = animeDB.find(a => a.link === link)
  if (anime && anime.date + 1000 * 60 * 60 > Date.now()) {
    return {
      animeInfo: anime.animeInfo,
      episodes: anime.episodes,
      description: anime.description,
      listAnimeRel: anime.listAnmRel
    }
  }
  const htmlData = await fetch('https://www3.animeflv.net/anime/' + link).then((res) => res.text())
  const $ = cheerio.load(htmlData)
  const scripts = $('script')
  const episodesScript = scripts.toArray().find((script) => {
    return $(script).html()?.includes('var episodes =')
  })
  const animeInfo = JSON.parse(episodesScript?.children[0].data.split('var anime_info = ')[1].split('];')[0] + ']' || '[]')
  const episodes = JSON.parse(episodesScript?.children[0].data.split('var episodes = ')[1].split('];')[0] + ']' || '[]')
  const description = $('.Description p').text()
  const listAnmRel = $('.ListAnmRel li').map((_, el) => {
    return {
      title: $(el).last().text(),
      link: $(el).find('a').attr('href').split('/anime/')[1]
    }
  }).get()

  const newAnime = {
    link,
    date: Date.now(),
    episodes,
    animeInfo,
    description,
    listAnmRel
  }
  const index = animeDB.findIndex(a => a.link === link)
  if (index !== -1) {
    animeDB[index] = newAnime
  } else {
    animeDB.push(newAnime)
  }
  fs.writeFileSync('./tools/animeDB.json', JSON.stringify(animeDB))

  return { animeInfo, episodes, description, listAnimeRel: listAnmRel }
}

async function streamWish (link, codeUrl, option) {
  const browser = await firefox.launch({ headless: true })
  // if is not closed after 5 minutes, close it
  setTimeout(async () => {
    await browser.close()
  }, 1000 * 60)
  console.log({ codeUrl })
  let url
  try {
    const page = await browser.newPage()
    await page.goto(codeUrl)
    await page.click('button.g-recaptcha.btn.btn-primary.submit-btn.py-3.px-4.justify-content-start')
    await page.waitForSelector('.dwnlonk', { timeout: 10000 })
    url = await page.evaluate(() => {
      return document.querySelector('.dwnlonk').href
    })
    await page.close()
    await browser.close()
    console.log({ url })
  } catch (e) {
    await browser.close()
    console.error(e)
    return await streamWish(link, codeUrl, option)
  }

  const newVideo = { link, url: codeUrl, date: Date.now(), lastResolvedUrl: url, lastResolvedDate: Date.now() }
  if (option === 'update') {
    const index = videoDB.findIndex(v => v.link === link)
    videoDB[index] = newVideo
  } else {
    videoDB.push(newVideo)
  }
  fs.writeFileSync('./tools/mediaLinks.json', JSON.stringify(videoDB))
  return newVideo.lastResolvedUrl
}
async function stape (link, codeUrl, option) {
  const browser = await firefox.launch({ headless: true })
  let url
  try {
    const page = await browser.newPage()
    await page.goto(codeUrl)
    url = await page.evaluate(() => {
      return document.querySelector('video')?.src
    })
    await page.close()
    await browser.close()
  } catch (e) {
    await browser.close()
    console.error(e)
    return await stape(link, codeUrl, option)
  }
  const resolvedUrl = await fetch(url).then((res) => res.url)
  const newVideo = { link, url: codeUrl, date: Date.now(), lastResolvedUrl: resolvedUrl, lastResolvedDate: Date.now() }
  if (option === 'update') {
    const index = videoDB.findIndex(v => v.link === link)
    videoDB[index] = newVideo
  } else {
    videoDB.push(newVideo)
  }
  fs.writeFileSync('./tools/mediaLinks.json', JSON.stringify(videoDB))
  return newVideo.lastResolvedUrl
}

async function browse (page) {
  if (page < 1) {
    page = 1
  }
  const alreadyVisited = browseAnimes.find(a => a.page === page)
  if (alreadyVisited && alreadyVisited.lastUpdate + 1000 * 60 * 60 > Date.now()) {
    browseAnimes[browseAnimes.indexOf(alreadyVisited)] = { ...alreadyVisited, lastUpdate: Date.now() }
    return { list: alreadyVisited.list, pages: alreadyVisited.pageMaxId }
  }

  const htmlData = await fetch('https://www3.animeflv.net/browse' + (page ? '?page=' + page : '')).then((res) => res.text())
  const $ = cheerio.load(htmlData)
  const anime = $('.Anime.alt.B')
  const list = anime.map((_, el) => {
    const title = $(el).find('.Title').last().text()
    const link = $(el).find('a').attr('href').split('/anime/')[1]
    const img = $(el).find('img').attr('src')
    const description = $(el).find('.Description p').last().text()
    return { title, link, img, description }
  }).get()
  // pageMaxId = .pagination li a size-2
  pageMaxId = $('.pagination li a')
  pageMaxId = pageMaxId[pageMaxId.length - 2].children[0].data
  browseAnimes.push({ page, list, lastUpdate: Date.now(), pageMaxId })
  return { list, pages: pageMaxId }
}

async function searchList (search) {
  const data = await fetch('https://www3.animeflv.net/api/animes/search', {
    headers: {
      accept: 'application/json, text/javascript, */*; q=0.01',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: 'value=' + search,
    method: 'POST'
  }).then((res) => res.json())
  const list = data.map((anime) => {
    return { title: anime.title, link: anime.slug, img: 'https://www3.animeflv.net/uploads/animes/covers/80x80/' + anime.id + '.jpg' }
  })
  if (list.length > 5) {
    return list.slice(0, 5)
  }
  return list
}

export { getVideo, getAnimeEpisodes, browse, searchList }
