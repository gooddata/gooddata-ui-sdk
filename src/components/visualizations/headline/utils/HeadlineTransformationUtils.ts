// (C) 2007-2018 GoodData Corporation
import cloneDeep = require('lodash/cloneDeep');
import get = require('lodash/get');
import isEmpty = require('lodash/isEmpty');
import isNumber = require('lodash/isNumber');
import * as CustomEventPolyfill from 'custom-event';
import * as invariant from 'invariant';
import { AFM, Execution } from '@gooddata/typings';
import { InjectedIntl } from 'react-intl';

import { getMeasureUriOrIdentifier } from '../../utils/drilldownEventing';
import { IDrillableItem, IDrillEvent, IDrillEventCallback } from '../../../../interfaces/DrillEvents';
import { VisualizationTypes, VisElementType } from '../../../../constants/visualizationTypes';
import { IHeadlineData, IHeadlineDataItem } from '../../../../interfaces/Headlines';

export interface IHeadlineExecutionData {
    measureHeaderItem: Execution.IMeasureHeaderItem['measureHeaderItem'];
    value: Execution.DataValue;
}

export interface IHeadlineDrillItemContext {
    localIdentifier: AFM.Identifier;
    value: string;
    element: VisElementType;
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
        isDrillable: false
    };
}

function createTertiaryItem(executionData: IHeadlineExecutionData[], intl: InjectedIntl): IHeadlineDataItem {
    const secondaryHeaderItem = get(executionData, ['1', 'measureHeaderItem']);
    if (!secondaryHeaderItem) {
        return null;
    }

    const primaryValueString = get(executionData, ['0', 'value']);
    const primaryValue = primaryValueString !== null ? Number(primaryValueString) : null;
    const secondaryValueString = get(executionData, ['1', 'value']);
    const secondaryValue = secondaryValueString !== null ? Number(secondaryValueString) : null;

    const tertiaryTitle = intl.formatMessage({ id: 'visualizations.headline.tertiary.title' });

    const isCountableValue = isNumber(primaryValue) && isNumber(secondaryValue);
    const tertiaryValue = (isCountableValue && secondaryValue !== 0)
        ? ((primaryValue - secondaryValue) / secondaryValue) * 100
        : null;

    return {
        localIdentifier: 'tertiaryIdentifier',
        title: tertiaryTitle,
        value: tertiaryValue !== null ? String(tertiaryValue) : null,
        format: null,
        isDrillable: false
    };
}

/**
 * Get tuple of measure header items with related data value by index position from executionResponse and
 * executionResult.
 *
 * @param executionResponse
 * @param executionResult
 * @returns {any[]}
 */
function getExecutionData(executionResponse: Execution.IExecutionResponse,
                          executionResult: Execution.IExecutionResult): IHeadlineExecutionData[] {
    const headerItems = get(executionResponse, 'dimensions[0].headers[0].measureGroupHeader.items', []);

    return headerItems.map((item, index) => {
        const value = get<string>(executionResult, ['data', index]);

        invariant(value !== undefined, 'Undefined execution value data for headline transformation');
        invariant(item.measureHeaderItem, 'Missing expected measureHeaderItem');

        return {
            measureHeaderItem: item.measureHeaderItem,
            value
        };
    });
}

/**
 * Get {HeadlineData} used by the {Headline} component.
 *
 * @param executionResponse - The execution response with dimensions definition.
 * @param executionResult - The execution result with an actual data values.
 * @param intl - Required localization for compare item title
 * @returns {*}
 */
export function getHeadlineData(executionResponse: Execution.IExecutionResponse,
                                executionResult: Execution.IExecutionResult,
                                intl: InjectedIntl): IHeadlineData {
    const executionData = getExecutionData(executionResponse, executionResult);

    const primaryItem = createHeadlineDataItem(executionData[0]);

    const secondaryItem = createHeadlineDataItem(executionData[1]);
    const secondaryItemProp = secondaryItem ? { secondaryItem } : {};

    const tertiaryItem = createTertiaryItem(executionData, intl);
    const tertiaryItemProp = tertiaryItem ? { tertiaryItem } : {};

    return {
        primaryItem,
        ...secondaryItemProp,
        ...tertiaryItemProp
    };
}

