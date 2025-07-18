// (C) 2023-2025 GoodData Corporation
import { ChangeEvent } from "react";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

const TOOLTIP_ALIGN_POINTS = [{ align: "tc bl", offset: { x: 0, y: -2 } }];

/**
 * @internal
 */
export interface IModeSelectItemProps {
    className: string;
    itemValue: string;
    itemText: string;
    itemTooltip: string;
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * @internal
 */
export function ModeSelectItem(props: IModeSelectItemProps) {
    const { checked, onChange, itemValue, itemText, itemTooltip, className } = props;

    return (
        <BubbleHoverTrigger>
            <label className="input-radio-label bottom-space">
                <input
                    type="radio"
                    className={cx("input-radio", className)}
                    value={itemValue}
                    checked={checked}
                    onChange={onChange}
                />
                <span className="input-label-text">{itemText}</span>
            </label>
            <Bubble
                className="bubble-primary gd-filter-configuration-mode-item-bubble"
                alignPoints={TOOLTIP_ALIGN_POINTS}
            >
                {itemTooltip}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
