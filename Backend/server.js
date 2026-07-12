const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Set Content-Type as JSON for all API responses
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: "ok", message: "Welcome to my backend!" }));
  } else if (req.url === '/api/info' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      track: "Backend AI Engineering",
      assignment: "BE-01: Build your first API endpoint",
      author: "Amal S",
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not Found", path: req.url }));
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
