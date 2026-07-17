// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { type IntlShape } from "react-intl";

import {
    type DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterConfigModeValues,
    type ObjRef,
    type ObjRefInScope,
    isObjRef,
} from "@gooddata/sdk-model";
import { DimensionalitySection, type IDimensionalityItem } from "@gooddata/sdk-ui-filters/internal";

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
    dimensionality: IDimensionalityItem[];
    catalogDimensionality: IDimensionalityItem[];
    loadCatalogDimensionality: (dimensionality: ObjRef[]) => Promise<IDimensionalityItem[]>;
    showConfigModeSection: boolean;
    onTitleChange: (title: string) => void;
    onTitleReset: () => void;
    onModeChange: (mode: DashboardAttributeFilterConfigMode) => void;
    onDimensionalityChange: (dimensionality: IDimensionalityItem[]) => void;
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
    dimensionality,
    catalogDimensionality,
    loadCatalogDimensionality,
    showConfigModeSection,
    onTitleChange,
    onTitleReset,
    onModeChange,
    onDimensionalityChange,
}: IMeasureValueFilterConfigurationProps) {
    const handleModeChanged = useCallback(
        (value: string) => {
            onModeChange(value as DashboardAttributeFilterConfigMode);
        },
        [onModeChange],
    );
    const handleLoadCatalogDimensionality = useCallback(
        (currentDimensionality: ObjRefInScope[]) =>
            loadCatalogDimensionality(currentDimensionality.filter(isObjRef)),
        [loadCatalogDimensionality],
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
            <DimensionalitySection
                dimensionality={dimensionality}
                catalogDimensionality={catalogDimensionality}
                loadCatalogDimensionality={handleLoadCatalogDimensionality}
                onDimensionalityChange={onDimensionalityChange}
                // Dashboard MVFs are newly configured with explicit ObjRef dimensionality.
                isMigratedFilter
                // This panel has no dialog-level scroll container, so the section bounds its own pills.
                withScrollContainer
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
