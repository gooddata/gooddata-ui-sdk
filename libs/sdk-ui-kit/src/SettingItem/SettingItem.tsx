// (C) 2022 GoodData Corporation

import React from "react";
import cx from "classnames";

import { ActionType, ISettingItem } from "./typings";

import { Button } from "../Button";
import { Bubble, BubbleHoverTrigger } from "../Bubble";

const RIGHT_TOOLTIP_BUBBLE_ALIGN_POINTS = [{ align: "cr cl" }];

const getActionElement = (
    actionType: ActionType,
    value: string | boolean,
    isDisableAction: boolean,
    onActionCallback: () => void,
): JSX.Element => {
    switch (actionType) {
        case "LinkButton":
            return (
                <Button
                    className="gd-button-link-dimmed"
                    value={value}
                    disabled={isDisableAction}
                    onClick={onActionCallback}
                />
            );
        case "Switcher":
            return (
                <label className="input-checkbox-toggle">
                    <input
                        type="checkbox"
                        checked={value as boolean}
                        disabled={isDisableAction}
                        onChange={onActionCallback}
                        className={`s-checkbox-toggle ${isDisableAction ? "s-disabled" : "s-enabled"}`}
                    />
                    <span className="input-label-text" />
                </label>
            );
        default:
            return (
                <Button
                    className="gd-button-secondary gd-button-small"
                    value={value}
                    disabled={isDisableAction}
                    onClick={onActionCallback}
                />
            );
    }
};

/**
 * @internal
 */
export const SettingItem: React.FC<ISettingItem> = ({
    className,
    title,
    titleTooltipText,
    alignPointTitleTooltip,
    value,
    actionType,
    actionValue,
    hasDivider,
    isLoading,
    isDisableAction,
    actionTooltipText,
    alignPointActionTooltip,
    onAction,
}) => {
    return (
        <div className={cx(className, "gd-setting-item-container", { divider: hasDivider })}>
            <div className="gd-setting-item-title">
                <span className="title">{title}</span>
                {titleTooltipText && (
                    <BubbleHoverTrigger>
                        <span className="icon-circle-question gd-icon-circle-question" />
                        <Bubble
                            className={cx(className, "bubble-primary")}
                            alignPoints={alignPointTitleTooltip || RIGHT_TOOLTIP_BUBBLE_ALIGN_POINTS}
                        >
                            {titleTooltipText}
                        </Bubble>
                    </BubbleHoverTrigger>
                )}
            </div>
            <div className="gd-setting-item-state">
                {isLoading && <span className={cx("gd-spinner middle")} />}
                {!isLoading && (
                    <>
                        <div className="gd-setting-item-value">{value}</div>
                        <div className="gd-setting-item-action">
                            <BubbleHoverTrigger>
                                {getActionElement(actionType, actionValue, isDisableAction, onAction)}
                                {actionTooltipText && (
                                    <Bubble
                                        className={cx(className, "bubble-primary")}
                                        alignPoints={
                                            alignPointActionTooltip || RIGHT_TOOLTIP_BUBBLE_ALIGN_POINTS
                                        }
                                    >
                                        {actionTooltipText}
                                    </Bubble>
                                )}
                            </BubbleHoverTrigger>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
