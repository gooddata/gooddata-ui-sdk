// (C) 2019-2025 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import cloneDeep from "lodash/cloneDeep.js";
import noop from "lodash/noop.js";
import set from "lodash/set.js";
import DisabledBubbleMessage from "../DisabledBubbleMessage.js";

import { getTranslation } from "../../utils/translations.js";
import { AxisType } from "../../interfaces/AxisType.js";

export interface IConfigSubsectionOwnProps {
    valuePath?: string;
    title: string;
    canBeToggled?: boolean;
    toggleDisabled?: boolean;
    toggledOn?: boolean;
    showDisabledMessage?: boolean;
    properties?: any;
    pushData?(data: any): void;
    axisType?: AxisType;
    children?: React.ReactNode;
}

export interface IConfigSubsectionState {
    disabled: boolean;
}

export type IConfigSubsectionProps = IConfigSubsectionOwnProps & WrappedComponentProps;

function ConfigSubsection(props: IConfigSubsectionProps) {
    const {
        title,
        intl,
        canBeToggled = false,
        toggleDisabled = false,
        toggledOn = true,
        pushData = noop,
        showDisabledMessage = false,
        valuePath,
        properties,
        axisType,
        children,
    } = props;

    const toggleValue = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        return `s-configuration-subsection-${title.replace(/\./g, "-")}`;
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

export default injectIntl<"intl", IConfigSubsectionProps>(ConfigSubsection);
