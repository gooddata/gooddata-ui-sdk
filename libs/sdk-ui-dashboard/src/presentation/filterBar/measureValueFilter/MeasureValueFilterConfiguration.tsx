// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { type IntlShape } from "react-intl";

import {
    type DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterConfigModeValues,
} from "@gooddata/sdk-model";

import { ConfigurationCategory } from "../attributeFilter/dashboardDropdownBody/configuration/ConfigurationCategory.js";
import { ConfigurationPanelHeader } from "../attributeFilter/dashboardDropdownBody/configuration/ConfigurationPanelHeader.js";
import { ConfigModeSelect } from "../configuration/ConfigurationModeSelect.js";
import { AttributeTitleRenaming } from "../configuration/title/AttributeTitleRenaming.js";

interface IMeasureValueFilterConfigurationProps {
    intl: IntlShape;
    titleText: string;
    resetTitleText: string;
    modeCategoryTitleText: string;
    title: string;
    defaultTitle: string;
    mode: DashboardAttributeFilterConfigMode;
    showConfigModeSection: boolean;
    onTitleChange: (title: string) => void;
    onTitleReset: () => void;
    onModeChange: (mode: DashboardAttributeFilterConfigMode) => void;
}

/**
 * @internal
 */
export function MeasureValueFilterConfiguration({
    intl,
    titleText,
    resetTitleText,
    modeCategoryTitleText,
    title,
    defaultTitle,
    mode,
    showConfigModeSection,
    onTitleChange,
    onTitleReset,
    onModeChange,
}: IMeasureValueFilterConfigurationProps) {
    const handleModeChanged = useCallback(
        (value: string) => {
            onModeChange(value as DashboardAttributeFilterConfigMode);
        },
        [onModeChange],
    );

    return (
        <div className="s-measure-value-filter-dropdown-configuration attribute-filter-dropdown-configuration sdk-edit-mode-on">
            <ConfigurationPanelHeader />
            <AttributeTitleRenaming
                categoryTitle={titleText}
                resetTitleText={resetTitleText}
                onClick={onTitleReset}
                onChange={onTitleChange}
                showResetTitle={title !== defaultTitle}
                attributeTitle={title}
            />
            {showConfigModeSection ? (
                <>
                    <ConfigurationCategory categoryTitle={modeCategoryTitleText} />
                    <ConfigModeSelect
                        intl={intl}
                        selectedMode={mode ?? DashboardAttributeFilterConfigModeValues.ACTIVE}
                        onChanged={handleModeChanged}
                    />
                </>
            ) : null}
        </div>
    );
}
