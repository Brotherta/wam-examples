


const getProcessor = (moduleId) => {
    /** @type {AudioWorkletGlobalScope} */
        // @ts-ignore
    const audioWorkletGlobalScope = globalThis;
    const {registerProcessor} = audioWorkletGlobalScope;

    const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);

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
            /** @param {MessageEvent<{ audio?: Float32Array[]; position?: number }>} e */
            this.port.onmessage = (e) => {
                if (e.data.audio) {
                    this.audio = e.data.audio;
                } else if (typeof e.data.position === "number") {
                    this.playhead = e.data.position * sampleRate;
                }
            };
        }

        async _onMessage(e) {
            await super._onMessage(e);
        }

        _processEvent(event) {
            this.emitEvents(event);
        }

        _process(){}

        /**
         * @param {Float32Array[][]} inputs
         * @param {Float32Array[][]} outputs
         * @param {Record<string, Float32Array>} parameters
         */
        process(inputs, outputs, parameters) {
            if (!this.audio) return true;
            const bufferSize = outputs[0][0].length;
            const audioLength = this.audio[0].length;
            /** Only one output is used. */
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