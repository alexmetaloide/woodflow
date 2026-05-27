import express from 'express';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(resolve(__dirname, 'dist'), {
  maxAge: '1y',
  immutable: true,
}));

app.get('*', (_req, res) => {
  res.sendFile(resolve(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`WoodFlow running at http://0.0.0.0:${PORT}`);
});
