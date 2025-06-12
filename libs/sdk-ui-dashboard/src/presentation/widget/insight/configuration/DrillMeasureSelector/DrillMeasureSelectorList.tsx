// (C) 2019-2022 GoodData Corporation
import { IAvailableDrillTargetMeasure } from "@gooddata/sdk-ui";
import React from "react";

import DrillMeasureSelectorItem from "./DrillMeasureSelectorItem.js";

export interface IDrillMeasureSelectorListProps {
    supportedItems: IAvailableDrillTargetMeasure[];
    onSelect: (item: IAvailableDrillTargetMeasure) => void;
}

const DrillMeasureSelectorList: React.FunctionComponent<IDrillMeasureSelectorListProps> = (props) => {
    return (
        <div className="gd-drill-measure-selector-list">
            {props.supportedItems.map((item) => (
                <DrillMeasureSelectorItem
                    key={item.measure.measureHeaderItem.localIdentifier}
                    item={item}
                    onClick={props.onSelect}
                />
            ))}
        </div>
    );
};

export default DrillMeasureSelectorList;
