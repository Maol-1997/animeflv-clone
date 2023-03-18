// @ts-nocheck
import * as cheerio from 'cheerio'
import { firefox } from 'playwright-firefox'
import fs from 'fs'

let browser
export default async function getVideo (link) {
  if (!browser) {
    browser = await firefox.launch()
  }
  // check if the video url is already scraped looking in db.json
  const db = JSON.parse(fs.readFileSync('./tools/db.json', 'utf8'))
  const video = db.find(v => v.link === link)
  if (video && video.date + 1000 * 60 * 60 * 24 > Date.now()) {
    if (video.lastResolvedDate + 1000 * 60 * 15 > Date.now()) {
      return video.lastResolvedUrl
    }
    const resolvedUrl = await fetch(video.url).then((res) => res.url)
    const index = db.findIndex(v => v.link === link)
    db[index].lastResolvedDate = Date.now()
    db[index].lastResolvedUrl = resolvedUrl
    fs.writeFileSync('./tools/db.json', JSON.stringify(db))
    return resolvedUrl
  }
  const htmlData = await fetch('https://www3.animeflv.net/ver/' + link).then((res) => res.text())
  const $ = cheerio.load(htmlData)
  // get the video (json) in the script, its starting like var videos =
  const scripts = $('script')
  const videoScript = scripts.toArray().find((script) => {
    return $(script).html()?.includes('var videos =')
  })
  const videoScriptHtml = $(videoScript).html()
  const videos = JSON.parse(videoScriptHtml?.split('var videos = ')[1].split(';')[0] || '[]')
  const stape = videos.SUB.find(v => v.server === 'stape')
  const page = await browser.newPage()
  await page.goto(stape.code)
  const url = await page.evaluate(() => {
    return document.querySelector('video')?.src
  })
  await page.close()
  const resolvedUrl = await fetch(url).then((res) => res.url)
  const newVideo = { link, url, date: Date.now(), lastResolvedUrl: resolvedUrl, lastResolvedDate: Date.now() }
  db.push(newVideo)
  fs.writeFileSync('./tools/db.json', JSON.stringify(db))
  return resolvedUrl
}
