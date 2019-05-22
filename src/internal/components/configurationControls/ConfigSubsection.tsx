// (C) 2019 GoodData Corporation
import * as React from "react";
import { InjectedIntl } from "react-intl";
import noop = require("lodash/noop");
import set = require("lodash/set");
import DisabledBubbleMessage from "../DisabledBubbleMessage";

import { getTranslation } from "../../utils/translations";

export interface IConfigSubsectionProps {
    valuePath?: string;
    title: string;
    intl?: InjectedIntl;
    canBeToggled?: boolean;
    toggleDisabled?: boolean;
    toggledOn?: boolean;
    showDisabledMessage?: boolean;
    properties?: any;
    pushData?(data: any): void;
}

export interface IConfigSubsectionState {
    disabled: boolean;
}

export default class ConfigSubsection extends React.Component<
    IConfigSubsectionProps,
    IConfigSubsectionState
> {
    public static defaultProps = {
        collapsed: true,
        canBeToggled: false,
        toggleDisabled: false,
        toggledOn: true,
        pushData: noop,
        intl: noop,
        showDisabledMessage: false,
    };

    constructor(props: IConfigSubsectionProps) {
        super(props);
        this.toggleValue = this.toggleValue.bind(this);
    }

    public render() {
        const { title, intl } = this.props;

        return (
            <div className="configuration-subsection s-configuration-subsection">
                <fieldset>
                    <legend>
                        <span className="legend-title">{getTranslation(title, intl)}</span>
                        {this.renderToggleSwitch()}
                    </legend>
                    <div>{this.props.children}</div>
                </fieldset>
            </div>
        );
    }

    private renderToggleSwitch() {
        if (this.props.canBeToggled) {
            const { toggledOn, toggleDisabled, showDisabledMessage, intl } = this.props;

            return (
                <DisabledBubbleMessage
                    className="input-checkbox-toggle"
                    showDisabledMessage={showDisabledMessage}
                    intl={intl}
                >
                    <label className="s-checkbox-toggle-label">
                        <input
                            type="checkbox"
                            checked={toggledOn}
                            disabled={toggleDisabled}
                            onChange={this.toggleValue}
                            className="s-checkbox-toggle"
                        />
                        <span className="input-label-text" />
                    </label>
                </DisabledBubbleMessage>
            );
        }

        return null;
    }

    private toggleValue(event: React.ChangeEvent<HTMLInputElement>) {
        const { valuePath, properties, pushData } = this.props;

        if (valuePath && properties && pushData) {
            const newProperties = set(properties, `controls.${valuePath}`, event.target.checked);

            pushData({ properties: newProperties });
        }
    }
}
