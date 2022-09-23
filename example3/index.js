const audioUrl = "https://wasabi.i3s.unice.fr/WebAudioPluginBank/BasketCaseGreendayriffDI.mp3";
const plugin1Url = "https://mainline.i3s.unice.fr/wam2/packages/StonePhaserStereo/index.js";
const plugin2Url = "https://mainline.i3s.unice.fr/wam2/packages/BigMuff/index.js";

export const audioCtx = new AudioContext();
/** @type {HTMLButtonElement} */
// @ts-ignore
const btnStart = document.getElementById("btn-start");
/** @type {HTMLInputElement} */
// @ts-ignore
const inputLoop = document.getElementById("input-loop");

(async () => {
    const { default: initializeWamHost } = await import('./sdk/initializeWamHost.js');
    const [hostGroupId] = await initializeWamHost(audioCtx);

    const { default: MyWam } = await import('./my-wam.js');
    const { default: WAM1 } = await import(plugin1Url);
    const { default: WAM2 } = await import(plugin2Url);

    let wamInstance = await MyWam.createInstance(hostGroupId, audioCtx);
    /** @type {import("./audio-player-node.js").default} */
    let node = wamInstance.audioNode;

    const { default: OperableAudioBuffer } = await import("./operable-audio-buffer.js");

    const response = await fetch(audioUrl);
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

    /** @type {import("./operable-audio-buffer.js").default} */
    const operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype);

    node.setAudio(operableAudioBuffer.toArray());


    let pluginInstance1 = await WAM1.createInstance(hostGroupId, audioCtx);
    let pluginDom1 = await pluginInstance1.createGui();

    let pluginInstance2 = await WAM2.createInstance(hostGroupId, audioCtx);
    let pluginDom2 = await pluginInstance2.createGui();

    node.connect(pluginInstance1._audioNode).connect(pluginInstance2._audioNode).connect(audioCtx.destination);
    node.parameters.get("playing").value = 0;
    node.parameters.get("loop").value = 1;

    let mount1 = document.querySelector("#mount1");
    mount1.innerHTML = '';
    await mount1.appendChild(pluginDom1);

    let mount2 = document.querySelector("#mount2");
    mount2.innerHTML = '';
    await mount2.appendChild(pluginDom2);

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
    console.log("end");
    btnStart.style.display = "";
})();
