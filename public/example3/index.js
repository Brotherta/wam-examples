import {drawBuffer, Playhead} from "../lib/utils/drawer.js";

const audioUrl = "../assets/audio/Guitar.mp3";
const plugin1Url = "../node_modules/burns-audio-wam/dist/plugins/lfo/index.js";
const plugin2Url = "https://mainline.i3s.unice.fr/wam2/packages/BigMuff/index.js";

const btnStart = document.getElementById("btn-start");
const inputLoop = document.getElementById("input-loop");
const waveCanvas = document.getElementById("canvas1");
const playheadCanvas = document.getElementById("playhead");

const btnStartDemo = document.getElementById("btn-start-demo");
const demoDiv = document.getElementById("demo-div");
const widgetLoadingDiv = document.getElementById("widget-loading");
const loadingWheelDiv = document.getElementById("loading-wheel")

btnStartDemo.onclick = async () => {
    btnStartDemo.style.display = "none";
    demoDiv.style.display = "";
    await startHost();
}

export let audioCtx;

async function startHost()  {
    audioCtx = new AudioContext();
    await audioCtx.suspend();

    /* Import from the Web Audio Modules 2.0 SDK to initialize Wam Host.
    It initializes a unique ID for the current AudioContext. */
    const {default: initializeWamHost} = await import("../lib/sdk/initializeWamHost.js");
    const [hostGroupId] = await initializeWamHost(audioCtx);

    // Import our custom WAM Processor and the plugins.
    const {default: MyWam} = await import("./my-wam.js");
    const {default: WAM1} = await import(plugin1Url);
    const {default: WAM2} = await import(plugin2Url);
    const {default: OperableAudioBuffer} = await import("../lib/utils/operable-audio-buffer.js");

    // Create an instance of our Processor. We can get from the instance the audio node.
    let wamInstance = await MyWam.createInstance(hostGroupId, audioCtx);
    /** @type {import("./audio-player-node.js").default} */
    let node = wamInstance.audioNode;

    const response = await fetch(audioUrl);
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

    // Transforming the audio buffer into a custom audio buffer to add logic inside. (Needed to manipulate the audio, for example, editing...)
    const operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype);

    // Drawing the waveform in the canvas.
    drawBuffer(waveCanvas, audioBuffer, "blue", 600, 100);
    let playhead = new Playhead(playheadCanvas, waveCanvas, audioBuffer.length);

    // Creating the Instance of the WAM plugins.
    let pluginInstance1 = await WAM1.createInstance(hostGroupId, audioCtx);
    let pluginDom1 = await pluginInstance1.createGui();
    let pluginInstance2 = await WAM2.createInstance(hostGroupId, audioCtx);
    let pluginDom2 = await pluginInstance2.createGui();

    // Sending audio to the processor and connecting the node to the output destination.
    node.setAudio(operableAudioBuffer.toArray());
    node.connect(pluginInstance1._audioNode).connect(pluginInstance2._audioNode).connect(audioCtx.destination);
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

    // Mounting the plugin dom to the html.
    let mount1 = document.querySelector("#mount1");
    mount1.innerHTML = "";
    await mount1.appendChild(pluginDom1);

    let mount2 = document.querySelector("#mount2");
    mount2.innerHTML = "";
    await mount2.appendChild(pluginDom2);

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

    loadingWheelDiv.style.display = "none";
    widgetLoadingDiv.style.display = "";
}
