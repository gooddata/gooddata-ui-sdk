// (C) 2021 GoodData Corporation

import React from "react";
import { useComponentLabelsContext } from "./ComponentLabelsContext";

import { SharedObjectCheckboxControl } from "./SharedObjectCheckboxControl";
import { ISharedObjectUnderLenientControlProps } from "./types";

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
