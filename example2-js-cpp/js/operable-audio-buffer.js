
class OperableAudioBuffer extends AudioBuffer {

    toArray(shared = false) {
        const supportSAB = typeof SharedArrayBuffer !== "undefined";
        /** @type {Float32Array[]} */
        const channelData = [];
        const { numberOfChannels, length } = this;
        for (let i = 0; i < numberOfChannels; i++) {
            if (shared && supportSAB) {
                channelData[i] = new Float32Array(new SharedArrayBuffer(length * Float32Array.BYTES_PER_ELEMENT));
                channelData[i].set(this.getChannelData(i));
            } else {
                channelData[i] = this.getChannelData(i);
            }
        }
        return channelData;
    }
}

export default OperableAudioBuffer;
