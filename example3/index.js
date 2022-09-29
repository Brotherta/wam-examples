import {drawBuffer} from "../lib/utils/drawer.js";

const audioUrl = "https://wasabi.i3s.unice.fr/WebAudioPluginBank/BasketCaseGreendayriffDI.mp3";
const plugin1Url = "https://mainline.i3s.unice.fr/wam2/packages/StonePhaserStereo/index.js";
const plugin2Url = "https://mainline.i3s.unice.fr/wam2/packages/BigMuff/index.js";

export const audioCtx = new AudioContext();

const btnStart = document.getElementById("btn-start");
const inputLoop = document.getElementById("input-loop");
const canvas = document.getElementById("canvas1");
const example = document.getElementById("example");

/**
 * Self-invoking asynchronous function to initialize the host.
 */
(async () => {
    /**
     * Import from the Web Audio Modules 2.0 SDK to initialize Wam Host.
     * It initializes a unique ID for the current AudioContext.
     */
    const { default: initializeWamHost } = await import('./sdk/initializeWamHost.js');
    const [hostGroupId] = await initializeWamHost(audioCtx);

    /**
     * Import our custom WAM Processor and the plugins.
     */
    const { default: MyWam } = await import('./my-wam.js');
    const { default: WAM1 } = await import(plugin1Url);
    const { default: WAM2 } = await import(plugin2Url);

    /**
     * Create an instance of our Processor. We can get from the instance the audio node.
     * @type {WebAudioModule<WamNode>}
     */
    let wamInstance = await MyWam.createInstance(hostGroupId, audioCtx);
    /** @type {import("./audio-player-node.js").default} */
    let node = wamInstance.audioNode;

    /** @type {import("../lib/utils/operable-audio-buffer.js").default}
     * Transform the audio buffer in a custom audio buffer to add logic inside. (Needed to manipulate the audio, for example editing...)
     */
    const { default: OperableAudioBuffer } = await import("../lib/utils/operable-audio-buffer.js");

    const response = await fetch(audioUrl);
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
    /** @type {import("../lib/utils/operable-audio-buffer.js").default} */
    const operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype);

    /** Draw the waveform in the canvas. */
    drawBuffer(canvas, audioBuffer, "blue", 600, 100);


    /**
     * Create the Instance of the WAM plugins.
     * @type {Promise<IWebAudioModule<*>>|Promise<WebAudioModule<WamNode>>|*}
     */
    let pluginInstance1 = await WAM1.createInstance(hostGroupId, audioCtx);
    let pluginDom1 = await pluginInstance1.createGui();

    let pluginInstance2 = await WAM2.createInstance(hostGroupId, audioCtx);
    let pluginDom2 = await pluginInstance2.createGui();

    /**
     * Sending audio to the processor and connecting the node to the output destination.
     */
    node.setAudio(operableAudioBuffer.toArray());
    node.connect(pluginInstance1._audioNode).connect(pluginInstance2._audioNode).connect(audioCtx.destination);
    node.parameters.get("playing").value = 0;
    node.parameters.get("loop").value = 1;

    /**
     * Mount the plugins to the host.
     * @type {Element}
     */
    let mount1 = document.querySelector("#mount1");
    mount1.innerHTML = '';
    await mount1.appendChild(pluginDom1);

    let mount2 = document.querySelector("#mount2");
    mount2.innerHTML = '';
    await mount2.appendChild(pluginDom2);

    /**
     * Connecting host's logic of the page.
     */
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
    document.querySelector(".loading").style.display = "none";
})();
