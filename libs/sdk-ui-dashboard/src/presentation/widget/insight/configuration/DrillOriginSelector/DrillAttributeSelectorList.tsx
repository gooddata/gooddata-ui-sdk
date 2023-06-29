// (C) 2021-2022 GoodData Corporation
import { IAvailableDrillTargetAttribute } from "@gooddata/sdk-ui";
import React from "react";
import { DrillAttributeSelectorItem } from "./DrillAttributeSelectorItem.js";

export interface IDrillAttributeSelectorListProps {
    supportedItems: IAvailableDrillTargetAttribute[];
    onSelect: (item: IAvailableDrillTargetAttribute) => void;
    onCloseDropdown: () => void;
}

const DrillAttributeSelectorList: React.FunctionComponent<IDrillAttributeSelectorListProps> = (props) => {
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
};

export default DrillAttributeSelectorList;
