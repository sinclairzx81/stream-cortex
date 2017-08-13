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

import * as fs        from "fs"
import * as path      from "path"
import { start }      from "./process"
import { Disposable } from "./dispose"

/**
 * provisions the HLS video stream directory.
 * @param {HLSVideoStreamOptions} options the hls options.
 * @returns {void}
 */
const createDirectory = (options: HLSVideoStreamOptions) => {
  const directory = path.join(options.streamDir, options.streamId)
  const exists = fs.existsSync(directory)
  if(exists) removeDirectory(options)
  fs.mkdirSync(path.join(options.streamDir, options.streamId))
}

/**
 * removes the HLS video stream directory.
 * @param {HLSVideoStreamOptions} options the hls options.
 * @returns {void}
 */
const removeDirectory = (options: HLSVideoStreamOptions) => {
  const directory = path.join(options.streamDir, options.streamId)
  const exists = fs.existsSync(directory)
  if(!exists) return
  const contents  = fs.readdirSync(directory)
  contents.forEach(content => {
    const filename = path.join(directory, content)
    fs.unlinkSync(filename)
  }); fs.rmdirSync(directory)
}

const command = (options: HLSVideoStreamOptions) => `ffmpeg -f image2pipe -s ${options.width}x${options.height} -i - -hls_time 1 ${path.join(options.streamDir, options.streamId)}/out.m3u8`

export type HLSVideoStreamOptions = {
  width    : number
  height   : number
  frameRate: number
  streamDir: string
  streamId : string
}
export type HLSVideoStreamDisposeFunction = (source: HLSVideoStream) => void

/**
 * HLSVideoStream
 * 
 * Creates a HLS videostream. HLS (HTTP Live Streaming) is a segmented
 * video streaming protocol. FFMPEG writes to the output directory which
 * contains a manifest file (m3u8) and segment files (.ts). The browser
 * makes a request to the out.m3u8 file on load, which is then used to
 * load the "last" segment. The management of the manifest and segments
 * is handled by ffmpeg (out of band) with the rest of the application.
 * 
 * HLS incurs some delay in the rendering, this may be configurable with
 * varying sized segment sizes.
 */
export class HLSVideoStream implements Disposable {
  private stdin : NodeJS.WritableStream
  private stdout: NodeJS.ReadableStream
  private stderr: NodeJS.ReadableStream
  private kill  : Function
  private ready : boolean = false

  constructor(private options: HLSVideoStreamOptions, private dispose_ext: HLSVideoStreamDisposeFunction = function () { }) {
    createDirectory(options)
    start(command(options), (stdin, stdout, stderr, kill) => {
      this.stdin  = stdin
      this.stdout = stdout
      this.stderr = stderr
      this.kill   = kill
      this.stderr.on("data",  data  =>  process.stdout.write(data))
      this.stderr.on("data",  data  => {})
      this.stdout.on("data",  data  => {})
      this.stderr.on("error", error => { this.dispose_ext(this) })
      this.stdout.on("error", error => { this.dispose_ext(this) })
      this.stdin.on("error",  error => { this.dispose_ext(this) })
      this.ready = true
    })
  }

  /**
   * writes a video frame to this stream.
   * @param {Buffer} data the frame data to write (should be a png)
   * @returns {Promise<any>}
   */
  public write(data: Buffer): Promise<any> {
    if (!this.ready) return Promise.resolve()
    return new Promise((resolve, reject) => {
      this.stdin.write(data, error => {
        if (error) return reject(error)
        resolve()
      })
    })
  }

  /**
   * disposes of this video stream.
   * @returns {void}
   */
  public dispose(): void {
    this.dispose_ext(this)
    this.kill()
    // removeDirectory(this.options)
  }
}