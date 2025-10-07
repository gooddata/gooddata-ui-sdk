// (C) 2019-2025 GoodData Corporation

import { UIEvent } from "react";

import { FormattedMessage } from "react-intl";

import { IAvailableDrillTargets } from "@gooddata/sdk-ui";

import DrillAttributeSelectorList from "./DrillAttributeSelectorList.js";
import DrillMeasureSelectorList from "./DrillMeasureSelectorList.js";
import { IAvailableDrillTargetItem } from "../../../../drill/DrillSelect/types.js";

export interface IDrillOriginSelectorBodyProps {
    supportedItems: IAvailableDrillTargets;
    onSelect: (item: IAvailableDrillTargetItem) => void;
    onCloseDropdown: () => void;
}

function DrillOriginSelectorBody({
    onCloseDropdown,
    onSelect,
    supportedItems,
}: IDrillOriginSelectorBodyProps) {
    const stopPropagation = (e: UIEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    return (
        <div
            className="gd-drill-item-selector-dropdown s-drill-item-selector-dropdown"
            onScroll={stopPropagation}
        >
            <div className="gd-drill-item-selector-header">
                <FormattedMessage id="configurationPanel.drillConfig.clickHint" />
                <button
                    className="gd-button-link gd-button-icon-only gd-icon-cross"
                    onClick={onCloseDropdown}
                />
            </div>
            <div className="gd-drill-item-selector-body">
                <DrillMeasureSelectorBody
                    supportedItems={supportedItems}
                    onSelect={onSelect}
                    onCloseDropdown={onCloseDropdown}
                />
                <DrillAttributeSelectorBody
                    supportedItems={supportedItems}
                    onSelect={onSelect}
                    onCloseDropdown={onCloseDropdown}
                />
            </div>
        </div>
    );
}

function DrillMeasureSelectorBody({
    supportedItems,
    onSelect,
    onCloseDropdown,
}: IDrillOriginSelectorBodyProps) {
    return supportedItems.measures?.length ? (
        <>
            <div className="gd-drill-origin-selector-separator">
                <span>
                    <FormattedMessage id="configurationPanel.drillConfig.measureValue" />
                </span>
            </div>
            <DrillMeasureSelectorList
                supportedItems={supportedItems.measures}
                onSelect={onSelect}
                onCloseDropdown={onCloseDropdown}
            />
        </>
    ) : null;
}

function DrillAttributeSelectorBody({
    supportedItems,
    onSelect,
    onCloseDropdown,
}: IDrillOriginSelectorBodyProps) {
    return supportedItems.attributes?.length ? (
        <>
            <div className="gd-drill-origin-selector-separator">
                <span>
                    <FormattedMessage id="configurationPanel.drillConfig.attributeValue" />
                </span>
            </div>
            <DrillAttributeSelectorList
                supportedItems={supportedItems.attributes}
                onSelect={onSelect}
                onCloseDropdown={onCloseDropdown}
            />
        </>
    ) : null;
}

export default DrillOriginSelectorBody;
