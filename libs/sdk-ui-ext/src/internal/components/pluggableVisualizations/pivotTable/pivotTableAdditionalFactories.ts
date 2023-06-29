// (C) 2022 GoodData Corporation
import isNil from "lodash/isNil.js";
import isString from "lodash/isString.js";
import partition from "lodash/partition.js";
import {
    ColumnLocator,
    IAbsoluteColumnWidth,
    IAllMeasureColumnWidthItem,
    IAttributeColumnLocator,
    ITotalColumnLocator,
    IAttributeColumnWidthItem,
    IMeasureColumnLocator,
    IMeasureColumnWidthItem,
    isAllMeasureColumnWidthItem,
    isAttributeColumnLocator,
    isAttributeColumnWidthItem,
    isMeasureColumnLocator,
    isMeasureColumnWidthItem,
    isWeakMeasureColumnWidthItem,
    IWeakMeasureColumnWidthItem,
} from "@gooddata/sdk-ui-pivot";

import { IAdditionalFactoryDefinition } from "../../../utils/embeddingCodeGenerator/index.js";

export function factoryNotationForAttributeColumnWidthItem(obj: IAttributeColumnWidthItem): string {
    const { attributeIdentifier, width } = obj.attributeColumnWidthItem;
    const { value: widthValue, allowGrowToFit } = width;
    // cannot use lodash compact, that would remove 0 values which we want to keep here
    const params = [`"${attributeIdentifier}"`, `${widthValue}`, allowGrowToFit && "true"].filter(
        (item) => !isNil(item),
    );
    return `newWidthForAttributeColumn(${params.join(", ")})`;
}

export function factoryNotationForMeasureColumnWidthItem(obj: IMeasureColumnWidthItem): string {
    const { locators, width } = obj.measureColumnWidthItem;

    // we know there is exactly one measureLocator and several attributeLocators
    const [[measureLocator], attributeLocators] = partition<ColumnLocator, IMeasureColumnLocator>(
        locators,
        isMeasureColumnLocator,
    );

    const allowGrowToFit = isString(width) ? false : (width as IAbsoluteColumnWidth).allowGrowToFit;
    const attributeLocatorFactories = attributeLocators.map((locator) =>
        isAttributeColumnLocator(locator)
            ? factoryNotationForAttributeColumnLocator(locator)
            : factoryNotationForTotalColumnLocator(locator),
    );

    // cannot use lodash compact, that would remove 0 values which we want to keep here
    const params = [
        `"${measureLocator.measureLocatorItem.measureIdentifier}"`,
        `[${attributeLocatorFactories.join(", ")}]`,
        isString(width.value) ? `"${width.value}"` : width.value,
        allowGrowToFit && "true",
    ].filter((item) => !isNil(item));
    return `newWidthForSelectedColumns(${params.join(", ")})`;
}

export function factoryNotationForAttributeColumnLocator(obj: IAttributeColumnLocator): string {
    const { attributeIdentifier, element } = obj.attributeLocatorItem;
    // cannot use lodash compact, that would remove 0 values which we want to keep here
    const params = [`"${attributeIdentifier}"`, element && `"${element}"`].filter((item) => !isNil(item));
    return `newAttributeColumnLocator(${params.join(", ")})`;
}

export function factoryNotationForTotalColumnLocator(obj: ITotalColumnLocator): string {
    const { attributeIdentifier, totalFunction } = obj.totalLocatorItem;
    // cannot use lodash compact, that would remove 0 values which we want to keep here
    const params = [`"${attributeIdentifier}"`, totalFunction && `"${totalFunction}"`].filter(
        (item) => !isNil(item),
    );
    return `newTotalColumnLocator(${params.join(", ")})`;
}

export function factoryNotationForWeakMeasureColumnWidthItem(obj: IWeakMeasureColumnWidthItem): string {
    const { locator, width } = obj.measureColumnWidthItem;
    // cannot use lodash compact, that would remove 0 values which we want to keep here
    const params = [
        `"${locator.measureLocatorItem.measureIdentifier}"`,
        width.value,
        width.allowGrowToFit && "true",
    ].filter((item) => !isNil(item));
    return `newWidthForAllColumnsForMeasure(${params.join(", ")})`;
}

export function factoryNotationForAllMeasureColumnWidthItem(obj: IAllMeasureColumnWidthItem): string {
    const { value, allowGrowToFit } = obj.measureColumnWidthItem.width;
    // cannot use lodash compact, that would remove 0 values which we want to keep here
    const params = [value, allowGrowToFit && "true"].filter((item) => !isNil(item));
    return `newWidthForAllMeasureColumns(${params.join(", ")})`;
}

export const pivotTableAdditionalFactories: IAdditionalFactoryDefinition[] = [
    {
        importInfo: {
            name: "newWidthForAttributeColumn",
            package: "@gooddata/sdk-ui-pivot",
            importType: "named",
        },
        transformation: (obj) => {
            return isAttributeColumnWidthItem(obj)
                ? factoryNotationForAttributeColumnWidthItem(obj)
                : undefined;
        },
    },
    {
        importInfo: {
            name: "newAttributeColumnLocator",
            package: "@gooddata/sdk-ui-pivot",
            importType: "named",
        },
        transformation: (obj) => {
            return isAttributeColumnLocator(obj) ? factoryNotationForAttributeColumnLocator(obj) : undefined;
        },
    },
    {
        importInfo: {
            name: "newWidthForAllColumnsForMeasure",
            package: "@gooddata/sdk-ui-pivot",
            importType: "named",
        },
        transformation: (obj) => {
            return isWeakMeasureColumnWidthItem(obj)
                ? factoryNotationForWeakMeasureColumnWidthItem(obj)
                : undefined;
        },
    },
    {
        importInfo: {
            name: "newWidthForSelectedColumns",
            package: "@gooddata/sdk-ui-pivot",
            importType: "named",
        },
        transformation: (obj) => {
            return isMeasureColumnWidthItem(obj) ? factoryNotationForMeasureColumnWidthItem(obj) : undefined;
        },
    },
    {
        importInfo: {
            name: "newWidthForAllMeasureColumns",
            package: "@gooddata/sdk-ui-pivot",
            importType: "named",
        },
        transformation: (obj) => {
            return isAllMeasureColumnWidthItem(obj)
                ? factoryNotationForAllMeasureColumnWidthItem(obj)
                : undefined;
        },
    },
];
