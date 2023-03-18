// ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { searchList } from '../../../tools/scraper'
export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<{}>
) {
  const { searchParam } = req.query
  const anime = await searchList(searchParam as string)
  res.status(200).json(anime)
  // res.status(200).json({ url: lastResolvedUrl })
}
