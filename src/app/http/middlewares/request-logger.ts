import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../logger';

const toMilliseconds = (start: bigint): number => {
  const diffNs = process.hrtime.bigint() - start;
  return Number(diffNs) / 1_000_000;
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = randomUUID();
  const start = process.hrtime.bigint();

  logger.info('Request received', {
    requestId,
    method: req.method,
    url: req.originalUrl
  });

  res.on('finish', () => {
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(toMilliseconds(start).toFixed(2))
    });
  });

  next();
};
