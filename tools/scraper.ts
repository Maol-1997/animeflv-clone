// @ts-nocheck
import * as cheerio from 'cheerio'
import { firefox } from 'playwright-firefox'
import fs from 'fs'

let videoDB
let animeDB

let browser
async function getVideo (link) {
  if (!browser) {
    browser = await firefox.launch()
  }
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
  // download link from zippyshare
  const downloadLink = $('.Button.Sm.fa-download').map((_, el) => {
    return $(el).attr('href')
  }).get().find((link) => link.includes('zippyshare'))
  if (downloadLink) {
    return await zippyShare(link, downloadLink, 'new')
  }

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
}

async function getAnimeEpisodes (link) {
  animeDB = JSON.parse(fs.readFileSync('./tools/animeDB.json', 'utf8'))
  const anime = animeDB.find(a => a.link === link)
  if (anime && anime.date + 1000 * 60 * 60 > Date.now()) {
    return { animeInfo: anime.animeInfo, episodes: anime.episodes, description: anime.description, listAnimeRel: anime.listAnmRel }
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
      return $zippy(script).html().includes('href = "/d/')
    })
    let zippyLink = ($zippy(zippyScripts).html().split('href = "')[1].split('.mp4')[0] + '.mp4').split('/')
    // eslint-disable-next-line no-eval
    zippyLink[zippyLink.length - 2] = eval(zippyLink[zippyLink.length - 2].split('(')[1].split(')')[0])
    zippyLink = zippyLink.join('/')
    zippyLink = downloadLink.split('/v/')[0] + zippyLink // revisar porque a veces hace mal el calculo y hace redirect

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
  const page = await browser.newPage()
  await page.goto(codeUrl)
  const url = await page.evaluate(() => {
    return document.querySelector('video')?.src
  })
  await page.close()
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
export { getVideo, getAnimeEpisodes }
