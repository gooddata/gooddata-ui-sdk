// (C) 2019-2025 GoodData Corporation

import { type IAvailableDrillTargetMeasure } from "@gooddata/sdk-ui";

export interface IDrillMeasureSelectorItemProps {
    item: IAvailableDrillTargetMeasure;
    onClick: (item: IAvailableDrillTargetMeasure) => void;
    onCloseDropdown: () => void;
}

export function DrillMeasureSelectorItem(props: IDrillMeasureSelectorItemProps) {
    const onClick = () => {
        props.onClick(props.item);
        props.onCloseDropdown();
    };

    const name = props.item.measure.measureHeaderItem.name;
    return (
        <a
            onClick={onClick}
            className={`gd-drill-measure-selector-list-item s-drill-measure-selector-item`}
            title={name}
        >
            {name}
        </a>
    );
}
