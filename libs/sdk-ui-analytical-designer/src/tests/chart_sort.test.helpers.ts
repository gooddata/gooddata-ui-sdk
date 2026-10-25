// (C) 2022-2026 GoodData Corporation

import {
    type ISortItem,
    localIdRef,
    newAttributeAreaSort,
    newAttributeSort,
    newMeasureSort,
} from "@gooddata/sdk-model";
import { type IAvailableSortsGroup, type ISortConfig } from "@gooddata/sdk-ui-ext/internal";

export const attributeSortAsc1 = newAttributeSort("attr1", "asc");
export const attributeSortAsc2 = newAttributeSort("attr2", "asc");
export const attributeSortDesc1 = newAttributeSort("attr1", "desc");
export const attributeSortDesc2 = newAttributeSort("attr2", "desc");

export const areaSortAsc1 = newAttributeAreaSort("area1", "asc");
export const areaSortAsc2 = newAttributeAreaSort("area2", "asc");
export const areaSortDesc1 = newAttributeAreaSort("area1", "desc");
export const areaSortDesc2 = newAttributeAreaSort("area2", "desc");

export const chronoDateSortAsc1 = newAttributeSort("cd1", "asc");
export const chronoDateSortAsc2 = newAttributeSort("cd2", "asc");
export const chronoDateSortDesc1 = newAttributeSort("cd1", "desc");
export const chronoDateSortDesc2 = newAttributeSort("cd2", "desc");

export const genericDateSortAsc1 = newAttributeSort("gd1", "asc");
export const genericDateSortAsc2 = newAttributeSort("gd2", "asc");
export const genericDateSortDesc1 = newAttributeSort("gd1", "desc");
export const genericDateSortDesc2 = newAttributeSort("gd2", "desc");

export const measureSortAsc1 = newMeasureSort("m1", "asc");
export const measureSortAsc2 = newMeasureSort("m2", "asc");
export const measureSortDesc1 = newMeasureSort("m1", "desc");
export const measureSortDesc2 = newMeasureSort("m2", "desc");

export const attributeSortConfig: ISortConfig = {
    defaultSort: [attributeSortAsc1],
    availableSorts: [
        {
            itemId: localIdRef("a1"),
            attributeSort: {
                areaSortEnabled: true,
                normalSortEnabled: true,
            },
        },
    ],
    supported: true,
    disabled: false,
};

export const measureSortConfig: ISortConfig = {
    defaultSort: [measureSortDesc1],
    appliedSort: [measureSortDesc2],
    availableSorts: [
        {
            itemId: localIdRef("m1"),
            metricSorts: [
                {
                    type: "measureSort",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: "m1",
                            },
                        },
                    ],
                },
            ],
        },
    ],
    supported: true,
    disabled: false,
};

export const disabledSortConfig: ISortConfig = {
    defaultSort: [],
    availableSorts: [],
    supported: true,
    disabled: true,
};

const availableAttributeSort: IAvailableSortsGroup = {
    itemId: localIdRef("attr1"),
    attributeSort: {
        normalSortEnabled: true,
        areaSortEnabled: true,
    },
};

export const buildSortConfig = (
    supported = true,
    disabled = false,
    defaultSort: ISortItem[] = [attributeSortAsc1],
    availableSorts: IAvailableSortsGroup[] = [availableAttributeSort],
    disabledExplanation?: string,
): ISortConfig => ({
    defaultSort,
    availableSorts,
    supported,
    disabled,
    disabledExplanation,
});

export const buildSupportedSortConfig = (
    currentSort: ISortItem[] = [],
    availableSorts: IAvailableSortsGroup[] = [],
) => buildSortConfig(true, false, currentSort, availableSorts);
