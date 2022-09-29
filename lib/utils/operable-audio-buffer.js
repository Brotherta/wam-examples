/**
 * @class
 * @extends AudioBuffer
 *
 * Class to add custom operation on the audio buffer.
 * For instance clone the buffer, reverse the audio, inverse, edit, etc...
 */
class OperableAudioBuffer extends AudioBuffer {
    /**
     * @property {Function} clone It clones the current buffer and return a new one.
     * @return {OperableAudioBuffer}
     */
    clone() {
        const newBuffer = new OperableAudioBuffer(this);
        for (let i = 0; i < this.numberOfChannels; i++) {
            const channel = this.getChannelData(i);
            newBuffer.copyToChannel(channel, i);
        }
        return newBuffer;
    }

    /**
     * @property {Function} reverse Reverses the current audio buffer.
     * @return {void}
     */
    reverse() {
        for (let i = 0; i < this.numberOfChannels; i++) {
            const channel = this.getChannelData(i);
            channel.reverse();
        }
    }

    /**
     * @property {Function} inverse Inverses the audio of the current audio buffer.
     * @return {void}
     */
    inverse() {
        for (let i = 0; i < this.numberOfChannels; i++) {
            const channel = this.getChannelData(i);
            for (let j = 0; j < channel.length; j++) {
                channel[j] = -channel[j];
            }
        }
    }
    /**
     * @property {Function} concat Concatenates to the current audio buffer a new buffer given in parameters.
     * @param {AudioBuffer} that
     * @param {number} [numberOfChannels]
     * @return {AudioBuffer}
     */
    concat(that, numberOfChannels = this.numberOfChannels) {
        const { sampleRate } = this;
        const length = this.length + that.length;
        const buffer = new OperableAudioBuffer({ numberOfChannels, length, sampleRate });
        const from = this.length;
        for (let i = 0; i < numberOfChannels; i++) {
            if (i < this.numberOfChannels) buffer.copyToChannel(this.getChannelData(i), i);
            if (i < that.numberOfChannels) buffer.copyToChannel(that.getChannelData(i), i, from);
        }
        return buffer;
    }
    /**
     * @property {Function} split Splits a buffer in two distinct audio buffers.
     * @param {number} from
     * @returns {[OperableAudioBuffer, OperableAudioBuffer]}
     */
    split(from) {
        if (from >= this.length || from <= 0) throw new RangeError("Split point is out of bound");
        const { length, sampleRate, numberOfChannels } = this;
        const buffer1 = new OperableAudioBuffer({ length: from, numberOfChannels, sampleRate });
        const buffer2 = new OperableAudioBuffer({ length: length - from, numberOfChannels, sampleRate });
        for (let i = 0; i < numberOfChannels; i++) {
            const channel1 = buffer1.getChannelData(i);
            const channel2 = buffer2.getChannelData(i);
            this.copyFromChannel(channel1, i);
            this.copyFromChannel(channel2, i, from);
        }
        return [buffer1, buffer2];
    }
    /**
     * @property {Function} write Write to the given channel a new value at the given index.
     * @param {number} channel
     * @param {number} index
     * @param {number} value
     * @return {void}
     */
    write(channel, index, value) {
        if (channel > this.numberOfChannels) throw new Error(`Channel written ${channel} out of range ${this.numberOfChannels}`);
        if (index > this.length) throw new Error(`Index written ${index} out of range ${this.length}`);
        this.getChannelData(channel)[index] = value;
    }

    /**
     * @property {Function} toArray Transform the current audio buffer to a new float 32 array.
     * @param shared
     * @return {Float32Array[]}
     */
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
