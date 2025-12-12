// (C) 2007-2025 GoodData Corporation
import { cloneDeep, isEmpty } from "lodash-es";
import { type IntlShape } from "react-intl";
import { invariant } from "ts-invariant";

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { type DataValue, type IMeasureDescriptor, type Identifier } from "@gooddata/sdk-model";
import {
    DataViewFacade,
    type HeadlineElementType,
    type IDrillEvent,
    type IDrillEventContextHeadline,
    type IDrillEventIntersectionElement,
    type IHeaderPredicate,
    VisualizationTypes,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";

import { type IHeadlineData, type IHeadlineDataItem } from "../interfaces/Headlines.js";

export interface IHeadlineExecutionData {
    measureHeaderItem: IMeasureDescriptor["measureHeaderItem"];
    value: DataValue;
}

export interface IHeadlineDrillItemContext {
    localIdentifier: Identifier;
    value: string;
    element: HeadlineElementType;
}

function createTertiaryItem(executionData: IHeadlineExecutionData[], intl: IntlShape): IHeadlineDataItem {
    const secondaryHeaderItem = executionData?.[1]?.measureHeaderItem;
    if (!secondaryHeaderItem) {
        return null;
    }

    const primaryValueString = executionData?.[0]?.value;
    const primaryValue = primaryValueString === null ? null : Number(primaryValueString);
    const secondaryValueString = executionData?.[1]?.value;
    const secondaryValue = secondaryValueString === null ? null : Number(secondaryValueString);

    const tertiaryTitle = intl.formatMessage({ id: "visualizations.headline.tertiary.title" });

    const isCountableValue = typeof primaryValue === "number" && typeof secondaryValue === "number";
    const tertiaryValue =
        isCountableValue && secondaryValue !== 0
            ? ((primaryValue - secondaryValue) / secondaryValue) * 100
            : null;

    return {
        localIdentifier: "tertiaryIdentifier",
        title: tertiaryTitle,
        value: tertiaryValue === null ? null : String(tertiaryValue),
        format: null,
        isDrillable: false,
    };
}

export function createHeadlineDataItem(
    executionDataItem: IHeadlineExecutionData,
    isDrillable?: boolean,
): IHeadlineDataItem {
    if (!executionDataItem) {
        return null;
    }

    return {
        localIdentifier: executionDataItem.measureHeaderItem.localIdentifier,
        title: executionDataItem.measureHeaderItem.name,
        value:
            executionDataItem.value === null || executionDataItem.value === undefined
                ? null
                : String(executionDataItem.value),
        format: executionDataItem.measureHeaderItem.format,
        isDrillable: !!isDrillable,
    };
}

export function getExecutionData(dv: DataViewFacade): IHeadlineExecutionData[] {
    const headerItems = dv.meta().measureDescriptors();
    const data = dv.rawData().singleDimData();

    return headerItems.map((item, index) => {
        const value = data[index];

        invariant(value !== undefined, "Undefined execution value data for headline transformation");
        invariant(item.measureHeaderItem, "Missing expected measureHeaderItem");

        return {
            measureHeaderItem: item.measureHeaderItem,
            value,
        };
    });
}

/**
 * Get {@link IHeadlineData} used by the {@link Headline} component.
 *
 * @param dataView - data to visualize
 * @param intl - Required localization for compare item title
 */
export function getHeadlineData(dataView: IDataView, intl: IntlShape): IHeadlineData {
    const dv = DataViewFacade.for(dataView);
    const executionData = getExecutionData(dv);

    const primaryItem = createHeadlineDataItem(executionData[0]);

    const secondaryItem = createHeadlineDataItem(executionData[1]);
    const secondaryItemProp = secondaryItem ? { secondaryItem } : {};

    const tertiaryItem = createTertiaryItem(executionData, intl);
    const tertiaryItemProp = tertiaryItem ? { tertiaryItem } : {};

    return {
        primaryItem,
        ...secondaryItemProp,
        ...tertiaryItemProp,
    };
}

/**
 * Take headline data and apply list of drillable items.
 * The method will return copied collection of the headline data with altered drillable status.
 *
 * @param headlineData - The headline data that we want to change the drillable status.
 * @param drillableItems - list of drillable items
 * @param dataView - data visualized by the headline
 * @returns altered headlineData
 */
export function applyDrillableItems(
    headlineData: IHeadlineData,
    drillableItems: IHeaderPredicate[],
    dataView: IDataView,
): IHeadlineData {
    const dv = DataViewFacade.for(dataView);
    const data = cloneDeep(headlineData);
    const { primaryItem, secondaryItem } = data;
    const [primaryItemHeader, secondaryItemHeader] = dv.meta().measureDescriptors();

    if (!isEmpty(primaryItem) && !isEmpty(primaryItemHeader)) {
        primaryItem.isDrillable = isSomeHeaderPredicateMatched(drillableItems, primaryItemHeader, dv);
    }

    if (!isEmpty(secondaryItem) && !isEmpty(secondaryItemHeader)) {
        secondaryItem.isDrillable = isSomeHeaderPredicateMatched(drillableItems, secondaryItemHeader, dv);
    }

    return data;
}

/**
 * Build drill event data (object with execution and drill context) from the data obtained by clicking on the {@link Headline}
 * component an from the execution objects.
 *
 * @param itemContext - data received from the click on the {@link Headline} component.
 * @param dataView - data visualized by the headline
 */
export function buildDrillEventData(
    itemContext: IHeadlineDrillItemContext,
    dataView: IDataView,
): IDrillEvent {
    const dv = DataViewFacade.for(dataView);
    const measureHeaderItem: IMeasureDescriptor = dv.meta().measureDescriptor(itemContext.localIdentifier);
    if (!measureHeaderItem) {
        throw new Error("The metric uri has not been found in execution response!");
    }

    const intersectionElement: IDrillEventIntersectionElement = {
        header: measureHeaderItem,
    };
    const drillContext: IDrillEventContextHeadline = {
        type: VisualizationTypes.HEADLINE,
        element: itemContext.element,
        value: itemContext.value,
        intersection: [intersectionElement],
    };

    return {
        dataView,
        drillContext,
    };
}
