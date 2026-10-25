// (C) 2007-2026 GoodData Corporation

import { type Ref, memo, useCallback } from "react";

import { type DropTargetMonitor, useDrop } from "@evil-internetmann/react-dnd";
import classNames from "classnames";
import { FormattedMessage, defineMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { dropCatalogItem, swapBucketItem } from "../../actions/dnd_actions.js";
import { COLOR, LOCATION, METRIC_IDENTIFIERS, SEGMENT, SIZE } from "../../constants/bucket.js";
import { GEO_ATTRIBUTE } from "../../constants/catalog_filters.js";
import { BUCKET_ITEM, CATALOG_LIST_ITEM } from "../../constants/drag_item_types.js";
import { isLocationIconEnabled as isLocationIconEnabledSelector } from "../../services/reference_point_service.js";
import { addArithmeticMeasure } from "../../store/arithmetic_measures/arithmetic_measures_actions.js";
import { type AppDispatch } from "../../store/types.js";
import { type IDecoratedBucket, type IRawBucket, type IRawBucketItem } from "../../typings/buckets.js";
import {
    type IDraggableBucketItem,
    type IInjectedDropTargetProps,
    type IIsAllowedToDrop,
} from "../../typings/drag_and_drop.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";

const bucketAddPlaceholderMessageIds = {
    "metric.fact.attribute": defineMessage({ id: "dashboard.bucket.metric.fact.attribute.add_placeholder" })
        .id,
    "metric.attribute": defineMessage({ id: "dashboard.bucket.metric.attribute.add_placeholder" }).id,
    "metric.fact.attribute.geo_attribute": defineMessage({
        id: "dashboard.bucket.metric.fact.attribute.geo_attribute.add_placeholder",
    }).id,
    "attribute.date": defineMessage({ id: "dashboard.bucket.attribute.date.add_placeholder" }).id,
    "attribute.metric.date": defineMessage({ id: "dashboard.bucket.attribute.metric.date.add_placeholder" })
        .id,
    "geo_attribute.attribute.date": defineMessage({
        id: "dashboard.bucket.geo_attribute.attribute.date.add_placeholder",
    }).id,
    "geo_attribute.attribute.metric.date": defineMessage({
        id: "dashboard.bucket.geo_attribute.attribute.metric.date.add_placeholder",
    }).id,
    geo_attribute: defineMessage({ id: "dashboard.bucket.geo_attribute.add_placeholder" }).id,
    "attribute.geo_attribute": defineMessage({
        id: "dashboard.bucket.attribute.geo_attribute.add_placeholder",
    }).id,
    "metric.fact": defineMessage({ id: "dashboard.bucket.metric.fact.add_placeholder" }).id,
    date: defineMessage({ id: "dashboard.bucket.date.add_placeholder" }).id,
    attribute: defineMessage({ id: "dashboard.bucket.attribute.add_placeholder" }).id,
} as const;

const bucketDropzoneHintMessageIds = {
    "metric.fact.attribute": defineMessage({ id: "dashboard.bucket.metric.fact.attribute.dropzone_hint" }).id,
    "attribute.date": defineMessage({ id: "dashboard.bucket.attribute.date.dropzone_hint" }).id,
    geo_attribute: defineMessage({ id: "dashboard.bucket.geo_attribute.dropzone_hint" }).id,
    "attribute.geo_attribute": defineMessage({ id: "dashboard.bucket.attribute.geo_attribute.dropzone_hint" })
        .id,
    "metric.attribute": defineMessage({ id: "dashboard.bucket.metric.attribute.dropzone_hint" }).id,
    "metric.fact.attribute.geo_attribute": defineMessage({
        id: "dashboard.bucket.metric.fact.attribute.geo_attribute.dropzone_hint",
    }).id,
    "metric.fact": defineMessage({ id: "dashboard.bucket.metric.fact.dropzone_hint" }).id,
    date: defineMessage({ id: "dashboard.bucket.date.dropzone_hint" }).id,
    attribute: defineMessage({ id: "dashboard.bucket.attribute.dropzone_hint" }).id,
} as const;

const bucketMetricAddButtonPlaceholderMessageIds = {
    "metric.fact.attribute": defineMessage({
        id: "dashboard.bucket.metric.fact.attribute.add_metric_button.add_placeholder",
    }).id,
} as const;

interface IBucketDropTargetOwnProps {
    bucket: IDecoratedBucket;
    itemIsAllowedToDrop?: IIsAllowedToDrop;
    showAddItemButton?: boolean;
}

interface IBucketDropTargetDropConfigProps extends IBucketDropTargetOwnProps {
    onCatalogItemDropped: (localIdentifier: string, catalogItem: ICatalogEntry) => void;
    onItemSwapped: (localIdentifier: string, from: IRawBucketItem, to: IRawBucketItem) => void;
}

export interface IBucketDropTargetProps extends IBucketDropTargetOwnProps, IInjectedDropTargetProps {}

export const BucketDropTarget = memo(function BucketDropTarget({
    bucket,
    showAddItemButton = false,
    canDrop: canDropProp,
    isOver: isOverProp,
    itemIsAllowedToDrop,
}: IBucketDropTargetProps) {
    const isLocationIconEnabled = useSelector(isLocationIconEnabledSelector);
    const dispatch = useDispatch<AppDispatch>();

    const onCatalogItemDropped = useCallback(
        (localIdentifier: string, catalogItem: ICatalogEntry) => {
            dispatch(dropCatalogItem(localIdentifier, catalogItem));
        },
        [dispatch],
    );

    const onItemSwapped = useCallback(
        (localIdentifier: string, from: IRawBucketItem, to: IRawBucketItem) => {
            dispatch(swapBucketItem(localIdentifier, from, to));
        },
        [dispatch],
    );

    const onAddArithmeticMeasureClick = useCallback(
        (bucketLocalIdentifier: string) => {
            dispatch(addArithmeticMeasure(bucketLocalIdentifier));
        },
        [dispatch],
    );

    const [{ canDrop, isOver }, dropRef] = useDrop(
        () => ({
            accept: [CATALOG_LIST_ITEM, BUCKET_ITEM],
            drop: (_item: unknown, monitor) => {
                dropConfig.drop(
                    {
                        bucket,
                        showAddItemButton,
                        onCatalogItemDropped,
                        onItemSwapped,
                    },
                    monitor,
                );
            },
            canDrop: (_item, monitor) => dropConfig.canDrop({ bucket, itemIsAllowedToDrop }, monitor),
            collect: (monitor) => ({
                canDrop: monitor.canDrop(),
                isOver: monitor.isOver(),
            }),
        }),
        [bucket, showAddItemButton, isLocationIconEnabled, itemIsAllowedToDrop],
    );

    const effectiveCanDrop = canDropProp ?? canDrop;
    const effectiveIsOver = isOverProp ?? isOver;
    const getBucketLocalIdentifier = (): string => {
        return bucket.localIdentifier;
    };

    const handleAddArithmeticMeasureClick = () => {
        onAddArithmeticMeasureClick(bucket.localIdentifier);
    };

    const getAcceptsInBucket = (): string[] => {
        const localIdentifier = getBucketLocalIdentifier();
        const accepts: string[] = bucket.accepts ?? [];

        if (!isLocationIconEnabled) return accepts;

        switch (localIdentifier) {
            case LOCATION:
                return [GEO_ATTRIBUTE];
            case SIZE:
            case COLOR:
            case SEGMENT:
                return [...accepts, GEO_ATTRIBUTE];
            default:
                return accepts;
        }
    };

    const renderInvitation = () => {
        const accepts = getAcceptsInBucket();
        const acceptsJoinedStr = accepts.join(".");
        const localIdentifier = getBucketLocalIdentifier();
        let dropzoneMessageId = "";

        if (canDrop) {
            dropzoneMessageId = defineMessage({ id: "dashboard.bucket.drop" }).id;
        } else if (accepts.length) {
            const acceptsKey = acceptsJoinedStr as keyof typeof bucketAddPlaceholderMessageIds;
            if (showAddItemButton && METRIC_IDENTIFIERS.includes(localIdentifier)) {
                dropzoneMessageId =
                    bucketMetricAddButtonPlaceholderMessageIds[
                        acceptsJoinedStr as keyof typeof bucketMetricAddButtonPlaceholderMessageIds
                    ] ??
                    bucketAddPlaceholderMessageIds[acceptsKey] ??
                    `dashboard.bucket.${acceptsJoinedStr}.add_metric_button.add_placeholder`;
            } else {
                dropzoneMessageId =
                    bucketAddPlaceholderMessageIds[acceptsKey] ??
                    `dashboard.bucket.${acceptsJoinedStr}.add_placeholder`;
            }
        } else {
            return null;
        }

        const invitationsClassNames = classNames(
            "adi-bucket-invitation",
            {
                "adi-bucket-invitation-with-button": showAddItemButton,
            },
            `s-bucket-invitation-${localIdentifier}`,
        );

        const bubbleMessageId =
            bucketDropzoneHintMessageIds[acceptsJoinedStr as keyof typeof bucketDropzoneHintMessageIds] ??
            `dashboard.bucket.${acceptsJoinedStr}.dropzone_hint`;

        return (
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <div className={invitationsClassNames}>
                    <div className="adi-bucket-invitation-inner">
                        <FormattedMessage
                            id={dropzoneMessageId}
                            values={{
                                factIcon: <span className="fact-field-icon" />,
                                metricIcon: <span className="metric-field-icon" />,
                                attrIcon: <span className="attr-field-icon" />,
                                geoAttrIcon: <span className="geo-attr-field-icon" />,
                                dateIcon: <span className="date-field-icon" />,
                            }}
                        />
                    </div>
                </div>
                <Bubble className="bubble-primary" alignPoints={[{ align: "cr cl" }]}>
                    <FormattedMessage id={bubbleMessageId} />
                </Bubble>
            </BubbleHoverTrigger>
        );
    };

    const renderAddItemButton = () => {
        const plusButtonClass = classNames(
            "adi-bucket-add-item-button",
            "gd-icon-add",
            {
                "adi-bucket-add-item-button-active": showAddItemButton,
            },
            "s-bucket-add-arithmetic-measure-button",
            `s-bucket-add-arithmetic-measure-button-${getBucketLocalIdentifier()}`,
        );

        return (
            <div className={plusButtonClass} onClick={handleAddArithmeticMeasureClick}>
                <FormattedMessage id="dashboard.bucket.create_arithmetic_measure" tagName="span" />
            </div>
        );
    };

    const items = bucket.items ?? [];
    const canAcceptMoreItems = (bucket.itemsLimit ?? Infinity) > items.length;

    const dropZoneClassNames = classNames("adi-bucket-dropzone", "s-bucket-dropzone", {
        "adi-droppable-active": effectiveCanDrop,
        "adi-droppable-hover": effectiveIsOver && effectiveCanDrop,
    });

    return (
        <div
            className={classNames({ invisible: !canAcceptMoreItems })}
            ref={dropRef as unknown as Ref<HTMLDivElement>}
        >
            <hr className="adi-bucket-invitation-separator" />
            <div className={dropZoneClassNames} data-bubbletitlealignpoints="cr cl">
                <div className="adi-bucket-invitation-outer">
                    {renderInvitation()}
                    {renderAddItemButton()}
                </div>
            </div>
        </div>
    );
});

export const dropConfig = {
    drop(props: IBucketDropTargetDropConfigProps, monitor: DropTargetMonitor): void {
        const bucketOriginal: IRawBucket = props.bucket.original as IRawBucket;
        const localIdentifier: string = bucketOriginal?.localIdentifier;

        switch (monitor.getItemType()) {
            case BUCKET_ITEM: {
                const bucketItem: IRawBucketItem = (monitor.getItem() as IDraggableBucketItem).bucketItem;
                props.onItemSwapped(localIdentifier, bucketItem, null);
                break;
            }
            case CATALOG_LIST_ITEM: {
                const catalogItem: ICatalogEntry = (monitor.getItem() as IDraggableBucketItem).item;
                props.onCatalogItemDropped(localIdentifier, catalogItem);
                break;
            }
            default:
                break;
        }
    },

    canDrop(props: Partial<IBucketDropTargetDropConfigProps>, monitor: DropTargetMonitor): boolean {
        const isAllowed = props.itemIsAllowedToDrop || (() => true);
        const draggedItem = monitor.getItem();

        return isAllowed(draggedItem);
    },
};
