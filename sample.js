var http = require('http');

http.createServer(function (request, Response) {
    Response.writeHead(200, {'Content-type': 'text/plain'});
    Response.end('This is a Nodejs sample applica');
}).listen(9000);

  