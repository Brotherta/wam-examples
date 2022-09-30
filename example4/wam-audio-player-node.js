import {addFunctionModule, WamNode} from "../lib/sdk/index.js";
import {audioCtx} from "./index.js";
import getProcessor from "./wam-audio-player-processor.js";

/**
 * @class
 * @extends WamNode
 *
 * Class that extends WamNode, use to add our own processor, (see getProcessor).
 */
export default class MyWamNode extends WamNode {

    /**
     * Registers scripts required for the processor. Must be called before constructor.
     * @param {BaseAudioContext} audioContext
     * @param {string} moduleId
     */
    static async addModules(moduleId) {
        const {audioWorklet} = audioCtx;
        await super.addModules(audioCtx, moduleId);
        await addFunctionModule(audioWorklet, getProcessor, moduleId);
    }

    constructor(module) {
        super(module,
            {
                processorOptions: {
                    numberOfInputs: 1,
                    numberOfOutputs: 1,
                    outputChannelCount: [2],
                    useSab: true
                }
            });

        // We add to the supported events, the WAM automation for plugins' parameters.
        this._supportedEventTypes = new Set(['wam-automation']);
    }

    /**
     * @property {Function} setAudio Sends the audio buffer.
     *
     * @param {Float32Array[]} audio Audio Buffer to be transferred to the processor in the audio to process.
     */
    setAudio(audio) {
        this.port.postMessage({audio});
    }
}