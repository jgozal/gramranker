var http = require('http');
var fs = require('fs');

http.createServer(function(request, response) {
  request.on('error', function(err) {
    console.error(err);
    response.statusCode = 400;
    response.end();
  });
  response.on('error', function(err) {
    console.error(err);
  });
  if (request.method === 'GET' && request.url === '/') {
    request.pipe(response);
    var index = fs.readFileSync('./index.html', 'utf8')
    response.end(index, "utf-8");      
  } else {
    response.statusCode = 404;
    response.end();
  }
}).listen(8080);
console.log("Server running on port 8080.")


