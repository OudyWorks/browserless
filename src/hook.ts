// src/hooks.ts file
import type {
  Request,
  Response,
  ChromiumCDP,
  FirefoxPlaywright,
  ChromiumPlaywright,
  WebKitPlaywright,
} from '@browserless.io/browserless';
import type { Duplex } from 'stream';
import type { Page } from 'puppeteer-core';
import { EventEmitter } from 'events';

export class Hooks extends EventEmitter {
  constructor() {
    super();
  }

  // Called in src/server.ts for incoming HTTP and WebSocket requests, which
  // is why certain arguments might not be present -- only the Request is
  // guaranteed to be present as it is shared in both WS and HTTP requests.
  // MUST return a true/false indicating if Browserless should continue
  // handling the request or not.
  before({
    req,
    res,
    socket,
    head,
  }: {
    req: Request;
    res?: Response;
    socket?: Duplex;
    head?: Buffer;
  }): Promise<boolean> {
    req; res; socket; head;
    console.log("HOOKS BEFORE", req.url);
    return Promise.resolve(true);
  }

  // Called in src/limiter.ts and provides details regarding the result of the
  // session and a "start" time (Date.now()) of when the session started to run.
  // No return value or type required.
  after(args: {
    status: 'successful' | 'error' | 'timedout';
    start: number;
    req: Request;
  }): Promise<void> {
    args;
    return Promise.resolve(undefined);
  }

  // Called in src/browsers/index.ts
  // Called for every new CDP or Puppeteer-like "Page" creation in a browser.
  // Can be used to inject behaviors or add events to a page's lifecycle.
  // "meta" property is a parsed URL of the original incoming request.
  // No return value or type required.
  page(args: { meta: URL; page: Page }): Promise<void> {
    args;
    return Promise.resolve(undefined);
  }

  // Called in src/browsers/index.ts
  // Called for every new Browser creation in browserless, regardless of type.
  // Can be used to inject behaviors or add events to a browser's lifecycle.
  // "meta" property is a parsed URL of the original incoming request.
  // No return value or type required.
  browser(args: {
    browser:
    | ChromiumCDP
    | FirefoxPlaywright
    | ChromiumPlaywright
    | WebKitPlaywright;
    meta: URL;
  }): Promise<unknown> {
    args;
    return Promise.resolve(undefined);
  }
}