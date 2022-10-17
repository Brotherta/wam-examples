import {drawBuffer, Playhead} from "../lib/utils/drawer.js";

const audioUrl = "../assets/audio/Guitar.mp3";

const audioCtx = new AudioContext();

const btnStart = document.getElementById("btn-start");
const inputLoop = document.getElementById("input-loop");
const waveCanvas = document.getElementById("canvas1");
const playheadCanvas = document.getElementById("playhead");

const btnStartDemo = document.getElementById("btn-start-demo");
const demoDiv = document.getElementById("demo-div");
const widgetLoadingDiv = document.getElementById("widget-loading");
const loadingWheelDiv = document.getElementById("loading-wheel")

let moduleWasm;

/**
 * Fetches and loads the Web Assembly.
 * @return {Promise<void>}
 */
async function loadWasm() {
    WebAssembly.compileStreaming(fetch("./ProcessWasm.wasm"))
        .then(module => moduleWasm = module);
}

btnStartDemo.onclick = async () => {
    btnStartDemo.style.display = "none";
    demoDiv.style.display = "";
    await startHost();
}

async function startHost() {
    const audioCtx = new AudioContext();
    await audioCtx.suspend();
    await loadWasm();
    const {default: OperableAudioBuffer} = await import("../lib/utils/operable-audio-buffer.js");
    const {default: AudioPlayerNode} = await import("./js/audio-player-node.js");

    //Register our custom JavaScript processor in the current audio worklet.
    await audioCtx.audioWorklet.addModule("./js/audio-player-processor.js");

    const response = await fetch(audioUrl);
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

    // Transforming the audio buffer into a custom audio buffer to add logic inside. (Needed to manipulate the audio, for example, editing...)
    const operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype);
    const node = new AudioPlayerNode(audioCtx, 2, moduleWasm);

    // Drawing the waveform in the canvas.
    drawBuffer(waveCanvas, audioBuffer, "blue", 600, 100);
    let playhead = new Playhead(playheadCanvas, waveCanvas, audioBuffer.length);

    // Sending audio to the processor and connecting the node to the output destination.
    node.setAudio(operableAudioBuffer.toArray());
    node.connect(audioCtx.destination);
    node.parameters.get("playing").value = 0;
    node.parameters.get("loop").value = 1;


    // Updating the play head position.
    let curPos = 0;
    node.port.onmessage = (ev) => {
        if (ev.data.playhead) {
            curPos = ev.data.playhead;
        }
    }
    setInterval(()=>{
        if(audioCtx.state === "running") {
            playhead.update(curPos)
        }
    },16);

    // Connecting host's logic of the host page.
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

    loadingWheelDiv.style.display = "none";
    widgetLoadingDiv.style.display = "";
}
