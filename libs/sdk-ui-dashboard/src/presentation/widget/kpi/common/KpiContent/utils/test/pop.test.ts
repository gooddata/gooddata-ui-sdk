// (C) 2007-2020 GoodData Corporation

import { HYPHEN } from "../format.js";
import { getPopInfo, IPopInfo, LIMIT } from "../pop.js";
import { describe, it, expect } from "vitest";

describe("getPopInfo", () => {
    type TestCase = [
        { previous: number | null; current: number | null; meaning: "growIsGood" | "growIsBad" },
        IPopInfo,
    ];

    const testCases: TestCase[] = [
        [
            { previous: -20, current: 20, meaning: "growIsGood" },
            { trend: "up", meaning: "positive", percentage: "200%" },
        ],
        [
            { previous: 0, current: 20, meaning: "growIsGood" },
            { trend: "up", meaning: "positive", percentage: `>${LIMIT}%` },
        ],
        [
            { previous: 30, current: 20, meaning: "growIsGood" },
            { trend: "down", meaning: "negative", percentage: "-33%" },
        ],
        [
            { previous: -20, current: 0, meaning: "growIsGood" },
            { trend: "up", meaning: "positive", percentage: "100%" },
        ],
        [
            { previous: 0, current: 0, meaning: "growIsGood" },
            { trend: "neutral", meaning: "neutral", percentage: "0%" },
        ],
        [
            { previous: 20, current: 0, meaning: "growIsGood" },
            { trend: "down", meaning: "negative", percentage: "-100%" },
        ],
        [
            { previous: -30, current: -20, meaning: "growIsGood" },
            { trend: "up", meaning: "positive", percentage: "33%" },
        ],
        [
            { previous: -10, current: -20, meaning: "growIsGood" },
            { trend: "down", meaning: "negative", percentage: "-100%" },
        ],
        [
            { previous: 0, current: -20, meaning: "growIsGood" },
            { trend: "down", meaning: "negative", percentage: `<-${LIMIT}%` },
        ],
        [
            { previous: null, current: 20, meaning: "growIsGood" },
            { trend: "up", meaning: "positive", percentage: `>${LIMIT}%` },
        ],
        [
            { previous: null, current: -20, meaning: "growIsGood" },
            { trend: "down", meaning: "negative", percentage: `<-${LIMIT}%` },
        ],
        [
            { previous: null, current: 0, meaning: "growIsGood" },
            { trend: "neutral", meaning: "neutral", percentage: "0%" },
        ],
        [
            { previous: 0, current: null, meaning: "growIsGood" },
            { trend: "neutral", meaning: "neutral", percentage: "0%" },
        ],
        [
            { previous: null, current: null, meaning: "growIsGood" },
            { trend: "neutral", meaning: "neutral", percentage: HYPHEN },
        ],
        [
            { previous: -20, current: 20, meaning: "growIsBad" },
            { trend: "up", meaning: "negative", percentage: "200%" },
        ],
        [
            { previous: 0, current: 20, meaning: "growIsBad" },
            { trend: "up", meaning: "negative", percentage: `>${LIMIT}%` },
        ],
        [
            { previous: 30, current: 20, meaning: "growIsBad" },
            { trend: "down", meaning: "positive", percentage: "-33%" },
        ],
        [
            { previous: -20, current: 0, meaning: "growIsBad" },
            { trend: "up", meaning: "negative", percentage: "100%" },
        ],
        [
            { previous: 0, current: 0, meaning: "growIsBad" },
            { trend: "neutral", meaning: "neutral", percentage: "0%" },
        ],
        [
            { previous: 20, current: 0, meaning: "growIsBad" },
            { trend: "down", meaning: "positive", percentage: "-100%" },
        ],
        [
            { previous: -30, current: -20, meaning: "growIsBad" },
            { trend: "up", meaning: "negative", percentage: "33%" },
        ],
        [
            { previous: -10, current: -20, meaning: "growIsBad" },
            { trend: "down", meaning: "positive", percentage: "-100%" },
        ],
        [
            { previous: 0, current: -20, meaning: "growIsBad" },
            { trend: "down", meaning: "positive", percentage: `<-${LIMIT}%` },
        ],
        [
            { previous: null, current: 20, meaning: "growIsBad" },
            { trend: "up", meaning: "negative", percentage: `>${LIMIT}%` },
        ],
        [
            { previous: null, current: -20, meaning: "growIsBad" },
            { trend: "down", meaning: "positive", percentage: `<-${LIMIT}%` },
        ],
        [
            { previous: null, current: 0, meaning: "growIsBad" },
            { trend: "neutral", meaning: "neutral", percentage: "0%" },
        ],
        [
            { previous: 0, current: null, meaning: "growIsBad" },
            { trend: "neutral", meaning: "neutral", percentage: "0%" },
        ],
        [
            { previous: null, current: null, meaning: "growIsBad" },
            { trend: "neutral", meaning: "neutral", percentage: HYPHEN },
        ],
    ];

    it.each(testCases)("should should correctly compute pop info for %o", (config, expected) => {
        const popInfo = getPopInfo(config.previous, config.current, config.meaning);
        expect(popInfo).toEqual(expected);
    });
});
