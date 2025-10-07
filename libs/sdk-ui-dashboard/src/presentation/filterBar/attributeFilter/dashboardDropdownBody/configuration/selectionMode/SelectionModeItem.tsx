// (C) 2022-2025 GoodData Corporation

import cx from "classnames";

import { DashboardAttributeFilterSelectionMode } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

const ARROW_OFFSETS = { "cr cl": [20, 0], "cl cr": [-10, 0] };
const ALIGN_POINTS = [{ align: "cr cl" }, { align: "cl cr" }];

interface ISelectionModeItemProps {
    item: DashboardAttributeFilterSelectionMode;
    itemTitle: string;
    selected: boolean;
    disabled: boolean;
    disabledTooltip: string;
    onClick: () => void;
}

export function SelectionModeItem({
    item,
    itemTitle,
    selected,
    disabled,
    disabledTooltip,
    onClick,
}: ISelectionModeItemProps) {
    const className = cx(
        "gd-list-item",
        {
            "is-selected": selected,
        },
        {
            "is-disabled": disabled,
        },
        "s-selection-mode-dropdown-item",
        `s-selection-mode-dropdown-item-${item}`,
    );

    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0}>
            <div className={className} onClick={() => !disabled && onClick()}>
                {itemTitle}
            </div>
            {Boolean(disabled) && (
                <Bubble arrowOffsets={ARROW_OFFSETS} alignPoints={ALIGN_POINTS}>
                    <div>{disabledTooltip}</div>
                </Bubble>
            )}
        </BubbleHoverTrigger>
    );
}
