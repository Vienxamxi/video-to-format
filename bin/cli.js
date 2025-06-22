#!/usr/bin/env node
const { download } = require("../core/youtube");
const { configure, notifySuccess, notifyError } = require("../utils/Notification");

const args = process.argv.slice(2);

function printUsage() {
  console.log("📥 Usage: node cli.js <YouTube_URL> <format> [quality] [pathdownload] [--notify]");
}

if (args.length < 2) {
  printUsage();
  process.exit(1);
}

const url = args[0];
const format = args[1];
const quality = args[2] && !args[2].startsWith("--") ? (isNaN(args[2]) ? args[2] : parseInt(args[2])) : undefined;
const pathdownload = args[3] && !args[3].startsWith("--") ? args[3] : undefined;
const notifyFlag = args.includes("--notify");

// Cấu hình thông báo nếu người dùng bật tùy chọn --notify
configure({ enabled: notifyFlag });

download(url, { format, quality, pathdownload })
  .then(path => {
    const msg = `Download completed: ${path}`;
    console.log(`✅ ${msg}`);
    if (notifyFlag) notifySuccess(msg);
  })
  .catch(err => {
    const errMsg = `Error: ${err.message}`;
    console.error(`❌ ${errMsg}`);
    if (notifyFlag) notifyError(errMsg);
  });
