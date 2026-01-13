// (C) 2019-2025 GoodData Corporation

import { type ChangeEvent, type ReactNode } from "react";

import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { type AxisType } from "../../interfaces/AxisType.js";
import { getTranslation } from "../../utils/translations.js";
import { DisabledBubbleMessage } from "../DisabledBubbleMessage.js";

export interface IConfigSubsectionOwnProps {
    valuePath?: string;
    title?: string;
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

export type IConfigSubsectionProps = IConfigSubsectionOwnProps;

export function ConfigSubsection({
    title,
    canBeToggled = false,
    toggleDisabled = false,
    toggledOn = true,
    pushData = () => {},
    showDisabledMessage = false,
    valuePath,
    properties,
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
        if (canBeToggled) {
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
        }

        return null;
    };

    const getTestClassName = (): string => {
        return `s-configuration-subsection-${title === undefined ? "empty-title" : title.replace(/\./g, "-")}`;
    };

    const className = `configuration-subsection ${getTestClassName()}`;

    return (
        <div className={className} aria-label="Configuration subsection">
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