function findMeasureHeaderItem(localIdentifier: AFM.Identifier,
                               executionResponse: Execution.IExecutionResponse) {
    const measureGroupHeaderItems = get(executionResponse, 'dimensions[0].headers[0].measureGroupHeader.items', []);
    return measureGroupHeaderItems
        .map(item => item.measureHeaderItem)
        .find(header => header !== undefined && header.localIdentifier === localIdentifier);
}

function isItemDrillable(measureLocalIdentifier: AFM.Identifier,
                         drillableItems: IDrillableItem[],
                         executionRequest: AFM.IExecution['execution']): boolean {
    if (measureLocalIdentifier === undefined || measureLocalIdentifier === null) {
        return false;
    }
    const measureIds = getMeasureUriOrIdentifier(executionRequest.afm, measureLocalIdentifier);
    if (!measureIds) {
        return false;
    }
    return drillableItems.some((drillableItem: IDrillableItem) => {
        // Check for defined values because undefined === undefined
        const matchByIdentifier = drillableItem.identifier && measureIds.identifier &&
            drillableItem.identifier === measureIds.identifier;
        const matchByUri = drillableItem.uri && measureIds.uri && drillableItem.uri === measureIds.uri;

        return matchByUri || matchByIdentifier;
    });
}

/**
 * Take headline data and apply list of drillable items.
 * The method will return copied collection of the headline data with altered drillable status.
 *
 * @param headlineData - The headline data that we want to change the drillable status.
 * @param drillableItems - list of drillable items {uri, identifier}
 * @param executionRequest - Request with required measure id (uri or identifier) for activation of drill eventing
 * @returns altered headlineData
 */
export function applyDrillableItems(headlineData: IHeadlineData,
                                    drillableItems: IDrillableItem[],
                                    executionRequest: AFM.IExecution['execution']): IHeadlineData {
    const data = cloneDeep(headlineData);
    const { primaryItem, secondaryItem } = data;

    if (!isEmpty(primaryItem)) {
        primaryItem.isDrillable = isItemDrillable(primaryItem.localIdentifier, drillableItems, executionRequest);
    }

    if (!isEmpty(secondaryItem)) {
        secondaryItem.isDrillable = isItemDrillable(secondaryItem.localIdentifier, drillableItems, executionRequest);
    }

    return data;
}

/**
 * Build drill event data (object with execution and drill context) from the data obtained by clicking on the {Headline}
 * component an from the execution objects.
 *
 * @param itemContext - data received from the click on the {Headline} component.
 * @param executionRequest - The execution request with AFM and ResultSpec.
 * @param executionResponse - The execution response with dimensions definition.
 * @returns {*}
 */
export function buildDrillEventData(itemContext: IHeadlineDrillItemContext,
                                    executionRequest: AFM.IExecution['execution'],
                                    executionResponse: Execution.IExecutionResponse): IDrillEvent {
    const measureHeaderItem = findMeasureHeaderItem(itemContext.localIdentifier, executionResponse);
    if (!measureHeaderItem) {
        throw new Error('The metric uri has not been found in execution response!');
    }

    const measureIds = getMeasureUriOrIdentifier(executionRequest.afm, itemContext.localIdentifier);
    if (!measureIds) {
        throw new Error('The metric ids has not been found in execution request!');
    }

    return {
        executionContext: executionRequest.afm,
        drillContext: {
            type: VisualizationTypes.HEADLINE,
            element: itemContext.element,
            value: itemContext.value,
            intersection: [
                {
                    id: measureHeaderItem.localIdentifier,
                    title: measureHeaderItem.name,
                    header: {
                        identifier: measureIds.identifier || '',
                        uri: measureIds.uri || ''
                    }
                }
            ]
        }
    };
}

/**
 * Fire a new drill event built from the provided data to the target that have a 'dispatchEvent' method.
 *
 * @param drillEventFunction - custom drill event function which could process and prevent default post message event.
 * @param drillEventData - The event data in {executionContext, drillContext} format.
 * @param target - The target where the built event must be dispatched.
 */
export function fireDrillEvent(drillEventFunction: IDrillEventCallback,
                               drillEventData: IDrillEvent,
                               target: EventTarget) {
    const shouldDispatchPostMessage = drillEventFunction && drillEventFunction(drillEventData);

    if (shouldDispatchPostMessage !== false) {
        target.dispatchEvent(new CustomEventPolyfill('drill', {
            detail: drillEventData,
            bubbles: true
        }));
    }
}
