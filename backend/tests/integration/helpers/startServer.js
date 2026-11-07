import { createServer } from 'node:http';

export async function startTestServer() {
  process.env.NODE_ENV = 'test';
  const { default: app } = await import('../../../src/index.js');

  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve({ server, baseUrl });
    });
    server.on('error', reject);
  });
}

export async function stopTestServer(server) {
  if (server?.listening) {
    await new Promise((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  }
}
