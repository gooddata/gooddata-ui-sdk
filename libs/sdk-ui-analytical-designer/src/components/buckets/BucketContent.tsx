// (C) 2007-2026 GoodData Corporation

import { type CSSProperties, memo } from "react";

import { shallowEqual, useSelector } from "react-redux";

import {
    canAddItems,
    isAllowedToAdd,
    isAllowedToReorder,
    isAllowedToReplace,
    isWithinLimit,
} from "../../models/bucket_rules.js";
import { bucketContentSelector } from "../../selectors/buckets_selector.js";
import { type IAppState } from "../../store/types.js";
import {
    type IDecoratedBucket,
    type IDecoratedBucketItem,
    type IDecoratedBuckets,
} from "../../typings/buckets.js";
import { type IItemDropContext } from "../../typings/drag_and_drop.js";

import { BucketDropTarget } from "./BucketDropTarget.js";
import { BucketItem } from "./BucketItem.js";
import { BucketReorderableItem } from "./BucketReorderableItem.js";

interface IBucketContentOwnProps {
    buckets: IDecoratedBuckets;
    bucket: IDecoratedBucket;
}

type BucketContentProps = IBucketContentOwnProps;

interface IDropProperties {
    buckets: IDecoratedBuckets;
    bucket: IDecoratedBucket;
    to: string;
}

const itemStyle: CSSProperties = { position: "relative" };

export const BucketContent = memo(function BucketContent({ buckets, bucket }: BucketContentProps) {
    const { showAddItemButton = false } = useSelector(
        (state: IAppState) => bucketContentSelector(state, { bucket }),
        shallowEqual,
    );

    const ruleFunc = (
        func: (context: IItemDropContext, buckets: IDecoratedBuckets) => boolean,
        { buckets, to, bucket }: IDropProperties,
    ) => {
        // an empty drag hands over a PARTIAL context; the rules probe the optional fields
        return (draggedData?: Partial<IItemDropContext>) =>
            func({ ...draggedData, to, bucket } as IItemDropContext, buckets);
    };

    const itemIsAllowedToDrop = (params: IDropProperties) => {
        return ruleFunc(isAllowedToAdd, params);
    };

    const itemIsAllowedToReorder = (params: IDropProperties) => {
        return ruleFunc(isAllowedToReorder, params);
    };

    const itemIsAllowedToReplace = (params: IDropProperties) => {
        return ruleFunc(isAllowedToReplace, params);
    };

    const items = bucket.items;
    const dropProps: IDropProperties = {
        buckets,
        bucket,
        to: bucket.original?.localIdentifier,
    };

    const allowedToDrop = itemIsAllowedToDrop(dropProps);
    const allowedToReorder = itemIsAllowedToReorder(dropProps);
    const allowedToReplace = itemIsAllowedToReplace(dropProps);
    const canDropMoreItems = ruleFunc(canAddItems, dropProps)();
    const isWithinLimitFn = ruleFunc(isWithinLimit, dropProps);

    return (
        <div className="bucket-contents">
            {items.length ? (
                <ul>
                    {items.map((item: IDecoratedBucketItem, idx: number) => (
                        <li key={idx} style={itemStyle}>
                            {bucket.allowsReordering && canDropMoreItems ? (
                                <BucketReorderableItem
                                    index={idx}
                                    bucketItem={item}
                                    bucket={bucket}
                                    bucketPosition={idx}
                                    itemIsAllowedToReorder={allowedToReorder}
                                    itemIsAllowedToReplace={allowedToReplace}
                                    isWithinLimit={isWithinLimitFn}
                                    dragHandle
                                />
                            ) : (
                                <BucketItem
                                    index={idx}
                                    bucketItem={item}
                                    bucket={bucket}
                                    bucketPosition={idx}
                                    itemIsAllowedToDrop={allowedToReplace}
                                    dragHandle
                                />
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="empty" />
            )}
            {canDropMoreItems ? (
                <BucketDropTarget
                    bucket={bucket}
                    itemIsAllowedToDrop={allowedToDrop}
                    showAddItemButton={showAddItemButton}
                />
            ) : null}
        </div>
    );
});
