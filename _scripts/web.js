const { build } = require("esbuild");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const express = require("express");
const { WebSocketServer } = require("ws");

const filesRoot = path.join(__dirname, "_files");
const projectRoot = path.join(__dirname, "..");
const tmpFile = path.join(os.tmpdir(), "media-query-fns.ts");

const startDevServer = async () => {
  const wss = new WebSocketServer({ port: 8081 });
  wss.on("connection", (ws) => {
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });
  });
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  wss.on("close", () => {
    clearInterval(interval);
  });

  let prevBundledJS = "";

  await build({
    entryPoints: ["./_scripts/_files/index.tsx"],
    minify: true,
    bundle: true,
    outfile: tmpFile,
    platform: "browser",
    target: "es2017",
    logLevel: "warning",
    watch: {
      onRebuild: async (err) => {
        if (err) {
          console.error("Build failure:", err);
        } else {
          console.log("Build success");
          const bundledJS = fs.readFileSync(tmpFile, "utf8");
          if (bundledJS !== prevBundledJS) {
            prevBundledJS = bundledJS;
            wss.clients.forEach((ws) => {
              if (ws.isAlive) {
                ws.send("reload");
              }
            });
          }
        }
      },
    },
    footer: {
      js: `;(new WebSocket("ws://localhost:8081")).addEventListener("message",function(m){if(m.data=="reload")location.reload()})`,
    },
  });

  const bundledJS = fs.readFileSync(tmpFile, "utf8");
  if (bundledJS !== prevBundledJS) {
    prevBundledJS = bundledJS;
  }

  const setHeaders = (res) => {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");
  };

  const app = express();
  app.get("/", (_, res) => {
    setHeaders(res);
    res.sendFile(path.join(filesRoot, "index.html"));
  });
  app.get("/scripts.js", (_, res) => {
    setHeaders(res);
    res.setHeader("Content-Type", "text/javascript");
    res.sendFile(tmpFile);
  });
  app.get("/styles.css", (_, res) => {
    setHeaders(res);
    res.sendFile(path.join(filesRoot, "styles.css"));
  });
  app.listen(8080, () => {
    console.log(`Live reload server: http://localhost:8080`);
  });
};

startDevServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
