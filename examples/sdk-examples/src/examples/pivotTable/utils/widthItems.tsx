// (C) 2020 GoodData Corporation
import {
    IAttribute,
    attributeLocalId,
    IMeasure,
    measureLocalId,
    IAttributeLocatorItem,
} from "@gooddata/sdk-model";
import { IMeasureColumnWidthItem } from "@gooddata/sdk-ui-pivot";

export const attributeColumnWidthItem = (attribute: IAttribute, width: number) => {
    return {
        attributeColumnWidthItem: {
            width,
            attributeIdentifier: attributeLocalId(attribute),
        },
    };
};

export const measureColumnWidthItemSimple = (
    measure: IMeasure,
    width: number,
    obj?: IAttributeLocatorItem[],
): IMeasureColumnWidthItem => {
    const measureColumnWidthItemHolder: IMeasureColumnWidthItem["measureColumnWidthItem"] = {
        width,
        locators: [
            {
                measureLocatorItem: {
                    measureIdentifier: measureLocalId(measure),
                },
            },
        ],
    };

    if (obj) {
        measureColumnWidthItemHolder.locators.splice(
            -2,
            0,
            ...obj.map((attributeLocatorItem) => ({
                ...attributeLocatorItem,
            })),
        );
    }

    return { measureColumnWidthItem: measureColumnWidthItemHolder };
};

export const allMeasureColumnWidthItem = (width: number) => {
    return {
        measureColumnWidthItem: {
            width,
        },
    };
};
