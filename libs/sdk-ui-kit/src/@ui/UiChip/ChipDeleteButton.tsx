// (C) 2025-2026 GoodData Corporation

import { type IChipDeleteButtonProps } from "./types.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

const { e } = bem("gd-ui-kit-chip");

export function ChipDeleteButton({
    onDelete,
    onDeleteKeyDown,
    deleteAriaLabel,
    dataTestId,
}: IChipDeleteButtonProps) {
    return (
        <button
            data-testid={dataTestId ? `${dataTestId}-delete-button` : undefined}
            aria-label={deleteAriaLabel}
            className={e("delete")}
            onClick={onDelete}
            onKeyDown={onDeleteKeyDown}
        >
            <span className={e("icon-delete")}>
                <UiIcon type="cross" color="complementary-6" size={14} />
            </span>
        </button>
    );
}
