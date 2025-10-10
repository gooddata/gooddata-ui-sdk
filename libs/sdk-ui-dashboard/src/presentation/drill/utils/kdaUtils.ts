// (C) 2025 GoodData Corporation

import { isEqualWith } from "lodash-es";
import { IntlShape } from "react-intl";

import {
    IKeyDriveAnalysis,
    IMeasureDescriptor,
    IResultAttributeHeaderItem,
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

export interface KeyDriverCombinationItem {
    where: "before" | "after" | "none";
    type: "comparative" | "year-to-year";
    difference: number;
    date: IResultAttributeHeaderItem;
}

export function getKdaKeyDriverCombinations(
    drillDefinition: IKeyDriveAnalysis,
    drillEvent: IDrillEvent,
): KeyDriverCombinationItem[] {
    const dv = DataViewFacade.for(drillEvent.dataView);
    const { attributeHeader, metricHeader } = findHeadersCombinations(drillDefinition, drillEvent);

    // No relevant headers
    if (!attributeHeader || !metricHeader) {
        return [];
    }

    const dateAttribute = findDateValues(dv, attributeHeader);
    const metricValue = findMetricValues(dv, metricHeader, dateAttribute.dims);

    const res: KeyDriverCombinationItem[] = [];
    if (dateAttribute.previousValue && metricValue.previousValue) {
        res.push({
            where: "before",
            difference:
                (metricValue.currentValue.rawValue as number) -
                (metricValue.previousValue.rawValue as number),
            type: "comparative",
            date: dateAttribute.previousValue,
        });
    }
    if (dateAttribute.nextValue && metricValue.nextValue) {
        res.push({
            where: "after",
            difference:
                (metricValue.nextValue.rawValue as number) - (metricValue.currentValue.rawValue as number),
            type: "comparative",
            date: dateAttribute.nextValue,
        });
    }
    res.push({
        where: "none",
        difference: 0,
        type: "year-to-year",
        date: dateAttribute.currentValue,
    });

    return res;
}

export function getKeyDriverCombinationItemTitle(intl: IntlShape, item: KeyDriverCombinationItem) {
    switch (item.type) {
        case "comparative": {
            const where =
                item.where === "before"
                    ? intl.formatMessage({ id: "drill.kda.from" })
                    : intl.formatMessage({ id: "drill.kda.in" });

            if (item.difference < 0) {
                return intl.formatMessage(
                    { id: "drill.kda.drop" },
                    {
                        where,
                        title: item.date.formattedName,
                    },
                );
            }
            if (item.difference > 0) {
                return intl.formatMessage(
                    { id: "drill.kda.increase" },
                    {
                        where,
                        title: item.date.formattedName,
                    },
                );
            }
            return intl.formatMessage(
                { id: "drill.kda.no_change" },
                {
                    where,
                    title: item.date.formattedName,
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

function findDateValues(
    dv: DataViewFacade,
    attributeHeader: IDrillIntersectionAttributeItem,
): {
    previousValue: IResultAttributeHeaderItem | undefined;
    currentValue: IResultAttributeHeaderItem;
    nextValue: IResultAttributeHeaderItem | undefined;
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

    const previousValue = headers[dims[0]][dims[1]][dims[2] - 1]?.attributeHeaderItem ?? undefined;
    const currentValue = attributeHeader.attributeHeaderItem;
    const nextValue = headers[dims[0]][dims[1]][dims[2] + 1]?.attributeHeaderItem ?? undefined;

    return {
        previousValue,
        currentValue,
        nextValue,
        dims,
    };
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
