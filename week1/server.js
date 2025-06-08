const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Hello World</h1>');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
    console.log(`Request received: ${req.method} ${req.url}`);
});

server.listen(PORT, (error) => {
    if (error) {
        console.error(`Error in starting server: ${error.message}`);
    } else {
        console.log(`Server is running on http://localhost:${PORT}`);
    }   
});
