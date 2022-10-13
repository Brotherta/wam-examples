import {drawBuffer} from "../lib/utils/drawer.js";
import VuMeter from "./vu-meter.js";

const audioUrl = "../assets/audio/BasketCaseGreendayriffDI.mp3";

const audioCtx = new AudioContext();

const btnStart = document.getElementById("btn-start");
const inputLoop = document.getElementById("input-loop");
const canvas = document.getElementById("canvas1");
const vuMeterCanvas = document.getElementById("canvas2");
const example = document.getElementById("example");


/**
 * Self-invoking asynchronous function to initialize the host.
 */
(async () => {
    await audioCtx.suspend();
    const {default: OperableAudioBuffer} = await import("../lib/utils/operable-audio-buffer.js");
    const {default: AudioPlayerNode} = await import("./audio-player-node.js");
    const vuMeter = new VuMeter(vuMeterCanvas, 30, 200);


    // Register our custom JavaScript processor in the current audio worklet.
    await audioCtx.audioWorklet.addModule("./audio-player-processor.js");

    const response = await fetch(audioUrl);
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

    //Transform the audio buffer into a custom audio buffer to add logic inside. (Needed to manipulate the audio, for example, editing...)
    const operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype);
    const node = new AudioPlayerNode(audioCtx, 2);

    node.port.onmessage = ev => {
        let vol = 0;
        let sensitivity = 1.3;
        if (ev.data.volume) {
            vol = ev.data.volume;
        }
        vuMeter.update(Math.abs(vol) * sensitivity);
    }

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
            audioCtx.suspend();
            node.parameters.get("playing").value = 0;
            btnStart.textContent = "Start";
        } else {
            audioCtx.resume();
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
    document.querySelector(".loading").style.display = "none";
})();
