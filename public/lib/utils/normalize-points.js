/**
 * Get from the time, the value of the parameter between two points.
 * @param a The first point.
 * @param b The second point.
 * @param t The time wanted.
 * @return {number} the parameter's value at the time t.
 */
function getXFromY(a, b, t) {
    let gradient = (b.value - a.value)/(b.time - a.time);
    let intercept = b.value - gradient * b.time;
    return gradient * t + intercept;
}

/**
 * Get all points with a specific step between users steps.
 *
 * @param points The user's points.
 * @param minValue The minimum value of the parameter.
 * @param maxValue The maximum value of the parameter.
 * @param defValue The default value of the parameter.
 * @param duration The duration of the audio buffer.
 * @param step The step wanted for the automation.
 * @return *[{number, number}]
 */
function normalizePoints(points, minValue, maxValue, defValue, duration, step) {
    // If there is no point defined by the users.
    if (points.length === 0) {
        points.push({value: defValue, time: 0});
    }
    let firstPoint = points[0];
    let lastPoint = points[points.length-1];

    // If the first user point isn't set at the beginning of the audio.
    if (firstPoint.time !== 0) {
        points.unshift({value: defValue, time: 0});
    }
    // If the last user point isn't set at the end of the audio.
    if (lastPoint.time !== duration) {
        points.push({value: lastPoint.value, time: duration});
    }

    let normalizedPoints = []
    let pointIndex = 0;
    for (let t = 0; t < duration; t += step) {
        if (t > points[pointIndex+1].time) {
            pointIndex++;
        }
        let valueAtT = getXFromY(points[pointIndex], points[pointIndex+1], t);
        // If the current point is at the same time that the previous value, set to the previous value...
        if (isNaN(valueAtT)) {
            valueAtT = normalizedPoints[normalizedPoints.length-1].value;
        }
        normalizedPoints.push({value: valueAtT, time: t});
    }
    // Add the last point.
    normalizedPoints.push(points[pointIndex+1]);
    return normalizedPoints;
}

export {normalizePoints};
