// (C) 2021-2025 GoodData Corporation

import { useComponentLabelsContext } from "./ComponentLabelsContext.js";
import { SharedObjectCheckboxControl } from "./SharedObjectCheckboxControl.js";
import { ISharedObjectLockControlProps } from "./types.js";

/**
 * @internal
 */
export function SharedObjectLockControl({
    isLocked,
    isLockingSupported,
    onLockChange,
}: ISharedObjectLockControlProps) {
    const labels = useComponentLabelsContext();

    return (
        <SharedObjectCheckboxControl
            isChecked={isLocked}
            isSupported={isLockingSupported}
            onChange={onLockChange}
            label={labels.accessTypeLabel}
            name="shared-dialog-lock"
            className="s-shared-object-lock"
        />
    );
}
