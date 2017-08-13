/*--------------------------------------------------------------------------

canvas - type declaration for https://www.npmjs.com/package/canvas

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

declare module "canvas" {
  
  class Canvas extends HTMLCanvasElement {
    public PNG_FILTER_NONE: any
    public stride: number
    constructor(width: number, height: number) 
    public pngStream(): NodeJS.ReadableStream
    public jpegStream(options: {
      bufsize?: number,
      quality?: number,
      progressive: boolean
    }): NodeJS.ReadableStream

    // PNG Buffer, zlib compression level 3 (from 0-9), faster but bigger 
    public toBuffer(type?: string, compression?: number, filter?: any): NodeBuffer
    // ARGB32 Buffer, native-endian 
    public toBuffer(type: "raw")

    // In memory, this is `canvas.height * canvas.stride` bytes long. 
    // The top row of pixels, in ARGB order, left-to-right, is: 
    // var topPixelsARGBLeftToRight = buf3.slice(0, canvas.width * 4);
    // var row3 = buf3.slice(2 * canvas.stride, 2 * canvas.stride + canvas.width * 4);
  }

  namespace Canvas {
    export class Image extends HTMLImageElement {}
  }
  export = Canvas
}