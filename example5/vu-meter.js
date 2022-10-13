class VuMeter {

    /**@type HTMLCanvasElement*/
    canvas;
    /** @type number */
    minValue;
    /** @type number */
    maxValue;
    /** @type CanvasRenderingContext2D */
    ctx;

    /**
     *
     * @param {HTMLCanvasElement} canvas
     * @param {number} height
     * @param {number} width
     * @param {number} minValue
     * @param {number} maxValue
     */
    constructor(canvas, height, width) {
        this.canvas = canvas;
        this.canvas.height = height;
        this.canvas.width = width;

        this.ctx = this.canvas.getContext("2d")

        let gradient = this.ctx.createLinearGradient(0,0, width, height);
        gradient.addColorStop(0, "#08ff00");
        gradient.addColorStop(0.33, "#fffb00");
        gradient.addColorStop(0.66, "#ff7300");
        gradient.addColorStop(1, "#ff0000");

        this.ctx.fillStyle = gradient;
        this.ctx.clearRect(0,0,width,height);
    }

    update(value) {
        value = Math.min(value, 1);
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        this.ctx.fillRect(0, 0, value*this.canvas.width, this.canvas.height);
    }

}

export default VuMeter;