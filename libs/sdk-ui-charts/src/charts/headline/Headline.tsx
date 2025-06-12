// (C) 2007-2025 GoodData Corporation
import React, { useEffect, useState } from "react";
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IBucket, IMeasure, INullableFilter, newBucket } from "@gooddata/sdk-model";
import {
    BucketNames,
    Subtract,
    useResolveValuesWithPlaceholders,
    withContexts,
    MeasureOrPlaceholder,
    NullableFiltersOrPlaceholders,
} from "@gooddata/sdk-ui";
import omit from "lodash/omit.js";
import { invariant } from "ts-invariant";

import { IBucketChartProps, ICoreChartProps } from "../../interfaces/index.js";
import { CoreHeadline, ICoreHeadlineExtendedProps } from "./CoreHeadline.js";
import { createHeadlineProvider } from "./HeadlineProviderFactory.js";
import { IHeadlineProvider } from "./HeadlineProvider.js";

//
// Public interface
//

/**
 * @public
 */
export interface IHeadlineBucketProps {
    /**
     * Specify the measure whose value will be shown as the headline.
     */
    primaryMeasure: MeasureOrPlaceholder;

    /**
     * Specify secondary measure whose value will be shown for comparison with the primary measure.
     * The change in percent between the two values will also be calculated and displayed.
     *
     * @deprecated this property is deprecated, use secondaryMeasures instead
     */
    secondaryMeasure?: MeasureOrPlaceholder;

    /**
     * Specify secondary measures whose values will be shown as the compare values.
     */
    secondaryMeasures?: MeasureOrPlaceholder[];

    /**
     * Specify filters to apply on the data to chart.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;
}

/**
 * @public
 */
export interface IHeadlineProps extends IBucketChartProps, IHeadlineBucketProps {}

const WrappedHeadline = withContexts(RenderHeadline);

/**
 * Headline shows a single number or compares two numbers. You can display both measures and attributes.
 *
 * @remarks
 * Headlines have two sections: Measure (primary) and Measure (secondary).
 * You can add one item to each section. If you add two items, the headline also displays the change in percent.
 *
 * See {@link IHeadlineProps} to learn how to configure the Headline and the
 * {@link https://sdk.gooddata.com/gooddata-ui/docs/headline_component.html | headline documentation} for more information.
 *
 * @public
 */
export const Headline = (props: IHeadlineProps) => {
    const [primaryMeasure, secondaryMeasure, filters] = useResolveValuesWithPlaceholders(
        [props.primaryMeasure, props.secondaryMeasure, props.filters],
        props.placeholdersResolutionContext,
    );

    return <WrappedHeadline {...props} {...{ primaryMeasure, secondaryMeasure, filters }} />;
};

export function RenderHeadline(props: IHeadlineProps): JSX.Element {
    const { backend, workspace, primaryMeasure } = props;
    invariant(primaryMeasure, "The property primaryMeasure must be specified.");

    const [isEnableNewHeadline, setEnableNewHeadline] = useState<boolean>();

    // TODO - this block should be removed when removing FF enableNewHeadline (JIRA: EGL-162)
    useEffect(() => {
        if (backend && workspace) {
            backend
                .workspace(workspace)
                .settings()
                .getSettingsForCurrentUser()
                .then(
                    (featureFlags) => {
                        setEnableNewHeadline(!!featureFlags.enableNewHeadline);
                    },
                    () => {
                        setEnableNewHeadline(false);
                    },
                );
        }
    }, [backend, workspace]);

    return isEnableNewHeadline !== undefined ? (
        <CoreHeadline {...toCoreHeadlineProps(props, isEnableNewHeadline)} />
    ) : null;
}

//
// Internals
//

type IIrrelevantHeadlineProps = IHeadlineBucketProps & IBucketChartProps;
type IHeadlineNonBucketProps = Subtract<IHeadlineProps, IIrrelevantHeadlineProps>;
type CoreHeadlineProps = ICoreChartProps & ICoreHeadlineExtendedProps;

export function toCoreHeadlineProps(props: IHeadlineProps, enableNewHeadline: boolean): CoreHeadlineProps {
    const primaryMeasure = props.primaryMeasure as IMeasure;
    const secondaryMeasures = [props.secondaryMeasure, ...(props.secondaryMeasures || [])] as IMeasure[];

    const buckets = [
        newBucket(BucketNames.MEASURES, primaryMeasure),
        newBucket(BucketNames.SECONDARY_MEASURES, ...secondaryMeasures),
    ];

    const newProps: IHeadlineNonBucketProps = omit<IHeadlineProps, keyof IIrrelevantHeadlineProps>(props, [
        "primaryMeasure",
        "secondaryMeasure",
        "filters",
        "backend",
    ]);

    const provider = createHeadlineProvider(buckets, props.config, enableNewHeadline);

    return {
        ...newProps,
        headlineTransformation: provider.getHeadlineTransformationComponent(),
        execution: createExecution(provider, buckets, props),
        exportTitle: props.exportTitle || "Headline",
        enableExecutionCancelling: props.config?.enableExecutionCancelling ?? false,
    };
}

function createExecution(
    provider: IHeadlineProvider,
    buckets: IBucket[],
    props: IHeadlineProps,
): IPreparedExecution {
    const { backend, workspace, execConfig, filters } = props;
    const executionFactory = backend.withTelemetry("Headline", props).workspace(workspace).execution();

    return provider.createExecution(executionFactory, {
        buckets,
        filters: filters as INullableFilter[],
        executionConfig: execConfig,
    });
}
