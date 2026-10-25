// (C) 2020-2026 GoodData Corporation

// @vitest-environment node

import moment from "moment";
import { describe, expect, it } from "vitest";

import { type AdClearCommandData, GdcAdCommandType, GdcProductName } from "@gooddata/sdk-embedding";

import { GRANULARITY } from "../../models/granularity.js";
import { type ICatalogEntries } from "../../typings/state_objects.js";

import {
    buildDateFilterConfig,
    convertRelativeToStaticDate,
    getItemCacheByDfIdentifierFromAvailableDisplayForms,
    getItemCacheByDfUriFromAvailableDisplayForms,
    getPostMessageContextIdFromCommandData,
    getSupportedGranularities,
} from "./post_message_saga_helper.js";

describe("post message helper", () => {
    const projectTimezoneOffset = -25200000;

    describe("buildDateFilterConfig", () => {
        it("should return static period date", () => {
            const expected = buildDateFilterConfig({
                from: "2020-01-01",
                to: "2020-01-02",
            });
            expect(expected).toEqual({
                interval: ["2020-01-01", "2020-01-02"],
                type: "absolute",
                granularity: GRANULARITY.DATE,
            });
        });

        it("should return all time value", () => {
            const allTime = buildDateFilterConfig({
                from: "2020-01-01",
                to: "2020-01-02",
                granularity: "ALL_TIME_GRANULARITY",
            });
            expect(allTime).toEqual({ name: "all_time" });
        });

        it("should return relative date", () => {
            const expected = buildDateFilterConfig({
                from: 0,
                to: 0,
                granularity: GRANULARITY.YEAR,
            });
            expect(expected).toEqual({
                granularity: GRANULARITY.YEAR,
                interval: [0, 0],
                type: "relative",
            });
        });

        it("should return relative date for relative one if custom relative period is supported", () => {
            const expected = buildDateFilterConfig({
                from: -20,
                to: 18,
                granularity: GRANULARITY.YEAR,
            });
            expect(expected).toEqual({
                granularity: GRANULARITY.YEAR,
                interval: [-20, 18],
                type: "relative",
            });
        });
    });

    describe("convertRelativeToStaticDate", () => {
        const currentDate: moment.Moment = moment("2020-10-05T15:33:25+07:00");

        it.each([
            ["relative date", GRANULARITY.DATE, 1, 2, "2020-10-06", "2020-10-07"],
            ["'Last 7 days' with 'Exclude today'", GRANULARITY.DATE, -7, -1, "2020-09-28", "2020-10-04"],
            ["'Last 2 weeks' with 'Exclude this week'", GRANULARITY.WEEK, -2, -1, "2020-09-20", "2020-10-03"],
            [
                "'Last 12 months' with 'Exclude this month'",
                GRANULARITY.MONTH,
                -12,
                -1,
                "2019-10-01",
                "2020-09-30",
            ],
            [
                "'Last 4 quarters' with 'Exclude this quarter'",
                GRANULARITY.QUARTER,
                -4,
                -1,
                "2019-10-01",
                "2020-09-30",
            ],
        ])(
            "should convert %s to static period",
            (
                _condition: string,
                granularity: string,
                from: number,
                to: number,
                expectedFrom: string,
                expectedTo: string,
            ) => {
                const result = convertRelativeToStaticDate(
                    {
                        from,
                        to,
                        granularity,
                    },
                    projectTimezoneOffset,
                    false,
                    currentDate,
                );

                expect(result).toEqual({
                    periodFrom: expectedFrom,
                    periodTo: expectedTo,
                });
            },
        );
    });

    describe("getPostMessageContextIdFromCommandData", () => {
        it("should return default context id for undefined command data", () => {
            const contextId = getPostMessageContextIdFromCommandData(undefined);

            expect(contextId).toBe("DEFAULT_POST_MESSAGE_CONTEXT_ID");
        });

        it("should return default context id if it is not defined in the message", () => {
            const commandData: AdClearCommandData = {
                gdc: {
                    product: GdcProductName.ANALYTICAL_DESIGNER,
                    event: {
                        name: GdcAdCommandType.Clear,
                    },
                },
            };

            const contextId = getPostMessageContextIdFromCommandData(commandData);

            expect(contextId).toBe("DEFAULT_POST_MESSAGE_CONTEXT_ID");
        });

        it("should return contextId from the message", () => {
            const commandData: AdClearCommandData = {
                gdc: {
                    product: GdcProductName.ANALYTICAL_DESIGNER,
                    event: {
                        name: GdcAdCommandType.Clear,
                        contextId: "definedContextId",
                    },
                },
            };

            const contextId = getPostMessageContextIdFromCommandData(commandData);

            expect(contextId).toBe("definedContextId");
        });
    });

    describe("getItemCacheByDfUriFromAvailableDisplayForms", () => {
        const itemCache: ICatalogEntries = {
            item1: {
                displayForms: [{ uri: "/uri1" }, { uri: "/uri2" }],
            },
            item2: {
                displayForms: [{ uri: "/uri3" }, { uri: "/uri4" }],
            },
            item3: {
                displayForms: [{ uri: "/uri3" }, { uri: "/uri4" }],
            },
        } as unknown as ICatalogEntries;

        it("should return undefined when specified uri does not exist in available display forms", () => {
            const result = getItemCacheByDfUriFromAvailableDisplayForms("/nonexistentUri", itemCache);

            expect(result).toEqual(undefined);
        });

        it("should return first cached item that contains requested display form uri", () => {
            const result = getItemCacheByDfUriFromAvailableDisplayForms("/uri3", itemCache);

            expect(result).toEqual(itemCache["item2"]);
        });
    });

    describe("getItemCacheByDfIdentifierFromAvailableDisplayForms", () => {
        // a label and a computed attribute sharing the identifier live in different cache namespaces
        const itemCache: ICatalogEntries = {
            "attribute.shared": {
                type: "attribute",
                displayForms: [{ id: "shared" }, { id: "label.other" }],
            },
            "computedAttribute.shared": {
                type: "computedAttribute",
                displayForms: [{ id: "shared" }],
            },
            "date.created": {
                displayForms: [{ id: "date.created.year" }],
            },
        } as unknown as ICatalogEntries;

        it("should return undefined when no item owns the display form", () => {
            expect(getItemCacheByDfIdentifierFromAvailableDisplayForms("missing", itemCache)).toBeUndefined();
        });

        it("should resolve a label to a plain attribute by default", () => {
            expect(getItemCacheByDfIdentifierFromAvailableDisplayForms("shared", itemCache)).toBe(
                itemCache["attribute.shared"],
            );
            expect(
                getItemCacheByDfIdentifierFromAvailableDisplayForms("shared", itemCache, "displayForm"),
            ).toBe(itemCache["attribute.shared"]);
        });

        it("should resolve a label to a date attribute item that carries no type", () => {
            expect(getItemCacheByDfIdentifierFromAvailableDisplayForms("date.created.year", itemCache)).toBe(
                itemCache["date.created"],
            );
        });

        it("should resolve a computed attribute reference only among computed attributes", () => {
            expect(
                getItemCacheByDfIdentifierFromAvailableDisplayForms("shared", itemCache, "computedAttribute"),
            ).toBe(itemCache["computedAttribute.shared"]);
            expect(
                getItemCacheByDfIdentifierFromAvailableDisplayForms(
                    "label.other",
                    itemCache,
                    "computedAttribute",
                ),
            ).toBeUndefined();
        });
    });

    describe("getSupportedGranularities", () => {
        it.each([true, false])(
            "should return expected granularities when time support is %s",
            (isTimeSupported) => {
                expect(getSupportedGranularities(isTimeSupported)).toMatchSnapshot();
            },
        );

        it("should omit GDC.time.second when seconds are not supported but keep minute and hour", () => {
            const result = getSupportedGranularities(true, false);
            expect(result).not.toHaveProperty("GDC.time.second");
            expect(result).toHaveProperty("GDC.time.minute");
            expect(result).toHaveProperty("GDC.time.hour");
        });
    });
});
