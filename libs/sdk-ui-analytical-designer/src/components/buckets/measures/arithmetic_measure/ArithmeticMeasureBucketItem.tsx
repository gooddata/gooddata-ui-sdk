// (C) 2007-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type ConnectDragSource } from "@evil-internetmann/react-dnd";
import { useDispatch, useSelector } from "react-redux";

import { toggleBucketItemExpanded } from "../../../../actions/buckets_actions.js";
import { isRenamingBucketItem as isRenamingBucketItemSelector } from "../../../../services/buckets_service.js";
import { type AppDispatch, type IAppState } from "../../../../store/types.js";
import { type IDecoratedBucketItem } from "../../../../typings/buckets.js";
import { MeasureBucketItemHeader } from "../../MeasureBucketItemHeader.js";

import { ArithmeticMeasureBucketItemConfiguration } from "./ArithmeticMeasureBucketItemConfiguration.js";

export interface IArithmeticMeasureBucketItemProps {
    bucketItem: IDecoratedBucketItem;
    connectDragSource?: ConnectDragSource;
    isDraggedItem?: boolean;
}

export function ArithmeticMeasureBucketItem({
    bucketItem,
    connectDragSource,
    isDraggedItem = false,
}: IArithmeticMeasureBucketItemProps): ReactElement {
    const isRenamingBucketItem = useSelector((state: IAppState) => isRenamingBucketItemSelector(state));
    const dispatch = useDispatch<AppDispatch>();

    const renderHeader = (): ReactElement => {
        const onToggleCollapse = () => dispatch(toggleBucketItemExpanded(bucketItem.original));

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
                <ArithmeticMeasureBucketItemConfiguration
                    bucketItemLocalIdentifier={bucketItem.localIdentifier}
                />
            )}
        </div>
    );
}
