// (C) 2007-2018 GoodData Corporation
import get = require("lodash/get");
import { VisualizationObject, AFM, VisualizationInput } from "@gooddata/typings";
import { DataLayer } from "@gooddata/gooddata-js";
import { IMeasureTitleProps, IArithmeticMeasureTitleProps } from "..";
import { ATTRIBUTE, MEASURES, COLUMNS } from "../constants/bucketNames";
import IMeasure = VisualizationObject.IMeasure;
import IArithmeticMeasureDefinition = VisualizationObject.IArithmeticMeasureDefinition;
import { IPivotTableBucketProps } from "../components/PivotTable";
import { mergeFiltersToAfm } from "./afmHelper";

function getTotals(
    mdObject: VisualizationObject.IVisualizationObject,
): VisualizationObject.IVisualizationTotal[] {
    const attributes = mdObject.content.buckets.find(bucket => bucket.localIdentifier === ATTRIBUTE);
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

export const mdObjectToPivotBucketProps = (
    mdObject: VisualizationObject.IVisualizationObject,
    filtersFromProps: AFM.FilterItem[],
): IPivotTableBucketProps => {
    const measureBucket = mdObject.content.buckets.find(bucket => bucket.localIdentifier === MEASURES);
    const rowBucket = mdObject.content.buckets.find(bucket => bucket.localIdentifier === ATTRIBUTE);
    const columnBucket = mdObject.content.buckets.find(bucket => bucket.localIdentifier === COLUMNS);

    const measures: IPivotTableBucketProps["measures"] = (measureBucket && measureBucket.items) || [];
    const rows: IPivotTableBucketProps["rows"] =
        (rowBucket && (rowBucket.items as VisualizationObject.IVisualizationAttribute[])) || [];
    const columns: IPivotTableBucketProps["columns"] =
        (columnBucket && (columnBucket.items as VisualizationObject.IVisualizationAttribute[])) || [];
    const sortBy: IPivotTableBucketProps["sortBy"] =
        (mdObject &&
            mdObject.content &&
            mdObject.content.properties &&
            JSON.parse(mdObject.content.properties).sortItems) ||
        [];
    const totals: IPivotTableBucketProps["totals"] = (rowBucket && rowBucket.totals) || [];

    const afmWithoutMergedFilters = DataLayer.toAfmResultSpec(mdObject.content).afm;
    afmWithoutMergedFilters.filters = afmWithoutMergedFilters.filters || [];

    const afm = mergeFiltersToAfm(afmWithoutMergedFilters, filtersFromProps);

    const filters: VisualizationInput.IFilter[] = (afm.filters || []).filter(afmFilter => {
        // Filter out expression filters which are not supported in bucket interface
        return AFM.isDateFilter(afmFilter) || AFM.isAttributeFilter(afmFilter);
    }) as AFM.FilterItem[];

    return {
        measures,
        rows,
        columns,
        filters,
        sortBy,
        totals,
    };
};

export default {
    getTotals,
    getVisualizationClassUri,
    buildMeasureTitleProps,
    buildArithmeticMeasureTitleProps,
    mdObjectToPivotBucketProps,
};
