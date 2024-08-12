import { NextApiRequest, NextApiResponse } from 'next'
import { getVideo } from '../../../tools/scraper'
import { Readable } from 'stream'

// Helper function to convert a ReadableStream to a Node.js Readable stream
function readableStreamToNodeStream (readableStream: ReadableStream<Uint8Array>): Readable {
  const nodeStream = new Readable({
    read () {}
  })
  const reader = readableStream.getReader()
  reader.read().then(function processText ({ done, value }) {
    if (done) {
      nodeStream.push(null)
      return
    }
    nodeStream.push(Buffer.from(value))
    reader.read().then(processText)
  })
  return nodeStream
}

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const { link } = req.query
  if (typeof link !== 'string') {
    res.status(400).json({ message: 'Invalid link parameter.' })
    return
  }
  const lastResolvedUrl = await getVideo(link)

  const range = req.headers.range
  if (!range) {
    res.status(400).send('Requires Range header')
    return
  }

  const videoResponse = await fetch(lastResolvedUrl, {
    headers: { range } // Sends the requested range to the remote server
  })

  if (!videoResponse.ok) {
    res.status(500).json({ message: 'Failed to fetch video.' })
    return
  }

  // Ensure necessary headers for partial content streaming are forwarded
  const { status, headers } = videoResponse
  res.status(status === 206 ? 206 : 500)
  res.setHeader('Content-Type', 'video/mp4')
  res.setHeader('Content-Range', headers.get('Content-Range') as string)
  res.setHeader('Accept-Ranges', headers.get('Accept-Ranges') as string)
  res.setHeader('Content-Length', headers.get('Content-Length') as string)

  if (videoResponse.body) {
    const nodeStream = readableStreamToNodeStream(videoResponse.body)
    nodeStream.pipe(res)
  } else {
    res.status(500).json({ message: 'Failed to stream the content.' })
  }
}
