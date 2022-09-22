class AudioPlayerNode extends AudioWorkletNode {
    /**
     * @param {BaseAudioContext} context
     * @param {number} channelCount
     * @param {WebAssembly.Module} moduleWasm
     */
    constructor(context, channelCount, moduleWasm) {
        super(context, "audio-player-processor", {
            numberOfInputs: 0,
            numberOfOutputs: 2,
            channelCount
        });
        this.setWasm(moduleWasm);
    }
    /**
     * @param {Float32Array[]} audio
     */
    setAudio(audio) {
        this.port.postMessage({ audio });
    }

    setWasm(moduleWasm) {
        this.port.postMessage( { moduleWasm });
    }

    /** @param {number} position set playhead in seconds */
    setPosition(position) {
        this.port.postMessage({ position });
    }
}

export default AudioPlayerNode;
