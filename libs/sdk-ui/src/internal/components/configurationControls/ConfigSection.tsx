// (C) 2019 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import * as classNames from "classnames";
import noop = require("lodash/noop");
import get = require("lodash/get");
import set = require("lodash/set");

import DisabledBubbleMessage from "../DisabledBubbleMessage";

import { getTranslation } from "../../utils/translations";

export interface IConfigSectionProps {
    id: string;
    valuePath?: string;
    canBeToggled?: boolean;
    toggleDisabled?: boolean;
    toggledOn?: boolean;
    propertiesMeta: any;
    properties?: any;
    title: string;
    subtitle?: string;
    showDisabledMessage?: boolean;
    className?: string;
    pushData?(data: any): void;
}

export interface IConfigSectionState {
    collapsed: boolean;
}

export class ConfigSection extends React.Component<
    IConfigSectionProps & WrappedComponentProps,
    IConfigSectionState
> {
    public static defaultProps = {
        collapsed: true,
        canBeToggled: false,
        toggleDisabled: false,
        toggledOn: true,
        disabled: false,
        pushData: noop,
        showDisabledMessage: false,
        className: "",
        properties: {},
    };

    constructor(props: IConfigSectionProps & WrappedComponentProps) {
        super(props);

        this.toggleCollapsed = this.toggleCollapsed.bind(this);
        this.toggleValue = this.toggleValue.bind(this);

        const collapsed = get(props, `propertiesMeta.${this.props.id}.collapsed`, true);

        this.state = {
            collapsed,
        };
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IConfigSectionProps & WrappedComponentProps) {
        const collapsed = get(nextProps, `propertiesMeta.${this.props.id}.collapsed`, true);
        this.setState({ collapsed });
    }

    public render() {
        const { collapsed } = this.state;
        const { title, intl, subtitle, className } = this.props;
        const configSectionClassName = `adi-bucket-configuration ${className}`;

        return (
            <div className={this.getSectionClassNames()}>
                <div className={this.getHeaderClassNames()} onClick={this.toggleCollapsed}>
                    {getTranslation(title, intl) + (subtitle ? ` (${getTranslation(subtitle, intl)})` : "")}
                </div>

                {this.renderToggleSwitch()}

                <div className={configSectionClassName}>{!collapsed && this.props.children}</div>
            </div>
        );
    }

    private renderToggleSwitch() {
        if (this.props.canBeToggled) {
            const { toggledOn, toggleDisabled, showDisabledMessage } = this.props;

            return (
                <DisabledBubbleMessage
                    className="adi-bucket-item-toggle"
                    showDisabledMessage={showDisabledMessage}
                >
                    <label className={this.getToggleLabelClassNames()}>
                        <input
                            type="checkbox"
                            checked={toggledOn}
                            disabled={toggleDisabled}
                            onChange={this.toggleValue}
                            className={`s-checkbox-toggle ${toggleDisabled ? "s-disabled" : "s-enabled"}`}
                        />
                        <span className="input-label-text" />
                    </label>
                </DisabledBubbleMessage>
            );
        }

        return null;
    }

    private getHeaderClassNames() {
        const { collapsed } = this.state;

        return classNames(
            "adi-bucket-item-header",
            "adi-configuration-section-header",
            "s-configuration-panel-item-header",
            {
                expanded: !collapsed,
                "adi-bucket-item-header-has-toggle": this.props.canBeToggled,
                collapsed,
            },
        );
    }

    private getToggleLabelClassNames() {
        return classNames("input-checkbox-toggle", "s-checkbox-toggle-label");
    }

    private getSectionClassNames() {
        return classNames("adi-bucket-item", `s-config-section-${this.props.id}`);
    }

    private toggleCollapsed() {
        const { collapsed } = this.state;

        const propertiesMeta = {};

        propertiesMeta[this.props.id] = {
            collapsed: !collapsed,
        };

        this.setState({ collapsed: !collapsed });
        this.props.pushData({ propertiesMeta });
    }

    private toggleValue(event: React.ChangeEvent<HTMLInputElement>) {
        const { valuePath, properties, pushData } = this.props;

        if (valuePath && properties && pushData) {
            const newProperties = set(properties, `controls.${valuePath}`, event.target.checked);

            pushData({ properties: newProperties });
        }
    }
}

export default injectIntl(ConfigSection);
