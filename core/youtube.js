const fs = require("fs");
const path = require("path");
const ytdl = require("@distube/ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const cliProgress = require("cli-progress");
const prettyBytes = require("pretty-bytes");
const readline = require("readline");
const notifier = require("node-notifier");
const { isVideoExtension } = require("../utils/videoTypes");

ffmpeg.setFfmpegPath(ffmpegPath);

const SUPPORTED_FORMATS_AUDIO = [
    "mp3", "wav", "flac", "aac", "m4a"
];

const SUPPORTED_FORMATS_VIDEO = [
    "mp4", "mkv", "webm", "avi"
]

const SUPPORTED_FORMATS = [
    ...SUPPORTED_FORMATS_AUDIO,
    ...SUPPORTED_FORMATS_VIDEO
];

function askUser(question) {
    return new Promise(resolve => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim().toLowerCase());
        });
    });
}

async function download(url, options = {}) {
    const format = (options.format || 'mp3').toLowerCase();
    const quality = options.quality || (SUPPORTED_FORMATS_AUDIO.includes(format) ? 128 : '360p');
    const outputPath = options.pathdownload || './downloads';

    if (!SUPPORTED_FORMATS.includes(format)) throw new Error(`❌ Format not supported: ${format}`);
    if (!ytdl.validateURL(url)) throw new Error("❌ Invalid YouTube URL");

    let info;
    try {
        info = await ytdl.getInfo(url);
    } catch (err) {
        throw new Error(`❌ Failed to get video info: ${err.message}`);
    }

    const title = (info.videoDetails.title || 'video')
        .replace(/[<>:"/\\|?*]+/g, '')
        .trim();
    const outputFile = path.join(outputPath, `${title}.${format}`);
    if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

    const isAudioOnly = SUPPORTED_FORMATS_AUDIO.includes(format);
    let selectedFormat = null;
    const allFormats = info.formats.filter(f =>
        isAudioOnly ? (f.hasAudio && !f.hasVideo) : (f.hasAudio && f.hasVideo)
    );

    if (allFormats.length === 0) throw new Error("❌ No compatible formats found.");

    if (isAudioOnly) {
        const audioMatches = allFormats.filter(f => f.audioBitrate && !isNaN(f.audioBitrate))
            .sort((a, b) => b.audioBitrate - a.audioBitrate);

        const requestedKbps = typeof quality === 'number' ? quality : parseInt(quality);
        selectedFormat = audioMatches.find(f => f.audioBitrate >= requestedKbps);

        if (!selectedFormat) {
            const maxAvailable = audioMatches[0]?.audioBitrate || 0;
            if (requestedKbps > maxAvailable) {
                const answer = await askUser(`⚠️ Your audio only supports up to ${maxAvailable}kbps. You requested ${requestedKbps}kbps. Continue? [Y/N] `);
                if (answer !== 'y') throw new Error("❌ Cancelled by user.");
            }
            selectedFormat = audioMatches[0];
        }
    } else {
        const qualityLabel = typeof quality === 'number' ? `${quality}p` : quality;
        selectedFormat = allFormats.find(f => f.qualityLabel === qualityLabel);

        if (!selectedFormat) {
            const availableNumbers = allFormats
                .map(f => parseInt(f.qualityLabel))
                .filter(q => !isNaN(q))
                .sort((a, b) => b - a);

            const maxQ = availableNumbers[0];
            const requestedQ = parseInt(qualityLabel);

            if (requestedQ > maxQ) {
                const answer = await askUser(`⚠️ Your video only supports up to ${maxQ}p. You requested ${requestedQ}p. Continue? [Y/N] `);
                if (answer !== 'y') throw new Error("❌ Cancelled by user.");
                selectedFormat = allFormats.find(f => parseInt(f.qualityLabel) === maxQ);
            } else {
                selectedFormat = allFormats
                    .filter(f => parseInt(f.qualityLabel) <= requestedQ)
                    .sort((a, b) => parseInt(b.qualityLabel) - parseInt(a.qualityLabel))[0];
            }
        }
    }

    if (!selectedFormat) throw new Error("❌ Could not select a suitable format.");

    const stream = ytdl.downloadFromInfo(info, { quality: selectedFormat.itag });

    const progressBar = new cliProgress.SingleBar({
        format: `[{bar}] {percentage}% | {downloaded} / {total}`,
        barCompleteChar: '#',
        barIncompleteChar: '-',
        hideCursor: true
    });

    let totalSize = 0;
    stream.on('response', (res) => {
        const total = res.headers['content-length'];
        if (total) {
            totalSize = parseInt(total);
            progressBar.start(totalSize, 0, {
                downloaded: '0 MB',
                total: prettyBytes(totalSize)
            });
        }
    });

    return new Promise((resolve, reject) => {
        let downloadedSize = 0;

        stream.on('data', (chunk) => {
            downloadedSize += chunk.length;
            if (totalSize > 0) {
                progressBar.update(downloadedSize, {
                    downloaded: prettyBytes(downloadedSize),
                    total: prettyBytes(totalSize)
                });
            }
        });

        const cmd = ffmpeg(stream)
            .toFormat(format)
            .on('end', () => {
                progressBar.stop();
                console.log(`\n✅ Download completed: ${outputFile}`);
                notifier.notify({
                    title: 'Download Complete',
                    message: title,
                    sound: true
                });
                resolve(outputFile);
            })
            .on('error', err => {
                progressBar.stop();
                reject(err);
            });

        if (isAudioOnly) cmd.noVideo();
        cmd.save(outputFile);
    });
}

module.exports = { download };