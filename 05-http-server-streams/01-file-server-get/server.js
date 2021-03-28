const url = require('url');
const http = require('http');
const path = require('path');
const {
  stat,
  createReadStream,
} = require('fs');


const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end();
      } else {
        stat(filepath, (err, stat) => {
          if (err && err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end();
          } else {
            res.writeHead(200, {'Content-Length': stat.size});

            const stream = createReadStream(filepath);
            stream.pipe(res);
            res.on('close', () => {
              stream.destroy();
            });
          }
        });
      }
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
