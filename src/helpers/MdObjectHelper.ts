// (C) 2007-2018 GoodData Corporation
import get = require("lodash/get");
import { VisualizationObject } from "@gooddata/typings";
import { IMeasureTitleProps, IArithmeticMeasureTitleProps } from "..";
import { ATTRIBUTE } from "../constants/bucketNames";
import IMeasure = VisualizationObject.IMeasure;
import IArithmeticMeasureDefinition = VisualizationObject.IArithmeticMeasureDefinition;

function getTotals(
    mdObject: VisualizationObject.IVisualizationObject,
): VisualizationObject.IVisualizationTotal[] {
    const attributes: VisualizationObject.IBucket = mdObject.content.buckets.find(
        bucket => bucket.localIdentifier === ATTRIBUTE,
    );
    return get(attributes, "totals", []);
}

function getVisualizationClassUri(mdObject: VisualizationObject.IVisualizationObject): string {
    return get(mdObject, "content.visualizationClass.uri", "");
}

/**
 * Build properties object used by the {ArithmeticMeasureTitleFactory} to not be dependent on the
 * {VisualizationObject.IMeasure}. It contains all the necessary properties related to the measure title.
 * @param measures - The measures that will be converted.
 * @return The array of {IMeasureTitleProps} objects.
 *
 * @internal
 */
function buildMeasureTitleProps(measures: IMeasure[]): IMeasureTitleProps[] {
    return measures.map(measure => ({
        localIdentifier: measure.measure.localIdentifier,
        title: measure.measure.title,
        alias: measure.measure.alias,
    }));
}

/**
 * Build properties object used by the {ArithmeticMeasureTitleFactory} to not be dependent on the
 * {VisualizationObject.IArithmeticMeasureDefinition}. It contains all the necessary properties from the arithmetic
 * measure.
 * @param measureDefinition - The definition of the arithmetic measure that will be converted.
 * @return {IArithmeticMeasureTitleProps}
 *
 * @internal
 */
function buildArithmeticMeasureTitleProps(
    measureDefinition: IArithmeticMeasureDefinition,
): IArithmeticMeasureTitleProps {
    const { operator, measureIdentifiers } = measureDefinition.arithmeticMeasure;
    return {
        operator,
        masterMeasureLocalIdentifiers: measureIdentifiers,
    };
}

export default {
    getTotals,
    getVisualizationClassUri,
    buildMeasureTitleProps,
    buildArithmeticMeasureTitleProps,
};
