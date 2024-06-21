import {
  APITags,
  BrowserlessRoutes,
  BrowserlessSessionJSON,
  HTTPManagementRoutes,
  HTTPRoute,
  Methods,
  Request,
  contentTypes,
  jsonResponse,
} from '@browserless.io/browserless';
import { ServerResponse } from 'http';

export type ResponseSchema = BrowserlessSessionJSON;

export default class SessionGetRoute extends HTTPRoute {
  name = BrowserlessRoutes.SessionGetRoute;
  accepts = [contentTypes.any];
  auth = true;
  browser = null;
  concurrency = false;
  contentTypes = [contentTypes.json];
  description = `Lists all currently running sessions and relevant meta-data excluding potentially open pages.`;
  method = Methods.get;
  path = HTTPManagementRoutes.session;
  tags = [APITags.management];
  handler = async (_req: Request, res: ServerResponse): Promise<void> => {
    const id: string = _req.parsed.pathname?.split('/').pop()!;
    const browserManager = this.browserManager();
    const response: ResponseSchema | undefined = await browserManager.getSessionById(id);
    if (response)
      return jsonResponse(res, 200, response);
    else
      return jsonResponse(res, 404, { error: "Session not found" });
  };
}
