// (C) 2022-2025 GoodData Corporation

import { ReactElement } from "react";

import cx from "classnames";

import { ActionType, ISettingItem } from "./typings.js";
import { Bubble, BubbleHoverTrigger } from "../Bubble/index.js";
import { Button } from "../Button/index.js";

const DEFAULT_ALIGN_POINT_TITLE_TOOLTIP = [{ align: "cr cl" }, { align: "bl tl" }, { align: "bc tc" }];

const DEFAULT_ALIGN_POINT_ACTION_TOOLTIP = [{ align: "cl cr" }, { align: "bc tc" }];

const getActionElement = (
    actionType: ActionType,
    value: string | boolean,
    isDisableAction: boolean,
    onActionCallback: () => void,
): ReactElement => {
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
export function SettingItem({
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
    renderSubtitle,
    titleTooltipHideDelay = 0,
}: ISettingItem) {
    return (
        <div className={cx(className, "gd-setting-item-container", { divider: hasDivider })}>
            <div className="gd-setting-item-title">
                <span className="title">{title}</span>
                {titleTooltipText ? (
                    <BubbleHoverTrigger hideDelay={titleTooltipHideDelay}>
                        <span className="icon-circle-question gd-icon-circle-question" />
                        <Bubble
                            className={cx(className, "bubble-primary")}
                            alignPoints={alignPointTitleTooltip || DEFAULT_ALIGN_POINT_TITLE_TOOLTIP}
                        >
                            {titleTooltipText}
                        </Bubble>
                    </BubbleHoverTrigger>
                ) : null}
                {renderSubtitle?.()}
            </div>
            <div className="gd-setting-item-state">
                {isLoading ? <span className={cx("gd-spinner middle")} /> : null}
                {!isLoading && (
                    <>
                        <div className="gd-setting-item-value">{value}</div>
                        <div className="gd-setting-item-action">
                            <BubbleHoverTrigger>
                                {getActionElement(
                                    actionType,
                                    actionValue,
                                    isDisableAction ?? false,
                                    onAction!,
                                )}
                                {actionTooltipText ? (
                                    <Bubble
                                        className={cx(className, "bubble-primary")}
                                        alignPoints={
                                            alignPointActionTooltip || DEFAULT_ALIGN_POINT_ACTION_TOOLTIP
                                        }
                                    >
                                        {actionTooltipText}
                                    </Bubble>
                                ) : null}
                            </BubbleHoverTrigger>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
