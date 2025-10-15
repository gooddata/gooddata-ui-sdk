// (C) 2025 GoodData Corporation

import { isEqualWith } from "lodash-es";
import { IntlShape } from "react-intl";

import {
    IAttributeDescriptor,
    IAttributeDescriptorBody,
    IKeyDriveAnalysis,
    IMeasureDescriptor,
    IResultAttributeHeader,
    isMeasureDescriptor,
} from "@gooddata/sdk-model";
import {
    DataPoint,
    DataViewFacade,
    IDrillEvent,
    IDrillIntersectionAttributeItem,
    isDrillIntersectionAttributeItem,
} from "@gooddata/sdk-ui";

import { getDrillOriginLocalIdentifier } from "../../../_staging/drills/drillingUtils.js";
import { DashboardKeyDriverCombinationItem } from "../../../model/index.js";

/**
 * @internal
 */
export function getKdaKeyDriverCombinations(
    drillDefinition: IKeyDriveAnalysis,
    drillEvent: IDrillEvent,
): DashboardKeyDriverCombinationItem[] {
    const dv = DataViewFacade.for(drillEvent.dataView);
    const { attributeHeader, metricHeader } = findHeadersCombinations(drillDefinition, drillEvent);

    // No relevant headers
    if (!attributeHeader || !metricHeader) {
        return [];
    }

    const dateAttribute = findDateValues(dv, attributeHeader);
    const metricValue = findMetricValues(dv, metricHeader, dateAttribute.dims);

    const res: DashboardKeyDriverCombinationItem[] = [];

    // There is a previous value in graph
    const before = createBefore(dateAttribute, metricValue);
    res.push(...(before ? [before] : []));

    // There is a next value in graph
    const after = createAfter(dateAttribute, metricValue);
    res.push(...(after ? [after] : []));

    // There is a previous year value in graph
    const year = createYearToYear(dv, metricHeader, dateAttribute, metricValue);
    res.push(...(year ? [year] : []));

    return res;
}

function createBefore(
    dateAttribute: ReturnType<typeof findDateValues>,
    metricValue: ReturnType<typeof findMetricValues>,
): DashboardKeyDriverCombinationItem | undefined {
    if (dateAttribute.previousValue && metricValue.previousValue) {
        const currentValue = metricValue.currentValue.rawValue as number;
        const previousValue = metricValue.previousValue.rawValue as number;

        return {
            where: "before",
            difference: currentValue - previousValue,
            type: "comparative",
            values: [previousValue, currentValue],
            range: [dateAttribute.previousValue, dateAttribute.currentValue],
        };
    }
    return undefined;
}

function createAfter(
    dateAttribute: ReturnType<typeof findDateValues>,
    metricValue: ReturnType<typeof findMetricValues>,
): DashboardKeyDriverCombinationItem | undefined {
    if (dateAttribute.nextValue && metricValue.nextValue) {
        const currentValue = metricValue.currentValue.rawValue as number;
        const nextValue = metricValue.nextValue.rawValue as number;

        return {
            where: "after",
            difference: nextValue - currentValue,
            type: "comparative",
            values: [currentValue, nextValue],
            range: [dateAttribute.currentValue, dateAttribute.nextValue],
        };
    }
    return undefined;
}

function createYearToYear(
    dv: DataViewFacade,
    metric: IMeasureDescriptor,
    dateAttribute: ReturnType<typeof findDateValues>,
    metricValue: ReturnType<typeof findMetricValues>,
): DashboardKeyDriverCombinationItem | undefined {
    const values = dateAttribute.values;
    const previousYear = findValuePreviousYear(dateAttribute.currentValue);
    const previousYearMetricValue = findMetricPreviousYearValue(dv, metric, values, previousYear);

    if (previousYear && previousYearMetricValue && metricValue) {
        const previousValue = previousYearMetricValue.rawValue as number;
        const currentValue = metricValue.currentValue.rawValue as number;

        return {
            where: "none",
            difference: previousValue - currentValue,
            type: "year-to-year",
            values: [previousValue, currentValue],
            range: [previousYear, dateAttribute.currentValue],
        };
    }
    return undefined;
}

/**
 * @internal
 */
export function getKeyDriverCombinationItemTitle(intl: IntlShape, item: DashboardKeyDriverCombinationItem) {
    switch (item.type) {
        case "comparative": {
            const where =
                item.where === "before"
                    ? intl.formatMessage({ id: "drill.kda.from" })
                    : intl.formatMessage({ id: "drill.kda.in" });
            const date = item.where === "before" ? item.range[0] : item.range[1];

            if (item.difference < 0) {
                return intl.formatMessage(
                    { id: "drill.kda.drop" },
                    {
                        where,
                        title: date.attributeHeaderItem.formattedName,
                    },
                );
            }
            if (item.difference > 0) {
                return intl.formatMessage(
                    { id: "drill.kda.increase" },
                    {
                        where,
                        title: date.attributeHeaderItem.formattedName,
                    },
                );
            }
            return intl.formatMessage(
                { id: "drill.kda.no_change" },
                {
                    where,
                    title: date.attributeHeaderItem.formattedName,
                },
            );
        }
        case "year-to-year":
            return intl.formatMessage({ id: "drill.kda.year_to_year" });
    }
}

