const videoExtensions = require('video-extensions');

/**
 * Kiểm tra một định dạng có phải là video không
 * @param {string} ext - Phần mở rộng (ví dụ: 'mp4', 'mkv', ...)
 * @returns {boolean}
 */
function isVideoExtension(ext) {
    return Array.isArray(videoExtensions) && videoExtensions.includes(ext.toLowerCase());
}

/**
 * Danh sách tất cả định dạng video được hỗ trợ
 */
function getSupportedVideoExtensions() {
    return Array.isArray(videoExtensions) ? videoExtensions : [];
}

module.exports = {
    isVideoExtension,
    getSupportedVideoExtensions
};