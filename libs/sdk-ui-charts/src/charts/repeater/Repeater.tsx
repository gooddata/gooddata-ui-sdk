// (C) 2024-2025 GoodData Corporation

import { ReactElement } from "react";

import { omit } from "lodash-es";

import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IAttribute, IAttributeOrMeasure, IBucket, INullableFilter } from "@gooddata/sdk-model";
import {
    AttributeOrPlaceholder,
    AttributesMeasuresOrPlaceholders,
    ExplicitDrill,
    ITranslationsComponentProps,
    IntlTranslationsProvider,
    IntlWrapper,
    NullableFiltersOrPlaceholders,
    OnFiredDrillEvent,
    Subtract,
    useResolveValuesWithPlaceholders,
    withContexts,
} from "@gooddata/sdk-ui";

import { CoreRepeater } from "./CoreRepeater.js";
import { constructRepeaterBuckets, constructRepeaterDimensions } from "./internal/repeaterExecution.js";
import { IBucketChartProps, ICoreChartProps } from "../../interfaces/index.js";

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
     * View by attribute to be used for inline visualizations.
     */
    viewBy?: AttributeOrPlaceholder;

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
export interface IRepeaterProps extends IBucketChartProps, IRepeaterBucketProps {
    /**
     * Configure drillability; e.g. which parts of the visualization can be interacted with.
     * LIMITATION: For now only attributes in columns can be drilled into.
     */
    drillableItems?: ExplicitDrill[];

    /**
     * Called when user triggers a drill on a visualization.
     */
    onDrill?: OnFiredDrillEvent;
}

const WrappedRepeater = withContexts(RenderRepeater);

/**
 * @beta
 */
export function Repeater(props: IRepeaterProps): ReactElement {
    const [attribute, columns, viewBy, filters] = useResolveValuesWithPlaceholders(
        [props.attribute, props.columns, props.viewBy, props.filters],
        props.placeholdersResolutionContext,
    );

    return <WrappedRepeater {...props} {...{ attribute, columns, viewBy, filters }} />;
}

export function RenderRepeater(props: IRepeaterProps): ReactElement {
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
    const { attribute, columns = [], viewBy } = props;

    const buckets = constructRepeaterBuckets(
        attribute as IAttribute,
        columns as IAttributeOrMeasure[],
        viewBy as IAttribute,
        props.config?.inlineVisualizations,
    );

    const newProps: IRepeaterNonBucketProps = omit<IRepeaterProps, keyof IIrrelevantRepeaterProps>(props, [
        "attribute",
        "columns",
        "viewBy",
        "filters",
        "backend",
    ]);

    return {
        ...newProps,
        execution: createExecution(buckets, props),
        exportTitle: props.exportTitle || "Repeater", // TODO: is this correct? at least translate
        enableExecutionCancelling: props.config?.enableExecutionCancelling ?? false,
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
