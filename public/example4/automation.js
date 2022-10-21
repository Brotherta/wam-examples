import {audioCtx} from "./index.js";
import {normalizePoints} from "../lib/utils/normalize-points.js";

/**
 * Sends to the processor the automation events.
 *
 * @param node The host audio node.
 * @param plugin The plugin that we want to automatize.
 * @param duration The duration of the current sound.
 * @return {Promise<void>}
 */
export default async function applyAutomation(node, plugin, duration) {
    let info = await plugin._audioNode.getParameterInfo();

    const {minValue, maxValue, label, id} = Object.values(info)[4];
    console.log(minValue, maxValue, label, id);

    let parameterPoints = [
        {value: minValue, time: 0},
        {value: maxValue, time: duration/2},
        {value: minValue, time: duration}
    ];
    let normalizedPoints = normalizePoints(parameterPoints, minValue, maxValue, 0.5, duration, 0.01);

    let events = [];
    for (let i = 0; i<normalizedPoints.length; i++) {
        events.push({type: 'wam-automation', data: {id: id, value: normalizedPoints[i].value}, time: audioCtx.currentTime + normalizedPoints[i].time});
    }
    node.scheduleEvents(...events);
}