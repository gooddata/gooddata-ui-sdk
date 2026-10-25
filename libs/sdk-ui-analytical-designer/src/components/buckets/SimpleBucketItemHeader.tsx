// (C) 2007-2026 GoodData Corporation

import { type MouseEvent, memo, useCallback, useRef } from "react";

import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";

import { EditableLabel, ShortenedText } from "@gooddata/sdk-ui-kit";

import {
    setBucketItemTitle,
    setRenamingBucketItemEnded,
    setRenamingBucketItemStarted,
} from "../../actions/buckets_actions.js";
import { isRenamingBucketItem as isRenamingBucketItemSelector } from "../../services/buckets_service.js";
import { type AppDispatch } from "../../store/types.js";

export interface ISimpleBucketItemHeaderProps {
    localIdentifier: string;
    title: string;
    alias?: string;
    type: string;
    className: string;
    isCollapsed: boolean;
    isLocationIconVisible?: boolean;
    onToggleCollapse: () => void;
}

export const SimpleBucketItemHeader = memo(function SimpleBucketItemHeader({
    localIdentifier,
    title,
    alias,
    type,
    className,
    isCollapsed,
    isLocationIconVisible,
    onToggleCollapse,
}: ISimpleBucketItemHeaderProps) {
    const editableLabelRef = useRef<HTMLDivElement>(null);

    const isRenamingBucketItem = useSelector(isRenamingBucketItemSelector);
    const dispatch = useDispatch<AppDispatch>();

    const renamingBucketItemStarted = useCallback(() => {
        dispatch(setRenamingBucketItemStarted());
    }, [dispatch]);

    const renamingBucketItemEnded = useCallback(() => {
        dispatch(setRenamingBucketItemEnded());
    }, [dispatch]);

    const getClassNames = () => {
        return classNames("adi-bucket-item-header", "s-bucket-item-header", {
            expanded: !isCollapsed,
            collapsed: isCollapsed,
            renaming: isRenamingBucketItem,
        });
    };

    const handleHeaderClick = (e: MouseEvent<HTMLElement>): void => {
        // clicking on editable label should not collapse/uncollapse the bucket item
        const isClickedOutsideEditableLabel = !editableLabelRef?.current?.contains(e.target as Node);
        if (isClickedOutsideEditableLabel && !isRenamingBucketItem) {
            onToggleCollapse();
        }
    };

    const onBucketItemRename = (title: string) => {
        renamingBucketItemEnded();
        dispatch(setBucketItemTitle(localIdentifier, title));
    };

    const innerClassName = classNames(
        "adi-catalog-item",
        {
            "multiple-dates": type === "date",
            "configurable-attribute": type === "attribute",
            "type-geo_attribute": isLocationIconVisible,
            [`type-${type}`]: !isLocationIconVisible,
        },
        className,
    );

    return (
        <div className={getClassNames()} onClick={handleHeaderClick}>
            <div className={innerClassName}>
                <EditableLabel
                    ref={editableLabelRef}
                    value={alias || title}
                    placeholder={title}
                    maxLength={50}
                    maxRows={1}
                    onSubmit={onBucketItemRename}
                    onEditingStart={renamingBucketItemStarted}
                    onCancel={renamingBucketItemEnded}
                    className="s-rename-label"
                />
            </div>
            {alias ? (
                <div className="adi-bucket-item-sub-header">
                    <ShortenedText>{title}</ShortenedText>
                </div>
            ) : null}
        </div>
    );
});
