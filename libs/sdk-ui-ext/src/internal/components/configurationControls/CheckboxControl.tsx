// (C) 2019-2022 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
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
        const { checked, disabled, labelText, showDisabledMessage, intl, valuePath } = this.props;
        return (
            <DisabledBubbleMessage showDisabledMessage={showDisabledMessage}>
                <label className="input-checkbox-label">
                    <input
                        aria-label={valuePath}
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

        const clonedProperties = cloneDeep(properties);
        set(clonedProperties, `controls.${valuePath}`, event.target.checked);

        pushData({ properties: clonedProperties });
    }
}

export default injectIntl(CheckboxControl);
