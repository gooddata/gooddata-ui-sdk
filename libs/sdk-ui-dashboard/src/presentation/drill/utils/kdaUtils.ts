// (C) 2025 GoodData Corporation

import { groupBy, isEqualWith } from "lodash-es";
import { IntlShape } from "react-intl";

import {
    IAttributeDescriptor,
    IAttributeDescriptorBody,
    ICatalogDateAttribute,
    IKeyDriveAnalysis,
    IMeasureDescriptor,
    IResultAttributeHeader,
    areObjRefsEqual,
    isMeasureDescriptor,
} from "@gooddata/sdk-model";
import {
    DataPoint,
    DataViewFacade,
    IDrillEvent,
    IDrillIntersectionAttributeItem,
    isDrillIntersectionDateAttributeItem,
} from "@gooddata/sdk-ui";

import { DashboardKeyDriverCombinationItem } from "../../../model/index.js";

/**
 * @internal
 */
export function getKdaKeyDriverCombinations(
    dateAttributes: ICatalogDateAttribute[],
    drillDefinition: IKeyDriveAnalysis,
    drillEvent: IDrillEvent,
): DashboardKeyDriverCombinationItem[] {
    //TODO: Special implementation for headline
    const dv = DataViewFacade.for(drillEvent.dataView);
    const { attributeHeader, metricHeader } = findHeadersCombinations(drillDefinition, drillEvent);

    // No relevant headers
    if (!attributeHeader || !metricHeader) {
        return [];
    }

    const dateAttribute = findDateValues(dv, dateAttributes, attributeHeader);
    const metricValue = findMetricValues(dv, metricHeader, dateAttribute);

    const res: DashboardKeyDriverCombinationItem[] = [];

    // There is a previous value in graph
    const before = createBefore(metricHeader, dateAttribute, metricValue);
    res.push(...(before ? [before] : []));

    // There is a next value in graph
    const after = createAfter(metricHeader, dateAttribute, metricValue);
    res.push(...(after ? [after] : []));

    // There is a previous year value in graph
    const year = createYearToYear(dv, metricHeader, dateAttribute, metricValue);
    res.push(...(year ? [year] : []));

    return res;
}

