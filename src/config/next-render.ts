import { Request, Response, NextFunction } from 'express';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

class NextRenderer {
  static async init() {
    await nextApp.prepare();
  }

  static async render(
    req: Request,
    res: Response,
    pagePath: string,
    query: NextParsedUrlQuery = {}
  ) {
    await nextApp.render(req, res, pagePath, query);
  }

  static handleRequests(req: Request, res: Response, next: NextFunction) {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }
}

export default NextRenderer;
