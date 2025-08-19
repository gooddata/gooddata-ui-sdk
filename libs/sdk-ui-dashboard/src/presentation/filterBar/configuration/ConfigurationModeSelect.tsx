// (C) 2023-2025 GoodData Corporation
import React, { ChangeEvent, useCallback } from "react";

import { IntlShape } from "react-intl/src/types.js";

import { ModeSelectItem } from "./ConfigurationModeSelectItem.js";
import { messages } from "../../../locales.js";

export interface IConfigModeSelectProps {
    selectedMode: string;
    onChanged: (value: string) => void;
    intl: IntlShape;
}

const ACTIVE_MODE: string = "active";
const READONLY_MODE: string = "readonly";
const HIDDEN_MODE: string = "hidden";

export const ConfigModeSelect: React.FC<IConfigModeSelectProps> = (props) => {
    const { selectedMode, onChanged, intl } = props;

    const onCheck = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            onChanged(value);
        },
        [onChanged],
    );

    const activeTitle = intl.formatMessage(messages.filterConfigurationModeActiveTitle);
    const readOnlyTitle = intl.formatMessage(messages.filterConfigurationModeReadOnlyTitle);
    const hiddenTitle = intl.formatMessage(messages.filterConfigurationModeHiddenTitle);
    const activeTooltip = intl.formatMessage(messages.filterConfigurationModeActiveTooltip);
    const readOnlyTooltip = intl.formatMessage(messages.filterConfigurationModeReadOnlyTooltip);
    const hiddenTooltip = intl.formatMessage(messages.filterConfigurationModeHiddenTooltip);

    return (
        <div className="configuration-item-mode s-configuration-item-mode">
            <ModeSelectItem
                className="config-state-active s-config-state-active"
                itemText={activeTitle}
                itemValue={ACTIVE_MODE}
                onChange={onCheck}
                checked={selectedMode === ACTIVE_MODE}
                itemTooltip={activeTooltip}
            />
            <ModeSelectItem
                className="config-state-readonly s-config-state-readonly"
                itemText={readOnlyTitle}
                itemValue={READONLY_MODE}
                onChange={onCheck}
                checked={selectedMode === READONLY_MODE}
                itemTooltip={readOnlyTooltip}
            />
            <ModeSelectItem
                className="config-state-hidden s-config-state-hidden"
                itemText={hiddenTitle}
                itemValue={HIDDEN_MODE}
                onChange={onCheck}
                checked={selectedMode === HIDDEN_MODE}
                itemTooltip={hiddenTooltip}
            />
        </div>
    );
};