function createBefore(
    measure: IMeasureDescriptor,
    dateAttribute: ReturnType<typeof findDateValues>,
    metricValue: ReturnType<typeof findMetricValues>,
): DashboardKeyDriverCombinationItem | undefined {
    if (dateAttribute.previousValue && metricValue.previousValue) {
        const currentValue = metricValue.currentValue.rawValue as number;
        const previousValue = metricValue.previousValue.rawValue as number;

        return {
            measure,
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
    measure: IMeasureDescriptor,
    dateAttribute: ReturnType<typeof findDateValues>,
    metricValue: ReturnType<typeof findMetricValues>,
): DashboardKeyDriverCombinationItem | undefined {
    if (dateAttribute.nextValue && metricValue.nextValue) {
        const currentValue = metricValue.currentValue.rawValue as number;
        const nextValue = metricValue.nextValue.rawValue as number;

        return {
            measure,
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
    measure: IMeasureDescriptor,
    dateAttribute: ReturnType<typeof findDateValues>,
    metricValue: ReturnType<typeof findMetricValues>,
): DashboardKeyDriverCombinationItem | undefined {
    const values = dateAttribute.values;
    const attributeDefinition = dateAttribute.attributeDefinition;

    if (!attributeDefinition) {
        return undefined;
    }

    const isYear = attributeDefinition.granularity === "GDC.time.year";

    // Year to year is not available for year granularity, it not makes sense
    if (isYear) {
        return undefined;
    }

    const { previousYear, previousYearDatePoint } = findPreviousYearValue(
        dv,
        measure,
        values,
        dateAttribute.currentValue,
    );

    if (previousYear && previousYearDatePoint && metricValue) {
        const previousValue = previousYearDatePoint.rawValue as number;
        const currentValue = metricValue.currentValue.rawValue as number;

        return {
            measure,
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
    if (drillDefinition.transition !== "in-place") {
        return {
            attributeHeader: undefined,
            metricHeader: undefined,
        };
    }
    //NOTE: For now we only support 1 date and 1 metric
    const attributeHeader = (drillEvent.drillContext.intersection || [])
        .map((intersectionElement) => intersectionElement.header)
        .filter(isDrillIntersectionDateAttributeItem)[0];
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
    dateAttributes: ICatalogDateAttribute[],
    attributeHeader: IDrillIntersectionAttributeItem,
): {
    attributeDefinition: ICatalogDateAttribute | undefined;
    values: IResultAttributeHeader[];
    previousValue: AttributeHeader | undefined;
    currentValue: AttributeHeader;
    nextValue: AttributeHeader | undefined;
    dims: [number, number, number];
    shift: number;
} {
    const { dims, values, shift } = calculateDimensions(dv, attributeHeader);

    const previousValue = getAttributeHeader(attributeHeader.attributeHeader, values[dims[2] - shift]);
    const currentValue = attributeHeader;
    const nextValue = getAttributeHeader(attributeHeader.attributeHeader, values[dims[2] + shift]);

    const attributeDefinition = dateAttributes.find((da) => {
        return (
            areObjRefsEqual(da.defaultDisplayForm, attributeHeader.attributeHeader.ref) ||
            da.attribute.displayForms.some((df) =>
                areObjRefsEqual(df.ref, attributeHeader.attributeHeader.ref),
            )
        );
    });

    return {
        values,
        previousValue,
        currentValue,
        nextValue,
        attributeDefinition,
        dims,
        shift,
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
    dateAttribute: ReturnType<typeof findDateValues>,
): {
    previousValue: DataPoint | undefined;
    currentValue: DataPoint;
    nextValue: DataPoint | undefined;
} {
    const localId = metricHeader.measureHeaderItem.localIdentifier;
    const data = Array.from(dv.data().series().allForMeasure(localId))[0].dataPoints();

    const previousValue = data[dateAttribute.dims[2] - dateAttribute.shift];
    const currentValue = data[dateAttribute.dims[2]];
    const nextValue = data[dateAttribute.dims[2] + dateAttribute.shift];

    return {
        previousValue,
        currentValue,
        nextValue,
    };
}

function findPreviousYearValue(
    dv: DataViewFacade,
    metricHeader: IMeasureDescriptor,
    values: IResultAttributeHeader[],
    currentYear: AttributeHeader,
): {
    previousYear: AttributeHeader | null;
    previousYearDatePoint: DataPoint | null;
} {
    const localId = metricHeader.measureHeaderItem.localIdentifier;
    const data = Array.from(dv.data().series().allForMeasure(localId))[0].dataPoints();

    const split = currentYear.attributeHeaderItem.uri.split("-");
    split[0] = (parseInt(split[0]) - 1).toString();
    const prevYearUri = split.join("-");

    const prevYearHeader = values.find((v) => v.attributeHeaderItem.uri === prevYearUri);
    const prevYearIndex = prevYearHeader ? values.indexOf(prevYearHeader) : -1;

    return {
        previousYear: prevYearHeader
            ? {
                  ...currentYear,
                  ...prevYearHeader,
              }
            : null,
        previousYearDatePoint: data[prevYearIndex] ?? null,
    };
}

function calculateDimensions(
    dv: DataViewFacade,
    attributeHeader: IDrillIntersectionAttributeItem,
): {
    dims: [number, number, number];
    shift: number;
    values: IResultAttributeHeader[];
} {
    const headers = dv.meta().attributeHeaders();
    // const dims = headers.reduce(
    //     (prev, f, dim1) => {
    //         const [dim2, dim3] = f.reduce(
    //             (prev, f, i) => {
    //                 const dim3 = f.findIndex((a) => {
    //                     return isEqualWith(a.attributeHeaderItem, attributeHeader.attributeHeaderItem);
    //                 });
    //                 if (dim3 >= 0) {
    //                     return [i, dim3];
    //                 }
    //                 return prev;
    //             },
    //             [-1, -1],
    //         );
    //         if (dim2 >= 0 && dim3 >= 0) {
    //             return [dim1, dim2, dim3];
    //         }
    //         return prev;
    //     },
    //     [-1, -1, -1],
    // ) as [number, number, number];

    // Find a dimension of the attribute header
    const dims =
        (headers.flatMap((f, dim1) =>
            f.flatMap((group, dim2) => {
                const dim3 = group.findIndex((a) =>
                    isEqualWith(a.attributeHeaderItem, attributeHeader.attributeHeaderItem),
                );
                return dim3 >= 0 ? [[dim1, dim2, dim3]] : [];
            }),
        )[0] as [number, number, number]) ?? ([-1, -1, -1] as [number, number, number]);

    // Retrieve the values for the attribute header by dimensions
    const values = headers[dims[0]][dims[1]];

    // Find a shift for the attribute header
    const shift = Object.values(groupBy(values, (val) => val.attributeHeaderItem.uri))[0].length;

    return {
        dims,
        shift,
        values,
    };
}
