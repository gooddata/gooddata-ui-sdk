// (C) 2007-2026 GoodData Corporation

import { type ReactElement, useCallback } from "react";

import { type ConnectDragSource } from "@evil-internetmann/react-dnd";
import { connect } from "react-redux";

import { type ChartInlineVisualizationType } from "@gooddata/sdk-ui-ext";

import {
    type ISetBucketItemAggregationAction,
    type ISetBucketItemExpandedAction,
    setBucketItemAggregation,
    toggleBucketItemExpanded,
} from "../../actions/buckets_actions.js";
import {
    CatalogUiActions,
    type ICatalogItemTooltipDetailsRequestAction,
} from "../../sagas/catalog/catalog_ui_actions.js";
import { measureBucketItemSelector } from "../../selectors/buckets_selector.js";
import { type IAppState } from "../../store/types.js";
import { type IDecoratedBucketItem, type IRawBucketItem } from "../../typings/buckets.js";
import { type IOrganizedCatalogItem } from "../../typings/catalog.js";

import { MeasureBucketItemConfiguration } from "./MeasureBucketItemConfiguration.js";
import { MeasureBucketItemHeader } from "./MeasureBucketItemHeader.js";

export interface IMeasureBucketItemOwnProps {
    bucketItem: IDecoratedBucketItem;
    connectDragSource?: ConnectDragSource;
    localIdentifier?: string;
    isDraggedItem?: boolean;
}

export interface IMeasureBucketItemStateProps {
    isRenamingBucketItem: boolean;
    allowMetricVisualizations: boolean;
    supportedMetricVisualizationTypes: ChartInlineVisualizationType[];
    disableMeasureFilters: boolean;
}

export interface IMeasureBucketItemDispatchProps {
    requestCatalogItemTooltipDetails: (
        item: IOrganizedCatalogItem,
    ) => ICatalogItemTooltipDetailsRequestAction;
    setBucketItemAggregation: (item: IRawBucketItem, aggregation: string) => ISetBucketItemAggregationAction;
    toggleBucketItemExpanded: (item: IRawBucketItem) => ISetBucketItemExpandedAction;
}

export interface IMeasureBucketItemProps
    extends IMeasureBucketItemOwnProps, IMeasureBucketItemStateProps, IMeasureBucketItemDispatchProps {}

const mapDispatchToProps: IMeasureBucketItemDispatchProps = {
    requestCatalogItemTooltipDetails: CatalogUiActions.requestCatalogItemTooltipDetails,
    setBucketItemAggregation,
    toggleBucketItemExpanded,
};

export function MeasureBucketItemBase({
    bucketItem,
    localIdentifier = "",
    isRenamingBucketItem = false,
    isDraggedItem = false,
    connectDragSource,
    toggleBucketItemExpanded,
    setBucketItemAggregation,
    allowMetricVisualizations,
    supportedMetricVisualizationTypes,
    disableMeasureFilters,
}: IMeasureBucketItemProps): ReactElement {
    const onSetAttributeAggregation = useCallback(
        (item: IRawBucketItem, aggregation: string): void => {
            setBucketItemAggregation(item, aggregation);
        },
        [setBucketItemAggregation],
    );

    const onToggleCollapse = useCallback(
        () => toggleBucketItemExpanded(bucketItem.original as IRawBucketItem),
        [toggleBucketItemExpanded, bucketItem],
    );

    const renderHeader = (): ReactElement => {
        const header = (
            <div>
                <MeasureBucketItemHeader
                    bucketItem={bucketItem}
                    filters={bucketItem.filters}
                    isCollapsed={bucketItem.collapsed}
                    onToggleCollapse={onToggleCollapse}
                    isDraggedItem={isDraggedItem}
                />
            </div>
        );

        if (!isRenamingBucketItem && connectDragSource !== undefined) {
            return connectDragSource(header);
        }

        return header;
    };

    return (
        <div>
            {renderHeader()}
            {bucketItem.collapsed ? null : (
                <MeasureBucketItemConfiguration
                    localIdentifier={localIdentifier}
                    bucketItem={bucketItem}
                    onSetAttributeAggregation={onSetAttributeAggregation}
                    allowMetricVisualizations={allowMetricVisualizations}
                    supportedMetricVisualizationTypes={supportedMetricVisualizationTypes}
                    disableMeasureFilters={disableMeasureFilters}
                />
            )}
        </div>
    );
}

export const MeasureBucketItem = connect<
    IMeasureBucketItemStateProps,
    IMeasureBucketItemDispatchProps,
    IMeasureBucketItemOwnProps,
    IAppState
>(
    measureBucketItemSelector,
    mapDispatchToProps,
)(MeasureBucketItemBase);
