// (C) 2021-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { smoothingGenerator } from "./cd_smooth.js";

describe("smoothing generator", () => {
    it("should converge to target value", () => {
        const targetValue = 100;
        const maxIterations = 500;
        const timeIncrement = 20;

        const generator = smoothingGenerator(0, targetValue, 1000);
        generator.next();

        let i = 0;

        while (i <= maxIterations) {
            const frame = generator.next(timeIncrement);
            if (frame.done) break;

            generator.next();
            i += 1;
        }

        if (i > maxIterations) {
            throw new Error(`Generator did not converge within ${maxIterations} iterations!`);
        }
    });

    it("should finish immediately if there is nothing to animate", () => {
        const generator = smoothingGenerator(0, 0, 0);
        expect(generator.next().done).toEqual(true);
    });
});
