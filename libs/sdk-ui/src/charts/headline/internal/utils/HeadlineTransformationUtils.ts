// (C) 2007-2018 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import isEmpty = require("lodash/isEmpty");
import isNumber = require("lodash/isNumber");
import { DataValue, DataViewFacade, IDataView, IMeasureHeaderItem } from "@gooddata/sdk-backend-spi";
import * as CustomEventPolyfill from "custom-event";
import * as invariant from "invariant";
import { InjectedIntl } from "react-intl";
import { HeadlineElementType, VisualizationTypes } from "../../../../base/constants/visualizationTypes";
import {
    isSomeHeaderPredicateMatched2,
    createDrillIntersectionElement,
} from "../../../../base/helpers/drilling";
import {
    IDrillEvent2,
    IDrillEventCallback2,
    IDrillEventContextHeadline,
} from "../../../../base/interfaces/DrillEvents";
import { IHeaderPredicate2 } from "../../../../base/interfaces/HeaderPredicate";
import { IHeadlineData, IHeadlineDataItem } from "../../Headlines";
import { measureUriOrQualifier } from "../../../../base/helpers/measures";
import { Identifier } from "@gooddata/sdk-model";

export interface IHeadlineExecutionData {
    measureHeaderItem: IMeasureHeaderItem["measureHeaderItem"];
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

function createTertiaryItem(executionData: IHeadlineExecutionData[], intl: InjectedIntl): IHeadlineDataItem {
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
    const headerItems = dv.measureGroupHeaderItems();
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
export function getHeadlineData(dataView: IDataView, intl: InjectedIntl): IHeadlineData {
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
    drillableItems: IHeaderPredicate2[],
    dataView: IDataView,
): IHeadlineData {
    const dv = new DataViewFacade(dataView);
    const data = cloneDeep(headlineData);
    const { primaryItem, secondaryItem } = data;
    const [primaryItemHeader, secondaryItemHeader] = dv.measureGroupHeaderItems();

    if (!isEmpty(primaryItem) && !isEmpty(primaryItemHeader)) {
        primaryItem.isDrillable = isSomeHeaderPredicateMatched2(drillableItems, primaryItemHeader, dv);
    }

    if (!isEmpty(secondaryItem) && !isEmpty(secondaryItemHeader)) {
        secondaryItem.isDrillable = isSomeHeaderPredicateMatched2(drillableItems, secondaryItemHeader, dv);
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
): IDrillEvent2 {
    const dv = new DataViewFacade(dataView);
    const measureHeaderItem = dv.measureGroupHeaderItem(itemContext.localIdentifier);
    if (!measureHeaderItem) {
        throw new Error("The metric uri has not been found in execution response!");
    }

    const masterMeasureQualifier = measureUriOrQualifier(
        dv.masterMeasureForDerived(itemContext.localIdentifier),
    );
    if (!masterMeasureQualifier) {
        throw new Error("The metric ids has not been found in execution request!");
    }

    const intersectionElement = createDrillIntersectionElement(
        measureHeaderItem.measureHeaderItem.localIdentifier,
        measureHeaderItem.measureHeaderItem.name,
        masterMeasureQualifier.uri,
        masterMeasureQualifier.identifier,
    );
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

/**
 * Fire a new drill event built from the provided data to the target that have a 'dispatchEvent' method.
 *
 * @param drillEventFunction - custom drill event function which could process and prevent default post message event.
 * @param drillEventData - The event data in {executionContext, drillContext} format.
 * @param target - The target where the built event must be dispatched.
 */
export function fireDrillEvent(
    drillEventFunction: IDrillEventCallback2,
    drillEventData: IDrillEvent2,
    target: EventTarget,
) {
    const shouldDispatchPostMessage = drillEventFunction && drillEventFunction(drillEventData);

    if (shouldDispatchPostMessage !== false) {
        target.dispatchEvent(
            new CustomEventPolyfill("drill", {
                detail: drillEventData,
                bubbles: true,
            }),
        );
    }
}
