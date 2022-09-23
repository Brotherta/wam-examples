/**
 * @class
 * @extends {AudioWorkletNode}
 * Class to extend the default built-in AudioWorkletNode.
 * It is important to override the class to defines our own Processor - See {AudioPlayerProcessor}
 * This version will use a C++ Processors compiled in a Web Assembly module with Emscriptem.
 */
class AudioPlayerNode extends AudioWorkletNode {
    /**
     * @param {BaseAudioContext} context  Audio context of the host
     * @param {number} channelCount Number of channel in the host
     * @param {WebAssembly.Module} moduleWasm Web Assembly Module pre-compiled.
     */
    constructor(context, channelCount, moduleWasm) {
        /**
         * @param {string} "audio-player-processor" The custom processor
         * @param {AudioWorkletNodeOptions} processorOptions The options for the processor (number of inputs, number of outputs, number of channel given in the constructor
         */
        super(context, "audio-player-processor", {
            numberOfInputs: 0,
            numberOfOutputs: 2,
            channelCount
        });
        /** Send Web Assembly Module to the custom processor. */
        this.setWasm(moduleWasm);
    }

    /**
     * @param {Float32Array[]} audio send to the processor the audio to process.
     */
    setAudio(audio) {
        this.port.postMessage({audio});
    }

    setWasm(moduleWasm) {
        this.port.postMessage({moduleWasm});
    }
}

export default AudioPlayerNode;
