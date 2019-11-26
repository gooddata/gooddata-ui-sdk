// (C) 2019 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import set = require("lodash/set");
import DisabledBubbleMessage from "../DisabledBubbleMessage";
import { IVisualizationProperties } from "../../interfaces/Visualization";
import { getTranslation } from "../../utils/translations";

export interface ICheckboxControlProps {
    valuePath: string;
    properties: IVisualizationProperties;
    labelText?: string;
    checked?: boolean;
    disabled?: boolean;
    showDisabledMessage?: boolean;
    pushData(data: any): void;
}

class CheckboxControl extends React.Component<ICheckboxControlProps & WrappedComponentProps> {
    public static defaultProps = {
        checked: false,
        disabled: false,
        showDisabledMessage: false,
    };

    constructor(props: ICheckboxControlProps & WrappedComponentProps) {
        super(props);

        this.onValueChanged = this.onValueChanged.bind(this);
    }

    public render() {
        const { checked, disabled, labelText, showDisabledMessage, intl } = this.props;
        return (
            <DisabledBubbleMessage showDisabledMessage={showDisabledMessage}>
                <label className="input-checkbox-label">
                    <input
                        checked={checked}
                        disabled={disabled}
                        type="checkbox"
                        className="input-checkbox"
                        onChange={this.onValueChanged}
                    />
                    <span className="input-label-text">{getTranslation(labelText, intl)}</span>
                </label>
            </DisabledBubbleMessage>
        );
    }

    private onValueChanged(event: React.ChangeEvent<HTMLInputElement>) {
        const { valuePath, properties, pushData } = this.props;
        const newProperties = set(properties, `controls.${valuePath}`, event.target.checked);

        pushData({ properties: newProperties });
    }
}

export default injectIntl(CheckboxControl);
