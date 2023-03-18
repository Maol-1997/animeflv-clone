// ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { getAnimeEpisodes } from '../../../tools/scraper'
export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<{}>
) {
  const { link } = req.query
  const anime = await getAnimeEpisodes(link as string)
  res.status(200).json(anime)
  // res.status(200).json({ url: lastResolvedUrl })
}
