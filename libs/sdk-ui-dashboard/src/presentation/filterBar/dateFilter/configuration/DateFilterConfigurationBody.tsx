// (C) 2023-2024 GoodData Corporation
import React, { useCallback, useState } from "react";
import { IntlShape } from "react-intl/src/types.js";
import { IFilterConfigurationProps } from "@gooddata/sdk-ui-filters";
import { DashboardDateFilterConfigMode, ObjRef } from "@gooddata/sdk-model";

import { DateFilterConfigurationActions } from "./DateFilterConfigurationActions.js";
import { ConfigurationCategory } from "../../configuration/ConfigurationCategory.js";
import { ConfigurationPanelHeader } from "../../configuration/ConfigurationPanelHeader.js";
import { ConfigModeSelect } from "../../configuration/ConfigurationModeSelect.js";

import { messages } from "../../../../locales.js";
import { useDateFilterConfig } from "../useDateFilterConfig.js";
import { AttributeTitleRenaming } from "../../configuration/title/AttributeTitleRenaming.js";
import { selectBackendCapabilities, useDashboardSelector } from "../../../../model/index.js";

interface IDateFilterConfigurationProps extends IFilterConfigurationProps {
    intl: IntlShape;
    dateDataSet?: ObjRef;
    defaultDateFilterName: string;
}

export const DateFilterConfigurationBody: React.FC<IDateFilterConfigurationProps> = (props) => {
    const { onCancelButtonClick, onSaveButtonClick, intl, dateDataSet, defaultDateFilterName } = props;

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
        capabilities.supportsMultipleDateFilters && onTitleChange();
        capabilities.supportsHiddenAndLockedFiltersOnUI &&
            changeConfigMode(selectedMode as DashboardDateFilterConfigMode);
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
};
