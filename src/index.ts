/*--------------------------------------------------------------------------

stream-cortex - realtime live video streaming experiments with node + ffmpeg

The MIT License (MIT)

Copyright (c) 2016 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import * as express from "express"
import * as cortex from "./cortex/index"

//-------------------------------------------------
// constants.
//-------------------------------------------------

const width     = 640;
const height    = 480;
const frameRate = 30

//-------------------------------------------------
// canvas rendering stream, produces video frames.
//-------------------------------------------------
const canvas = new cortex.CanvasStream({ 
  width, 
  height, 
  frameRate 
})

//-------------------------------------------------
// hls video stream, is a consumer of video frames.
//-------------------------------------------------
const hls = new cortex.HLSVideoStream({
  streamDir: __dirname + "/web/streams",
  streamId : "testing",
  width,
  height,
  frameRate
})

//-------------------------------------------------
// webb direct video stream, created on http requests.
//-------------------------------------------------
const streams = new Array<cortex.WebMVideoStream>()

//-------------------------------------------------
// canvas rendering loop, produces video frames @ frameRate.
//-------------------------------------------------
let angle = 0;
canvas.update(context => {
  // clear the video frame
  context.clearRect(0, 0, width, height)

  // color in the background
  context.fillStyle = "#EEEEEE"
  context.fillRect(0, 0, width, height)

  // draw a circle
  context.beginPath()
  var radius = 25 + 150 * Math.abs(Math.cos(angle))
  context.arc(225, 225, radius, 0, Math.PI * 2, false)
  context.closePath()
  context.fillStyle = "#006699"
  context.fill()

  // draw a circle
  context.beginPath();
  var radius = 25 + 150 * Math.abs(Math.cos(angle + 1))
  context.arc(425, 225, radius, 0, Math.PI * 2, false)
  context.closePath()
  context.fillStyle = "#669900"
  context.fill()

  // draw date time
  context.fillStyle = "#000000"
  context.fillText((new Date().toString()), 10, 50)
  angle += Math.PI / 128
})



//-------------------------------------------------
// canvas read event, frames are multicast to streams.
//-------------------------------------------------
canvas.read(frame => {
  hls.write(frame)
  streams.forEach(stream => {
    stream.write(frame)
  })
})

//-------------------------------------------------
// small web server implementation
//-------------------------------------------------
const app = express()

app.use(express.static(__dirname + "/web"))

app.get("/video", (request, response) => {
  const stream = new cortex.WebMVideoStream({ width, height, frameRate })
  stream.read (data => response.write(data))
  streams.push(stream)
  response.writeHead(200, {"Content-Type": "video/webm"})
  response.connection.on("end", () => {
    const index = streams.indexOf(stream)
    streams.splice(index, 1)
    stream.dispose()
  })
})

app.listen(5000)



