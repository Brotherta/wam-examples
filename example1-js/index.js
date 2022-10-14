import {drawBuffer} from "../lib/utils/drawer.js";

const audioUrl = "../assets/audio/Guitar.mp3";

const btnStart = document.getElementById("btn-start");
const inputLoop = document.getElementById("input-loop");
const canvas = document.getElementById("canvas1");

const btnStartDemo = document.getElementById("btn-start-demo");
const demoDiv = document.getElementById("demo-div");
const widgetLoadingDiv = document.getElementById("widget-loading");
const loadingWheelDiv = document.getElementById("loading-wheel")

btnStartDemo.onclick = async () => {
    btnStartDemo.style.display = "none";
    demoDiv.style.display = "";
    await startHost();
}

/**
 * Self-invoking asynchronous function to initialize the host.
 */
async function startHost() {
    const {default: OperableAudioBuffer} = await import("../lib/utils/operable-audio-buffer.js");
    const {default: AudioPlayerNode} = await import("./audio-player-node.js");
    const audioCtx = new AudioContext();
    // Register our custom JavaScript processor in the current audio worklet.
    await audioCtx.audioWorklet.addModule("./audio-player-processor.js");

    const response = await fetch(audioUrl);
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

    //Transform the audio buffer into a custom audio buffer to add logic inside. (Needed to manipulate the audio, for example, editing...)
    const operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype);
    const node = new AudioPlayerNode(audioCtx, 2);

    // Draw the waveform in the canvas.
    drawBuffer(canvas, audioBuffer, "blue", 600, 100);

    //Sending audio to the processor and connecting the node to the output destination.
    node.setAudio(operableAudioBuffer.toArray());
    node.connect(audioCtx.destination);
    node.parameters.get("playing").value = 0;
    node.parameters.get("loop").value = 1;

    // Connecting host's logic of the page.
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
    loadingWheelDiv.style.display = "none";
    widgetLoadingDiv.style.display = "";
}
