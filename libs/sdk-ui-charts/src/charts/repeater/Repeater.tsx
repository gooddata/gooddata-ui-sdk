// (C) 2024 GoodData Corporation

import React from "react";
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IAttribute, IAttributeOrMeasure, IBucket, INullableFilter } from "@gooddata/sdk-model";
import {
    Subtract,
    useResolveValuesWithPlaceholders,
    AttributeOrPlaceholder,
    NullableFiltersOrPlaceholders,
    withContexts,
    AttributesMeasuresOrPlaceholders,
    ITranslationsComponentProps,
    IntlTranslationsProvider,
    IntlWrapper,
} from "@gooddata/sdk-ui";
import { IBucketChartProps, ICoreChartProps } from "../../interfaces/index.js";
import omit from "lodash/omit.js";
import { CoreRepeater } from "./CoreRepeater.js";
import { constructRepeaterBuckets, constructRepeaterDimensions } from "./internal/repeaterExecution.js";

//
// Public interface
//

/**
 * @beta
 */
export interface IRepeaterBucketProps {
    /**
     * Main attribute that sets repeating frequency used for the computation.
     */
    attribute: AttributeOrPlaceholder;

    /**
     * Definition of columns which are sliced by the main attribute.
     */
    columns?: AttributesMeasuresOrPlaceholders;

    /**
     * Slicing attribute to be used for visualization measures.
     */
    sliceVisualizationBy?: AttributeOrPlaceholder;

    /**
     * Specify filters to apply on the data to compute with.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;
}

/**
 * @beta
 */
export interface IRepeaterProps extends IBucketChartProps, IRepeaterBucketProps {}

const WrappedRepeater = withContexts(RenderRepeater);

/**
 * @beta
 */
export const Repeater = (props: IRepeaterProps): JSX.Element => {
    const [attribute, measures, filters] = useResolveValuesWithPlaceholders(
        [props.attribute, props.columns, props.filters],
        props.placeholdersResolutionContext,
    );

    return <WrappedRepeater {...props} {...{ attribute, measures, filters }} />;
};

export function RenderRepeater(props: IRepeaterProps): JSX.Element {
    return (
        <IntlWrapper locale={props.locale}>
            <IntlTranslationsProvider>
                {(translationProps: ITranslationsComponentProps) => {
                    return <CoreRepeater intl={translationProps.intl} {...toCoreRepeaterProps(props)} />;
                }}
            </IntlTranslationsProvider>
        </IntlWrapper>
    );
}

//
// Internals
//

type IIrrelevantRepeaterProps = IRepeaterBucketProps & IBucketChartProps;
type IRepeaterNonBucketProps = Subtract<IRepeaterProps, IIrrelevantRepeaterProps>;

export function toCoreRepeaterProps(props: IRepeaterProps): ICoreChartProps {
    const { attribute, columns = [], sliceVisualizationBy } = props;

    const buckets = constructRepeaterBuckets(
        attribute as IAttribute,
        columns as IAttributeOrMeasure[],
        sliceVisualizationBy as IAttribute,
    );

    const newProps: IRepeaterNonBucketProps = omit<IRepeaterProps, keyof IIrrelevantRepeaterProps>(props, [
        "attribute",
        "columns",
        "sliceVisualizationBy",
        "filters",
        "backend",
    ]);

    return {
        ...newProps,
        execution: createExecution(buckets, props),
        exportTitle: props.exportTitle || "Repeater", // TODO: is this correct? at least translate
    };
}

function createExecution(buckets: IBucket[], props: IRepeaterProps): IPreparedExecution {
    const { backend, workspace, execConfig } = props;
    const dimensions = constructRepeaterDimensions(buckets);

    return backend
        .withTelemetry("Repeater", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters as INullableFilter[])
        .withDimensions(...dimensions)
        .withExecConfig(execConfig);
}
