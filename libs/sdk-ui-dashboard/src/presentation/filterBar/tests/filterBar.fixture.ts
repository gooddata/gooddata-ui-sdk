// (C) 2023 GoodData Corporation
import { type FilterBarAttributeFilterIndexed } from "../filterBar/useFiltersWithAddedPlaceholder.js";

export const filterBarAttributeFilterIndexes: FilterBarAttributeFilterIndexed[] = [
    {
        filter: {
            attributeFilter: {
                attributeElements: {
                    uris: ["Email with (add)ventures on Jul-12-09"],
                },
                displayForm: {
                    identifier: "label.f_activity.subject",
                    type: "displayForm",
                },
                negativeSelection: true,
                localIdentifier: "02d9bde2d3594337a52bcc2568771633",
                selectionMode: "multi",
            },
        },
        filterIndex: 0,
    },
    {
        filter: {
            attributeFilter: {
                attributeElements: {
                    values: ["Antony"],
                },
                displayForm: {
                    identifier: "attr.f_owner.salesrep",
                    type: "displayForm",
                },
                negativeSelection: true,
                localIdentifier: "05dff1cccf81454f99adf2de0ec46159",
                selectionMode: "multi",
            },
        },
        filterIndex: 1,
    },
    {
        filter: {
            attributeFilter: {
                attributeElements: {
                    uris: [],
                },
                displayForm: {
                    identifier: "f_activity.id",
                    type: "displayForm",
                },
                negativeSelection: true,
                localIdentifier: "83d83cdb0efe40e7a64012934a1f3d67",
            },
        },
        filterIndex: 2,
    },
];
