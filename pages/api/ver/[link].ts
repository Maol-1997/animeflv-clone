// ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import getVideo from '../../../tools/videoScraper'
type Data = {
    url: string
}
export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { link } = req.query
  const video = await getVideo(link as string)
  res.status(200).json({ url: video })
}
