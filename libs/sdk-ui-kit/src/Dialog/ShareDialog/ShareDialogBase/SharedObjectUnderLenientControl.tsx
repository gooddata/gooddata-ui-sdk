// (C) 2021 GoodData Corporation

import React from "react";
import { useComponentLabelsContext } from "./ComponentLabelsContext.js";

import { SharedObjectCheckboxControl } from "./SharedObjectCheckboxControl.js";
import { ISharedObjectUnderLenientControlProps } from "./types.js";

/**
 * @internal
 */
export const SharedObjectUnderLenientControl: React.FC<ISharedObjectUnderLenientControlProps> = ({
    isUnderLenientControl,
    isLeniencyControlSupported,
    onUnderLenientControlChange,
}) => {
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
};
