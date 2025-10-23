// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { compact } from "lodash-es";

import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    IDimension,
    IExecutionDefinition,
    MeasureGroupIdentifier,
    bucketsAttributes,
    bucketsMeasures,
    newBucket,
    newDimension,
} from "@gooddata/sdk-model";
import { BucketNames, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { IGeoPushpinChartNextResolvedProps } from "../../types/internal.js";

/**
 * Creates dimensions for geo chart execution.
 * @internal
 */
export function getGeoChartDimensions(def: IExecutionDefinition): IDimension[] {
    const buckets = def.buckets;
    const measures = bucketsMeasures(buckets);
    const attributes = bucketsAttributes(buckets);

    return compact([measures.length > 0 && newDimension([MeasureGroupIdentifier]), newDimension(attributes)]);
}

/**
 * Creates an execution for GeoPushpinChartNext with proper bucket configuration.
 *
 * @remarks
 * This hook creates a prepared execution with the appropriate buckets based on whether
 * the chart is using location mode (single attribute) or lat/lng mode (two attributes).
 *
 * Buckets created:
 * - LOCATION: Contains either location attribute or lat/lng attributes
 * - SIZE: Contains size measure/attribute
 * - COLOR: Contains color measure/attribute
 * - SEGMENT: Contains segmentBy attribute
 * - TOOLTIP_TEXT: Contains tooltipText attribute
 *
 * @param config - Execution configuration
 * @returns Prepared execution ready to be executed
 *
 * @alpha
 */
export function useInitExecution(props: IGeoPushpinChartNextResolvedProps): IPreparedExecution {
    const {
        location,
        latitude,
        longitude,
        segmentBy,
        size,
        color,
        config,
        filters = [],
        sortBy = [],
        execConfig,
    } = props;

    const backend = useBackendStrict(props.backend, "useInitExecution");
    const workspace = useWorkspaceStrict(props.workspace, "useInitExecution");

    const { tooltipText } = config ?? {};

    return useMemo(() => {
        const buckets = [];

        // Location bucket - either single location or lat/lng pair
        if (latitude && longitude) {
            buckets.push(newBucket(BucketNames.LATITUDE, latitude));
            buckets.push(newBucket(BucketNames.LONGITUDE, longitude));
        } else if (location) {
            buckets.push(newBucket(BucketNames.LOCATION, location));
        }

        // Size bucket
        if (size) {
            buckets.push(newBucket(BucketNames.SIZE, size));
        }

        // Color bucket
        if (color) {
            buckets.push(newBucket(BucketNames.COLOR, color));
        }

        // Segment bucket
        if (segmentBy) {
            buckets.push(newBucket(BucketNames.SEGMENT, segmentBy));
        }

        // Tooltip text bucket
        if (tooltipText) {
            buckets.push(newBucket(BucketNames.TOOLTIP_TEXT, tooltipText));
        }

        let execution = backend
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, filters)
            .withSorting(...sortBy)
            .withDimensions(getGeoChartDimensions);

        if (execConfig) {
            execution = execution.withExecConfig(execConfig);
        }

        return execution;
    }, [
        backend,
        workspace,
        location,
        latitude,
        longitude,
        segmentBy,
        size,
        color,
        tooltipText,
        filters,
        sortBy,
        execConfig,
    ]);
}
