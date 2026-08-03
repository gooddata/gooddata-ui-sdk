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
        // TODO INE (CQ-2726): resolve the effective workspace timezone and include it in the item label
        const workspaceItemLabel = intl.formatMessage({
            id: "settingsDashboardDialog.section.timezone.defaultTimezone.workspace",
        });
        // plain ID here — the label template already brackets the value, so the "id (offset)"
        // display label would produce nested brackets
        const browserTimezoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const browserItemLabel = intl.formatMessage(
            { id: "settingsDashboardDialog.section.timezone.defaultTimezone.fromBrowser" },
            { timezone: browserTimezoneId },
        );

        return [
            { id: undefined, label: workspaceItemLabel },
            { id: BROWSER_DETECTED, label: browserItemLabel },
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
