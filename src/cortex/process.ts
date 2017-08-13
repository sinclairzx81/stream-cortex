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


import { spawn } from "child_process"

/**
 * StartFunction
 * 
 * The handle given to to streams.
 */
export type StartFunction = (stdin: NodeJS.WritableStream, stdout: NodeJS.ReadableStream, stderr: NodeJS.ReadableStream, kill: Function) => void

/**
 * starts a OS process with the given command.
 * @param {string} command the command line shell arguments to start.
 * @param {StartFunction} func a function to receive stdin, stdout, stderr, and a kill function.
 * @returns {void}
 */
export const start = (command: string, func: StartFunction) => {
  const args    = command.split(" ").filter(n => n.length > 0)
  const ffmpeg  = args.shift()
  const proc    = spawn(ffmpeg, args)
  func(proc.stdin, proc.stdout, proc.stderr, () => proc.kill("SIGINT"))
}
