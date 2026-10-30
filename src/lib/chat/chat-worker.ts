/// <reference lib="webworker" />
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

/** The model runs here, not on the main thread.
 *
 * Token generation is a tight WebGPU loop. On the main thread it blocks React,
 * so the page freezes exactly while the answer is streaming in - the one
 * moment the visitor is watching it. In a worker the UI stays interactive and
 * the Stop button actually responds. */
const handler = new WebWorkerMLCEngineHandler();

self.onmessage = (event: MessageEvent) => {
  handler.onmessage(event);
};
