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

import { Disposable } from "./dispose"
import { start }      from "./process"

const command = (options: VideoSourceOptions) => `ffmpeg -f image2pipe -s ${options.width}x${options.height} -i - -vcodec libvpx -preset ultrafast -tune zerolatency -qmin 0 -qmax 50 -crf 10 -b:v 1M -f webm pipe:1`

export type VideoStreamReadFunction = (data: Buffer) => void

export type VideoSourceOptions = {
  width      : number
  height     : number
  frameRate  : number
}

/**
 * WebMVideoStream
 * 
 * A real time webm video encoder. This stream accepts images
 * on the write() function. These images are processed and 
 * written on ffmpegs stdout. Thus this type is duplex. 
 * This type will emit byte data on this types read() 
 * function.
 */
export class WebMVideoStream implements Disposable {

  private stdin   : NodeJS.WritableStream
  private stdout  : NodeJS.ReadableStream
  private stderr  : NodeJS.ReadableStream
  private kill    : Function
  private onread  : VideoStreamReadFunction = function() {}
  private ready   : boolean = false
  private disposed: boolean = false

  constructor(private options: VideoSourceOptions) {
    start(command(options), (stdin, stdout, stderr, kill) => {
      this.stdin  = stdin
      this.stdout = stdout
      this.stderr = stderr
      this.kill   = kill
      this.stderr.on("data",  data =>  process.stdout.write(data))
      this.stdout.on("data",  data =>  this.onread(data))
      this.stderr.on("error", error => {this.dispose()})
      this.stdout.on("error", error => {this.dispose()})
      this.stdin.on ("error", error => {this.dispose()})
      this.ready  = true
    })
  }

  /**
   * subscribes to the VideoSource data. 
   * @param {VideoSourceReadFunction} func the video source read function.
   * @returns {void}
   */
  public read(func: VideoStreamReadFunction) : void {
    this.onread = func
  }

  /**
   * writes a frame to this video stream.
   * @param {Buffer} data the image data for the frame. (ideally png)
   * @returns {Promise<any>}
   */
  public write(data: Buffer): Promise<any> {
    if(!this.ready) return Promise.resolve()
    return new Promise((resolve, reject) => {
      this.stdin.write(data, error => {
        if(error) return reject(error)
        resolve()
      })
    })
  }

  /**
   * disposes of this object.
   * @returns {void}
   */
  public dispose() {
    if(!this.disposed) {
      this.kill()
      this.disposed = true
    }
  }
}