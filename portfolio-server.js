const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT || 3000);
const root = __dirname;
const allowedFiles = new Set(['index.html', 'portfolio.html']);

function sendFile(response, filePath) {
    const extension = path.extname(filePath).toLowerCase();
    const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };
    response.writeHead(200, { 'Content-Type': types[extension] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname.startsWith('/api/')) {
        response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        return response.end(JSON.stringify({ error: 'A vitrine pública não possui API social' }));
    }
    if (url.pathname.startsWith('/Icons/')) {
        const relative = url.pathname.slice(1).replaceAll('/', path.sep);
        const filePath = path.resolve(root, relative);
        if (filePath.startsWith(path.resolve(root, 'Icons')) && fs.existsSync(filePath)) return sendFile(response, filePath);
    }
    const requested = url.pathname === '/' ? 'portfolio.html' : url.pathname.slice(1);
    const fileName = allowedFiles.has(requested) ? requested : 'index.html';
    sendFile(response, path.join(root, fileName));
});

server.listen(port, () => console.log(`Portfolio Your Life em http://localhost:${port}`));
