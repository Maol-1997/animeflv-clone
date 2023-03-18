// ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { browse } from '../../tools/scraper'
export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<{}>
) {
  const { page } = req.query
  console.log(page)
  const anime = await browse(page as string)
  res.status(200).json(anime)
  // res.status(200).json({ url: lastResolvedUrl })
}
