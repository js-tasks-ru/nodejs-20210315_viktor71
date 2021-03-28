const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      if (pathname.includes('/') || pathname.includes('..')) {
        res.statusCode = 400;
        res.end();
      } else {
        const streamLimit = new LimitSizeStream({limit: 1048576});
        const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});

        streamLimit
            .on('error', (error) => {
              if (error.code === 'LIMIT_EXCEEDED') {
                fs.unlink(filepath, (err) => {
                  if (err) {
                    res.statusCode = 500;
                    res.end();
                  } else {
                    res.statusCode = 413;
                    res.end('Too Large');
                  }
                });
              } else {
                res.statusCode = 500;
                res.end();
              }
            });

        writeStream
            .on('error', (error) => {
              if (error.code === 'EEXIST') {
                res.statusCode = 409;
              } else {
                res.statusCode = 500;
              }
              res.end();
            })
            .on('finish', () => {
              res.statusCode = 201;
              res.end();
            });

        req.on('close', () => {
          if (req.aborted) {
            fs.unlink(filepath, (err) => {
              if (err) {
                res.statusCode = 500;
              }
              res.end();
            });
          } else {
            res.end();
          }
        });

        req.pipe(streamLimit).pipe(writeStream);
      }
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
