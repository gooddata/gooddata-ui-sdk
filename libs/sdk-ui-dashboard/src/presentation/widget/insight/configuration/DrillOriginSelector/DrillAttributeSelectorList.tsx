// (C) 2021-2025 GoodData Corporation
import { IAvailableDrillTargetAttribute } from "@gooddata/sdk-ui";
import { DrillAttributeSelectorItem } from "./DrillAttributeSelectorItem.js";

export interface IDrillAttributeSelectorListProps {
    supportedItems: IAvailableDrillTargetAttribute[];
    onSelect: (item: IAvailableDrillTargetAttribute) => void;
    onCloseDropdown: () => void;
}

export default function DrillAttributeSelectorList({
    supportedItems,
    onSelect,
    onCloseDropdown,
}: IDrillAttributeSelectorListProps) {
    return (
        <div className="gd-drill-attribute-selector-list">
            {supportedItems.map((item) => (
                <DrillAttributeSelectorItem
                    key={item.attribute.attributeHeader.localIdentifier}
                    item={item}
                    onClick={onSelect}
                    onCloseDropdown={onCloseDropdown}
                />
            ))}
        </div>
    );
}
