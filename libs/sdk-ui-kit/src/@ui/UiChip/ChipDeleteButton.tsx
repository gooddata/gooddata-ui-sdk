// (C) 2025 GoodData Corporation

import { ChipDeleteButtonProps } from "./types.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

const { e } = bem("gd-ui-kit-chip");

export function ChipDeleteButton({
    onDelete,
    onDeleteKeyDown,
    deleteAriaLabel,
    dataTestId,
}: ChipDeleteButtonProps) {
    return (
        <button
            data-testid={dataTestId ? `${dataTestId}-delete-button` : undefined}
            aria-label={deleteAriaLabel}
            className={e("delete")}
            onClick={onDelete}
            onKeyDown={onDeleteKeyDown}
        >
            <span className={e("icon-delete")}>
                <UiIcon type="cross" color="complementary-6" size={14} ariaHidden />
            </span>
        </button>
    );
}
