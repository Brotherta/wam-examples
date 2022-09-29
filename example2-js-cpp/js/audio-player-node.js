/**
 * @class
 * @extends {AudioWorkletNode}
 * Class to extend the default built-in AudioWorkletNode.
 * It is important to override the class to define our Processor - See {AudioPlayerProcessor}
 * This version will use a C++ Processors compiled in a Web Assembly module with Emscriptem.
 */
class AudioPlayerNode extends AudioWorkletNode {
    /**
     * @constructor
     *
     * @param {BaseAudioContext} context  Audio context of the host
     * @param {number} channelCount Number of channels in the host
     * @param {WebAssembly.Module} moduleWasm Web Assembly Module pre-compiled.
     */
    constructor(context, channelCount, moduleWasm) {
        /**
         * @param {string} "audio-player-processor" The custom processor.
         * @param {AudioWorkletNodeOptions} processorOptions The options for the processor (number of inputs, number of outputs, number of channel given in the constructor.
         */
        super(context, "audio-player-processor", {
            numberOfInputs: 0,
            numberOfOutputs: 2,
            channelCount,
            processorOptions: {
                moduleWasm
            }

        });
    }

    /**
     * @property {Function} setAudio Sends the audio buffer to the processor in the audio thread.
     *
     * @param {Float32Array[]} audio Audio Buffer to be transferred to the processor in the audio to process.
     */
    setAudio(audio) {
        this.port.postMessage({audio});
    }
}

export default AudioPlayerNode;
