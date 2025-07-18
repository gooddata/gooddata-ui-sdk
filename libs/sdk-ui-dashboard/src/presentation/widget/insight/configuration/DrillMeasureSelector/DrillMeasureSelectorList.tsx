// (C) 2019-2025 GoodData Corporation
import { IAvailableDrillTargetMeasure } from "@gooddata/sdk-ui";

import DrillMeasureSelectorItem from "./DrillMeasureSelectorItem.js";

export interface IDrillMeasureSelectorListProps {
    supportedItems: IAvailableDrillTargetMeasure[];
    onSelect: (item: IAvailableDrillTargetMeasure) => void;
}

export default function DrillMeasureSelectorList({
    supportedItems,
    onSelect,
}: IDrillMeasureSelectorListProps) {
    return (
        <div className="gd-drill-measure-selector-list">
            {supportedItems.map((item) => (
                <DrillMeasureSelectorItem
                    key={item.measure.measureHeaderItem.localIdentifier}
                    item={item}
                    onClick={onSelect}
                />
            ))}
        </div>
    );
}
