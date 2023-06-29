// (C) 2022 GoodData Corporation

import React from "react";
import cx from "classnames";

import { Overlay } from "../Overlay/index.js";
import { IAlignPoint } from "../typings/positioning.js";

const dropdownAlignPoints: IAlignPoint[] = [{ align: "bl tl" }, { align: "br tr" }];

interface ChartSortingDropdownBodyProps {
    buttonNode?: HTMLElement | string;
    onClose?: () => void;
    children?: React.ReactNode;
}

/**
 * @internal
 */
export const ChartSortingDropdownBody: React.FC<ChartSortingDropdownBodyProps> = ({
    children,
    buttonNode,
    onClose,
}) => {
    const getDialogClasses = () => {
        return cx([
            "overlay",
            "gd-dialog",
            "gd-dropdown",
            "gd-sort-charting-dropdown",
            "gd-sort-charting-dropdown-wide",
            "s-sort-charting-dropdown",
        ]);
    };
    return (
        <Overlay
            alignTo={buttonNode}
            alignPoints={dropdownAlignPoints}
            closeOnOutsideClick={true}
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            ignoreClicksOnByClass={[
                ".gd-measure-sorting-dropdown-body",
                ".gd-attribute-sorting-dropdown-body",
            ]}
            onClose={onClose}
        >
            <div className={getDialogClasses()}>{children}</div>
        </Overlay>
    );
};
