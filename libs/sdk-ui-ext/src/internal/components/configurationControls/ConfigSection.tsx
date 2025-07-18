// (C) 2019-2025 GoodData Corporation
import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import cloneDeep from "lodash/cloneDeep.js";
import noop from "lodash/noop.js";
import set from "lodash/set.js";

import DisabledBubbleMessage from "../DisabledBubbleMessage.js";

import { getTranslation } from "../../utils/translations.js";

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
    children?: ReactNode;
    toggleMessageId?: string;
}

export interface IConfigSectionState {
    collapsed: boolean;
}

export default function ConfigSection({
    id,
    valuePath,
    canBeToggled = false,
    toggleDisabled = false,
    toggledOn = true,
    propertiesMeta,
    properties = {},
    title,
    subtitle,
    showDisabledMessage = false,
    className = "",
    pushData = noop,
    children,
    toggleMessageId,
}: IConfigSectionProps) {
    const intl = useIntl();

    const initialCollapsed = propertiesMeta?.[id]?.collapsed ?? true;
    const [collapsed, setCollapsed] = useState(initialCollapsed);

    useEffect(() => {
        const newCollapsed = propertiesMeta?.[id]?.collapsed ?? true;
        setCollapsed(newCollapsed);
    }, [propertiesMeta, id]);

    const toggleCollapsed = () => {
        const newCollapsed = !collapsed;
        const metaUpdate = { [id]: { collapsed: newCollapsed } };
        setCollapsed(newCollapsed);
        pushData({ propertiesMeta: metaUpdate });
    };

    const toggleValue = (event: ChangeEvent<HTMLInputElement>) => {
        if (valuePath && properties) {
            const cloned = cloneDeep(properties);
            set(cloned, `controls.${valuePath}`, event.target.checked);
            pushData({ properties: cloned });
        }
    };

    const getSectionClassNames = () => cx("adi-bucket-item", `s-config-section-${id}`);

    const getHeaderClassNames = () =>
        cx(
            "adi-bucket-item-header",
            "adi-configuration-section-header",
            "s-configuration-panel-item-header",
            {
                expanded: !collapsed,
                "adi-bucket-item-header-has-toggle": canBeToggled,
                collapsed,
            },
        );

    const getToggleLabelClassNames = () => cx("input-checkbox-toggle", "s-checkbox-toggle-label");

    const renderToggleSwitch = () => {
        if (!canBeToggled) return null;

        return (
            <DisabledBubbleMessage
                className="adi-bucket-item-toggle"
                showDisabledMessage={showDisabledMessage}
                messageId={toggleMessageId}
            >
                <label className={getToggleLabelClassNames()}>
                    <input
                        aria-label={id}
                        type="checkbox"
                        checked={toggledOn}
                        disabled={toggleDisabled}
                        onChange={toggleValue}
                        className={`s-checkbox-toggle ${toggleDisabled ? "s-disabled" : "s-enabled"}`}
                    />
                    <span className="input-label-text" />
                </label>
            </DisabledBubbleMessage>
        );
    };

    const headerLabel =
        getTranslation(title, intl) + (subtitle ? ` (${getTranslation(subtitle, intl)})` : "");

    return (
        <div className={getSectionClassNames()} aria-label="Configuration section">
            <div className={getHeaderClassNames()} onClick={toggleCollapsed}>
                {headerLabel}
            </div>
            {renderToggleSwitch()}
            <div className={`adi-bucket-configuration ${className}`}>{!collapsed && children}</div>
        </div>
    );
}
