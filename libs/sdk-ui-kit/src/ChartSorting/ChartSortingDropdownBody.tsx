// (C) 2022 GoodData Corporation

import React from "react";
import cx from "classnames";

import { Overlay } from "../Overlay";
import { IAlignPoint } from "../typings/positioning";

const dropdownAlignPoints: IAlignPoint[] = [{ align: "bl tl" }];

interface ChartSortingDropdownBodyProps {
    onClose?: () => void;
}

/**
 * @internal
 */
export const ChartSortingDropdownBody: React.FC<ChartSortingDropdownBodyProps> = ({ children, onClose }) => {
    const getDialogClasses = () => {
        return cx([
            "overlay",
            "gd-dialog",
            "gd-dropdown",
            "gd-sort-charting-dropdown",
            "gd-sort-charting-dropdown-wide",
            "s-sort-charting-dropddown",
        ]);
    };
    return (
        <Overlay
            alignTo=".s-chart-sorting-button"
            alignPoints={dropdownAlignPoints}
            closeOnOutsideClick={true}
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            onClose={onClose}
        >
            <div className={getDialogClasses()}>{children}</div>
        </Overlay>
    );
};
