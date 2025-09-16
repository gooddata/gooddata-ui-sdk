// (C) 2021-2025 GoodData Corporation

import { useComponentLabelsContext } from "./ComponentLabelsContext.js";
import { SharedObjectCheckboxControl } from "./SharedObjectCheckboxControl.js";
import { ISharedObjectUnderLenientControlProps } from "./types.js";

/**
 * @internal
 */
export function SharedObjectUnderLenientControl({
    isUnderLenientControl,
    isLeniencyControlSupported,
    onUnderLenientControlChange,
}: ISharedObjectUnderLenientControlProps) {
    const labels = useComponentLabelsContext();

    return (
        <SharedObjectCheckboxControl
            isChecked={isUnderLenientControl}
            isSupported={isLeniencyControlSupported}
            onChange={onUnderLenientControlChange}
            label={labels.accessRegimeLabel}
            name="shared-accessRegimeLabel-control"
            className="s-shared-object-under-lenient-control"
        />
    );
}
