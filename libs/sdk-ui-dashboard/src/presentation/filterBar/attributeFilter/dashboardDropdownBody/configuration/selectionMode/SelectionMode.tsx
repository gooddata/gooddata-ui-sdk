// (C) 2023 GoodData Corporation
import React from "react";
import { ConfigurationCategory } from "../ConfigurationCategory";
import { DashboardAttributeFilterSelectionMode } from "@gooddata/sdk-model";

interface ISelectionModeProps {
    selectionTitleText: string;
    multiSelectionOptionText: string;
    singleSelectionOptionText: string;
    selectionMode: DashboardAttributeFilterSelectionMode;
    onSelectionModeChange: (value: DashboardAttributeFilterSelectionMode) => void;
    disabled: boolean;
}

export const SelectionMode: React.FC<ISelectionModeProps> = (props) => {
    const {
        selectionTitleText,
        multiSelectionOptionText,
        singleSelectionOptionText,
        selectionMode,
        onSelectionModeChange,
        disabled,
    } = props;

    const changeSelectionHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelectionModeChange(e.target.value as DashboardAttributeFilterSelectionMode);
    };

    return (
        <>
            <ConfigurationCategory categoryTitle={selectionTitleText} />
            <div className="configuration-selection-mode">
                <label className="input-radio-label">
                    <input
                        type="radio"
                        className="input-radio"
                        value="multi"
                        disabled={disabled}
                        checked={selectionMode === "multi"}
                        onChange={changeSelectionHandler}
                    />
                    <span className="input-label-text">{multiSelectionOptionText}</span>
                </label>
                <label className="input-radio-label">
                    <input
                        type="radio"
                        value="single"
                        disabled={disabled}
                        checked={selectionMode === "single"}
                        onChange={changeSelectionHandler}
                    />
                    <span className="input-label-text">{singleSelectionOptionText}</span>
                </label>
            </div>
        </>
    );
};
