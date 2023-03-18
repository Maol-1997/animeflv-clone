import type { NextApiRequest, NextApiResponse } from 'next'
import * as cheerio from 'cheerio'
import getVideo from '../../tools/videoScraper'

let lastTime = Date.now() - 1000 * 60 * 5 // 5 min ago
type Data = {
    link?: string,
    img?: string,
    title?: string,
    episode?: string,
}
let lastResult = [] as Data[]
let latestEpisodes = [] as Data[]

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<Data[]>
) {
  if (Date.now() > lastTime + 1000 * 60 * 5) {
    lastTime = Date.now()
    const htmlData = await fetch('https://animeflv.net').then((res) => res.text())
    const $ = cheerio.load(htmlData)
    // get the latest episodes from the home page and show them in the console
    latestEpisodes = $('.ListEpisodios li')
      .map((_, el) => {
        const $el = $(el)
        const $link = $el.find('a')
        const $img = $el.find('img')
        const $title = $el.find('.Title')
        const $episode = $el.find('.Capi')
        return {
          link: $link.attr('href'),
          img: $img.attr('src'),
          title: $title.text(),
          episode: $episode.text()
        }
      })
      .get()
    if (JSON.stringify(lastResult) !== JSON.stringify(latestEpisodes)) {
      lastResult = latestEpisodes
      preCheck(latestEpisodes)
    }
  }
  res.status(200).json(latestEpisodes)
}

async function preCheck (latestEpisodes: Data[]) {
  for (let i = 0; i < latestEpisodes.length; i++) {
    console.log('checking', latestEpisodes[i].link)
    await getVideo(latestEpisodes[i].link?.replace('/ver/', ''))
  }
}
