// (C) 2026 GoodData Corporation

import { type ReactElement, useEffect, useRef } from "react";

import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { ConfigSubsection } from "./ConfigSubsection.js";
import { DropdownControl } from "./DropdownControl.js";
import { messages } from "../../../locales.js";
import { pushpinShapeTypeDropdownItems } from "../../constants/dropdowns.js";
import { type IDropdownItem } from "../../interfaces/Dropdown.js";
import { type IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

export interface IPushpinShapeControlProps {
    disabled: boolean;
    properties: IVisualizationProperties;
    pushData: (data: unknown) => void;
    spriteIcons?: IDropdownItem[];
    hasGeoIconLabel?: boolean;
    hasSizeOrColorMeasure?: boolean;
}

export function PushpinShapeControl(props: IPushpinShapeControlProps): ReactElement | null {
    const intl = useIntl();
    const {
        disabled,
        properties,
        pushData,
        spriteIcons = [],
        hasGeoIconLabel = false,
        hasSizeOrColorMeasure = false,
    } = props;
    const shapeType = properties?.controls?.["points"]?.shapeType ?? "circle";
    const icon = properties?.controls?.["points"]?.icon ?? "";

    const hasSpriteIcons = spriteIcons.length > 0;
    const disabledIconTooltip = intl.formatMessage({ id: messages["shapeTypeIconDisabled"].id });
    const allItems = getTranslatedDropdownItems(pushpinShapeTypeDropdownItems, intl);
    const isCurrentShapeType = (value: IDropdownItem["value"]): boolean => value === shapeType;
    const isIconShapeType = (value: IDropdownItem["value"]): boolean =>
        value === "oneIcon" || value === "iconByValue";
    const isShapeTypeSelectionDisabled = disabled || (hasSizeOrColorMeasure && !isIconShapeType(shapeType));
    const lastAutoSelectedIcon = useRef<string | undefined>(undefined);
    const shapeTypeItems = allItems
        .filter((item) => {
            if (item.value === "oneIcon" && !hasSpriteIcons && !isCurrentShapeType(item.value)) {
                return false;
            }
            if (item.value === "iconByValue" && !hasGeoIconLabel && !isCurrentShapeType(item.value)) {
                return false;
            }
            if (hasSizeOrColorMeasure && isIconShapeType(item.value) && !isCurrentShapeType(item.value)) {
                return false;
            }
            return true;
        })
        .map((item) => {
            // Keep the current invalid icon shape visible so the user can switch back to circle.
            if (hasSizeOrColorMeasure && isIconShapeType(item.value)) {
                return { ...item, info: disabledIconTooltip };
            }
            return item;
        });

    // Auto-select first sprite icon when switching to "oneIcon" with no icon set
    useEffect(() => {
        if (shapeType !== "oneIcon" || icon || spriteIcons.length === 0) {
            lastAutoSelectedIcon.current = undefined;
            return;
        }

        const firstSpriteIcon = spriteIcons[0]?.value;
        if (typeof firstSpriteIcon !== "string" || !firstSpriteIcon) {
            return;
        }
        if (lastAutoSelectedIcon.current === firstSpriteIcon) {
            return;
        }
        lastAutoSelectedIcon.current = firstSpriteIcon;

        const clonedProperties = cloneDeep(properties);
        set(clonedProperties, "controls.points.icon", firstSpriteIcon);
        pushData({ properties: clonedProperties });
    }, [shapeType, icon, spriteIcons, properties, pushData]);

    // Keep the shape section visible when metrics lock the current valid mode to circle.
    // This mirrors other disabled controls and makes the restriction explicit.
    const selectableItems = shapeTypeItems.filter((item) => item.value !== undefined);
    if (selectableItems.length <= 1 && !isShapeTypeSelectionDisabled) {
        return null;
    }

    return (
        <ConfigSubsection title={messages["pointsShapeTitle"].id}>
            <DropdownControl
                value={shapeType}
                valuePath="points.shapeType"
                labelText={messages["pointsShapeTypeTitle"].id}
                disabled={isShapeTypeSelectionDisabled}
                showDisabledMessage={isShapeTypeSelectionDisabled}
                properties={properties}
                pushData={pushData}
                items={shapeTypeItems}
            />
            {shapeType === "oneIcon" && hasSpriteIcons ? (
                <DropdownControl
                    value={icon}
                    valuePath="points.icon"
                    labelText={messages["pointsShapeIconTitle"].id}
                    disabled={disabled}
                    showDisabledMessage={disabled}
                    properties={properties}
                    pushData={pushData}
                    items={spriteIcons}
                    showSearch
                    width={160}
                />
            ) : null}
        </ConfigSubsection>
    );
}
