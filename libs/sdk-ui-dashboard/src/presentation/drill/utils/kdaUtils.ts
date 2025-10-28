// (C) 2025 GoodData Corporation

import { isEqual, isEqualWith } from "lodash-es";
import { IntlShape } from "react-intl";
import { invariant } from "ts-invariant";

import {
    IAttributeDescriptor,
    ICatalogDateAttribute,
    IKeyDriveAnalysis,
    IResultAttributeHeader,
    areObjRefsEqual,
    isMeasureDescriptor,
} from "@gooddata/sdk-model";
import {
    DataPoint,
    DataViewFacade,
    IDataSeries,
    IDrillEvent,
    IDrillIntersectionAttributeItem,
    isDrillIntersectionAttributeItem,
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
    const combinations = findHeadersCombinations(drillDefinition, drillEvent);

    // No relevant headers
    if (!combinations.attributeHeader || !combinations.metricHeader) {
        return [];
    }

    const dateAttribute = findDateValues(dv, dateAttributes, combinations);
    const metricValue = findMetricValues(dv, combinations);

    const res: DashboardKeyDriverCombinationItem[] = [];

    // There is a previous value in graph
    const before = createBefore(combinations, dateAttribute, metricValue);
    res.push(...(before ? [before] : []));

    // There is a next value in graph
    const after = createAfter(combinations, dateAttribute, metricValue);
    res.push(...(after ? [after] : []));

    // There is a previous year value in graph
    const year = createYearToYear(combinations, dateAttribute, metricValue);
    res.push(...(year ? [year] : []));

    return res;
}

function createBefore(
    combinations: Combinations,
    dataValues: DataValues,
    metricValue: MetricValues,
): DashboardKeyDriverCombinationItem | undefined {
    const measure = combinations.metricHeader;
    if (measure && dataValues.previousValue && metricValue.previousValue) {
        const currentValue = metricValue.currentValue.rawValue as number;
        const previousValue = metricValue.previousValue.rawValue as number;

        return {
            measure,
            where: "before",
            difference: currentValue - previousValue,
            type: "comparative",
            values: [previousValue, currentValue],
            range: [dataValues.previousValue, dataValues.currentValue],
        };
    }
    return undefined;
}

function createAfter(
    combinations: Combinations,
    dataValues: DataValues,
    metricValue: MetricValues,
): DashboardKeyDriverCombinationItem | undefined {
    const measure = combinations.metricHeader;
    if (measure && dataValues.nextValue && metricValue.nextValue) {
        const currentValue = metricValue.currentValue.rawValue as number;
        const nextValue = metricValue.nextValue.rawValue as number;

        return {
            measure,
            where: "after",
            difference: nextValue - currentValue,
            type: "comparative",
            values: [currentValue, nextValue],
            range: [dataValues.currentValue, dataValues.nextValue],
        };
    }
    return undefined;
}

