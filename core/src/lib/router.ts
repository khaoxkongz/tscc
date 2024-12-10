import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';

import { BaseResponse } from './response';
import { MaybePromise } from './types';
import { HandlerMetadata } from './typed-routes';

export type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => MaybePromise<BaseResponse>;

export const catchAsync =
  (fn: (...args: any[]) => any) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };

export class BaseRouter {
  constructor(public readonly instance: Router = Router()) {}

  private extractHandlers(handlers: RequestHandler[]) {
    const handler = handlers[handlers.length - 1] as RequestHandler;
    const middlewares = handlers.slice(0, handlers.length - 1);
    return { handler, middlewares };
  }

  private preRequest(handler: RequestHandler) {
    const invokeHandler = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      const result = await handler(req, res, next);
      return res.json({
        success: true,
        message: 'Request successful',
        ...result,
      } satisfies BaseResponse);
    };
    return catchAsync(invokeHandler);
  }

  public get(path: string, ...handlers: RequestHandler[]) {
    const { handler, middlewares } = this.extractHandlers(handlers);
    this.instance.get(path, middlewares, this.preRequest(handler));
  }

  public post(path: string, ...handlers: RequestHandler[]) {
    const { handler, middlewares } = this.extractHandlers(handlers);
    this.instance.route(path).post(middlewares, this.preRequest(handler));
  }

  public put(path: string, ...handlers: RequestHandler[]) {
    const { handler, middlewares } = this.extractHandlers(handlers);
    this.instance.route(path).put(middlewares, this.preRequest(handler));
  }

  public delete(path: string, ...handlers: RequestHandler[]) {
    const { handler, middlewares } = this.extractHandlers(handlers);
    this.instance.route(path).delete(middlewares, this.preRequest(handler));
  }

  public registerClassRoutes(classInstance: object) {
    const fields = Object.values(classInstance);
    fields.forEach((field) => {
      const route = field as HandlerMetadata;
      if (route.__handlerMetadata) {
        const { path, handler } = route;
        const method = route.method.toLowerCase();
        console.log('Registering route', method, path);
        (this.instance.route(path) as any)[method](this.preRequest(handler));
      }
    });
    return this;
  }
}
