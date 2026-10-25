// (C) 2007-2026 GoodData Corporation

import {
    getNewDerivedBucketItems,
    setNewDerivedBucketItems,
} from "../store/buckets/pluggable_visualization_helpers.js";
import { type IPluggableVisualizationState } from "../store/buckets/pluggable_visualization_state.js";
import { type IAppState } from "../store/types.js";
import { type IRawBucketItems } from "../typings/buckets.js";

/**
 * Whole-root adapters over `data.pluggableVisualization`. The operations themselves are narrow pure
 * helpers over the domain value (store/buckets/pluggable_visualization_helpers.ts); these are the
 * queue-value pair the `setBucketItemOverTimeComparison` root adapter threads, the read the report
 * selector delegates to, and a test seeding entry point.
 */

const readSubtree = (state: IAppState): IPluggableVisualizationState => state.data.pluggableVisualization;

const writeSubtree = (state: IAppState, pluggableVisualization: IPluggableVisualizationState): IAppState =>
    state.data.pluggableVisualization === pluggableVisualization
        ? state
        : { ...state, data: { ...state.data, pluggableVisualization } };

export const PluggableVisualizationService = {
    getNewDerivedBucketItems: (state: IAppState): IRawBucketItems =>
        getNewDerivedBucketItems(readSubtree(state)),

    /**
     * The subtree VALUE, for an adapter whose operation takes the whole queue as one of several domain
     * inputs (`setBucketItemOverTimeComparison`) rather than running a queue operation of its own.
     */
    getQueueState: (state: IAppState): IPluggableVisualizationState => readSubtree(state),

    setQueueState: (state: IAppState, pluggableVisualization: IPluggableVisualizationState): IAppState =>
        writeSubtree(state, pluggableVisualization),

    setNewDerivedBucketItems: (state: IAppState, derivedBucketItems: IRawBucketItems): IAppState =>
        writeSubtree(state, setNewDerivedBucketItems(readSubtree(state), derivedBucketItems)),
};
