import {addFunctionModule, WamNode} from "./sdk/index.js";
import {audioCtx} from "./index.js";
import getProcessor from "./wam-audio-player-processor.js";

export default class MyWamNode extends WamNode {

    static async addModules(moduleId) {
        const { audioWorklet } = audioCtx;
        await super.addModules(audioCtx, moduleId);
        await addFunctionModule(audioWorklet, getProcessor, moduleId);
    }

    constructor(module, options) {
        super(module, options);
        this._supportedEventTypes = new Set(['wam-automation']);
    }

    async _onMessage(e) {
        await super._onMessage(e);
    }

    /**
     * @param {Float32Array[]} audio
     */
    setAudio(audio) {
        this.port.postMessage({ audio });
    }
    /** @param {number} position set playhead in seconds */
    setPosition(position) {
        this.port.postMessage({ position });
    }
}