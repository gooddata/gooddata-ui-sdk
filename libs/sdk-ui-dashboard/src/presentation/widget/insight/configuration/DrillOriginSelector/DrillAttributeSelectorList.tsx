// (C) 2021-2025 GoodData Corporation
import React from "react";

import { IAvailableDrillTargetAttribute } from "@gooddata/sdk-ui";

import { DrillAttributeSelectorItem } from "./DrillAttributeSelectorItem.js";

export interface IDrillAttributeSelectorListProps {
    supportedItems: IAvailableDrillTargetAttribute[];
    onSelect: (item: IAvailableDrillTargetAttribute) => void;
    onCloseDropdown: () => void;
}

function DrillAttributeSelectorList(props: IDrillAttributeSelectorListProps) {
    return (
        <div className="gd-drill-attribute-selector-list">
            {props.supportedItems.map((item) => (
                <DrillAttributeSelectorItem
                    key={item.attribute.attributeHeader.localIdentifier}
                    item={item}
                    onClick={props.onSelect}
                    onCloseDropdown={props.onCloseDropdown}
                />
            ))}
        </div>
    );
}

export default DrillAttributeSelectorList;
