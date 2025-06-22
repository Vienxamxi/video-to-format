const http = require("http");
const urlModule = require("url");
const express = require("express");
const { download } = require("./core/youtube");
const { configure, notifySuccess, notifyError } = require("./utils/Notification");

/**
 * Start a download API server. Supports both plain HTTP and Express.
 * @param {object} options
 * @param {number} options.port - Port to listen on (default 7000)
 * @param {string} options.host - Host to bind (default '0.0.0.0')
 * @param {boolean} options.useExpress - Use Express framework (default true)
 * @param {string} options.basePath - Base path for API endpoints (default '/download')
 */
function urldownload({ port = 7000, host = "0.0.0.0", useExpress = true, basePath = "/download" } = {}) {
    // Handler logic for download endpoint
    async function handleDownload(req, res) {
        const query = req.query || urlModule.parse(req.url, true).query;
        const videoUrl = query.url;
        const format = query.format || "mp3";
        const quality = query.quality ? (isNaN(query.quality) ? query.quality : parseInt(query.quality)) : undefined;
        const pathdownload = query.pathdownload || undefined;
        const notifyFlag = query.notify === "true" || query.notify === true;

        configure({ enabled: notifyFlag });

        if (!videoUrl) {
            res.statusCode = 400;
            return res.json ? res.json({ error: "Missing url parameter" }) : res.end(JSON.stringify({ error: "Missing url parameter" }));
        }

        try {
            const filePath = await download(videoUrl, { format, quality, pathdownload, notification: notifyFlag });
            const result = { success: true, path: filePath };
            if (res.json) {
                res.status(200).json(result);
            } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(result));
            }
        } catch (err) {
            const errorResult = { success: false, error: err.message };
            if (res.json) {
                res.status(500).json(errorResult);
            } else {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify(errorResult));
            }
        }
    }

    if (useExpress) {
        const app = express();
        app.get(basePath, handleDownload);
        app.listen(port, host, () => {
            console.log(`🚀 Express Download API listening at http://${host}:${port}${basePath}?url=<YouTube_URL>&format=mp4&quality=720&notify=true`);
        });
    } else {
        const server = http.createServer((req, res) => {
            const parsed = urlModule.parse(req.url, true);
            if (parsed.pathname === basePath && req.method === "GET") {
                // Wrap handleDownload: create fake req.query and res.json
                req.query = parsed.query;
                res.json = (obj) => {
                    res.writeHead(res.statusCode || 200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(obj));
                };
                handleDownload(req, res);
            } else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not Found");
            }
        });
        server.listen(port, host, () => {
            console.log(`🚀 HTTP Download API listening at http://${host}:${port}${basePath}?url=<YouTube_URL>&format=mp4&quality=720&notify=true`);
        });
    }
}

module.exports = { urldownload };