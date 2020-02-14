// (C) 2007-2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import isEmpty = require("lodash/isEmpty");
import isNumber = require("lodash/isNumber");
import { DataValue, DataViewFacade, IDataView, IMeasureDescriptor } from "@gooddata/sdk-backend-spi";
import * as invariant from "invariant";
import { IntlShape } from "react-intl";
import {
    IDrillEvent,
    IDrillEventContextHeadline,
    IDrillEventIntersectionElement,
    IHeaderPredicate,
    isSomeHeaderPredicateMatched,
    HeadlineElementType,
    VisualizationTypes,
} from "@gooddata/sdk-ui";
import { IHeadlineData, IHeadlineDataItem } from "../../Headlines";
import { Identifier } from "@gooddata/sdk-model";

export interface IHeadlineExecutionData {
    measureHeaderItem: IMeasureDescriptor["measureHeaderItem"];
    value: DataValue;
}

export interface IHeadlineDrillItemContext {
    localIdentifier: Identifier;
    value: string;
    element: HeadlineElementType;
}

function createHeadlineDataItem(executionDataItem: IHeadlineExecutionData): IHeadlineDataItem {
    if (!executionDataItem) {
        return null;
    }

    return {
        localIdentifier: executionDataItem.measureHeaderItem.localIdentifier,
        title: executionDataItem.measureHeaderItem.name,
        value: executionDataItem.value ? String(executionDataItem.value) : null,
        format: executionDataItem.measureHeaderItem.format,
        isDrillable: false,
    };
}

function createTertiaryItem(executionData: IHeadlineExecutionData[], intl: IntlShape): IHeadlineDataItem {
    const secondaryHeaderItem = get(executionData, [1, "measureHeaderItem"]);
    if (!secondaryHeaderItem) {
        return null;
    }

    const primaryValueString = get(executionData, [0, "value"]);
    const primaryValue = primaryValueString !== null ? Number(primaryValueString) : null;
    const secondaryValueString = get(executionData, [1, "value"]);
    const secondaryValue = secondaryValueString !== null ? Number(secondaryValueString) : null;

    const tertiaryTitle = intl.formatMessage({ id: "visualizations.headline.tertiary.title" });

    const isCountableValue = isNumber(primaryValue) && isNumber(secondaryValue);
    const tertiaryValue =
        isCountableValue && secondaryValue !== 0
            ? ((primaryValue - secondaryValue) / secondaryValue) * 100
            : null;

    return {
        localIdentifier: "tertiaryIdentifier",
        title: tertiaryTitle,
        value: tertiaryValue !== null ? String(tertiaryValue) : null,
        format: null,
        isDrillable: false,
    };
}

function getExecutionData(dv: DataViewFacade): IHeadlineExecutionData[] {
    const headerItems = dv.measureDescriptors();
    const data = dv.singleDimData();

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
 * Get {HeadlineData} used by the {Headline} component.
 *
 * @param dataView - data to visualize
 * @param intl - Required localization for compare item title
 * @returns {*}
 */
export function getHeadlineData(dataView: IDataView, intl: IntlShape): IHeadlineData {
    const dv = new DataViewFacade(dataView);
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
 * @param drillableItems - list of drillable items {uri, identifier}
 * @param dataView - data visualized by the headline
 * @returns altered headlineData
 */
export function applyDrillableItems(
    headlineData: IHeadlineData,
    drillableItems: IHeaderPredicate[],
    dataView: IDataView,
): IHeadlineData {
    const dv = new DataViewFacade(dataView);
    const data = cloneDeep(headlineData);
    const { primaryItem, secondaryItem } = data;
    const [primaryItemHeader, secondaryItemHeader] = dv.measureDescriptors();

    if (!isEmpty(primaryItem) && !isEmpty(primaryItemHeader)) {
        primaryItem.isDrillable = isSomeHeaderPredicateMatched(drillableItems, primaryItemHeader, dv);
    }

    if (!isEmpty(secondaryItem) && !isEmpty(secondaryItemHeader)) {
        secondaryItem.isDrillable = isSomeHeaderPredicateMatched(drillableItems, secondaryItemHeader, dv);
    }

    return data;
}

/**
 * Build drill event data (object with execution and drill context) from the data obtained by clicking on the {Headline}
 * component an from the execution objects.
 *
 * @param itemContext - data received from the click on the {Headline} component.
 * @param dataView - data visualized by the headline
 * @returns {*}
 */
export function buildDrillEventData(
    itemContext: IHeadlineDrillItemContext,
    dataView: IDataView,
): IDrillEvent {
    const dv = new DataViewFacade(dataView);
    const measureHeaderItem: IMeasureDescriptor = dv.measureDescriptor(itemContext.localIdentifier);
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
