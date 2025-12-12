// (C) 2019-2025 GoodData Corporation

import { type IAvailableDrillTargetMeasure } from "@gooddata/sdk-ui";

import { DrillMeasureSelectorItem } from "./DrillMeasureSelectorItem.js";

export interface IDrillMeasureSelectorListProps {
    supportedItems: IAvailableDrillTargetMeasure[];
    onSelect: (item: IAvailableDrillTargetMeasure) => void;
    onCloseDropdown: () => void;
}

export function DrillMeasureSelectorList(props: IDrillMeasureSelectorListProps) {
    return (
        <div className="gd-drill-measure-selector-list">
            {props.supportedItems.map((item) => (
                <DrillMeasureSelectorItem
                    key={item.measure.measureHeaderItem.localIdentifier}
                    item={item}
                    onClick={props.onSelect}
                    onCloseDropdown={props.onCloseDropdown}
                />
            ))}
        </div>
    );
}
