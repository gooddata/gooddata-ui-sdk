// (C) 2020-2022 GoodData Corporation
import React from "react";

import { DrillSelectList } from "./DrillSelectList.js";
import { DashboardDrillDefinition } from "../../../types.js";
import { DrillSelectItem } from "./types.js";

interface DrillSelectListBodyProps {
    items: DrillSelectItem[];
    onSelect: (item: DashboardDrillDefinition) => void;
}

export const DrillSelectListBody: React.FC<DrillSelectListBodyProps> = (props) => {
    const { items, onSelect } = props;

    const stopPropagation = (e: React.UIEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    return (
        <div
            className="gd-drill-modal-picker-dropdown s-drill-item-selector-dropdown"
            onScroll={stopPropagation}
        >
            <div className="gd-drill-modal-picker-body">
                <DrillSelectList items={items} onSelect={onSelect} />
            </div>
        </div>
    );
};
