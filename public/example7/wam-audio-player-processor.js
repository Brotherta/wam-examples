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
    const COUNT_BLOCK = 16;

    const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);

    /**
     * @class
     *
     * Class of our custom processor implementing WAM standard. In this example, the processor doesn't provide any new features
     * and doesn't take advantage of the Web Audio Module SDK. It will be in a later example with plugins and the plugin's parameters.
     */
    class MyWamProcessor extends ModuleScope.WamProcessor {


        /**
         * @param {AudioWorkletNodeOptions} options
         */
        constructor(options) {
            super(options);

            this.sum = 0;
            this.blockCount = 0;
            this.ready = false;

            /** @param {MessageEvent<{ audio?: Float32Array[]; position?: number }>} e */
            this.port.onmessage = (e) => {
               if (e.data.ready) {
                    console.log("Processor ready.")
                    this.ready = true;
               }
            };
        }

        calculateMax(input) {
            for (let i = 0; i < input.length; i++) {
                this.max = Math.max(this.max, input[i]);
            }
            this.blockCount++;
            if (this.blockCount >= COUNT_BLOCK) {
                this.port.postMessage({volume: this.max});
                this.max = 0;
                this.blockCount = 0;
            }
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
            if (!this.ready) return true;
            this.calculateMax(inputs[0][0]);
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