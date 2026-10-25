// (C) 2021-2026 GoodData Corporation

/* eslint no-param-reassign:0 */
const EPSILON = 0.001;

/**
 * Critically Damped Ease-In/Ease-Out Smoothing
 * see Game Programming Gems 4, by Thomas Lowe
 */
function smoothCD(from: number, to: number, velocity: number, smoothTime: number, timeDelta: number) {
    if (smoothTime === 0) {
        return { value: to, velocity: 0 };
    }

    const omega = 2 / smoothTime;
    const x = omega * timeDelta;
    const exp = 1 / (1 + x + 0.45 * (x * x) + 0.235 * (x * x * x));
    const change = from - to;
    const temp = (velocity + omega * change) * timeDelta;

    const newVelocity = (velocity - omega * temp) * exp;
    const newValue = to + (change + temp) * exp;

    return {
        value: newValue,
        velocity: newVelocity,
    };
}

export function* smoothingGenerator(
    from: number,
    to: number,
    smoothTime: number,
    velocity = 0,
): Generator<number, void, number> {
    if (to - from === 0 || !smoothTime) {
        return;
    }

    do {
        const timeDelta = yield;
        const next = smoothCD(from, to, velocity, smoothTime, timeDelta);
        velocity = next.velocity;
        from = next.value;
        yield from;
    } while (Math.abs(to - from) > EPSILON);
}
