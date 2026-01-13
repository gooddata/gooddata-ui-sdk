// (C) 2019-2025 GoodData Corporation

import { type ChangeEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import cx from "classnames";
import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { getTranslation } from "../../utils/translations.js";
import { DisabledBubbleMessage } from "../DisabledBubbleMessage.js";

export interface IConfigSectionProps {
    id: string;
    valuePath?: string;
    canBeToggled?: boolean;
    toggleDisabled?: boolean;
    toggledOn?: boolean;
    propertiesMeta?: any;
    properties?: any;
    title?: string;
    subtitle?: string;
    showDisabledMessage?: boolean;
    className?: string;
    pushData?(data: any): void;
    children?: ReactNode;
    toggleMessageId?: string;
}

export function ConfigSection({
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
    pushData = () => {},
    children,
    toggleMessageId,
}: IConfigSectionProps) {
    const intl = useIntl();
    const [collapsed, setCollapsed] = useState(() => propertiesMeta?.[id]?.collapsed ?? true);

    useEffect(() => {
        // TODO: should the indexer be "nextProps.id"? Leaving as-is for now to be safe.
        const newCollapsed = propertiesMeta?.[id]?.collapsed ?? true;
        setCollapsed(newCollapsed);
    }, [propertiesMeta, id]);

    const toggleCollapsed = useCallback(() => {
        const propertiesMetaUpdate: Record<string, { collapsed: boolean }> = {};

        propertiesMetaUpdate[id] = {
            collapsed: !collapsed,
        };

        setCollapsed(!collapsed);
        pushData({ propertiesMeta: propertiesMetaUpdate });
    }, [id, collapsed, pushData]);

    const toggleValue = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (valuePath && properties && pushData) {
                const clonedProperties = cloneDeep(properties);
                set(clonedProperties, `controls.${valuePath}`, event.target.checked);

                pushData({ properties: clonedProperties });
            }
        },
        [valuePath, properties, pushData],
    );

    const getToggleLabelClassNames = useMemo(
        () => cx("input-checkbox-toggle", "s-checkbox-toggle-label"),
        [],
    );

    const renderToggleSwitch = useCallback(() => {
        if (canBeToggled) {
            return (
                <DisabledBubbleMessage
                    className="adi-bucket-item-toggle"
                    showDisabledMessage={showDisabledMessage}
                    messageId={toggleMessageId}
                >
                    <label className={getToggleLabelClassNames}>
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
    }, [
        canBeToggled,
        showDisabledMessage,
        toggleMessageId,
        getToggleLabelClassNames,
        id,
        toggledOn,
        toggleDisabled,
        toggleValue,
    ]);

    const headerClassNames = useMemo(
        () =>
            cx(
                "adi-bucket-item-header",
                "adi-configuration-section-header",
                "s-configuration-panel-item-header",
                {
                    expanded: !collapsed,
                    "adi-bucket-item-header-has-toggle": canBeToggled,
                    collapsed,
                },
            ),
        [collapsed, canBeToggled],
    );

    const sectionClassNames = useMemo(() => cx("adi-bucket-item", `s-config-section-${id}`), [id]);

    const configSectionClassName = useMemo(() => `adi-bucket-configuration ${className}`, [className]);

    return (
        <div className={sectionClassNames} aria-label="Configuration section">
            <div className={headerClassNames} onClick={toggleCollapsed}>
                {getTranslation(title, intl) + (subtitle ? ` (${getTranslation(subtitle, intl)})` : "")}
            </div>

            {renderToggleSwitch()}

            <div className={configSectionClassName}>{!collapsed && children}</div>
        </div>
    );
}
