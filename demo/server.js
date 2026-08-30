import { open, realpath } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const canonicalProjectRoot = await realpath(projectRoot);
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
]);

function send(response, statusCode, message) {
  response.writeHead(statusCode, { 'content-type': 'text/plain; charset=utf-8' });
  response.end(message);
}

function isOutsideRoot(root, filePath) {
  const relativePath = relative(root, filePath);
  return relativePath === '..'
    || relativePath.startsWith(`..${sep}`)
    || isAbsolute(relativePath);
}

async function serve(request, response) {
  let pathname;

  try {
    const queryStart = request.url.indexOf('?');
    const rawPath = queryStart === -1
      ? request.url
      : request.url.slice(0, queryStart);
    const decodedRawPath = decodeURIComponent(rawPath).replaceAll('\\', '/');

    if (decodedRawPath.split('/').includes('..')) {
      send(response, 403, 'Forbidden');
      return;
    }

    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    send(response, 400, 'Bad Request');
    return;
  }

  if (pathname === '/' || pathname === '/demo/') {
    pathname = '/demo/index.html';
  }

  const filePath = resolve(projectRoot, `.${pathname}`);
  if (isOutsideRoot(projectRoot, filePath)) {
    send(response, 403, 'Forbidden');
    return;
  }

  let fileHandle;

  try {
    const canonicalPath = await realpath(filePath);
    if (isOutsideRoot(canonicalProjectRoot, canonicalPath)) {
      send(response, 403, 'Forbidden');
      return;
    }

    fileHandle = await open(canonicalPath, 'r');
    const fileStats = await fileHandle.stat();
    if (!fileStats.isFile()) {
      await fileHandle.close();
      send(response, 404, 'Not Found');
      return;
    }
  } catch {
    if (fileHandle) await fileHandle.close().catch(() => {});
    send(response, 404, 'Not Found');
    return;
  }

  response.writeHead(200, {
    'content-type': contentTypes.get(extname(filePath)) ?? 'application/octet-stream',
  });
  const stream = fileHandle.createReadStream();
  stream.on('error', (error) => response.destroy(error));
  stream.pipe(response);
}

export function createDemoServer() {
  return createServer(serve);
}

const isExecutedEntry = process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isExecutedEntry) {
  createDemoServer().listen(4173, '127.0.0.1', () => {
    console.log('Demo available at http://127.0.0.1:4173/demo/');
  });
}
