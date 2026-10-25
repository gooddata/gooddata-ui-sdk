// (C) 2019-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    type IArithmeticMeasureDefinition,
    type IMeasure,
    type IMeasureDefinition,
    type IMeasureDefinitionType,
    type IPoPMeasureDefinition,
    type IPreviousPeriodDateDataSet,
    type IPreviousPeriodMeasureDefinition,
    isArithmeticMeasure,
    isComputedAttributeRef,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    isSimpleMeasure,
    measureAggregation,
    measureAlias,
    measureArithmeticOperands,
    measureArithmeticOperator,
    measureDoesComputeRatio,
    measureFilters,
    measureFormat,
    measureIdentifier,
    measureItem,
    measureLocalId,
    measureMasterIdentifier,
    measurePopAttribute,
    measurePreviousPeriodDateDataSets,
    measureTitle,
    measureUri,
} from "@gooddata/sdk-model";

import { getDefaultMeasureFormat } from "../../models/bucket_item.js";
import {
    type IVisualizationObjectArithmeticMeasureDefinition,
    type IVisualizationObjectMeasure,
    type IVisualizationObjectMeasureDefinition,
    type IVisualizationObjectPoPMeasureDefinition,
    type IPreviousPeriodDateDataSet as IVisualizationObjectPreviousPeriodDateDataSet,
    type IVisualizationObjectPreviousPeriodMeasureDefinition,
    type VisualizationObjectMeasureDefinitionType,
} from "../../typings/bear/bearTypes.js";

import { convertFilter } from "./FilterConverter.js";
import { toBearRef } from "./ObjRefConverter.js";

const convertPreviousPeriodDataSet = (
    dataSet: IPreviousPeriodDateDataSet,
): IVisualizationObjectPreviousPeriodDateDataSet => {
    return {
        dataSet: toBearRef(dataSet.dataSet),
        periodsAgo: dataSet.periodsAgo,
    };
};

const convertPreviousPeriodMeasureDefinition = (
    measure: IMeasure<IPreviousPeriodMeasureDefinition>,
): IVisualizationObjectPreviousPeriodMeasureDefinition => {
    return {
        previousPeriodMeasure: {
            measureIdentifier: measureMasterIdentifier(measure),
            dateDataSets: measurePreviousPeriodDateDataSets(measure).map(convertPreviousPeriodDataSet),
        },
    };
};

const convertPoPMeasureDefinition = (
    measure: IMeasure<IPoPMeasureDefinition>,
): IVisualizationObjectPoPMeasureDefinition => {
    return {
        popMeasureDefinition: {
            measureIdentifier: measureMasterIdentifier(measure),
            popAttribute: toBearRef(measurePopAttribute(measure)),
        },
    };
};

const convertArithmeticMeasureDefinition = (
    measure: IMeasure<IArithmeticMeasureDefinition>,
): IVisualizationObjectArithmeticMeasureDefinition => {
    return {
        arithmeticMeasure: {
            measureIdentifiers: measureArithmeticOperands(measure),
            operator: measureArithmeticOperator(measure),
        },
    };
};

const convertSimpleMeasureDefinition = (
    measure: IMeasure<IMeasureDefinition>,
    autoGenerateFilterLocalIdentifier: boolean,
): IVisualizationObjectMeasureDefinition => {
    const identifier = measureIdentifier(measure);
    const uri = measureUri(measure);
    const ref = measureItem(measure);

    if (!identifier && !uri) {
        throw new Error("Measure has neither uri nor identifier.");
    }

    const aggregation = measureAggregation(measure);
    const computeRatio = measureDoesComputeRatio(measure);
    const filters = (measureFilters(measure) || []).map((filter) =>
        convertFilter(filter, autoGenerateFilterLocalIdentifier),
    );

    return {
        measureDefinition: {
            // COUNT cannot distinguish a computed attribute from a regular attribute without its type.
            item: isComputedAttributeRef(ref) ? ref : identifier ? { identifier } : { uri: uri },
            ...(aggregation && { aggregation }),
            ...(computeRatio && { computeRatio }),
            ...(!isEmpty(filters) && { filters }),
        },
    };
};

const convertMeasureDefinition = (
    measure: IMeasure<IMeasureDefinitionType>,
    autoGenerateFilterLocalIdentifier: boolean,
): VisualizationObjectMeasureDefinitionType => {
    if (isSimpleMeasure(measure)) {
        return convertSimpleMeasureDefinition(measure, autoGenerateFilterLocalIdentifier);
    } else if (isArithmeticMeasure(measure)) {
        return convertArithmeticMeasureDefinition(measure);
    } else if (isPoPMeasure(measure)) {
        return convertPoPMeasureDefinition(measure);
    } else if (isPreviousPeriodMeasure(measure)) {
        return convertPreviousPeriodMeasureDefinition(measure);
    }

    throw new Error("Unknown measure type");
};

const getMeasureDefaultFormat = (measure: IMeasure<IMeasureDefinitionType>) => {
    const aggregation = measureAggregation(measure);
    const isAttribute = aggregation === "count" || aggregation === "approximate_count";
    const type = aggregation ? (isAttribute ? "attribute" : "fact") : "metric";
    return getDefaultMeasureFormat(type);
};

export const convertMeasure = (
    measure: IMeasure<IMeasureDefinitionType>,
    autoGenerateFilterLocalIdentifier: boolean,
): IVisualizationObjectMeasure => {
    const alias = measureAlias(measure);
    const format = measureFormat(measure) || getMeasureDefaultFormat(measure);
    const title = measureTitle(measure);

    return {
        measure: {
            definition: convertMeasureDefinition(measure, autoGenerateFilterLocalIdentifier),
            localIdentifier: measureLocalId(measure),
            ...(alias && { alias }),
            ...(format && { format }),
            ...(title && { title }),
        },
    };
};
