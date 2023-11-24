// (C) 2019-2021 GoodData Corporation
import {
    IPreviousPeriodDateDataSet as IBearPreviousPeriodDateDataSet,
    IPreviousPeriodMeasureDefinition as IBearPreviousPeriodMeasureDefinition,
    IVisualizationObjectArithmeticMeasureDefinition,
    IVisualizationObjectMeasure,
    IVisualizationObjectMeasureDefinition,
    IVisualizationObjectPoPMeasureDefinition,
    VisualizationObjectMeasureDefinitionType,
} from "@gooddata/api-model-bear";

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
import { convertFilter, IConvertInsightOptions } from "./FilterConverter.js";
import { convertAggregation } from "./afm/MeasureConverter.js";

const convertPreviousPeriodDataSet = (
    dataSet: IPreviousPeriodDateDataSet,
): IBearPreviousPeriodDateDataSet => {
    return {
        dataSet: toBearRef(dataSet.dataSet),
        periodsAgo: dataSet.periodsAgo,
    };
};

const convertPreviousPeriodMeasureDefinition = (
    measure: IMeasure<IPreviousPeriodMeasureDefinition>,
): IBearPreviousPeriodMeasureDefinition => {
    return {
        previousPeriodMeasure: {
            measureIdentifier: measureMasterIdentifier(measure)!,
            dateDataSets: measurePreviousPeriodDateDataSets(measure)!.map(convertPreviousPeriodDataSet),
        },
    };
};

const convertPoPMeasureDefinition = (
    measure: IMeasure<IPoPMeasureDefinition>,
): IVisualizationObjectPoPMeasureDefinition => {
    return {
        popMeasureDefinition: {
            measureIdentifier: measureMasterIdentifier(measure)!,
            popAttribute: toBearRef(measurePopAttribute(measure)!),
        },
    };
};

const convertArithmeticMeasureDefinition = (
    measure: IMeasure<IArithmeticMeasureDefinition>,
): IVisualizationObjectArithmeticMeasureDefinition => {
    return {
        arithmeticMeasure: {
            measureIdentifiers: measureArithmeticOperands(measure)!,
            operator: measureArithmeticOperator(measure)!,
        },
    };
};

const convertSimpleMeasureDefinition = (
    measure: IMeasure<IMeasureDefinition>,
    options?: IConvertInsightOptions,
): IVisualizationObjectMeasureDefinition => {
    const identifier = measureIdentifier(measure);
    const uri = measureUri(measure);

    if (!identifier && !uri) {
        throw new Error("Measure has neither uri nor identifier.");
    }

    const aggregation = convertAggregation(measureAggregation(measure));
    const computeRatio = measureDoesComputeRatio(measure);
    const filters = (measureFilters(measure) || []).map((filter) => convertFilter(filter, options));

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
    options?: IConvertInsightOptions,
): VisualizationObjectMeasureDefinitionType => {
    if (isSimpleMeasure(measure)) {
        return convertSimpleMeasureDefinition(measure, options);
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
    options?: IConvertInsightOptions,
): IVisualizationObjectMeasure => {
    const alias = measureAlias(measure);
    const format = measureFormat(measure);
    const title = measureTitle(measure);

    return {
        measure: {
            definition: convertMeasureDefinition(measure, options),
            localIdentifier: measureLocalId(measure),
            ...(alias && { alias }),
            ...(format && { format }),
            ...(title && { title }),
        },
    };
};
