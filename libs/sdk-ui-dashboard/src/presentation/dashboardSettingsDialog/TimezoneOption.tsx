// (C) 2026 GoodData Corporation

import { type ReactNode, useMemo } from "react";

import { useIntl } from "react-intl";

import { BROWSER_DETECTED, type IDashboardTimezoneConfig } from "@gooddata/sdk-model";
import {
    Bubble,
    BubbleHoverTrigger,
    type IAlignPoint,
    type ITimezoneSelectSpecialItem,
    TimezoneSelect,
} from "@gooddata/sdk-ui-kit";

const BUBBLE_ALIGN_POINTS: IAlignPoint[] = [{ align: "bc tl" }];

interface ITimezoneOptionProps {
    label: ReactNode;
    tooltip: ReactNode;
    timezoneConfig: IDashboardTimezoneConfig | undefined;
    onChange: (timezoneId: string | undefined) => void;
}

export function TimezoneOption({ label, tooltip, timezoneConfig, onChange }: ITimezoneOptionProps) {
    const intl = useIntl();

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
            <span className="input-label-text">
                {label}
                <BubbleHoverTrigger
                    showDelay={0}
                    hideDelay={0}
                    eventsOnBubble
                    className="configuration-category-item-tooltip-icon"
                >
                    <span className="gd-icon-circle-question gd-filter-configuration__help-icon" />
                    <Bubble alignPoints={BUBBLE_ALIGN_POINTS}>
                        <div className="gd-filter-configuration__help-tooltip">{tooltip}</div>
                    </Bubble>
                </BubbleHoverTrigger>
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
