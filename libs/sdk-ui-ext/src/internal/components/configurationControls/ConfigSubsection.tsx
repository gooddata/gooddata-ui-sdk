// (C) 2019-2025 GoodData Corporation
import { ChangeEvent, ReactNode } from "react";
import { useIntl } from "react-intl";
import cloneDeep from "lodash/cloneDeep.js";
import noop from "lodash/noop.js";
import set from "lodash/set.js";
import DisabledBubbleMessage from "../DisabledBubbleMessage.js";

import { getTranslation } from "../../utils/translations.js";
import { AxisType } from "../../interfaces/AxisType.js";

export interface IConfigSubsectionProps {
    valuePath?: string;
    title: string;
    canBeToggled?: boolean;
    toggleDisabled?: boolean;
    toggledOn?: boolean;
    showDisabledMessage?: boolean;
    properties?: any;
    pushData?(data: any): void;
    axisType?: AxisType;
    children?: ReactNode;
}

export interface IConfigSubsectionState {
    disabled: boolean;
}

export default function ConfigSubsection({
    valuePath,
    title,
    canBeToggled = false,
    toggleDisabled = false,
    toggledOn = true,
    showDisabledMessage = false,
    properties,
    pushData = noop,
    axisType,
    children,
}: IConfigSubsectionProps) {
    const intl = useIntl();

    const toggleValue = (event: ChangeEvent<HTMLInputElement>) => {
        if (valuePath && properties && pushData) {
            const clonedProperties = cloneDeep(properties);
            set(clonedProperties, `controls.${valuePath}`, event.target.checked);
            pushData({ properties: clonedProperties });
        }
    };

    const renderToggleSwitch = () => {
        if (!canBeToggled) {
            return null;
        }

        return (
            <DisabledBubbleMessage
                className="input-checkbox-toggle"
                showDisabledMessage={showDisabledMessage}
            >
                <label className="s-checkbox-toggle-label">
                    <input
                        aria-label={`${axisType} ${getTranslation(title, intl)}`}
                        type="checkbox"
                        checked={toggledOn}
                        disabled={toggleDisabled}
                        onChange={toggleValue}
                        className="s-checkbox-toggle"
                    />
                    <span className="input-label-text" />
                </label>
            </DisabledBubbleMessage>
        );
    };

    const getTestClassName = () => {
        return `s-configuration-subsection-${title.replace(/\./g, "-")}`;
    };

    return (
        <div
            className={`configuration-subsection ${getTestClassName()}`}
            aria-label="Configuration subsection"
        >
            <fieldset>
                <legend>
                    <span className="legend-title">{getTranslation(title, intl)}</span>
                    {renderToggleSwitch()}
                </legend>
                <div>{children}</div>
            </fieldset>
        </div>
    );
}
