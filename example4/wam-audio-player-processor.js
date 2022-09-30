/**
 * Function to get the processor. We need it as it is for later when we will add the processor to the AudioWorklet.
 * We will take the function, stringify it and inject into the AudioWorklet with parameters.
 *
 * @param moduleId
 * @return {MyWamProcessor}
 */

const getProcessor = (moduleId) => {
    /** @type {AudioWorkletGlobalScope} */
    const audioWorkletGlobalScope = globalThis;
    const {registerProcessor} = audioWorkletGlobalScope;

    const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);

    /**
     * @class
     *
     * Class of our custom processor implementing WAM standard. In this example, the processor doesn't provide any new features
     * and doesn't take advantage of the Web Audio Module SDK. It will be in a later example with plugins and the plugin's parameters.
     */
    class MyWamProcessor extends ModuleScope.WamProcessor {
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
         * @param {AudioWorkletNodeOptions} options
         */
        constructor(options) {
            super(options);
            /** @type {Float32Array[]} */
            this.audio = null;
            /** @type {number} */
            this.playhead = 0;
        }

        /** @param {MessageEvent<{ audio?: Float32Array[]; position?: number }>} e */
        async _onMessage(e) {
            await super._onMessage(e);
            if (e.data.audio) {
                this.audio = e.data.audio;
            } else if (typeof e.data.position === "number") {
                this.playhead = e.data.position * sampleRate;
            } else if (e.data.restart) {
                this.playhead = 0;
            }
        }

        /**
         * Process the events received.
         * @param event
         * @private
         */
        _processEvent(event) {
            this.emitEvents(event);
        }

        /**
         * When the automations events are called, this function is called.
         * @private
         */
        _process() {}

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
            super.process(inputs, outputs, parameters);
            if (!this.audio) return true;
            const bufferSize = outputs[0][0].length;
            const audioLength = this.audio[0].length;

            // Only one output is used.
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
            return true;
        }
    }

    try {
        registerProcessor(moduleId, MyWamProcessor);
    } catch (error) {
        console.warn(error);
    }
    return MyWamProcessor
}
export default getProcessor;