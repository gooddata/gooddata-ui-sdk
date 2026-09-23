// (C) 2026 GoodData Corporation

import { type ReactNode, useMemo } from "react";

import { useIntl } from "react-intl";

import { BROWSER_DETECTED, type IDashboardTimezoneConfig } from "@gooddata/sdk-model";
import {
    type ITimezoneSelectSpecialItem,
    TimezoneSelect,
    UiLink,
    UiTooltip,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectIsWhiteLabeled } from "../../model/store/config/configSelectors.js";

const DASHBOARD_TIMEZONE_DOC_LINK =
    "https://www.gooddata.ai/docs/cloud/customize-appearance/manage-timezones/#change-the-time-zone-on-a-dashboard";

interface ITimezoneOptionProps {
    label: ReactNode;
    tooltip: ReactNode;
    timezoneConfig: IDashboardTimezoneConfig | undefined;
    onChange: (timezoneId: string | undefined) => void;
}

export function TimezoneOption({ label, tooltip, timezoneConfig, onChange }: ITimezoneOptionProps) {
    const intl = useIntl();
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const helpTooltipId = useIdPrefixed("timezone-help-tooltip");

    const specialItems: ITimezoneSelectSpecialItem[] = useMemo(() => {
        const workspaceItemLabel = intl.formatMessage({
            id: "settingsDashboardDialog.section.timezone.defaultTimezone.workspace",
        });

        const workspaceItemTooltip = intl.formatMessage({
            id: "settingsDashboardDialog.section.timezone.defaultTimezone.workspace.tooltip",
        });

        // the docs link goes on its own line; it is left out of the plain-text tooltip read by screen readers
        const workspaceItemTooltipContent = isWhiteLabeled ? undefined : (
            <>
                {workspaceItemTooltip}
                <div className="gd-timezone-option__tooltip-link">
                    <UiLink
                        variant="inverse"
                        href={DASHBOARD_TIMEZONE_DOC_LINK}
                        rel="noopener noreferrer"
                        target="_blank"
                        dataTestId="timezone-docs-link"
                    >
                        {intl.formatMessage({
                            id: "settingsDashboardDialog.section.timezone.defaultTimezone.workspace.tooltip.learnMore",
                        })}
                    </UiLink>
                </div>
            </>
        );

        const browserItemLabel = intl.formatMessage({
            id: "settingsDashboardDialog.section.timezone.defaultTimezone.fromBrowser",
        });

        const browserItemTooltip = intl.formatMessage({
            id: "settingsDashboardDialog.section.timezone.defaultTimezone.fromBrowser.tooltip",
        });

        return [
            {
                id: undefined,
                label: workspaceItemLabel,
                tooltip: workspaceItemTooltip,
                tooltipContent: workspaceItemTooltipContent,
            },
            { id: BROWSER_DETECTED, label: browserItemLabel, tooltip: browserItemTooltip },
        ];
    }, [intl, isWhiteLabeled]);

    return (
        <div className="configuration-category-item">
            <span className="input-label-text">
                {label}
                {/* same wrapper class and nesting as the toggle rows, so the icon shares their color and cursor */}
                <span className="configuration-category-item-tooltip-icon">
                    <UiTooltip
                        id={helpTooltipId}
                        component="span"
                        inlineAnchor
                        anchor={
                            <span
                                role="img"
                                tabIndex={0}
                                aria-label={intl.formatMessage({
                                    id: "settingsDashboardDialog.section.timezone.defaultTimezone.help",
                                })}
                                aria-describedby={helpTooltipId}
                                className="gd-icon-circle-question gd-filter-configuration__help-icon"
                            />
                        }
                        content={<div className="gd-filter-configuration__help-tooltip">{tooltip}</div>}
                        triggerBy={["hover", "focus"]}
                        arrowPlacement="left"
                        optimalPlacement
                        width={200}
                    />
                </span>
            </span>
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
