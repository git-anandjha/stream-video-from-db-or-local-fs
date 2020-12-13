var router = require('express').Router();
var fs = require('fs')

router.get("/", function (req, res) {
    // Ensure there is a range given for the video
    const range = req.headers.range;

    const videoFile = req.query.search;
    console.log(videoFile + " was requested");
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    // get video stats (about 61MB)
    const videoPath = "videos/" + videoFile;
    const videoSize = fs.statSync(videoPath).size;

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });

    // Stream the video chunk to the client
    videoStream.pipe(res);
});

module.exports = router;