class AudioPlayerNode extends AudioWorkletNode {
    /**
     * @param {BaseAudioContext} context
     * @param {number} channelCount
     */
    constructor(context, channelCount) {
        super(context, "audio-player-processor", {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            channelCount
        });
    }
    /**
     * @param {Float32Array[]} audio
     */
    setAudio(audio) {
        this.port.postMessage({ audio });
    }
    /** @param {number} position set playhead in seconds */
    setPosition(position) {
        this.port.postMessage({ position });
    }
}

export default AudioPlayerNode;
