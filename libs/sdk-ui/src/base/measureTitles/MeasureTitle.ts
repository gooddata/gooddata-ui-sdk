// (C) 2007-2021 GoodData Corporation
/**
 * The properties of the `GdcVisualizationObject.IMeasure` necessary for the creation of the title of the ad hoc measures.
 *
 * @internal
 */
export interface IMeasureTitleProps {
    localIdentifier: string;
    title?: string;
    alias?: string;
}

/**
 * The properties of the `GdcVisualizationObject.IArithmeticMeasureDefinition` necessary for the creation of the title
 * of the arithmetic measure.
 *
 * @internal
 */
export interface IArithmeticMeasureTitleProps {
    operator: string;
    masterMeasureLocalIdentifiers: string[];
}
