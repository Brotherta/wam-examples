import VuMeter from "../lib/utils/vu-meter.js";

const plugin1Url = "../node_modules/burns-audio-wam/dist/plugins/pianoroll/index.js";
const plugin2Url = "https://mainline.i3s.unice.fr/wam2/packages/obxd/index.js";

let audioCtx;

const btnStart = document.getElementById("btn-start");
const vuMeterCanvas = document.getElementById("canvas2");
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
async function startHost () {
    audioCtx = new AudioContext();
    await audioCtx.suspend();

    const vuMeter = new VuMeter(vuMeterCanvas, 30, 200);
    /* Import from the Web Audio Modules 2.0 SDK to initialize Wam Host.
    It initializes a unique ID for the current AudioContext. */
    const {default: initializeWamHost} = await import("../lib/sdk/initializeWamHost.js");
    const [hostGroupId] = await initializeWamHost(audioCtx);

    const {default: WAM1} = await import(plugin1Url);
    const {default: WAM2} = await import(plugin2Url);

    /**
     * Create the Instance of the WAM plugins.
     * @type {Promise<IWebAudioModule<*>>|Promise<WebAudioModule<WamNode>>|*}
     */
    let gain = audioCtx.createGain();
    /**
     * @type {WamNode}
     */
    let keyboardInstance = await WAM1.createInstance(hostGroupId, audioCtx);
    let keyboardDom = await keyboardInstance.createGui();
    /**
     * @type {WamNode} 
     */
    let obxdInstance = await WAM2.createInstance(hostGroupId, audioCtx);
    let pluginDom2 = await obxdInstance.createGui();

    obxdInstance.audioNode.connect(gain).connect(audioCtx.destination);
    obxdInstance.audioNode.connect(keyboardInstance.audioNode);
    keyboardInstance.audioNode.connectEvents(obxdInstance.instanceId);

    /**
     * Mount the plugins to the host.
     * @type {Element}
     */
    let mount1 = document.querySelector("#mount1");
    mount1.innerHTML = "";
    await mount1.appendChild(keyboardDom);

    let mount2 = document.querySelector("#mount2");
    mount2.innerHTML = "";
    await mount2.appendChild(pluginDom2);

    btnStart.onclick = () => {
        if (audioCtx.state === "running") {
            audioCtx.suspend();
            btnStart.textContent = "Start";
        } else {
            audioCtx.resume();
            btnStart.textContent = "Stop";
            keyboardInstance.audioNode.scheduleEvents({
                type: 'wam-transport', data: {
                    playing: true,
                    timeSigDenominator: 4,
                    timeSigNumerator: 4,
                    currentBar: 0,
                    currentBarStarted: audioCtx.currentTime,
                    tempo: 120
                }
            })
        }
    }
    loadingWheelDiv.style.display = "none";
    widgetLoadingDiv.style.display = "";
}
