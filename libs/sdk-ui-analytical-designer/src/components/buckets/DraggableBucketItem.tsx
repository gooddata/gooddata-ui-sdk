// (C) 2007-2026 GoodData Corporation

import { type Ref, useMemo } from "react";

import { useDrag } from "@evil-internetmann/react-dnd";
import { omit } from "lodash-es";

import { BUCKET_ITEM } from "../../constants/drag_item_types.js";
import { getType } from "../../models/bucket_item.js";
import {
    type IDecoratedBucket,
    type IDecoratedBucketItem,
    type IRawBucketItem,
} from "../../typings/buckets.js";
import { type IDraggableBucketItem } from "../../typings/drag_and_drop.js";

import { BucketItemPure } from "./BucketItemPure.js";

interface IDragSourceProps {
    isDragging?: boolean;
}

interface IDraggableBucketItemOwnProps {
    bucket: IDecoratedBucket;
    bucketItem: IDecoratedBucketItem;
    dragHandle?: boolean;
    className?: string;
    onStartBucketItemDrag: (item: IRawBucketItem) => void;
    onEndBucketItemDrag: () => void;
    index: number;
}

export type DraggableBucketItemProps = IDraggableBucketItemOwnProps & IDragSourceProps;

export function DraggableBucketItem(props: DraggableBucketItemProps) {
    const { bucketItem, bucket, index, onStartBucketItemDrag, onEndBucketItemDrag } = props;
    const collapsedItem = useMemo(
        (): IDecoratedBucketItem => ({ ...bucketItem, collapsed: true }),
        [bucketItem],
    );

    const [{ isDragging }, dragRef] = useDrag(
        () => ({
            type: BUCKET_ITEM,
            item: () => {
                function renderDraggedItemElement() {
                    return (
                        <BucketItemPure
                            bucketItem={collapsedItem}
                            isDraggedItem
                            className="adi-dragged-item"
                        />
                    );
                }

                onStartBucketItemDrag(bucketItem.original as IRawBucketItem);

                return {
                    type: BUCKET_ITEM,
                    item: bucketItem.attribute,
                    bucketItem: bucketItem.original,
                    from: bucket?.localIdentifier || "",
                    dragged: getType(bucketItem),
                    index,
                    renderDraggedItemElement,
                } as IDraggableBucketItem;
            },
            end: () => {
                onEndBucketItemDrag();
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [bucketItem, bucket, index, onStartBucketItemDrag, onEndBucketItemDrag, collapsedItem],
    );

    const pureProps = omit(props, ["bucket"]);
    const localIdentifier = bucket.localIdentifier;

    return (
        <div ref={dragRef as unknown as Ref<HTMLDivElement>}>
            <BucketItemPure {...pureProps} isDragging={isDragging} localIdentifier={localIdentifier} />
        </div>
    );
}
