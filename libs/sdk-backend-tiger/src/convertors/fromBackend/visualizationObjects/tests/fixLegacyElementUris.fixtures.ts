// (C) 2019-2021 GoodData Corporation
import {
    IAttributeLocatorItem,
    idRef,
    IInsight,
    ISortItem,
    VisualizationProperties,
} from "@gooddata/sdk-model";
import { IWidget } from "@gooddata/sdk-backend-spi";
import { newInsightWidget } from "@gooddata/sdk-backend-base";

/**
 * @internal
 */
type ColorMapping = { color: { type: "guid"; value: string }; id: string };

const mockColorMapping = (elementIds: string[]): ColorMapping[] => {
    const colorMapping: ColorMapping[] = elementIds.map((id, idx) => ({
        id,
        color: {
            type: "guid",
            value: idx.toString(),
        },
    }));

    return colorMapping;
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

const mockColumnWidths = (elementIds: string[]) => {
    const measureColumnWidths: IMeasureColumnWidthItem[] = elementIds.map((id) => {
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

    return measureColumnWidths;
};

const mockSortItems = (elementIds: string[]): ISortItem[] => {
    const sortItems: ISortItem[] = elementIds.map((id) => {
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

    return sortItems;
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
