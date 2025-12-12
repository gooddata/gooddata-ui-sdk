// (C) 2023-2025 GoodData Corporation

import { useCallback, useState } from "react";

import { type IntlShape } from "react-intl/src/types.js";

import { type DashboardDateFilterConfigMode, type ObjRef } from "@gooddata/sdk-model";
import { type IFilterConfigurationProps } from "@gooddata/sdk-ui-filters";

import { DateFilterConfigurationActions } from "./DateFilterConfigurationActions.js";
import { messages } from "../../../../locales.js";
import { selectBackendCapabilities, useDashboardSelector } from "../../../../model/index.js";
import { ConfigurationCategory } from "../../configuration/ConfigurationCategory.js";
import { ConfigModeSelect } from "../../configuration/ConfigurationModeSelect.js";
import { ConfigurationPanelHeader } from "../../configuration/ConfigurationPanelHeader.js";
import { AttributeTitleRenaming } from "../../configuration/title/AttributeTitleRenaming.js";
import { useDateFilterConfig } from "../useDateFilterConfig.js";

interface IDateFilterConfigurationProps extends IFilterConfigurationProps {
    intl: IntlShape;
    dateDataSet?: ObjRef;
    defaultDateFilterName: string;
}

export function DateFilterConfigurationBody({
    onCancelButtonClick,
    onSaveButtonClick,
    intl,
    dateDataSet,
    defaultDateFilterName,
}: IDateFilterConfigurationProps) {
    const {
        mode,
        changeConfigMode,
        title,
        titleChanged,
        onConfigurationClose,
        onTitleChange,
        onTitleReset,
        onTitleUpdate,
    } = useDateFilterConfig(dateDataSet, defaultDateFilterName);
    const originConfigMode = mode;

    const capabilities = useDashboardSelector(selectBackendCapabilities);

    const [selectedMode, setSelectedMode] = useState(originConfigMode);

    const onConfigurationSave = useCallback(() => {
        onSaveButtonClick();
        if (capabilities.supportsMultipleDateFilters) {
            onTitleChange();
        }
        if (capabilities.supportsHiddenAndLockedFiltersOnUI) {
            changeConfigMode(selectedMode as DashboardDateFilterConfigMode);
        }
    }, [
        selectedMode,
        onTitleChange,
        onSaveButtonClick,
        capabilities.supportsMultipleDateFilters,
        capabilities.supportsHiddenAndLockedFiltersOnUI,
        changeConfigMode,
    ]);

    const onCancel = useCallback(() => {
        onCancelButtonClick();
        onConfigurationClose();
    }, [onCancelButtonClick, onConfigurationClose]);

    const onStateChange = useCallback((opt: string) => {
        setSelectedMode(opt as DashboardDateFilterConfigMode);
    }, []);

    const modeCategoryTitle = intl.formatMessage(messages.filterConfigurationModeTitle);
    const headerText = intl.formatMessage(messages.dateFilterDropdownConfigurationHeader);
    const cancelText = intl.formatMessage(messages.dateFilterDropdownConfigurationCancelText);
    const saveText = intl.formatMessage(messages.dateFilterDropdownConfigurationSaveText);
    const titleText = intl.formatMessage(messages.filterConfigurationTitleTitle);
    const resetTitleText = intl.formatMessage(messages.filterConfigurationTitleReset);
    const showResetTitle = title !== defaultDateFilterName;

    const isTitleDefined = !!title && title.trim().length > 0;
    const isSaveDisabled = isTitleDefined ? selectedMode === originConfigMode && !titleChanged : true;

    const titleConfig = capabilities.supportsMultipleDateFilters ? (
        <AttributeTitleRenaming
            categoryTitle={titleText}
            resetTitleText={resetTitleText}
            onClick={onTitleReset}
            onChange={onTitleUpdate}
            showResetTitle={showResetTitle}
            attributeTitle={title ?? defaultDateFilterName}
        />
    ) : null;

    const modeConfig = capabilities.supportsHiddenAndLockedFiltersOnUI ? (
        <div>
            <div className="configuration-category-title">
                <ConfigurationCategory categoryTitle={modeCategoryTitle} />
            </div>
            <ConfigModeSelect intl={intl} selectedMode={selectedMode} onChanged={onStateChange} />
        </div>
    ) : null;

    return (
        <div className="gd-extended-date-filter-container">
            <div className="gd-extended-date-filter-body s-extended-date-filters-body">
                <div className="s-date-filter-dropdown-configuration date-filter-dropdown-configuration sdk-edit-mode-on">
                    <ConfigurationPanelHeader headerText={headerText} />
                    {titleConfig}
                    {modeConfig}
                </div>
                <DateFilterConfigurationActions
                    cancelText={cancelText}
                    saveText={saveText}
                    onCancelButtonClick={onCancel}
                    onSaveButtonClick={onConfigurationSave}
                    isSaveDisabled={isSaveDisabled}
                />
            </div>
        </div>
    );
}
