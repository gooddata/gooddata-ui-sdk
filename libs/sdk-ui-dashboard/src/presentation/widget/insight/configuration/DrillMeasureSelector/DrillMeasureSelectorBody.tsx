// (C) 2019-2025 GoodData Corporation

import { UIEvent } from "react";

import { FormattedMessage } from "react-intl";

import { IAvailableDrillTargetMeasure } from "@gooddata/sdk-ui";

import DrillMeasureSelectorList from "./DrillMeasureSelectorList.js";

export interface IDrillMeasureSelectorBodyProps {
    supportedItems: IAvailableDrillTargetMeasure[];
    onSelect: (item: IAvailableDrillTargetMeasure) => void;
    onCloseDropdown: () => void;
}

function DrillMeasureSelectorBody(props: IDrillMeasureSelectorBodyProps) {
    const { supportedItems, onSelect, onCloseDropdown } = props;

    const stopPropagation = (e: UIEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    return (
        <div
            className="gd-drill-measure-selector-dropdown s-drill-measure-selector-dropdown"
            onScroll={stopPropagation}
        >
            <div className="gd-drill-measure-selector-header">
                <FormattedMessage id="configurationPanel.drillConfig.clickHint" />
                <button className="gd-button-link gd-button-icon-only icon-cross" onClick={onCloseDropdown} />
            </div>
            <div className="gd-drill-measure-selector-body">
                <div className="gd-drill-measure-selector-separator">
                    <span>
                        <FormattedMessage id="configurationPanel.drillConfig.measureValue" />
                    </span>
                </div>
                <DrillMeasureSelectorList supportedItems={supportedItems} onSelect={onSelect} />
            </div>
        </div>
    );
}

export default DrillMeasureSelectorBody;
