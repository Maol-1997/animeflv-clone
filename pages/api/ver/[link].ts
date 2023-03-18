// ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
// @ts-ignore
import request from 'request'
import { getVideo } from '../../../tools/scraper'
type Data = {
    url: string
}
export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { link } = req.query
  const lastResolvedUrl = await getVideo(link as string)
  req.pipe(request.get(lastResolvedUrl/*, {
    rejectUnauthorized: false
  } */)).pipe(res)
  // res.status(200).json({ url: lastResolvedUrl })
}
