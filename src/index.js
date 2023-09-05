import createBareServer from '@tomphttp/bare-server-node';
import { fileURLToPath } from "url";
import { createServer as createHttpsServer } from "node:https";
import { createServer as createHttpServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import serveStatic from "serve-static";

const bare = createBareServer("/bare/");
const serve = serveStatic(fileURLToPath(new URL("../static/", import.meta.url)), { fallthrough: false });
var server;
if(existsSync("../ssl/key.pem") && existsSync("../ssl/cert.pem")) {
  server = createHttpsServer({
    key: readFileSync("../ssl/key.pem"),
    cert: readFileSync("../ssl/cert.pem")
  });
} else server = createHttpServer();

server.on("request", (req, res) => {
  if(bare.shouldRoute(req)) bare.routeRequest(req, res); else {
    serve(req, res, (err) => {
      res.writeHead(err?.statusCode || 500, null, {
        "Content-Type": "text/plain",
      });
      res.end('Error')
    })
  }
});

server.on("upgrade", (req, socket, head) => {
  if(bare.shouldRoute(req, socket, head)) bare.routeUpgrade(req, socket, head); else socket.end();
});

server.on('listening', () => {
  const addr = server.address();



server.listen({ port: (process.env.PORT || 8080) })
