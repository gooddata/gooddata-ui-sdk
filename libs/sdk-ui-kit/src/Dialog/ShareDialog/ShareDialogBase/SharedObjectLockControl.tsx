// (C) 2021 GoodData Corporation

import React from "react";
import { useComponentLabelsContext } from "./ComponentLabelsContext";

import { SharedObjectCheckboxControl } from "./SharedObjectCheckboxControl";
import { ISharedObjectLockControlProps } from "./types";

/**
 * @internal
 */
export const SharedObjectLockControl: React.FC<ISharedObjectLockControlProps> = ({
    isLocked,
    isLockingSupported,
    onLockChange,
}) => {
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
};
