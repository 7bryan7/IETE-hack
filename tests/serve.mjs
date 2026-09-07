import { createServer } from 'vite';
const server = await createServer({ server: { host: '127.0.0.1', port: 3100, strictPort: true, open: false } });
await server.listen();
