// (C) 2007-2025 GoodData Corporation

import { omit, without } from "lodash-es";

import { type IAttributeDescriptor, type IResultAttributeHeader } from "@gooddata/sdk-model";
import {
    type DataViewFacade,
    type IHeaderPredicate,
    type IMappingHeader,
    type VisType,
    getDrillIntersection,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";

import { multiMeasuresAlternatingTypes } from "./chartCapabilities.js";
import { type IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";
import { type IPointData, type ISeriesDataItem } from "../../typings/unsafe.js";
import { isBubbleChart, isHeatmap, isOneOfTypes, isScatterPlot, isTreemap, unwrap } from "../_util/common.js";
import { findMeasureGroupInDimensions } from "../_util/executionResultHelper.js";

function getViewBy(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    viewByIndex: number,
) {
    let viewByHeader: IResultAttributeHeader | null = null;
    let viewByItem = null;
    let viewByAttributeDescriptor: IAttributeDescriptor | null = null;

    if (viewByAttribute) {
        viewByHeader = viewByAttribute.items[viewByIndex];
        viewByItem = {
            ...unwrap(viewByHeader),
            attribute: viewByAttribute,
        };
        viewByAttributeDescriptor = { attributeHeader: omit(viewByAttribute, "items") };
    }

    return {
        viewByHeader,
        viewByItem,
        viewByAttributeDescriptor,
    };
}

function getStackBy(
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    stackByIndex: number,
) {
    let stackByHeader: IResultAttributeHeader | null = null;
    let stackByItem = null;
    let stackByAttributeDescriptor: IAttributeDescriptor | null = null;

    if (stackByAttribute) {
        // stackBy item index is always equal to seriesIndex
        stackByHeader = stackByAttribute.items[stackByIndex];
        stackByItem = {
            ...unwrap(stackByHeader),
            attribute: stackByAttribute,
        };
        stackByAttributeDescriptor = { attributeHeader: omit(stackByAttribute, "items") };
    }

    return {
        stackByHeader,
        stackByItem,
        stackByAttributeDescriptor,
    };
}

export function getDrillableSeries(
    dv: DataViewFacade,
    series: any[],
    drillableItems: IHeaderPredicate[],
    viewByAttributes: (IUnwrappedAttributeHeadersWithItems | undefined | null)[],
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    type: VisType | undefined,
): any {
    const [viewByChildAttribute, viewByParentAttribute] = viewByAttributes;

    const isMultiMeasureWithOnlyMeasures =
        isOneOfTypes(type, multiMeasuresAlternatingTypes) && !viewByChildAttribute;
    const measureGroup = findMeasureGroupInDimensions(dv.meta().dimensions());

    return series.map((seriesItem) => {
        const seriesIndex = seriesItem.seriesIndex;
        let isSeriesDrillable = false;
        let data = seriesItem.data?.map((pointData: IPointData, pointIndex: number) => {
            let measureHeaders: IMappingHeader[] = [];

            const isStackedTreemap = isTreemap(type) && !!stackByAttribute;
            if (isScatterPlot(type)) {
                measureHeaders = (measureGroup.items ?? []).slice(0, 2);
            } else if (isBubbleChart(type)) {
                measureHeaders = (measureGroup.items ?? []).slice(0, 3);
            } else if (isStackedTreemap) {
                if (pointData.id !== undefined) {
                    // not leaf -> can't be drillable
                    return pointData;
                }
                const measureIndex = viewByChildAttribute ? 0 : parseInt(pointData.parent!, 10);
                measureHeaders = [measureGroup.items[measureIndex]];
            } else {
                // measureIndex is usually seriesIndex,
                // except for stack by attribute and metricOnly pie or donut chart
                // it is looped-around pointIndex instead
                // Looping around the end of items array only works when
                // measureGroup is the last header on it's dimension
                // We do not support setups with measureGroup before attributeHeaders
                const measureIndex =
                    !stackByAttribute && !isMultiMeasureWithOnlyMeasures
                        ? seriesIndex
                        : pointIndex % measureGroup.items.length;
                measureHeaders = [measureGroup.items[measureIndex]];
            }

            const viewByIndex = isHeatmap(type) || isStackedTreemap ? pointData.x : pointIndex;
            const stackByIndex = isHeatmap(type) || isStackedTreemap ? pointData.y : seriesIndex;

            const { stackByHeader, stackByAttributeDescriptor } = getStackBy(stackByAttribute, stackByIndex);

            const {
                viewByHeader: viewByChildHeader,
                viewByAttributeDescriptor: viewByChildAttributeDescriptor,
            } = getViewBy(viewByChildAttribute, viewByIndex!);

            const {
                viewByHeader: viewByParentHeader,
                viewByAttributeDescriptor: viewByParentAttributeDescriptor,
            } = getViewBy(viewByParentAttribute, viewByIndex!);

            // point is drillable if a drillableItem matches:
            //   point's measure,
            //   point's viewBy attribute,
            //   point's viewBy attribute item,
            //   point's stackBy attribute,
            //   point's stackBy attribute item,
            const drillableHooks: IMappingHeader[] = without(
                [
                    ...measureHeaders,
                    viewByChildAttributeDescriptor,
                    viewByChildHeader,
                    viewByParentAttributeDescriptor,
                    viewByParentHeader,
                    stackByAttributeDescriptor,
                    stackByHeader,
                ],
                null,
            ) as IMappingHeader[];

            const drilldown: boolean = drillableHooks.some((drillableHook) =>
                isSomeHeaderPredicateMatched(drillableItems, drillableHook, dv),
            );

            const drillableProps: any = {
                drilldown,
            };

            if (drilldown) {
                const headers: (IMappingHeader | null)[] = [
                    ...measureHeaders,
                    viewByChildHeader,
                    viewByChildAttributeDescriptor,
                    viewByParentHeader,
                    viewByParentAttributeDescriptor,
                    stackByHeader,
                    stackByAttributeDescriptor,
                ];
                const sanitizedHeaders: IMappingHeader[] = without([...headers], null) as IMappingHeader[];
                drillableProps.drillIntersection = getDrillIntersection(sanitizedHeaders);
                isSeriesDrillable = true;
            }
            return {
                ...pointData,
                ...drillableProps,
            };
        });

        if (isScatterPlot(type)) {
            data = data.filter((dataItem: ISeriesDataItem) => {
                return dataItem.x !== null && dataItem.y !== null;
            });
        }

        return {
            ...seriesItem,
            data,
            isDrillable: isSeriesDrillable,
        };
    });
}
