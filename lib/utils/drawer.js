/**
 * Simple function to draw in a canvas the waveform of the audio buffer source.
 * @param {HTMLCanvasElement}canvas
 * @param {AudioBuffer} buffer
 * @param {String} color
 * @param {number} width
 * @param {number} height
 */
export function drawBuffer(canvas, buffer, color, width, height) {
    let ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (color) {
        ctx.fillStyle = color;
    }
    let data = buffer.getChannelData(0);
    let step = Math.ceil(data.length / width);
    let amp = height / 2;
    for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
            let datum = data[i * step + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
}