import 'dotenv/config';
import express from 'express';
import routes from './app/http/routes';
import { requestLogger } from './app/http/middlewares/request-logger';
import { logger } from './app/logger';

const appName = 'Postech Car';
const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(requestLogger);

app.get('/', (_req, res) => {
  res.json({
    app: appName,
    message: 'API em execução',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (_req, res) => {
  res.json({
    app: appName,
    message: 'API em execução',
    basePath: '/api',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', routes);

app.listen(port, () => {
  logger.info(`${appName} ouvindo`, { port });
});
