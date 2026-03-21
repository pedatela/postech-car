import express from 'express';
import routes from './app/http/routes';

const appName = 'Postech Car';
const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

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
  console.log(`[${new Date().toISOString()}] ${appName} ouvindo na porta ${port}`);
});
