'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  const publicPath = path.resolve(__dirname, '..', 'public');

  return http.createServer((request, response) => {
    const sendTextResponse = (status, message) => {
      response.setHeader('Content-Type', 'text/plain');
      response.statusCode = status;
      response.end(message);
    };

    if (request.url.includes('..')) {
      return sendTextResponse(400, 'Bad Request');
    }

    const { pathname } = new URL(request.url, 'http://localhost');

    if (!pathname.startsWith('/file')) {
      return sendTextResponse(400, 'Bad Request');
    }

    if (pathname === '/file') {
      return sendTextResponse(200, 'To get a file use /file/path/to/file');
    }

    if (pathname.includes('//')) {
      return sendTextResponse(404, 'Not Found');
    }

    if (!pathname.startsWith('/file/')) {
      return sendTextResponse(200, 'To get a file use /file/path/to/file');
    }

    let fileName = pathname.replace(/^\/file\/?/, '');

    if (fileName === '') {
      fileName = 'index.html';
    }

    const filePath = path.join(publicPath, fileName);
    const resolvedPath = path.resolve(filePath);

    if (!resolvedPath.startsWith(publicPath)) {
      return sendTextResponse(400, 'Bad Request');
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        return sendTextResponse(404, 'File not found');
      }

      response.statusCode = 200;
      response.end(data);
    });
  });
}

module.exports = {
  createServer,
};