function createYearToYear(
    combinations: Combinations,
    dataValues: DataValues,
    metricValue: MetricValues,
): DashboardKeyDriverCombinationItem | undefined {
    const measure = combinations.metricHeader;
    const attributeDefinition = dataValues.attributeDefinition;

    if (!attributeDefinition || !measure) {
        return undefined;
    }

    const isYear = attributeDefinition.granularity === "GDC.time.year";

    // Year to year is not available for year granularity, it not makes sense
    if (isYear) {
        return undefined;
    }

    const previousYearDefinition = findPreviousYearValue(combinations, dataValues, metricValue);
    if (previousYearDefinition && metricValue) {
        const previousValue = previousYearDefinition.previousYearDataPoint.rawValue as number;
        const currentValue = metricValue.currentValue.rawValue as number;

        return {
            measure,
            where: "none",
            difference: previousValue - currentValue,
            type: "year-to-year",
            values: [previousValue, currentValue],
            range: [previousYearDefinition.previousYear, dataValues.currentValue],
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

type Combinations = ReturnType<typeof findHeadersCombinations>;

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

    const attributeHeaders = (drillEvent.drillContext.intersection || [])
        .map((intersectionElement) => intersectionElement.header)
        .filter(isDrillIntersectionAttributeItem)
        .filter((header) => header !== attributeHeader);

    return {
        attributeHeaders,
        attributeHeader,
        metricHeader,
    };
}

type DataValues = ReturnType<typeof findDateValues>;
type DataValue = IResultAttributeHeader & IAttributeDescriptor;

function findDateValues(
    dv: DataViewFacade,
    dateAttributes: ICatalogDateAttribute[],
    combinations: Combinations,
): {
    attributeDefinition: ICatalogDateAttribute | undefined;
    dimensions: DimensionArrayItem[];
    previousValue: DataValue | undefined;
    currentValue: DataValue;
    nextValue: DataValue | undefined;
} {
    const dimensions = calculateDimensions(dv, combinations);
    invariant(combinations.attributeHeader, "Primary attribute header is missing");

    const previousValue = getAttributeHeaders(combinations, dimensions, -1);
    const currentValue = combinations.attributeHeader;
    const nextValue = getAttributeHeaders(combinations, dimensions, 1);

    const attributeDefinition = dateAttributes.find((da) => {
        return (
            areObjRefsEqual(da.defaultDisplayForm, currentValue.attributeHeader.ref) ||
            da.attribute.displayForms.some((df) => areObjRefsEqual(df.ref, currentValue.attributeHeader.ref))
        );
    });

    return {
        dimensions,
        previousValue,
        currentValue,
        nextValue,
        attributeDefinition,
    };
}

function getAttributeHeaders(
    combinations: Combinations,
    dimensions: DimensionArrayItem[],
    direction: -1 | 1,
): DataValue | undefined {
    const currentHeader = combinations.attributeHeader;
    invariant(currentHeader, "Primary attribute header is missing");

    const primaryDimension = dimensions[0];
    const otherDimensions = dimensions.slice(1);

    const grouped = groupByDimension(otherDimensions, primaryDimension);
    const primaryValid = primaryDimension.values.map((v, i) => {
        const filled = grouped.every((g) => g.values[i]);
        return filled ? v : null;
    });

    const dates = primaryValid.filter(Boolean) as DataValue[];

    const currentHeaderIndex = dates.findIndex((d) =>
        isEqual(d.attributeHeaderItem, primaryDimension.value.attributeHeaderItem),
    );
    const directionHeaderIndex = primaryDimension.values.indexOf(dates[currentHeaderIndex + direction]);

    return primaryDimension.values[directionHeaderIndex] ?? undefined;
}

type MetricValues = ReturnType<typeof findMetricValues>;

function findMetricValues(
    dv: DataViewFacade,
    combinations: Combinations,
): {
    previousValue: DataPoint | undefined;
    currentValue: DataPoint;
    nextValue: DataPoint | undefined;
    values: IDataSeries[];
    dataPointIndex: number;
} {
    invariant(combinations.metricHeader, "Missing metric header.");

    const localId = combinations.metricHeader.measureHeaderItem.localIdentifier;
    const data = Array.from(dv.data().series().allForMeasure(localId));

    const titles = [
        combinations.attributeHeader.attributeHeaderItem.uri,
        ...combinations.attributeHeaders.map(asUri),
    ];
    const foundData = data.filter(dataSeriesExactMatch(titles));

    const scopeTitles = [...combinations.attributeHeaders.map(asUri)];
    const scopeDateData = data.filter(dataSeriesPartialMatch(scopeTitles));

    const selectedData = foundData[0] ?? scopeDateData[0] ?? data[0];
    const selectedDataIndex = scopeDateData.indexOf(selectedData);

    const selectedDataPoints = selectedData.dataPoints();
    const foundDataPoints = selectedDataPoints.filter(dataPointPartialMatch(scopeTitles));
    const foundDataPoint = selectedDataPoints.find(dataPointExactMatch(titles));
    const selectDataPoint = foundDataPoint ?? foundDataPoints[0] ?? selectedDataPoints[0];

    //only one dimensionality
    if (scopeDateData.length === 1) {
        const selectedDataPointIndex = foundDataPoints.indexOf(selectDataPoint);

        const previousValue = foundDataPoints[selectedDataPointIndex - 1] as DataPoint | undefined;
        const currentValue = selectDataPoint;
        const nextValue = foundDataPoints[selectedDataPointIndex + 1] as DataPoint | undefined;

        return {
            dataPointIndex: selectedDataPointIndex,
            values: scopeDateData,
            previousValue,
            currentValue,
            nextValue,
        };
    }

    //multiple dimensionality
    const selectedDataPointIndex = selectedDataPoints.indexOf(selectDataPoint);

    const previousData = scopeDateData[selectedDataIndex - 1];
    const nextData = scopeDateData[selectedDataIndex + 1];

    const previousValue = previousData?.dataPoints()[selectedDataPointIndex] ?? undefined;
    const currentValue = selectDataPoint;
    const nextValue = nextData?.dataPoints()[selectedDataPointIndex] ?? undefined;

    return {
        dataPointIndex: selectedDataPointIndex,
        values: scopeDateData,
        previousValue,
        currentValue,
        nextValue,
    };
}

function findPreviousYearValue(
    combinations: Combinations,
    dataValues: DataValues,
    metricValue: MetricValues,
):
    | {
          previousYear: DataValue;
          previousYearDataPoint: DataPoint;
      }
    | undefined {
    const attributeDefinition = dataValues.attributeDefinition;
    const currentYear = dataValues.currentValue;
    const values = metricValue.values;

    invariant(attributeDefinition);

    const previousYear = getPreviousYear(currentYear);
    const previousYearSeries = values.find(dataSeriesPartialMatch([previousYear]));

    const scopeTitles = [previousYear, ...(combinations.attributeHeaders?.map(asUri) ?? [])];
    const allDataPoints = previousYearSeries?.dataPoints() ?? [];
    const prevYearDataPoint = allDataPoints.find(dataPointExactMatch(scopeTitles));

    if (!prevYearDataPoint) {
        return undefined;
    }

    const descriptors = [
        ...(prevYearDataPoint.seriesDesc.attributeDescriptors ?? []),
        ...(prevYearDataPoint.sliceDesc?.descriptors ?? []),
    ];
    const headers = [
        ...(prevYearDataPoint.seriesDesc.attributeHeaders ?? []),
        ...(prevYearDataPoint.sliceDesc?.headers ?? []),
    ];

    const index =
        descriptors.findIndex((ah) => {
            return areObjRefsEqual(
                ah.attributeHeader.primaryLabel,
                attributeDefinition.defaultDisplayForm.ref,
            );
        }) ?? -1;

    const prevYearHeader = headers[index] as IResultAttributeHeader;
    const descriptor = descriptors[index];
    if (!prevYearHeader || !descriptor) {
        return undefined;
    }

    return {
        previousYear: {
            ...prevYearHeader,
            ...descriptor,
        },
        previousYearDataPoint: prevYearDataPoint,
    };
}

// Dimensions

type DimensionArrayItem = {
    dimensions: [number, number, number];
    values: DataValue[];
    value: DataValue;
};

function calculateDimensions(dv: DataViewFacade, combinations: Combinations): DimensionArrayItem[] {
    const headers = dv.meta().attributeHeaders();
    invariant(combinations.attributeHeader, "Primary attribute header is missing");

    // Find a dimension of the attribute header
    const primaryDimensions = getDimensions(dv, combinations.attributeHeader);
    const otherDimensions = combinations.attributeHeaders.map((h) => getDimensions(dv, h));

    const descriptor = dv.meta().attributeDescriptorsForDim(primaryDimensions[0])[primaryDimensions[1]];
    const values: DataValue[] = headers[primaryDimensions[0]][primaryDimensions[1]].map((v) => ({
        ...v,
        ...descriptor,
    }));

    const items: DimensionArrayItem[] = [
        {
            dimensions: primaryDimensions,
            values: values,
            value: values[primaryDimensions[2]],
        },
    ];
    otherDimensions.forEach((d) => {
        const descriptor = dv.meta().attributeDescriptorsForDim(d[0])[d[1]];
        const values = headers[d[0]][d[1]].map((v) => ({
            ...v,
            ...descriptor,
        }));
        items.push({
            dimensions: d,
            values: values,
            value: values[d[2]],
        });
    });
    return items;
}

function getDimensions(dv: DataViewFacade, item: IDrillIntersectionAttributeItem) {
    const headers = dv.meta().attributeHeaders();

    // Find a dimension of the attribute header
    return (
        (headers.flatMap((f, dim1) =>
            f.flatMap((group, dim2) => {
                const dim3 = group.findIndex((a) =>
                    isEqualWith(a.attributeHeaderItem, item.attributeHeaderItem),
                );
                return dim3 >= 0 ? [[dim1, dim2, dim3]] : [];
            }),
        )[0] as [number, number, number]) ?? ([-1, -1, -1] as [number, number, number])
    );
}

function getPreviousYear(currentYear: IResultAttributeHeader) {
    const split = currentYear.attributeHeaderItem.uri.split("-");
    split[0] = (parseInt(split[0]) - 1).toString();
    return split.join("-");
}

// Utils

function asUri(ch: IDrillIntersectionAttributeItem) {
    return ch.attributeHeaderItem.uri;
}

function dataSeriesExactMatch(titles: string[]) {
    return (d: IDataSeries) => {
        return d.scopeTitles().every((t) => (t === null ? true : titles.includes(t)));
    };
}

function dataSeriesPartialMatch(titles: string[]) {
    return (d: IDataSeries) => {
        const scTitles = d.scopeTitles();
        if (scTitles.length > 0 && titles.length > 0) {
            return scTitles.some((t) => (t === null ? true : titles.includes(t)));
        }
        return true;
    };
}

function dataPointPartialMatch(titles: string[]) {
    return (d: DataPoint) => {
        if (d.sliceDesc) {
            const scTitles = d.sliceDesc.sliceTitles();
            if (scTitles.length > 0 && titles.length > 0) {
                return scTitles.some((t) => (t === null ? true : titles.includes(t)));
            }
        }
        return true;
    };
}

function dataPointExactMatch(titles: string[]) {
    return (d: DataPoint) => {
        if (d.sliceDesc) {
            const scTitles = d.sliceDesc.sliceTitles();
            if (scTitles.length > 0) {
                return scTitles.every((t) => (t === null ? true : titles.includes(t)));
            }
        }
        return true;
    };
}

function groupByDimension(otherDimensions: DimensionArrayItem[], primaryDimension: DimensionArrayItem) {
    return otherDimensions
        .filter(({ dimensions }) => dimensions[0] === primaryDimension.dimensions[0])
        .map((dim) => ({
            ...dim,
            values: dim.values.map((v) =>
                v.attributeHeaderItem.uri === dim.value.attributeHeaderItem.uri ? v : null,
            ),
        }));
}
