const { download } = require("./core/youtube");
const { urldownload } = require("./server");

/**
 * Example usage in code:
 * download("https://www.youtube.com/watch?v=xyz", {
 *   format: "mp4",
 *   quality: 720,
 *   pathdownload: "./downloads",
 *   notification: true
 * });
 *
 * To start API server with Express:
 * const { urldownload } = require("video-to-format");
 * urldownload({ port: 8000, host: '127.0.0.1', useExpress: true, basePath: '/api/download' });
 */

module.exports = { download, urldownload };