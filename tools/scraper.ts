// @ts-nocheck
import * as cheerio from 'cheerio'
import { firefox } from 'playwright-firefox'
import fs from 'fs'

let videoDB
let animeDB

const browseAnimes = []
let pageMaxId = 0
let browser

async function getVideo (link) {
  // check if the video url is already scraped looking in db.json
  videoDB = JSON.parse(fs.readFileSync('./tools/mediaLinks.json', 'utf8'))
  const video = videoDB.find(v => v.link === link)
  if (video && video.date + 1000 * 60 * 60 * 24 > Date.now()) {
    if (video.lastResolvedDate + 1000 * 60 * 5 > Date.now()) {
      return video.lastResolvedUrl
    }
    if (video.url.includes('zippy')) {
      return await zippyShare(link, video.url, 'update')
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
    const STAPE = videos.SUB.find(v => v.server === 'stape')
    if (STAPE) {
      return await stape(link, STAPE.code, 'new')
    }
  } catch (e) {
    console.log('error streamtape', e)
  }
  try {
  // download link from zippyshare
    const downloadLink = $('.Button.Sm.fa-download').map((_, el) => {
      return $(el).attr('href')
    }).get().find((link) => link.includes('zippyshare'))
    if (downloadLink) {
      return await zippyShare(link, downloadLink, 'new')
    }
  } catch (e) {
    console.log('error zippyshare', e)
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

async function zippyShare (link, downloadLink, option) {
  const htmlZippy = await fetch(downloadLink)
  const zippyText = await htmlZippy.text()
  if (!zippyText.includes('File does not exist')) {
    const $zippy = cheerio.load(zippyText)
    const zippyScripts = $zippy('script').toArray().find((script) => {
      return $zippy(script).html().includes('dlbutton') && $zippy(script).html().includes('.mp4')
    })
    const scriptHtml = $zippy(zippyScripts).html()/* let zippyLink = (scriptHtml.split('href = "')[1].split('.mp4')[0] + '.mp4').split('/')
    // eslint-disable-next-line no-eval
    zippyLink[zippyLink.length - 2] = eval(zippyLink[zippyLink.length - 2].split('(')[1].split(')')[0])
    zippyLink = zippyLink.join('/')
    zippyLink = downloadLink.split('/v/')[0] + zippyLink // revisar porque a veces hace mal el calculo y hace redirect */
    const omg1 = parseInt(scriptHtml.split('document.getElementById(\'dlbutton\').omg = ')[1].split('%')[0])
    const omg2 = parseInt(scriptHtml.split('document.getElementById(\'dlbutton\').omg = ')[1].split('%')[1].split(';')[0])
    const omg = parseInt(omg1 % omg2)
    const b1 = parseInt(scriptHtml.split('var b = parseInt(document.getElementById(\'dlbutton\').omg) * (')[1].split('%')[0])
    const b2 = parseInt(scriptHtml.split('var b = parseInt(document.getElementById(\'dlbutton\').omg) * (')[1].split('%')[1].split(')')[0])
    const b = omg * parseInt(b1 % b2)
    const link = '/d/' + scriptHtml.split('= "/d/')[1].split('"')[0] + (b + 18) + scriptHtml.split('+(b+18)+"')[1].split('";')[0]
    const zippyLink = downloadLink.split('/v/')[0] + link

    const newVideo = {
      link,
      url: downloadLink,
      date: Date.now(),
      lastResolvedUrl: zippyLink,
      lastResolvedDate: Date.now()
    }
    if (option === 'update') {
      const index = videoDB.findIndex(v => v.link === link)
      videoDB[index] = newVideo
    } else {
      videoDB.push(newVideo)
    }
    fs.writeFileSync('./tools/mediaLinks.json', JSON.stringify(videoDB))
    return zippyLink
  }
}

async function stape (link, codeUrl, option) {
  let url
  try {
    browser = await firefox.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto(codeUrl)
    url = await page.evaluate(() => {
      return document.querySelector('video')?.src
    })
    await page.close()
    await browser.close()
  } catch (e) {
    console.error(e)
    try {
      await browser.close()
    } catch {}
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
