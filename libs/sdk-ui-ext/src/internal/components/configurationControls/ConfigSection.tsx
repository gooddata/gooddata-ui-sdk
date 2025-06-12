// (C) 2019-2023 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import cx from "classnames";
import cloneDeep from "lodash/cloneDeep.js";
import noop from "lodash/noop.js";
import set from "lodash/set.js";

import DisabledBubbleMessage from "../DisabledBubbleMessage.js";

import { getTranslation } from "../../utils/translations.js";

export interface IConfigSectionOwnProps {
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
    children?: React.ReactNode;
    toggleMessageId?: string;
}

export interface IConfigSectionState {
    collapsed: boolean;
}

export type IConfigSectionProps = IConfigSectionOwnProps & WrappedComponentProps;

export class ConfigSection extends React.Component<IConfigSectionProps, IConfigSectionState> {
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

    constructor(props: IConfigSectionOwnProps & WrappedComponentProps) {
        super(props);

        this.toggleCollapsed = this.toggleCollapsed.bind(this);
        this.toggleValue = this.toggleValue.bind(this);

        const collapsed = props.propertiesMeta?.[props.id]?.collapsed ?? true;

        this.state = {
            collapsed,
        };
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IConfigSectionOwnProps & WrappedComponentProps): void {
        // TODO: should the indexer be "nextProps.id"? Leaving as-is for now to be safe.
        const collapsed = nextProps.propertiesMeta?.[this.props.id]?.collapsed ?? true;
        this.setState({ collapsed });
    }

    public render() {
        const { collapsed } = this.state;
        const { title, intl, subtitle, className } = this.props;
        const configSectionClassName = `adi-bucket-configuration ${className}`;

        return (
            <div className={this.getSectionClassNames()} aria-label="Configuration section">
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
            const { toggledOn, toggleDisabled, showDisabledMessage, id, toggleMessageId } = this.props;

            return (
                <DisabledBubbleMessage
                    className="adi-bucket-item-toggle"
                    showDisabledMessage={showDisabledMessage}
                    messageId={toggleMessageId}
                >
                    <label className={this.getToggleLabelClassNames()}>
                        <input
                            aria-label={id}
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

        return cx(
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
        return cx("input-checkbox-toggle", "s-checkbox-toggle-label");
    }

    private getSectionClassNames() {
        return cx("adi-bucket-item", `s-config-section-${this.props.id}`);
    }

    private toggleCollapsed() {
        const { collapsed } = this.state;

        const propertiesMeta: Record<string, { collapsed: boolean }> = {};

        propertiesMeta[this.props.id] = {
            collapsed: !collapsed,
        };

        this.setState({ collapsed: !collapsed });
        this.props.pushData({ propertiesMeta });
    }

    private toggleValue(event: React.ChangeEvent<HTMLInputElement>) {
        const { valuePath, properties, pushData } = this.props;

        if (valuePath && properties && pushData) {
            const clonedProperties = cloneDeep(properties);
            set(clonedProperties, `controls.${valuePath}`, event.target.checked);

            pushData({ properties: clonedProperties });
        }
    }
}

export default injectIntl<"intl", IConfigSectionProps>(ConfigSection);
