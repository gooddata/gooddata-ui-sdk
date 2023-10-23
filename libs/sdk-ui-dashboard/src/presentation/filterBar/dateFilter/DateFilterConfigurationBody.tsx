// (C) 2023 GoodData Corporation
import React, { useCallback, useState } from "react";
import { IntlShape } from "react-intl/src/types.js";
import { IFilterConfigurationProps } from "@gooddata/sdk-ui-filters";
import { DashboardDateFilterConfigMode } from "@gooddata/sdk-model";

import { DateFilterConfigurationActions } from "./DateFilterConfigurationActions.js";
import { ConfigurationCategory } from "../configuration/ConfigurationCategory.js";
import { ConfigurationPanelHeader } from "../configuration/ConfigurationPanelHeader.js";
import { ConfigModeSelect } from "../configuration/ConfigurationModeSelect.js";
import {
    selectDateFilterConfigOverrides,
    setDashboardDateFilterConfigMode,
    useDashboardSelector,
    useDispatchDashboardCommand,
} from "../../../model/index.js";
import { messages } from "../../../locales.js";

interface IDateFilterConfigurationProps extends IFilterConfigurationProps {
    intl: IntlShape;
}

export const DateFilterConfigurationBody: React.FC<IDateFilterConfigurationProps> = (props) => {
    const { onCancelButtonClick, onSaveButtonClick, intl } = props;
    const filterConfig = useDashboardSelector(selectDateFilterConfigOverrides);
    const originConfigMode = filterConfig?.mode ?? "active";
    const [selectedMode, setSelectedMode] = useState(originConfigMode);

    const changeConfigMode = useDispatchDashboardCommand(setDashboardDateFilterConfigMode);

    const onConfigurationSave = useCallback(() => {
        onSaveButtonClick();
        changeConfigMode(selectedMode as DashboardDateFilterConfigMode);
    }, [selectedMode]);

    const onStateChange = useCallback((opt: string) => {
        setSelectedMode(opt as DashboardDateFilterConfigMode);
    }, []);

    const modeCategoryTitle = intl.formatMessage(messages.filterConfigurationModeTitle);
    const headerText = intl.formatMessage(messages.dateFilterDropdownConfigurationHeader);
    const cancelText = intl.formatMessage(messages.dateFilterDropdownConfigurationCancelText);
    const saveText = intl.formatMessage(messages.dateFilterDropdownConfigurationSaveText);

    return (
        <div className="gd-extended-date-filter-container">
            <div className="gd-extended-date-filter-body s-extended-date-filters-body">
                <div className="s-date-filter-dropdown-configuration date-filter-dropdown-configuration sdk-edit-mode-on">
                    <ConfigurationPanelHeader headerText={headerText} />
                    <div>
                        <div className="configuration-category-title">
                            <ConfigurationCategory categoryTitle={modeCategoryTitle} />
                        </div>
                        <ConfigModeSelect intl={intl} selectedMode={selectedMode} onChanged={onStateChange} />
                    </div>
                </div>
                <DateFilterConfigurationActions
                    cancelText={cancelText}
                    saveText={saveText}
                    onCancelButtonClick={onCancelButtonClick}
                    onSaveButtonClick={onConfigurationSave}
                    isSaveDisabled={selectedMode === originConfigMode}
                />
            </div>
        </div>
    );
};
