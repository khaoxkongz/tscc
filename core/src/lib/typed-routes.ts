import type { Request, Response } from 'express';

import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { ValidationError } from './errors';
import { BaseResponse } from './response';
import { RequestHandler } from './router';
import { MaybePromise } from './types';

export class TypedRoutes {
  get(path: string) {
    return new TypedRoutesHandler(path, 'GET');
  }

  post(path: string) {
    return new TypedRoutesHandler(path, 'POST');
  }

  put(path: string) {
    return new TypedRoutesHandler(path, 'PUT');
  }

  delete(path: string) {
    return new TypedRoutesHandler(path, 'DELETE');
  }
}

export interface HandlerMetadata {
  __handlerMetadata: true;
  method: string;
  path: string;
  handler: RequestHandler;
}

export type TypedHandler<
  TQuery extends z.ZodTypeAny,
  TBody extends z.ZodTypeAny,
  TParams extends z.ZodTypeAny,
  TResponse extends BaseResponse = BaseResponse
> = (context: {
  query: z.infer<TQuery>;
  params: z.infer<TParams>;
  body: z.infer<TBody>;
  req: Request<z.infer<TParams>, any, z.infer<TBody>, z.infer<TQuery>>;
  res: Response<TResponse>;
}) => MaybePromise<TResponse>;

export class TypedRoutesHandler<
  RouteQuery extends z.ZodTypeAny,
  RouteBody extends z.ZodTypeAny,
  RouteParams extends z.ZodTypeAny
> {
  public schema: {
    query?: z.ZodTypeAny;
    body?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
  } = {};

  constructor(private readonly path: string, private readonly method: string) {}

  public query<Query extends z.ZodTypeAny>(schema: Query) {
    this.schema.query = schema;
    return this as unknown as TypedRoutesHandler<Query, RouteBody, RouteParams>;
  }

  public body<Body extends z.ZodTypeAny>(schema: Body) {
    this.schema.body = schema;
    return this as unknown as TypedRoutesHandler<RouteQuery, Body, RouteParams>;
  }

  public params<Params extends z.ZodTypeAny>(schema: Params) {
    this.schema.params = schema;
    return this as unknown as TypedRoutesHandler<RouteQuery, RouteBody, Params>;
  }

  public handler(
    handler: TypedHandler<RouteQuery, RouteBody, RouteParams>
  ): HandlerMetadata {
    const invokeHandler = async (req: Request, res: Response) => {
      let message = '';
      let query;
      let params;
      let body;
      try {
        message = 'Query';
        query = this.schema.query
          ? this.schema.query.parse(req.query)
          : undefined;
        message = 'Params';
        params = this.schema.params
          ? this.schema.params.parse(req.params)
          : undefined;
        message = 'Body';
        body = this.schema.body ? this.schema.body.parse(req.body) : undefined;
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          throw new ValidationError(`${message} ${validationError.toString()}`);
        }
      }
      return handler({ query, params, body, req, res });
    };
    return {
      method: this.method,
      path: this.path,
      handler: invokeHandler,
      __handlerMetadata: true,
    };
  }
}
