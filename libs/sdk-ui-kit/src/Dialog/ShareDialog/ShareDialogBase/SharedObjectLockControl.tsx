// (C) 2021 GoodData Corporation

import React from "react";

import { SharedObjectCheckboxControl } from "./SharedObjectCheckboxControl";
import { ISharedObjectLockControlProps } from "./types";

/**
 * @internal
 */
export const SharedObjectLockControl: React.FC<ISharedObjectLockControlProps> = ({
    isLocked,
    isLockingSupported,
    labels,
    onLockChange,
}) => {
    return (
        <SharedObjectCheckboxControl
            isChecked={isLocked}
            isSupported={isLockingSupported}
            onChange={onLockChange}
            label={labels.lockControl}
            name="shared-dialog-lock"
            className="s-shared-object-lock"
        />
    );
};
