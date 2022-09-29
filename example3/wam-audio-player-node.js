import {addFunctionModule, WamNode} from "./sdk/index.js";
import {audioCtx} from "./index.js";
import getProcessor from "./wam-audio-player-processor.js";

/**
 * @class
 * @extends WamNode
 *
 * Class that extends WamNode, use to add our own processor, (see getProcessor).
 */
export default class MyWamNode extends WamNode {

    static async addModules(moduleId) {
        const { audioWorklet } = audioCtx;
        await super.addModules(audioCtx, moduleId);
        await addFunctionModule(audioWorklet, getProcessor, moduleId);
    }

    constructor(module, options) {
        super(module, options);
    }

    /**
     * @param {Float32Array[]} audio
     */
    setAudio(audio) {
        this.port.postMessage({ audio });
    }
}