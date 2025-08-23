import {
  APITags,
  HTTPRoute,
  Logger,
  Methods,
  Request,
  Response,
  contentTypes,
  writeResponse,
} from '@browserless.io/browserless';
import eventBus from './eventBus.js';

export default class FunctionEventHTTPRoute extends HTTPRoute {
  name = 'FunctionEventHTTPRoute';
  accepts = [contentTypes.json];
  auth = !true;
  browser = null;
  concurrency = false;
  contentTypes = [contentTypes.text];
  description = `Streams "Hello World!" every 2 seconds using Server-Sent Events.`;
  method = Methods.post;
  path = ['/sse-event?(/)'];
  tags = [APITags.browserAPI];
  async handler(req: Request, res: Response, logger: Logger): Promise<void> {
    logger.debug(`${req.method} /sse-event was called for SSE!`);
    // console.log("req.body", typeof req.body, req.body);
    const {id, data} = req.body as {id: string, data: any}
    console.log("id", id, "data", data)
    eventBus.emit(id, data);
    // const config = this.config()
    // config.getExternalAddress = () => 'http://localhost:3000';
    writeResponse(res, 200, "success", contentTypes.text);
  }
}
