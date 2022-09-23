import {drawBuffer} from "../lib/utils/drawer.js";

const audioUrl = "https://wasabi.i3s.unice.fr/WebAudioPluginBank/BasketCaseGreendayriffDI.mp3";

const audioCtx = new AudioContext();

const btnStart = document.getElementById("btn-start");
const inputLoop = document.getElementById("input-loop");
const canvas = document.getElementById("canvas1");
const example = document.getElementById("example");

(async () => {
    const { default: OperableAudioBuffer } = await import("../lib/utils/operable-audio-buffer.js");
    const { default: AudioPlayerNode } = await import("./audio-player-node.js");
    await audioCtx.audioWorklet.addModule("./audio-player-processor.js");

    const response = await fetch(audioUrl);
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

    /** @type {import("../lib/utils/operable-audio-buffer.js").default} */
    const operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype);
    const node = new AudioPlayerNode(audioCtx, 2);

    drawBuffer(canvas, audioBuffer, "blue", 600, 100);

    node.setAudio(operableAudioBuffer.toArray());
    node.connect(audioCtx.destination);
    node.parameters.get("playing").value = 0;
    node.parameters.get("loop").value = 1;

    btnStart.onclick = () => {
        if (audioCtx.state === "suspended") audioCtx.resume();
        const playing = node.parameters.get("playing").value;
        if (playing === 1) {
            node.parameters.get("playing").value = 0;
            btnStart.textContent = "Start";
        } else {
            node.parameters.get("playing").value = 1;
            btnStart.textContent = "Stop";
        }
    }
    inputLoop.checked = true;
    inputLoop.onchange = () => {
        const loop = node.parameters.get("loop").value;
        if (loop === 1) {
            node.parameters.get("loop").value = 0;
            inputLoop.checked = false;
        } else {
            node.parameters.get("loop").value = 1;
            inputLoop.checked = true;
        }
    }
    example.style.display = "";
    $(".loading").css("display", "none");
})();
