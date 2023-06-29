// (C) 2019-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import isEmpty from "lodash/isEmpty.js";
import { invariant } from "ts-invariant";
import { IDataView } from "@gooddata/sdk-backend-spi";
import { Identifier, DataValue, IMeasureDescriptor } from "@gooddata/sdk-model";

import { calculateXirr } from "./calculateXirr.js";
import {
    DataViewFacade,
    VisualizationTypes,
    HeadlineElementType,
    IDrillEvent,
    IDrillEventIntersectionElement,
    IDrillEventContextXirr,
    isSomeHeaderPredicateMatched,
    IHeaderPredicate,
    getMappingHeaderFormattedName,
} from "@gooddata/sdk-ui";
import { IHeadlineData } from "../../../headline/Headlines.js";

export interface IXirrExecutionData {
    date: string;
    value: DataValue;
}

export interface IXirrDrillItemContext {
    localIdentifier: Identifier;
    value: string;
    element: HeadlineElementType;
}

const computeXirr = (executionData: IXirrExecutionData[]): number => {
    // prevent errors on invalid inputs
    if (!executionData?.length) {
        return NaN;
    }

    const transactions = executionData
        .map((datum) => ({
            amount: datum.value != null ? Number.parseFloat(datum.value.toString()) : 0,
            date: datum.date,
        }))
        .filter((datum) => datum.amount !== 0) // zero values are irrelevant to XIRR computation, filter them out here to avoid useless Date parsing later
        .map(({ amount, date }) => ({
            amount,
            when: new Date(date), // TODO: parse the date explicitly to avoid cross-browser inconsistencies
        }));

    return calculateXirr(transactions);
};

function getExecutionData(dv: DataViewFacade): IXirrExecutionData[] {
    const headerItems = dv.meta().attributeHeaders()[0][0]; // TODO: is there a better way to do this?
    const data = dv.rawData().singleDimData();

    return headerItems
        ? headerItems.map((item, index): IXirrExecutionData => {
              const value = data[index];

              invariant(value !== undefined, "Undefined execution value data for XIRR transformation");
              invariant(item.attributeHeaderItem, "Missing expected attributeHeaderItem");

              return {
                  date: getMappingHeaderFormattedName(item),
                  value,
              };
          })
        : [];
}

/**
 * Get HeadlineData used by the {@link Headline} component.
 *
 * @param dataView - data to visualize
 * @param intl - Required localization for compare item title
 */
export function getHeadlineData(dataView: IDataView): IHeadlineData {
    const dv = DataViewFacade.for(dataView);
    const measure = dv.meta().measureDescriptors()[0];

    const executionData = getExecutionData(dv);
    const value = computeXirr(executionData);

    return {
        primaryItem: {
            localIdentifier: measure.measureHeaderItem.localIdentifier,
            title: measure.measureHeaderItem.name,
            value: value ? String(value) : null,
            format: measure.measureHeaderItem.format,
            isDrillable: false,
        },
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
    const { primaryItem } = data;
    const [primaryItemHeader] = dv.meta().measureDescriptors();

    if (!isEmpty(primaryItem) && !isEmpty(primaryItemHeader)) {
        primaryItem.isDrillable = isSomeHeaderPredicateMatched(drillableItems, primaryItemHeader, dv);
    }

    return data;
}

/**
 * Build drill event data (object with execution and drill context) from the data obtained by clicking on the {@link Xirr}
 * component an from the execution objects.
 *
 * @param itemContext - data received from the click on the {@link Xirr} component.
 * @param dataView - data visualized by the headline
 */
export function buildDrillEventData(itemContext: IXirrDrillItemContext, dataView: IDataView): IDrillEvent {
    const dv = DataViewFacade.for(dataView);
    const measureHeaderItem: IMeasureDescriptor = dv.meta().measureDescriptor(itemContext.localIdentifier);
    if (!measureHeaderItem) {
        throw new Error("The metric uri has not been found in execution response!");
    }

    const intersectionElement: IDrillEventIntersectionElement = {
        header: measureHeaderItem,
    };
    const drillContext: IDrillEventContextXirr = {
        type: VisualizationTypes.XIRR,
        element: "primaryValue",
        value: itemContext.value,
        intersection: [intersectionElement],
    };

    return {
        dataView,
        drillContext,
    };
}
