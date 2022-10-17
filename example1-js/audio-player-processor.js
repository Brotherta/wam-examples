/** @type {AudioWorkletGlobalScope}*/
const {registerProcessor, sampleRate} = globalThis;
const PLAYHEAD_COUNT_MAX = 8;

/**
 * @class
 * @extends {AudioWorkletProcessor}
 *
 * Class to define custom operations in the audio processor.
 */
class AudioPlayerProcessor extends AudioWorkletProcessor {
    /**
     * @property {Function} parameterDescriptors Get the custom parameters of the processor.
     *
     * @returns {AudioParamDescriptor[]}
     */
    static get parameterDescriptors() {
        return [{
            name: "playing",
            minValue: 0,
            maxValue: 1,
            defaultValue: 0
        }, {
            name: "loop",
            minValue: 0,
            maxValue: 1,
            defaultValue: 0
        }];
    }

    /**
     * @constructor
     *
     * @param {AudioWorkletNodeOptions} options
     */
    constructor(options) {
        super(options);
        /**
         * @property {Float32Array[]} audio Audio given by the host.
         */
        this.audio = null;
        /**
         * @property {number} playhea Current position in the audio buffer.
         */
        this.playhead = 0;
        this.playheadCount = 0;
        /**
         * @param {MessageEvent<{ audio?: Float32Array[]; position?: number }>} e
         * Define listeners to handle messages of the host. There we listen for the decoded audio buffer.
         */
        this.port.onmessage = (e) => {
            if (e.data.audio) {
                this.audio = e.data.audio;
            }
        };
    }

    /**
     * @property {Function} process Renderer of the audio buffer. It consumes the quantum block.
     *
     * @param {Float32Array[][]} inputs
     * @param {Float32Array[][]} outputs
     * @param {Record<string, Float32Array>} parameters
     *
     * @description Default value of the quantum frame is 128.
     */
    process(inputs, outputs, parameters) {
        if (!this.audio) return true;

        // Initializing the buffer with the given outputs and the audio length.
        const bufferSize = outputs[0][0].length;
        const audioLength = this.audio[0].length;

        // Only one output is used. Because we use our buffer source see {OperableAudioBuffer}
        const output = outputs[0];

        for (let i = 0; i < bufferSize; i++) {
            const playing = !!(i < parameters.playing.length ? parameters.playing[i] : parameters.playing[0]);
            const loop = !!(i < parameters.loop.length ? parameters.loop[i] : parameters.loop[0]);
            if (!playing) continue; // Not playing
            if (this.playhead >= audioLength) { // Play was finished
                if (loop) this.playhead = 0; // Loop just enabled, reset playhead
                else continue; // EOF without loop
            }
            const channelCount = Math.min(this.audio.length, output.length);
            for (let channel = 0; channel < channelCount; channel++) {
                output[channel][i] = this.audio[channel][this.playhead];
            }
            this.playhead++;
        }

        // Logic to update the playhead position.
        this.playheadCount++;
        if (this.playheadCount >= PLAYHEAD_COUNT_MAX) {
            this.port.postMessage({playhead: this.playhead});
            this.playheadCount = 0;
        }
        return true;
    }
}

try {
    registerProcessor("audio-player-processor", AudioPlayerProcessor);
} catch (error) {
    console.warn(error);
}
