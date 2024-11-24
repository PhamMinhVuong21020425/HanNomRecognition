import { Request, Response, NextFunction } from 'express';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';
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

  static async handleRequests(req: Request, res: Response, next: NextFunction) {
    await handle(req, res);
  }
}

export default NextRenderer;
