const message = document.getElementById('message');
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({
    log: true,
    progress: ({ ratio }) => {
        message.innerHTML = `Complete: ${(ratio * 100.0).toFixed(2)}%`;
    },
});

const transcode = async () => {
    const video_bit_rate = document.getElementById('video-bit-rate').value;
    const audio_bit_rate = document.getElementById('audio-bit-rate').value;
    const audio_sampling_rate = document.getElementById('audio-sampling-rate').value;
    const need_deinterlace = document.getElementById('need-deinterlace').value;
    const size = document.getElementById('size').value;
    const codec_profile = document.getElementById('codec-profile').value;
    const codec_level = document.getElementById('codec-level').value;
    const frame_rate = document.getElementById('frame-rate').value;

    const video = document.getElementById('output-video');
    URL.revokeObjectURL(video.src);

    const uploaded_video = document.getElementById('uploader').files[0];
    const name = uploaded_video.name;
    message.innerHTML = 'Loading ffmpeg-core.js';
    await ffmpeg.load();

    const ffmpeg_params = [];
    ffmpeg_params.push('-i', name);                  // input file name
    ffmpeg_params.push('-c:v', 'libx264');           // convert to h264
    if (codec_profile) {
        ffmpeg_params.push('-profile', codec_profile); // h264 codec profile
    }
    if (codec_level) {
        ffmpeg_params.push('-level', codec_level); // h264 codec level
    }
    if (size) {
        ffmpeg_params.push('-s', size); // size (width x height)
    }
    if (frame_rate) {
        ffmpeg_params.push('-r', frame_rate); // frame rate
    }
    if (video_bit_rate || video_bit_rate < 0) {
        ffmpeg_params.push('-vb', video_bit_rate + 'k'); // video bit rate [kbps]
    }
    if (audio_bit_rate) {
        ffmpeg_params.push('-ab', audio_bit_rate + 'k'); // audio bit rate [kbps]
    }
    if (audio_sampling_rate) {
        ffmpeg_params.push('-ar', audio_sampling_rate ); // audio sampling rate [bps]
    }
    if (need_deinterlace) {
        ffmpeg_params.push('-vf', 'yadif=deint=interlaced'); // deinterlace
    }
    ffmpeg_params.push('output.mp4');                // output file name

    message.innerHTML = 'Start transcoding';
    ffmpeg.FS('writeFile', name, await fetchFile(uploaded_video));
    await ffmpeg.run(...ffmpeg_params);
    message.innerHTML = 'Complete transcoding';
    const data = ffmpeg.FS('readFile', 'output.mp4');
    const videoUrl = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

    video.src = videoUrl;
    document.getElementById('download').href = videoUrl;
}

document.getElementById('start-convert').addEventListener('click', transcode);
