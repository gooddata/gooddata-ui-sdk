// (C) 2021-2024 GoodData Corporation
import React, { useState, useCallback, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { BubbleHoverTrigger, Bubble, IAlignPoint } from "@gooddata/sdk-ui-kit";

import DrillModalExportOptions from "./DrillModalExportOptions.js";
import DrillModalRawExportOptions from "./DrillModalRawExportOptions.js";

export interface IDrillModalFooterProps {
    exportAvailable: boolean;
    exportXLSXEnabled: boolean;
    onExportXLSX: () => void;
    exportCSVEnabled: boolean;
    onExportCSV: () => void;
    onExportCSVRaw: () => void;
    isLoading: boolean;
    isExportRawInNewUiVisible: boolean;
}

const bubbleAlignPoints: IAlignPoint[] = [{ align: "tc bc" }];

export const DrillModalFooter: React.FC<IDrillModalFooterProps> = ({
    exportAvailable,
    exportXLSXEnabled,
    onExportXLSX,
    exportCSVEnabled,
    onExportCSV,
    onExportCSVRaw,
    isLoading,
    isExportRawInNewUiVisible,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const toggleShowDropdown = useCallback(() => setShowDropdown((oldValue) => !oldValue), []);

    const handleOnExportXLSX = useCallback(() => {
        onExportXLSX();
        setShowDropdown(false);
    }, [onExportXLSX]);

    const handleOnExportCSV = useCallback(() => {
        onExportCSV();
        setShowDropdown(false);
    }, [onExportCSV]);

    const handleOnExportCSVRaw = useCallback(() => {
        onExportCSVRaw();
        setShowDropdown(false);
    }, [onExportCSVRaw]);

    const exportDisabled = !exportAvailable || (!exportXLSXEnabled && !exportCSVEnabled);

    const toggleButton = useMemo(
        () => (
            <button
                onClick={toggleShowDropdown}
                className={cx("gd-button-link-dimmed gd-button gd-icon-download export-menu-toggle-button", {
                    disabled: isExportRawInNewUiVisible ? false : exportDisabled,
                })}
                type="button"
            >
                <span className="gd-button-text">
                    <FormattedMessage id="dialogs.export.submit" />
                </span>
            </button>
        ),
        [exportDisabled, toggleShowDropdown],
    );

    return (
        <div
            className={cx("s-export-drilled-insight export-drilled-insight", {
                "is-disabled": isExportRawInNewUiVisible ? false : exportDisabled,
            })}
        >
            {isExportRawInNewUiVisible ? (
                <>
                    {toggleButton}
                    <DrillModalRawExportOptions
                        showDropdown={showDropdown}
                        toggleShowDropdown={toggleShowDropdown}
                        exportXLSXEnabled={exportXLSXEnabled}
                        exportCSVEnabled={exportCSVEnabled}
                        onExportXLSX={handleOnExportXLSX}
                        onExportCSV={handleOnExportCSV}
                        onExportCSVRaw={handleOnExportCSVRaw}
                    />
                </>
            ) : exportDisabled && !isLoading ? (
                <BubbleHoverTrigger>
                    {toggleButton}
                    <Bubble className="bubble-primary" alignPoints={bubbleAlignPoints}>
                        <FormattedMessage id="export_unsupported.disabled" />
                    </Bubble>
                </BubbleHoverTrigger>
            ) : (
                <>
                    {toggleButton}
                    <DrillModalExportOptions
                        showDropdown={showDropdown}
                        toggleShowDropdown={toggleShowDropdown}
                        exportXLSXEnabled={exportXLSXEnabled}
                        exportCSVEnabled={exportCSVEnabled}
                        onExportXLSX={handleOnExportXLSX}
                        onExportCSV={handleOnExportCSV}
                    />
                </>
            )}
        </div>
    );
};
