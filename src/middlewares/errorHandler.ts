import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error & { status?: number },
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('[Error Global]:', err);

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    error: 'Internal server error.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
