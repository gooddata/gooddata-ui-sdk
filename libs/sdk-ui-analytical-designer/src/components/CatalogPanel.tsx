// (C) 2019-2026 GoodData Corporation

import { type Ref, useCallback } from "react";

import { type DropTargetMonitor, useDrop } from "@evil-internetmann/react-dnd";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";

import { removeBucketItem } from "../actions/dnd_actions.js";
import { BUCKET_ITEM, FILTER_ITEM } from "../constants/drag_item_types.js";
import { removeFilter } from "../sagas/filter_bar/filter_bar_ui_actions.js";
import { enableEnhancedInsightPicker } from "../selectors/feature_flag_selector.js";
import { canCreateMetric } from "../selectors/metric_permissions_selector.js";
import { isCatalogEmptyNoData } from "../store/catalog/catalog_selector.js";
import { type FilterType } from "../store/filter_bar/filter_bar_types.js";
import { type AppDispatch } from "../store/types.js";
import { type IRawBucketItem } from "../typings/buckets.js";
import {
    type IDragFilterItem,
    type IDraggableBucketItem,
    type IInjectedDropTargetProps,
} from "../typings/drag_and_drop.js";

import { CreateMetricButton } from "./catalog/blocks/CreateMetricButton.js";
import { Trash } from "./catalog/blocks/Trash.js";
import { Catalog } from "./catalog/Catalog.js";
import { CatalogSidebarHeader } from "./catalogSidebar/CatalogSidebarToggle.js";

interface ICatalogPanelStateProps {
    canUserCreateMetric: boolean;
    noData: boolean;
    isEnhancedInsightPickerEnabled: boolean;
}

interface ICatalogPanelDispatchProps {
    onDropBucketItem: (bucketItem: IRawBucketItem, bucketItemPosition: number, from: string) => void;
    onDropFilterItem: (itemLocalIdentifier: string, itemType: FilterType) => void;
}

export type ICatalogPanelProps = ICatalogPanelStateProps &
    ICatalogPanelDispatchProps &
    IInjectedDropTargetProps;

export const dropConfig = {
    drop(props: ICatalogPanelProps, monitor: DropTargetMonitor) {
        const { onDropBucketItem, onDropFilterItem } = props;

        const dragItemType = (monitor.getItem() as IDragFilterItem).dragItemType;
        if (dragItemType === FILTER_ITEM) {
            const { itemType, itemLocalIdentifier } = monitor.getItem() as IDragFilterItem;
            onDropFilterItem(itemLocalIdentifier, itemType);
        } else {
            const { bucketItem, from, index } = monitor.getItem() as IDraggableBucketItem;
            onDropBucketItem(bucketItem, index, from);
        }
    },
};

export function CatalogPanelBase({
    isDragging,
    isOver,
    canUserCreateMetric,
    onDropBucketItem,
    onDropFilterItem,
    noData,
    isEnhancedInsightPickerEnabled,
}: ICatalogPanelProps) {
    const [{ canDrop, isOver: isOverDrop }, dropRef] = useDrop(
        () => ({
            accept: [BUCKET_ITEM, FILTER_ITEM],
            drop: (_item: unknown, monitor) => {
                dropConfig.drop(
                    {
                        isDragging,
                        isOver,
                        canUserCreateMetric,
                        noData,
                        onDropBucketItem,
                        onDropFilterItem,
                        isEnhancedInsightPickerEnabled,
                    } as ICatalogPanelProps,
                    monitor,
                );
            },
            collect: (monitor) => ({
                canDrop: monitor.canDrop(),
                isOver: monitor.isOver(),
            }),
        }),
        [isDragging, isOver, canUserCreateMetric, noData, onDropBucketItem, onDropFilterItem],
    );

    const effectiveIsDragging = isDragging ?? canDrop;
    const effectiveIsOver = isOver ?? isOverDrop;

    const catalogPanelClasses = classNames("adi-catalog-panel", "s-catalogue", {
        transparent: effectiveIsDragging,
        "enhanced-insight-picker": isEnhancedInsightPickerEnabled,
    });
    const trashPanelClasses = classNames("adi-trash-panel", {
        invisible: !effectiveIsDragging,
        "enhanced-insight-picker": isEnhancedInsightPickerEnabled,
    });

    return (
        <div className="adi-catalog-section" ref={dropRef as unknown as Ref<HTMLDivElement>}>
            <CatalogSidebarHeader />
            <div className={catalogPanelClasses}>
                <Catalog />
                {canUserCreateMetric ? <CreateMetricButton disabled={noData} /> : null}
            </div>
            <div className={trashPanelClasses}>
                <Trash isOver={effectiveIsOver} />
            </div>
        </div>
    );
}

export function CatalogPanel(ownProps: IInjectedDropTargetProps) {
    const dispatch = useDispatch<AppDispatch>();

    const canUserCreateMetric = useSelector(canCreateMetric);
    const noData = useSelector(isCatalogEmptyNoData);
    const isEnhancedInsightPickerEnabled = useSelector(enableEnhancedInsightPicker);

    const onDropBucketItem = useCallback(
        (bucketItem: IRawBucketItem, bucketItemPosition: number, from: string) => {
            dispatch(removeBucketItem(bucketItem, bucketItemPosition, from));
        },
        [dispatch],
    );
    const onDropFilterItem = useCallback(
        (itemLocalIdentifier: string, itemType: FilterType) => {
            dispatch(removeFilter(itemLocalIdentifier, itemType));
        },
        [dispatch],
    );

    return (
        <CatalogPanelBase
            {...ownProps}
            canUserCreateMetric={canUserCreateMetric}
            noData={noData}
            isEnhancedInsightPickerEnabled={isEnhancedInsightPickerEnabled}
            onDropBucketItem={onDropBucketItem}
            onDropFilterItem={onDropFilterItem}
        />
    );
}
