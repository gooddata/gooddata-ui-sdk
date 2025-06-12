// (C) 2019-2022 GoodData Corporation
import {
    IAttributeLocatorItem,
    idRef,
    IInsight,
    ISortItem,
    VisualizationProperties,
    IWidget,
} from "@gooddata/sdk-model";
import { newInsightWidget } from "@gooddata/sdk-backend-base";

import { ColorMapping } from "../../fixLegacyElementUris.js";

const mockColorMapping = (elementIds: string[]): ColorMapping[] => {
    return elementIds.map((id, idx) => ({
        id,
        color: {
            type: "guid",
            value: idx.toString(),
        },
    }));
};

/**
 * @internal
 */
interface IMeasureColumnWidthItem {
    measureColumnWidthItem: {
        locators: unknown[];
    };
}

/**
 *
 * @internal
 */
interface IAttributeColumnLocator {
    attributeLocatorItem: {
        element?: string;
    };
}

const mockColumnWidths = (elementIds: string[]): IMeasureColumnWidthItem[] => {
    return elementIds.map((id) => {
        const attributeElementColumnLocator: IAttributeColumnLocator = {
            attributeLocatorItem: {
                element: id,
            },
        };
        return {
            measureColumnWidthItem: {
                locators: [attributeElementColumnLocator],
            },
        };
    });
};

const mockSortItems = (elementIds: string[]): ISortItem[] => {
    return elementIds.map((id) => {
        const attributeElementColumnLocator: IAttributeLocatorItem = {
            attributeLocatorItem: {
                attributeIdentifier: "localAttributeId",
                element: id,
            },
        };
        return {
            measureSortItem: {
                direction: "asc",
                locators: [attributeElementColumnLocator],
            },
        };
    });
};

export const mockInsight = (elementIds: string[]): IInsight => {
    const sortItems = mockSortItems(elementIds);
    const columnWidths = mockColumnWidths(elementIds);
    const colorMapping = mockColorMapping(elementIds);

    const properties: VisualizationProperties = {
        controls: {
            columnWidths,
            colorMapping,
        },
    };

    return {
        insight: {
            buckets: [],
            filters: [],
            ref: { identifier: "" },
            identifier: "",
            title: "",
            uri: "",
            visualizationUrl: "",
            sorts: sortItems,
            properties,
        },
    };
};

export const mockWidget = (elementIds: string[]): IWidget => {
    const columnWidths = mockColumnWidths(elementIds);

    const properties: VisualizationProperties = {
        controls: {
            columnWidths,
        },
    };

    return newInsightWidget(idRef("insight"), (w) => w.ref(idRef("insightWidget")).properties(properties));
};
