// (C) 2019-2022 GoodData Corporation
import { IAvailableDrillTargetMeasure } from "@gooddata/sdk-ui";
import React from "react";

export interface IDrillMeasureSelectorItemProps {
    item: IAvailableDrillTargetMeasure;
    onClick: (item: IAvailableDrillTargetMeasure) => void;
}

const DrillMeasureSelectorItem: React.FunctionComponent<IDrillMeasureSelectorItemProps> = (props) => {
    const onClick = () => {
        props.onClick(props.item);
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
};

export default DrillMeasureSelectorItem;
