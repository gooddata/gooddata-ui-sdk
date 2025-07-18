// (C) 2019-2025 GoodData Corporation
import { ReactNode, useState, useEffect } from "react";
import { useIntl } from "react-intl";
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
    children?: ReactNode;
    toggleMessageId?: string;
}

export default function ConfigSection(props: IConfigSectionOwnProps) {
    const {
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
    } = props;

    const intl = useIntl();

    const [collapsed, setCollapsed] = useState(() => propertiesMeta?.[id]?.collapsed ?? true);

    useEffect(() => {
        // TODO: should the indexer be "nextProps.id"? Leaving as-is for now to be safe.
        const newCollapsed = propertiesMeta?.[id]?.collapsed ?? true;
        setCollapsed(newCollapsed);
    }, [propertiesMeta, id]);

    const toggleCollapsed = () => {
        const propertiesMetaUpdate: Record<string, { collapsed: boolean }> = {};

        propertiesMetaUpdate[id] = {
            collapsed: !collapsed,
        };

        setCollapsed(!collapsed);
        pushData({ propertiesMeta: propertiesMetaUpdate });
    };

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
        }

        return null;
    };

    const getHeaderClassNames = () => {
        return cx(
            "adi-bucket-item-header",
            "adi-configuration-section-header",
            "s-configuration-panel-item-header",
            {
                expanded: !collapsed,
                "adi-bucket-item-header-has-toggle": canBeToggled,
                collapsed,
            },
        );
    };

    const getToggleLabelClassNames = () => {
        return cx("input-checkbox-toggle", "s-checkbox-toggle-label");
    };

    const getSectionClassNames = () => {
        return cx("adi-bucket-item", `s-config-section-${id}`);
    };

    const configSectionClassName = `adi-bucket-configuration ${className}`;

    return (
        <div className={getSectionClassNames()} aria-label="Configuration section">
            <div className={getHeaderClassNames()} onClick={toggleCollapsed}>
                {getTranslation(title, intl) + (subtitle ? ` (${getTranslation(subtitle, intl)})` : "")}
            </div>

            {renderToggleSwitch()}

            <div className={configSectionClassName}>{!collapsed && children}</div>
        </div>
    );
}
