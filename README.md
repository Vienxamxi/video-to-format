# 🎬 video-to-format

🎥 Download YouTube videos in various formats (mp4, mp3, mkv, webm, avi, wav, flac, aac, m4a) with quality control, progress bar, and optional system notifications.

## 📦 Installation

```bash
npm install video-to-format
```

## 🚀 CLI Usage

```bash
npx video-to-format <YouTube_URL> <format> [quality] [outputPath] [--notify]
```

### 📝 Example:

```bash
npx video-to-format https://www.youtube.com/watch?v=dQw4w9WgXcQ mp3 128 ./music --notify
```

## 🧑‍💻 API Usage

```JavaScript
const { download } = require("video-to-format");

download("https://www.youtube.com/watch?v=xyz", {
  format: "mp4",
  quality: 720,
  pathdownload: "./downloads",
  notification: true // Optional
});
```

## 🌐 Run as Server

```JavaScript
const { startServer } = require("video-to-format");

startServer({
  port: 7000,
  host: "localhost",
  basePath: "/download",
  useExpress: true
});
```
Access: http://localhost:7000/download?url=...&format=mp3&quality=128

### ✅ Features
- Support formats: mp4, mp3, mkv, webm, avi, wav, flac, aac, m4a
- Audio/Video quality control
- Progress bar with size indicator
- Terminal + API support
- Optional system notification on complete

## 📄 License

Copyright © 2025 by Vienxamxi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.