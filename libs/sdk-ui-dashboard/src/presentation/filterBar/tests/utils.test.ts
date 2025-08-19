// (C) 2023-2025 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import { describe, expect, it, vi } from "vitest";

import {
    DashboardAttributeFilterConfigModeValues,
    DashboardDateFilterConfigMode,
    DashboardDateFilterConfigModeValues,
} from "@gooddata/sdk-model";

import { filterBarAttributeFilterIndexes } from "./filterBar.fixture.js";
import { areAllFiltersHidden, getVisibilityIcon } from "../utils.js";

describe("utils", () => {
    describe("getVisibilityIcon", () => {
        const mockIntl: any = { formatMessage: vi.fn().mockImplementation((message) => message) };

        it("should return undefined when supportsHiddenAndLockedFiltersOnUI is false", () => {
            const result = getVisibilityIcon(
                DashboardDateFilterConfigModeValues.HIDDEN,
                true,
                false,
                mockIntl,
            );
            expect(result).toBeUndefined();
        });

        it("should return undefined when mode is undefined", () => {
            const result = getVisibilityIcon(undefined, true, true, mockIntl);
            expect(result).toBeUndefined();
        });

        it("should return undefined when mode is not hidden or readonly", () => {
            const result = getVisibilityIcon(
                DashboardDateFilterConfigModeValues.ACTIVE,
                true,
                true,
                mockIntl,
            );
            expect(result).toBeUndefined();
        });

        it("should return icon and tooltip when mode is hidden", () => {
            const result = getVisibilityIcon(
                DashboardDateFilterConfigModeValues.HIDDEN,
                true,
                true,
                mockIntl,
            );
            expect(result).toMatchSnapshot();
        });

        it("should return icon and tooltip when mode is readonly in edit mode", () => {
            const result = getVisibilityIcon(
                DashboardDateFilterConfigModeValues.READONLY,
                true,
                true,
                mockIntl,
            );
            expect(result).toMatchSnapshot();
        });

        it("should return icon and tooltip when mode is readonly in view mode", () => {
            const result = getVisibilityIcon(
                DashboardDateFilterConfigModeValues.READONLY,
                false,
                true,
                mockIntl,
            );
            expect(result).toMatchSnapshot();
        });
    });

    describe("areAllFiltersHidden", () => {
        const effectedAttributeFiltersModeMap = filterBarAttributeFilterIndexes.reduce((map, filter) => {
            map.set(
                filter.filter.attributeFilter.localIdentifier,
                DashboardAttributeFilterConfigModeValues.HIDDEN,
            );
            return map;
        }, new Map());

        it("should return true when all filters are hidden", () => {
            expect(
                areAllFiltersHidden(
                    filterBarAttributeFilterIndexes,
                    DashboardDateFilterConfigModeValues.HIDDEN,
                    effectedAttributeFiltersModeMap,
                    {} as unknown as Map<string, DashboardDateFilterConfigMode>,
                ),
            ).toBe(true);
        });

        it("should return false when existing attribute filter placeholder", () => {
            expect(
                areAllFiltersHidden(
                    [
                        ...filterBarAttributeFilterIndexes,
                        {
                            type: "filterPlaceholder",
                            filterIndex: 2,
                        },
                    ],
                    DashboardDateFilterConfigModeValues.HIDDEN,
                    effectedAttributeFiltersModeMap,
                    {} as unknown as Map<string, DashboardDateFilterConfigMode>,
                ),
            ).toBe(false);
        });

        it("should return false when date filter visible", () => {
            expect(
                areAllFiltersHidden(
                    filterBarAttributeFilterIndexes,
                    DashboardDateFilterConfigModeValues.READONLY,
                    effectedAttributeFiltersModeMap,
                    {} as unknown as Map<string, DashboardDateFilterConfigMode>,
                ),
            ).toBe(false);
        });

        it("should return false when at least one attribute filter visible", () => {
            const attributeFiltersModeMap = cloneDeep(effectedAttributeFiltersModeMap);
            attributeFiltersModeMap.set(
                filterBarAttributeFilterIndexes[0].filter.attributeFilter.localIdentifier,
                DashboardAttributeFilterConfigModeValues.ACTIVE,
            );

            expect(
                areAllFiltersHidden(
                    filterBarAttributeFilterIndexes,
                    DashboardDateFilterConfigModeValues.HIDDEN,
                    attributeFiltersModeMap,
                    {} as unknown as Map<string, DashboardDateFilterConfigMode>,
                ),
            ).toBe(false);
        });
    });
});
