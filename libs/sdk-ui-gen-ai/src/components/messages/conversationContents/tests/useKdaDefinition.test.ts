// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { useSelector } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { type IChatKdaDefinition } from "@gooddata/sdk-backend-spi";
import { type CatalogItem, type IAttribute, newMeasure } from "@gooddata/sdk-model";
import { type IDrillEvent } from "@gooddata/sdk-ui";
import { type IDashboardKeyDriverCombinationItem } from "@gooddata/sdk-ui-dashboard";

import {
    createKdaDefinition,
    createKdaDefinitionFromDrill,
    useKdaDefinition,
    useKdaInfo,
} from "../useKdaDefinition.js";

vi.mock("react-redux", () => ({
    useSelector: vi.fn(),
}));

vi.mock("react-intl", () => ({
    useIntl: () => ({ locale: "en-US" }),
}));

const measureRef1 = { uri: "/gdc/md/project/obj/1" };
const measureRef2 = { uri: "/gdc/md/project/obj/2" };

const catalogItems: CatalogItem[] = [
    {
        type: "measure",
        measure: {
            ref: measureRef1,
            title: "Measure 1 Title",
            id: "m1",
            uri: "/gdc/md/project/obj/1",
            type: "measure",
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
            expression: "",
            format: "",
        },
        groups: [],
    },
    {
        type: "fact",
        fact: {
            ref: measureRef2,
            title: "Fact 2 Title",
            id: "f2",
            uri: "/gdc/md/project/obj/2",
            type: "fact",
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
        },
        groups: [],
    },
];

const measure1 = newMeasure(measureRef1, (m) => m.localId("m1"));
const measure2 = newMeasure(measureRef2, (m) => m.localId("m2").aggregation("sum"));

const dateAttribute: IAttribute = {
    attribute: {
        displayForm: { uri: "/gdc/md/project/obj/df" },
        localIdentifier: "a1",
    },
};

describe("useKdaDefinition", () => {
    describe("createKdaDefinition", () => {
        it("should use title from catalogItems for a measure", () => {
            const result = createKdaDefinition(
                catalogItems,
                measure1,
                dateAttribute,
                [],
                "previous_period",
                "2023-01-01",
                "2023-01-02",
                "en-US",
            );
            expect(result.metric.measure.title).toBe("Measure 1 Title");
        });

        it("should use title from catalogItems for a fact-based measure", () => {
            const result = createKdaDefinition(
                catalogItems,
                measure2,
                dateAttribute,
                [],
                "previous_period",
                "2023-01-01",
                "2023-01-02",
                "en-US",
            );
            expect(result.metric.measure.title).toBe("Fact 2 Title");
        });

        it("should return undefined if measure is not found in catalogItems", () => {
            const unknownMeasure = newMeasure({ uri: "/unknown" }, (m) => m.localId("unknown"));
            const result = createKdaDefinition(
                catalogItems,
                unknownMeasure,
                dateAttribute,
                [],
                "previous_period",
                "2023-01-01",
                "2023-01-02",
                "en-US",
            );
            expect(result.metric.measure.title).toBeUndefined();
        });
    });

    describe("useKdaInfo", () => {
        it("should return correct title and range", () => {
            const def = createKdaDefinition(
                catalogItems,
                measure1,
                dateAttribute,
                [],
                "previous_period",
                "2023-01-01",
                "2023-01-02",
                "en-US",
            );
            const info = useKdaInfo(catalogItems, def, " - ");
            expect(info.title).toBe("measure//gdc/md/project/obj/1");
        });

        it("should return correct title with aggregation", () => {
            const def = createKdaDefinition(
                catalogItems,
                measure2,
                dateAttribute,
                [],
                "previous_period",
                "2023-01-01",
                "2023-01-02",
                "en-US",
            );
            const info = useKdaInfo(catalogItems, def, " - ");
            expect(info.title).toBe("SUM({fact//gdc/md/project/obj/2})");
        });
    });

    describe("createKdaDefinitionFromDrill", () => {
        it("should create KDA definition from drill event", () => {
            const mockData = {
                range: [
                    {
                        header: { attributeHeaderItem: { normalizedValue: "2023-01-01" } },
                        descriptor: {
                            attributeHeader: {
                                localIdentifier: "a1",
                                formOf: { uri: "/df" },
                                name: "Date",
                            },
                        },
                    },
                    {
                        header: { attributeHeaderItem: { normalizedValue: "2023-01-31" } },
                    },
                ],
                measure: {
                    measureHeaderItem: { localIdentifier: "m1" },
                },
                type: "comparative",
            } as unknown as IDashboardKeyDriverCombinationItem;

            const mockEvent = {
                dataView: {
                    definition: {
                        measures: [measure1],
                    },
                },
            } as unknown as IDrillEvent;

            const result = createKdaDefinitionFromDrill(catalogItems, "en-US", mockData, mockEvent);
            expect(result).toBeDefined();
            expect(result?.metric.measure.title).toBe("Measure 1 Title");
            expect(result?.range[0].date).toBe("2023-01-01");
            expect(result?.range[1].date).toBe("2023-01-31");
        });
    });

    describe("useKdaDefinition hook", () => {
        it("should return KDA definition using catalogItems from selector", () => {
            vi.mocked(useSelector).mockReturnValue(catalogItems);

            const content: IChatKdaDefinition = {
                measure: measure1,
                dateAttribute: dateAttribute,
                filters: [],
                referencePeriod: "2023-01-01",
                analyzedPeriod: "2023-01-02",
                dateGranularity: "GDC.time.date",
            };

            const { result } = renderHook(() => useKdaDefinition(content));

            expect(result.current.metric.measure.title).toBe("Measure 1 Title");
            expect(useSelector).toHaveBeenCalled();
        });
    });
});
