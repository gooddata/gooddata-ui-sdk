// (C) 2022-2026 GoodData Corporation

import { partition } from "lodash-es";

import {
    type ColumnLocator,
    type IAbsoluteColumnWidth,
    type IAllMeasureColumnWidthItem,
    type IAttributeColumnLocator,
    type IAttributeColumnWidthItem,
    type IMeasureColumnLocator,
    type IMeasureColumnWidthItem,
    type ITotalColumnLocator,
    type IWeakMeasureColumnWidthItem,
    isAllMeasureColumnWidthItem,
    isAttributeColumnLocator,
    isAttributeColumnWidthItem,
    isMeasureColumnLocator,
    isMeasureColumnWidthItem,
    isTotalColumnLocator,
    isWeakMeasureColumnWidthItem,
} from "@gooddata/sdk-ui-pivot";

import { type IAdditionalFactoryDefinition } from "../../../utils/embeddingCodeGenerator/types.js";

export function factoryNotationForAttributeColumnWidthItem(obj: IAttributeColumnWidthItem): string {
    const { attributeIdentifier, width } = obj.attributeColumnWidthItem;
    const { value: widthValue, allowGrowToFit } = width;
    // cannot use lodash compact, that would remove 0 values which we want to keep here
    const params = [`"${attributeIdentifier}"`, `${widthValue}`, allowGrowToFit && "true"].filter(
        (item) => !(item === null || item === undefined),
    );
    return `newWidthForAttributeColumn(${params.join(", ")})`;
}

export function factoryNotationForMeasureColumnWidthItem(obj: IMeasureColumnWidthItem): string {
    const { locators, width } = obj.measureColumnWidthItem;

    const [measureLocators, attributeLocators] = partition<ColumnLocator, IMeasureColumnLocator>(
        locators,
        isMeasureColumnLocator,
    );

    const allowGrowToFit = typeof width === "string" ? false : (width as IAbsoluteColumnWidth).allowGrowToFit;
    const attributeLocatorFactories = attributeLocators.map((locator) =>
        isAttributeColumnLocator(locator)
            ? factoryNotationForAttributeColumnLocator(locator)
            : factoryNotationForTotalColumnLocator(locator),
    );

    const measureLocatorIdentifiers = measureLocators?.map(
        (measureLocator) => measureLocator.measureLocatorItem.measureIdentifier,
    );

    const params = [
        measureLocatorIdentifiers && measureLocatorIdentifiers.length > 0
            ? `["${measureLocatorIdentifiers.join('","')}"]`
            : "null",
        `[${attributeLocatorFactories.join(", ")}]`,
        typeof width.value === "string" ? `"${width.value}"` : width.value,
        allowGrowToFit && "true",
    ].filter((item) => !(item === null || item === undefined));
    return `setNewWidthForSelectedColumns(${params.join(", ")})`;
}

export function factoryNotationForAttributeColumnLocator(obj: IAttributeColumnLocator): string {
    const { attributeIdentifier, element } = obj.attributeLocatorItem;
    // cannot use lodash compact, that would remove 0 values which we want to keep here
    const params = [`"${attributeIdentifier}"`, element && `"${element}"`].filter(
        (item) => !(item === null || item === undefined),
    );
    return `newAttributeColumnLocator(${params.join(", ")})`;
}

export function factoryNotationForTotalColumnLocator(obj: ITotalColumnLocator): string {
    const { attributeIdentifier, totalFunction } = obj.totalLocatorItem;
    // cannot use lodash compact, that would remove 0 values which we want to keep here
    const params = [`"${attributeIdentifier}"`, totalFunction && `"${totalFunction}"`].filter(
        (item) => !(item === null || item === undefined),
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
    ].filter((item) => !(item === null || item === undefined));
    return `newWidthForAllColumnsForMeasure(${params.join(", ")})`;
}

export function factoryNotationForAllMeasureColumnWidthItem(obj: IAllMeasureColumnWidthItem): string {
    const { value, allowGrowToFit } = obj.measureColumnWidthItem.width;
    // cannot use lodash compact, that would remove 0 values which we want to keep here
    const params = [value, allowGrowToFit && "true"].filter((item) => !(item === null || item === undefined));
    return `newWidthForAllMeasureColumns(${params.join(", ")})`;
}

export const pivotTableNextAdditionalFactories: IAdditionalFactoryDefinition[] = [
    {
        importInfo: {
            name: "newWidthForAttributeColumn",
            package: "@gooddata/sdk-ui-pivot/next",
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
            package: "@gooddata/sdk-ui-pivot/next",
            importType: "named",
        },
        transformation: (obj) => {
            return isAttributeColumnLocator(obj) ? factoryNotationForAttributeColumnLocator(obj) : undefined;
        },
    },
    {
        importInfo: {
            name: "newTotalColumnLocator",
            package: "@gooddata/sdk-ui-pivot/next",
            importType: "named",
        },
        transformation: (obj) => {
            return isTotalColumnLocator(obj) ? factoryNotationForTotalColumnLocator(obj) : undefined;
        },
    },
    {
        importInfo: {
            name: "newWidthForAllColumnsForMeasure",
            package: "@gooddata/sdk-ui-pivot/next",
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
            name: "setNewWidthForSelectedColumns",
            package: "@gooddata/sdk-ui-pivot/next",
            importType: "named",
        },
        transformation: (obj) => {
            return isMeasureColumnWidthItem(obj) ? factoryNotationForMeasureColumnWidthItem(obj) : undefined;
        },
    },
    {
        importInfo: {
            name: "newWidthForAllMeasureColumns",
            package: "@gooddata/sdk-ui-pivot/next",
            importType: "named",
        },
        transformation: (obj) => {
            return isAllMeasureColumnWidthItem(obj)
                ? factoryNotationForAllMeasureColumnWidthItem(obj)
                : undefined;
        },
    },
];
