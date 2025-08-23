import {
  APITags,
  BrowserHTTPRoute,
  BrowserInstance,
  // BrowserlessRoutes,
  CDPLaunchOptions,
  ChromiumCDP,
  Logger,
  Methods,
  Request,
  SystemQueryParameters,
  contentTypes,
  dedent,
  id,
  // writeResponse,
} from '@browserless.io/browserless';
import { ServerResponse } from 'http';
// import Stream from 'stream';
// import { fileTypeFromBuffer } from 'file-type';
import functionHandler from '../node_modules/@browserless.io/browserless/build/shared/utils/function/handler.js'
import eventBus from './eventBus.js';

interface JSONSchema {
  code: string;
  context?: Record<string, string | number>;
}

export type BodySchema = JSONSchema | string;

export interface QuerySchema extends SystemQueryParameters {
  launch?: CDPLaunchOptions | string;
}

/**
 * Responses are determined by the returned value of the function
 * itself. Binary responses (PDF's, screenshots) are returned back
 * as binary data, and primitive JavaScript values are returned back
 * by type (HTML data is "text/html", Objects are "application/json")
 */
export type ResponseSchema = unknown;

const sseContentType = 'text/event-stream' as contentTypes;
export default class ChromiumFunctionPostRoute extends BrowserHTTPRoute {
  name = "ChromiumFunctionSSEPostRoute";
  accepts = [contentTypes.json, contentTypes.javascript];
  auth = true;
  browser = ChromiumCDP;
  concurrency = !true;
  contentTypes = [sseContentType];
  description = dedent(`
  A JSON or JavaScript content-type API for running puppeteer code in the browser's context.
  Browserless sets up a blank page, injects your puppeteer code, and runs it.
  You can optionally load external libraries via the "import" module that are meant for browser usage.
  Values returned from the function are checked and an appropriate content-type and response is sent back
  to your HTTP call.`);
  method = Methods.post;
  path = ["/function-sse?(/)", "/chromium/function?(/)"];
  tags = [APITags.browserAPI];
  async handler(
    req: Request,
    res: ServerResponse,
    logger: Logger,
    browser: BrowserInstance,
  ): Promise<void> {
    const code = (req.body as any)?.code || req.body
    const context = (req.body as any)?.context || { ew: true }
    const __id__ = id()
    req.headers['content-type'] = contentTypes.json
    req.body = {
      code: `import event from "http://0.0.0.0:3000/event.mjs?id=${__id__}";` + code,
      context,
    } as BodySchema

    console.log("code", code)

    logger.debug(`${req.method} /function-sse was called for SSE!`);
    res.writeHead(200, {
      'Content-Type': sseContentType,
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    eventBus.on(__id__, (message) => {
      res.write(`data: ${JSON.stringify(message)}\n\n`);
    });
    req.on('close', () => {
      logger.info('Client closed connection, stopping SSE.');
      // clearInterval(intervalId);
      res.end();
    });

    eventBus.emit(__id__, { event: 'init', id: __id__ });

    const config = this.config();
    const handler = functionHandler(config, logger);
    const { contentType, payload, page } = await handler(req, browser);
    logger.info(`Got function response of "${contentType}" with payload:`, payload);
    res.write(`data: ${JSON.stringify(JSON.parse(payload as string))}\n\n`);
    page.close();
    page.removeAllListeners();
    eventBus.removeAllListeners(__id__);
    res.end();
  }
}
