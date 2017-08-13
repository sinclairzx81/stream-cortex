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

/// <reference path="../typings/canvas.d.ts" />

import { Disposable } from "./dispose"
import * as Canvas from "canvas"

export type CanvasStreamOptions = {
  width    : number
  height   : number
  frameRate: number
}

export type CanvasStreamUpdateFunction = (context: CanvasRenderingContext2D) => void
export type CanvasStreamReadFunction   = (buffer: Buffer) => void

/**
 * CanvasStream
 * 
 * A video source producer device. Allows a caller to render images to a 
 * CanvasRenderingContext2D, The resulting images are obtained on this
 * streams read() function.
 */
export class CanvasStream implements Disposable {
  
  private canvas     : Canvas
  private context    : CanvasRenderingContext2D
  private renderfunc : CanvasStreamUpdateFunction = function() {}
  private readfunc   : CanvasStreamReadFunction   = function() {}
  private interval   : number | NodeJS.Timer

  /**
   * creates a new canvas stream.
   * @param {CanvasStreamOptions} options the options for this stream.
   * @return {CanvasStream}
   */
  constructor(private options: CanvasStreamOptions) {
    this.canvas   = new Canvas(this.options.width, this.options.height)
    this.context  = this.canvas.getContext('2d')
    this.interval = setInterval(this.processFrame.bind(this), 1000 / this.options.frameRate)
  }

  /**
   * subscribes to this canvas streams update event.
   * @param {CanvasStreamUpdateFunction} func the event listener.
   * @returns {void}
   */
  public update(func: CanvasStreamUpdateFunction): void {
    this.renderfunc = func
  }

  /**
   * subscribes to this canvas streams read event.
   * @param {CanvasStreamReadFunction} func the event listener.
   * @returns {void}
   */
  public read(func: CanvasStreamReadFunction): void {
    this.readfunc = func
  }

  /**
   * Internally processes a frame. The process function 
   * passes the caller a CanvasRenderingContext2D to 
   * update the video buffer, and the result is read
   * as a PNG which is to be passed onto other video
   * streams.
   * @returns {void}
   */
  private processFrame(): void {
    this.renderfunc(this.context)
    const buffer = this.canvas.toBuffer(undefined, 3, this.canvas.PNG_FILTER_NONE)
    this.readfunc(buffer)
  }

  /**
   * disposes of this object.
   * @returns {void}
   */
  public dispose(): void {
    clearInterval(this.interval as NodeJS.Timer)
  }
}