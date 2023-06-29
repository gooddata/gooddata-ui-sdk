// (C) 2019-2022 GoodData Corporation
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

class ConfigSubsection extends React.Component<IConfigSubsectionProps, IConfigSubsectionState> {
    public static defaultProps = {
        collapsed: true,
        canBeToggled: false,
        toggleDisabled: false,
        toggledOn: true,
        pushData: noop,
        showDisabledMessage: false,
    };

    constructor(props: IConfigSubsectionOwnProps & WrappedComponentProps) {
        super(props);
        this.toggleValue = this.toggleValue.bind(this);
    }

    public render() {
        const { title, intl } = this.props;
        const className = `configuration-subsection ${this.getTestClassName()}`;

        return (
            <div className={className} aria-label="Configuration subsection">
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
            const { toggledOn, toggleDisabled, showDisabledMessage, title, intl, axisType } = this.props;
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
            const clonedProperties = cloneDeep(properties);
            set(clonedProperties, `controls.${valuePath}`, event.target.checked);

            pushData({ properties: clonedProperties });
        }
    }

    private getTestClassName(): string {
        return `s-configuration-subsection-${this.props.title.replace(/\./g, "-")}`;
    }
}

export default injectIntl<"intl", IConfigSubsectionProps>(ConfigSubsection);
