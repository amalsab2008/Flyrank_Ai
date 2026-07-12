# API Endpoint Verification Report (BE-01)
**Intern**: Amal S  
**Track**: Backend AI Engineering  
**Date**: July 12, 2026  

---

## 1. Server Implementation
The server is built in Node.js using the native `http` module, requiring zero external dependencies.

*   File path: `Backend/server.js`

```javascript
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
```

---

## 2. Curl Local Verification Output

The local server was started and tested using `curl.exe` to verify both JSON endpoints.

### Test 1: GET / (Root Endpoint)
**Command**:
```bash
curl.exe -i http://localhost:3000/
```

**Output**:
```text
HTTP/1.1 200 OK
Content-Type: application/json
Date: Sun, 12 Jul 2026 05:06:26 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"status":"ok","message":"Welcome to my backend!"}
```

---

### Test 2: GET /api/info (Info Endpoint)
**Command**:
```bash
curl.exe -i http://localhost:3000/api/info
```

**Output**:
```text
HTTP/1.1 200 OK
Content-Type: application/json
Date: Sun, 12 Jul 2026 05:06:26 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"track":"Backend AI Engineering","assignment":"BE-01: Build your first API endpoint","author":"Amal S","timestamp":"2026-07-12T05:06:26.663Z"}
```

---

### Test 3: GET /invalid-route (404 Fallback)
**Command**:
```bash
curl.exe -i http://localhost:3000/invalid-route
```

**Output**:
```text
HTTP/1.1 404 Not Found
Content-Type: application/json
Date: Sun, 12 Jul 2026 05:06:26 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"error":"Not Found","path":"/invalid-route"}
```
