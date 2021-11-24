// (C) 2021 GoodData Corporation

import React from "react";

import { SharedObjectCheckboxControl } from "./SharedObjectCheckboxControl";
import { ISharedObjectUnderLenientControlProps } from "./types";

/**
 * @internal
 */
export const SharedObjectUnderLenientControl: React.FC<ISharedObjectUnderLenientControlProps> = ({
    isUnderLenientControl,
    isLeniencyControlSupported,
    labels,
    onUnderLenientControlChange,
}) => {
    return (
        <SharedObjectCheckboxControl
            isChecked={isUnderLenientControl}
            isSupported={isLeniencyControlSupported}
            onChange={onUnderLenientControlChange}
            label={labels.underLenientControl}
            name="shared-object-under-lenient-control"
            className="s-shared-object-under-lenient-control"
        />
    );
};
