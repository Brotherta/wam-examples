/**
 * @class
 * @extends {AudioWorkletNode}
 * Class to extend the default built-in AudioWorkletNode.
 * It is important to override the class to defines our own Processor - See {AudioPlayerProcessor}
 */
class AudioPlayerNode extends AudioWorkletNode {
    /**
     * @param {BaseAudioContext} context  Audio context of the host
     * @param {number} channelCount Number of channel in the host
     */
    constructor(context, channelCount) {
        /**
         * @param {string} "audio-player-processor" The custom processor
         * @param {AudioWorkletNodeOptions} processorOptions The options for the processor (number of inputs, number of outputs, number of channel given in the constructor
         */
        super(context, "audio-player-processor", {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            channelCount
        });
    }

    /**
     * @param {Float32Array[]} audio send to the processor the audio to process.
     */
    setAudio(audio) {
        this.port.postMessage({audio});
    }
}

export default AudioPlayerNode;
