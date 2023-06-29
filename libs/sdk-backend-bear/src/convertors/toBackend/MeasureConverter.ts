// (C) 2019-2021 GoodData Corporation
import { GdcVisualizationObject } from "@gooddata/api-model-bear";
import {
    IMeasureDefinitionType,
    IMeasure,
    isSimpleMeasure,
    IMeasureDefinition,
    measureAlias,
    measureFormat,
    measureLocalId,
    measureTitle,
    measureAggregation,
    measureDoesComputeRatio,
    measureIdentifier,
    measureUri,
    isArithmeticMeasure,
    measureArithmeticOperands,
    measureArithmeticOperator,
    IArithmeticMeasureDefinition,
    isPoPMeasure,
    IPoPMeasureDefinition,
    measureMasterIdentifier,
    measurePopAttribute,
    isPreviousPeriodMeasure,
    IPreviousPeriodMeasureDefinition,
    measurePreviousPeriodDateDataSets,
    measureFilters,
    IPreviousPeriodDateDataSet,
} from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";
import { toBearRef } from "./ObjRefConverter.js";
import { convertFilter } from "./FilterConverter.js";
import { convertAggregation } from "./afm/MeasureConverter.js";

const convertPreviousPeriodDataSet = (
    dataSet: IPreviousPeriodDateDataSet,
): GdcVisualizationObject.IPreviousPeriodDateDataSet => {
    return {
        dataSet: toBearRef(dataSet.dataSet),
        periodsAgo: dataSet.periodsAgo,
    };
};

const convertPreviousPeriodMeasureDefinition = (
    measure: IMeasure<IPreviousPeriodMeasureDefinition>,
): GdcVisualizationObject.IPreviousPeriodMeasureDefinition => {
    return {
        previousPeriodMeasure: {
            measureIdentifier: measureMasterIdentifier(measure)!,
            dateDataSets: measurePreviousPeriodDateDataSets(measure)!.map(convertPreviousPeriodDataSet),
        },
    };
};

const convertPoPMeasureDefinition = (
    measure: IMeasure<IPoPMeasureDefinition>,
): GdcVisualizationObject.IPoPMeasureDefinition => {
    return {
        popMeasureDefinition: {
            measureIdentifier: measureMasterIdentifier(measure)!,
            popAttribute: toBearRef(measurePopAttribute(measure)!),
        },
    };
};

const convertArithmeticMeasureDefinition = (
    measure: IMeasure<IArithmeticMeasureDefinition>,
): GdcVisualizationObject.IArithmeticMeasureDefinition => {
    return {
        arithmeticMeasure: {
            measureIdentifiers: measureArithmeticOperands(measure)!,
            operator: measureArithmeticOperator(measure)!,
        },
    };
};

const convertSimpleMeasureDefinition = (
    measure: IMeasure<IMeasureDefinition>,
): GdcVisualizationObject.IMeasureDefinition => {
    const identifier = measureIdentifier(measure);
    const uri = measureUri(measure);

    if (!identifier && !uri) {
        throw new Error("Measure has neither uri nor identifier.");
    }

    const aggregation = convertAggregation(measureAggregation(measure));
    const computeRatio = measureDoesComputeRatio(measure);
    const filters = (measureFilters(measure) || []).map(convertFilter);

    return {
        measureDefinition: {
            item: identifier ? { identifier } : { uri: uri! },
            ...(aggregation && { aggregation }),
            ...(computeRatio && { computeRatio }),
            ...(!isEmpty(filters) && { filters }),
        },
    };
};

const convertMeasureDefinition = (
    measure: IMeasure<IMeasureDefinitionType>,
): GdcVisualizationObject.IMeasureDefinitionType => {
    if (isSimpleMeasure(measure)) {
        return convertSimpleMeasureDefinition(measure);
    } else if (isArithmeticMeasure(measure)) {
        return convertArithmeticMeasureDefinition(measure);
    } else if (isPoPMeasure(measure)) {
        return convertPoPMeasureDefinition(measure);
    } else if (isPreviousPeriodMeasure(measure)) {
        return convertPreviousPeriodMeasureDefinition(measure);
    }

    throw new Error("Unknown measure type");
};

export const convertMeasure = (
    measure: IMeasure<IMeasureDefinitionType>,
): GdcVisualizationObject.IMeasure => {
    const alias = measureAlias(measure);
    const format = measureFormat(measure);
    const title = measureTitle(measure);

    return {
        measure: {
            definition: convertMeasureDefinition(measure),
            localIdentifier: measureLocalId(measure),
            ...(alias && { alias }),
            ...(format && { format }),
            ...(title && { title }),
        },
    };
};
