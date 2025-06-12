// (C) 2022-2025 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";

import { Bubble, BubbleHoverTrigger } from "../../Bubble/index.js";
import { ShortenedText } from "../../ShortenedText/index.js";

import { IDialogListItemComponentProps } from "./typings.js";

const ICON_TOOLTIP_ALIGN_POINTS = [
    { align: "cr cl", offset: { x: 10, y: 0 } },
    { align: "cl cr", offset: { x: -10, y: 0 } },
];

const TEXT_TOOLTIP_ALIGN_POINTS = [
    { align: "tc bc", offset: { x: 0, y: 0 } },
    { align: "bc tc", offset: { x: 0, y: 0 } },
];

/**
 * @internal
 */
export const DialogListItemBasic: React.VFC<IDialogListItemComponentProps> = (props) => {
    const { item, className, onClick, onDelete } = props;
    const {
        id,
        title,
        subtitle,
        isDisabled = false,
        isClickable = true,
        isDeletable = true,
        icon,
        action,
        deleteTooltipText,
    } = item;

    const rootClassNames = useMemo(
        () =>
            cx(
                "gd-dialog-list-item-basic",
                "s-dialog-list-item-basic",
                `s-dialog-list-item-${stringUtils.simplifyText(id)}`,
                {
                    clickable: !isDisabled && isClickable,
                    disabled: isDisabled,
                },
                className,
            ),
        [id, isClickable, isDisabled, className],
    );
    const showDeleteButton = useMemo(
        () => (!isDisabled || !!action) && isDeletable,
        [isDisabled, isDeletable, action],
    );

    const handleItemClick = useCallback(() => {
        !isDisabled && isClickable && onClick?.(item);
    }, [isDisabled, isClickable, item, onClick]);

    const handleItemDelete = useCallback(() => {
        !isDisabled && isDeletable && onDelete?.(item);
    }, [isDisabled, isDeletable, item, onDelete]);

    return (
        <div role="dialog-list-item" className={rootClassNames}>
            {showDeleteButton ? (
                <div className="gd-dialog-list-item-delete">
                    <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                        <span
                            role="icon-delete"
                            className={cx("gd-dialog-list-item-delete-icon s-dialog-list-item-delete-icon", {
                                disabled: isDisabled,
                            })}
                            onClick={handleItemDelete}
                        />
                        {deleteTooltipText ? (
                            <Bubble className="bubble-primary" alignPoints={ICON_TOOLTIP_ALIGN_POINTS}>
                                {deleteTooltipText}
                            </Bubble>
                        ) : null}
                    </BubbleHoverTrigger>
                </div>
            ) : null}
            {action ? <div className="gd-dialog-list-item-action">{action}</div> : null}
            <div
                role="dialog-list-item-content"
                className="gd-dialog-list-item-content s-dialog-list-item-content"
                onClick={handleItemClick}
            >
                {icon ? <div className="gd-dialog-list-item-icon">{icon}</div> : null}
                <div className="gd-dialog-list-item-text s-dialog-list-item-text">
                    <div className="gd-dialog-list-item-title s-dialog-list-item-title">
                        <ShortenedText
                            className="gd-dialog-list-item-shortened-text"
                            tooltipAlignPoints={TEXT_TOOLTIP_ALIGN_POINTS}
                        >
                            {title}
                        </ShortenedText>
                    </div>
                    {subtitle ? (
                        <div className="gd-dialog-list-item-subtitle s-dialog-list-item-subtitle">
                            <ShortenedText
                                className="gd-dialog-list-item-shortened-text"
                                tooltipAlignPoints={TEXT_TOOLTIP_ALIGN_POINTS}
                            >
                                {subtitle}
                            </ShortenedText>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
