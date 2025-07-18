// (C) 2019-2025 GoodData Corporation
import { IAvailableDrillTargetMeasure } from "@gooddata/sdk-ui";

export interface IDrillMeasureSelectorItemProps {
    item: IAvailableDrillTargetMeasure;
    onClick: (item: IAvailableDrillTargetMeasure) => void;
}

export default function DrillMeasureSelectorItem({ item, onClick }: IDrillMeasureSelectorItemProps) {
    const name = item.measure.measureHeaderItem.name;

    return (
        <a
            onClick={() => onClick(item)}
            className={`gd-drill-measure-selector-list-item s-drill-measure-selector-item`}
            title={name}
        >
            {name}
        </a>
    );
}
