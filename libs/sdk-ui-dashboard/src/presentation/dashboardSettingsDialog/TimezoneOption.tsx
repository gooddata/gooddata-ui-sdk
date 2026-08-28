// (C) 2026 GoodData Corporation

import { type ReactNode, useMemo } from "react";

import { useIntl } from "react-intl";

import { BROWSER_DETECTED, type IDashboardTimezoneConfig } from "@gooddata/sdk-model";
import {
    type ITimezoneSelectSpecialItem,
    TimezoneSelect,
    UiTooltip,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

interface ITimezoneOptionProps {
    label: ReactNode;
    tooltip: ReactNode;
    timezoneConfig: IDashboardTimezoneConfig | undefined;
    onChange: (timezoneId: string | undefined) => void;
}

export function TimezoneOption({ label, tooltip, timezoneConfig, onChange }: ITimezoneOptionProps) {
    const intl = useIntl();
    const helpTooltipId = useIdPrefixed("timezone-help-tooltip");

    const specialItems: ITimezoneSelectSpecialItem[] = useMemo(() => {
        const workspaceItemLabel = intl.formatMessage({
            id: "settingsDashboardDialog.section.timezone.defaultTimezone.workspace",
        });

        const workspaceItemTooltip = intl.formatMessage({
            id: "settingsDashboardDialog.section.timezone.defaultTimezone.workspace.tooltip",
        });

        const browserItemLabel = intl.formatMessage({
            id: "settingsDashboardDialog.section.timezone.defaultTimezone.fromBrowser",
        });

        const browserItemTooltip = intl.formatMessage({
            id: "settingsDashboardDialog.section.timezone.defaultTimezone.fromBrowser.tooltip",
        });

        return [
            { id: undefined, label: workspaceItemLabel, tooltip: workspaceItemTooltip },
            { id: BROWSER_DETECTED, label: browserItemLabel, tooltip: browserItemTooltip },
        ];
    }, [intl]);

    return (
        <div className="configuration-category-item">
            {/* the tooltip anchor wrapper is a div, which must not nest inside the label span */}
            <span className="input-label-text">{label}</span>
            <UiTooltip
                id={helpTooltipId}
                inlineAnchor
                anchor={
                    <span
                        role="img"
                        tabIndex={0}
                        aria-label={intl.formatMessage({
                            id: "settingsDashboardDialog.section.timezone.defaultTimezone.help",
                        })}
                        aria-describedby={helpTooltipId}
                        className="gd-icon-circle-question gd-filter-configuration__help-icon configuration-category-item-tooltip-icon"
                    />
                }
                content={<div className="gd-filter-configuration__help-tooltip">{tooltip}</div>}
                triggerBy={["hover", "focus"]}
                arrowPlacement="left"
                optimalPlacement
                width={200}
            />
            <TimezoneSelect
                value={timezoneConfig?.timezoneId}
                showTooltip
                onChange={onChange}
                specialItems={specialItems}
                searchPlaceholder={intl.formatMessage({
                    id: "settingsDashboardDialog.section.timezone.select.searchPlaceholder",
                })}
                ariaLabel={intl.formatMessage({
                    id: "settingsDashboardDialog.section.timezone.defaultTimezone",
                })}
                noMatchLabel={intl.formatMessage({
                    id: "settingsDashboardDialog.section.timezone.select.noMatch",
                })}
            />
        </div>
    );
}