function findHeadersCombinations(drillDefinition: IKeyDriveAnalysis, drillEvent: IDrillEvent) {
    const localIdentifier = getDrillOriginLocalIdentifier(drillDefinition);
    const attributeHeader = (drillEvent.drillContext.intersection || [])
        .map((intersectionElement) => intersectionElement.header)
        .filter(isDrillIntersectionAttributeItem)
        .find(
            (intersectionAttributeItem) =>
                intersectionAttributeItem.attributeHeader.localIdentifier === localIdentifier,
        );
    const metricHeader = (drillEvent.drillContext.intersection || [])
        .map((intersectionElement) => intersectionElement.header)
        .filter(isMeasureDescriptor)[0];

    return {
        attributeHeader,
        metricHeader,
    };
}

type AttributeHeader = IResultAttributeHeader & IAttributeDescriptor;

function findDateValues(
    dv: DataViewFacade,
    attributeHeader: IDrillIntersectionAttributeItem,
): {
    values: IResultAttributeHeader[];
    previousValue: AttributeHeader | undefined;
    currentValue: AttributeHeader;
    nextValue: AttributeHeader | undefined;
    dims: [number, number, number];
} {
    const headers = dv.meta().attributeHeaders();
    const dims = headers.reduce(
        (prev, f, dim1) => {
            const [dim2, dim3] = f.reduce(
                (prev, f, i) => {
                    const dim3 = f.findIndex((a) => {
                        return isEqualWith(a.attributeHeaderItem, attributeHeader.attributeHeaderItem);
                    });
                    if (dim3 >= 0) {
                        return [i, dim3];
                    }
                    return prev;
                },
                [-1, -1],
            );
            if (dim2 >= 0 && dim3 >= 0) {
                return [dim1, dim2, dim3];
            }
            return prev;
        },
        [-1, -1, -1],
    ) as [number, number, number];

    const values = headers[dims[0]][dims[1]];

    const previousValue = getAttributeHeader(attributeHeader.attributeHeader, values[dims[2] - 1]);
    const currentValue = attributeHeader;
    const nextValue = getAttributeHeader(attributeHeader.attributeHeader, values[dims[2] + 1]);

    return {
        values,
        previousValue,
        currentValue,
        nextValue,
        dims,
    };
}

function getAttributeHeader(
    attributeHeader: IAttributeDescriptorBody,
    header: IResultAttributeHeader | undefined,
) {
    return header
        ? {
              ...header,
              attributeHeader,
          }
        : undefined;
}

function findMetricValues(
    dv: DataViewFacade,
    metricHeader: IMeasureDescriptor,
    dims: [number, number, number],
): {
    previousValue: DataPoint | undefined;
    currentValue: DataPoint;
    nextValue: DataPoint | undefined;
} {
    const localId = metricHeader.measureHeaderItem.localIdentifier;
    const data = Array.from(dv.data().series().allForMeasure(localId))[0].dataPoints();

    const previousValue = data[dims[2] - 1];
    const currentValue = data[dims[2]];
    const nextValue = data[dims[2] + 1];

    return {
        previousValue,
        currentValue,
        nextValue,
    };
}

function findMetricPreviousYearValue(
    dv: DataViewFacade,
    metricHeader: IMeasureDescriptor,
    values: IResultAttributeHeader[],
    previousYear: IResultAttributeHeader | null,
): DataPoint | null {
    if (!previousYear) {
        return null;
    }

    const localId = metricHeader.measureHeaderItem.localIdentifier;
    const data = Array.from(dv.data().series().allForMeasure(localId))[0].dataPoints();
    const prevYearIndex = values.findIndex(
        (v) => v.attributeHeaderItem.normalizedValue === previousYear.attributeHeaderItem.normalizedValue,
    );

    return data[prevYearIndex] ?? null;
}

function findValuePreviousYear(current: AttributeHeader): AttributeHeader | null {
    const value = current.attributeHeaderItem.normalizedValue;

    if (!value) {
        return null;
    }

    const date = new Date(value);
    date.setFullYear(date.getFullYear() - 1);
    return {
        ...current,
        attributeHeaderItem: {
            ...current.attributeHeaderItem,
            normalizedValue: date.toISOString(),
        },
    };
}
