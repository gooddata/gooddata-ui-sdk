// (C) 2022-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import {
    sanitizeIdPrefix,
    sanitizeRemoveFilterContext,
    sanitizeRouteParams,
    sanitizeSetFilterContext,
} from "./id_prefix_sanitize.js";

vi.hoisted(() => {
    vi.resetModules();
});

// Hack that will get `jest.spyOn` work on ESM module (that is immutable) in CommonJS jest environment
// if they are imported as `import * as some_dependency from "some_dependency"` pattern.
// When Vitest will be ESM native in the future, we will have to redesign the test (or possibly it will work
// as swc will not be necessary. See https://github.com/swc-project/swc/issues/3843
vi.mock("../backend", async () => {
    const actualModule = await vi.importActual("../backend");
    return {
        __esModule: true,
        ...actualModule,
    };
});

describe("Id prefix sanitize:", () => {
    it("sanitizeIdPrefix: no prefix", () => {
        expect(sanitizeIdPrefix("test")).toBe("test");
    });

    it("sanitizeIdPrefix: with prefix", () => {
        expect(sanitizeIdPrefix("namespace:test")).toBe("test");
    });

    it("sanitizeRouteParams: no prefix", () => {
        expect(sanitizeRouteParams({ projectId: "proj", reportId: "test" })).toEqual({
            projectId: "proj",
            reportId: "test",
        });
    });

    it("sanitizeRouteParams: with prefix", () => {
        expect(sanitizeRouteParams({ projectId: "proj", reportId: "namespace:test" })).toEqual({
            projectId: "proj",
            reportId: "test",
        });
    });

    it("sanitizeRemoveFilterContext: no prefix", () => {
        expect(
            sanitizeRemoveFilterContext([
                { displayForm: { identifier: "test" } },
                { dataSet: { identifier: "test" } },
                { removeRankingFilter: {} },
            ]),
        ).toEqual([
            { displayForm: { identifier: "test" } },
            { dataSet: { identifier: "test" } },
            { removeRankingFilter: {} },
        ]);
    });

    it("sanitizeRemoveFilterContext: with prefix", () => {
        expect(
            sanitizeRemoveFilterContext([
                { displayForm: { identifier: "namespace:test" } },
                { dataSet: { identifier: "namespace:test" } },
                { removeRankingFilter: {} },
            ]),
        ).toEqual([
            { displayForm: { identifier: "test" } },
            { dataSet: { identifier: "test" } },
            { removeRankingFilter: {} },
        ]);
    });

    it("sanitizeSetFilterContext: no prefix", () => {
        expect(
            sanitizeSetFilterContext([
                { absoluteDateFilter: { dataSet: { identifier: "test" }, from: "date0", to: "date1" } },
                {
                    relativeDateFilter: {
                        dataSet: { identifier: "test" },
                        from: 0,
                        to: -3,
                        granularity: "DAY",
                    },
                },
                {
                    positiveAttributeFilter: {
                        displayForm: { identifier: "test" },
                        textFilter: true,
                        in: [],
                    },
                },
                {
                    negativeAttributeFilter: {
                        displayForm: { identifier: "test" },
                        textFilter: true,
                        notIn: [],
                    },
                },
                {
                    rankingFilter: {
                        measure: { localIdentifier: "test" },
                        value: 10,
                        attributes: [{ localIdentifier: "test" }],
                        operator: "TOP",
                    },
                },
            ]),
        ).toEqual([
            { absoluteDateFilter: { dataSet: { identifier: "test" }, from: "date0", to: "date1" } },
            { relativeDateFilter: { dataSet: { identifier: "test" }, from: 0, to: -3, granularity: "DAY" } },
            { positiveAttributeFilter: { displayForm: { identifier: "test" }, textFilter: true, in: [] } },
            { negativeAttributeFilter: { displayForm: { identifier: "test" }, textFilter: true, notIn: [] } },
            {
                rankingFilter: {
                    measure: { localIdentifier: "test" },
                    value: 10,
                    attributes: [{ localIdentifier: "test" }],
                    operator: "TOP",
                },
            },
        ]);
    });

    it("sanitizeSetFilterContext: with prefix", () => {
        expect(
            sanitizeSetFilterContext([
                {
                    absoluteDateFilter: {
                        dataSet: { identifier: "namespace:test" },
                        from: "date0",
                        to: "date1",
                    },
                },
                {
                    relativeDateFilter: {
                        dataSet: { identifier: "namespace:test" },
                        from: 0,
                        to: -3,
                        granularity: "DAY",
                    },
                },
                {
                    positiveAttributeFilter: {
                        displayForm: { identifier: "namespace:test" },
                        textFilter: true,
                        in: [],
                    },
                },
                {
                    negativeAttributeFilter: {
                        displayForm: { identifier: "namespace:test" },
                        textFilter: true,
                        notIn: [],
                    },
                },
                {
                    rankingFilter: {
                        measure: { localIdentifier: "namespace:test" },
                        value: 10,
                        attributes: [{ localIdentifier: "namespace:test" }],
                        operator: "TOP",
                    },
                },
            ]),
        ).toEqual([
            { absoluteDateFilter: { dataSet: { identifier: "test" }, from: "date0", to: "date1" } },
            { relativeDateFilter: { dataSet: { identifier: "test" }, from: 0, to: -3, granularity: "DAY" } },
            { positiveAttributeFilter: { displayForm: { identifier: "test" }, textFilter: true, in: [] } },
            { negativeAttributeFilter: { displayForm: { identifier: "test" }, textFilter: true, notIn: [] } },
            {
                rankingFilter: {
                    measure: { localIdentifier: "namespace:test" },
                    value: 10,
                    attributes: [{ localIdentifier: "namespace:test" }],
                    operator: "TOP",
                },
            },
        ]);
    });
});
