// (C) 2025-2026 GoodData Corporation

import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

import { type IChipActionButtonProps } from "./types.js";

const { e } = bem("gd-ui-kit-chip");

export function ChipActionButton({
    onAction,
    onActionKeyDown,
    actionAriaLabel,
    actionAriaDescribedBy,
    actionIcon = "ellipsisVertical",
    dataTestId,
}: IChipActionButtonProps) {
    return (
        <button
            data-testid={dataTestId ? `${dataTestId}-action-button` : undefined}
            aria-label={actionAriaLabel}
            aria-describedby={actionAriaDescribedBy}
            className={e("action")}
            onClick={onAction}
            onKeyDown={onActionKeyDown}
        >
            <span className={e("icon-action")}>
                <UiIcon type={actionIcon} color="complementary-6" size={14} />
            </span>
        </button>
    );
}
