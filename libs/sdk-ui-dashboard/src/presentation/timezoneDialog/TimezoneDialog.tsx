// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode, useEffect, useMemo, useState } from "react";

import { FormattedMessage, defineMessage, useIntl } from "react-intl";

import { BROWSER_DETECTED, resolveTimezoneId } from "@gooddata/sdk-model";
import {
    ConfirmDialog,
    type ITimezoneSelectSpecialItem,
    Message,
    TimezoneSelect,
    getCurrentTimeByTimezoneId,
    getTimezoneDisplayLabel,
    useToastMessage,
} from "@gooddata/sdk-ui-kit";

import { changeDashboardTimezoneOverride } from "../../model/commands/timezone.js";
import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectTimezone } from "../../model/store/config/configSelectors.js";
import { selectDashboardTimezoneConfig } from "../../model/store/meta/metaSelectors.js";
import { uiActions } from "../../model/store/ui/index.js";
import { selectTimezoneOverride } from "../../model/store/ui/uiSelectors.js";

/**
 * Dialog for the ad-hoc, session-only change of the dashboard timezone in view mode.
 *
 * @remarks
 * The dialog hosts the shared timezone picker with two special items: "Default" (clears the
 * override so the dashboard/workspace configuration applies again) and "Device time zone". Applying
 * a selection dispatches the ChangeDashboardTimezoneOverride command; its handler resolves the
 * browser-detected sentinel, so the session-only ui state always ends up with a concrete IANA
 * timezone ID. The override is never persisted with the dashboard.
 *
 * @alpha
 */
export function TimezoneDialog(): ReactElement | null {
    const intl = useIntl();
    const dispatch = useDashboardDispatch();
    const { addSuccess } = useToastMessage();
    const currentOverride = useDashboardSelector(selectTimezoneOverride);
    const timezoneConfig = useDashboardSelector(selectDashboardTimezoneConfig);
    const workspaceTimezone = useDashboardSelector(selectTimezone);
    const [selected, setSelected] = useState<string | undefined>(currentOverride);
    const [currentTimeOfTimezone, setCurrentTimeOfTimezone] = useState<string>();

    // Prefer the configured dashboard timezone (browser-detected sentinel resolved). When the
    // dashboard has no explicit timezone, fall back to the effective workspace/organization
    // timezone so the Default item, description note, and current-time preview share the same
    // concrete ID.
    const defaultTimezoneId = resolveTimezoneId(timezoneConfig?.timezoneId) ?? workspaceTimezone;

    const specialItems: ITimezoneSelectSpecialItem[] = useMemo(() => {
        const defaultItemLabel = intl.formatMessage({ id: "timezoneDialog.default" });

        const browserTimezoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const browserTimezoneName = getTimezoneDisplayLabel(browserTimezoneId);
        const browserItemLabel = intl.formatMessage(
            { id: "timezoneDialog.fromBrowser" },
            { timezone: browserTimezoneName },
        );

        return [
            { id: undefined, label: defaultItemLabel },
            { id: BROWSER_DETECTED, label: browserItemLabel },
        ];
    }, [intl]);

    useEffect(() => {
        const timezoneId = resolveTimezoneId(selected) ?? defaultTimezoneId;
        if (timezoneId) {
            setCurrentTimeOfTimezone(getCurrentTimeByTimezoneId(timezoneId));
        } else {
            setCurrentTimeOfTimezone(undefined);
        }
    }, [selected, defaultTimezoneId]);

    const onCancel = () => dispatch(uiActions.closeTimezoneDialog());

    const onApply = () => {
        dispatch(uiActions.closeTimezoneDialog());
        // the command handler resolves the browser-detected special item; resolve locally only
        // to skip dispatching when the selection matches the current override
        if (resolveTimezoneId(selected) !== currentOverride) {
            dispatch(changeDashboardTimezoneOverride(selected));
            addSuccess(defineMessage({ id: "timezoneDialog.success" }));
        }
    };

    return (
        <ConfirmDialog
            onCancel={onCancel}
            onSubmit={onApply}
            isPositive
            className="s-dialog s-timezone-dialog gd-timezone-dialog"
            headline={intl.formatMessage({ id: "timezoneDialog.title" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "apply" })}
        >
            <div className="gd-timezone-dialog-picker">
                <TimezoneSelect
                    value={selected}
                    onChange={setSelected}
                    specialItems={specialItems}
                    searchPlaceholder={intl.formatMessage({
                        id: "timezoneDialog.select.searchPlaceholder",
                    })}
                    ariaLabel={intl.formatMessage({ id: "timezoneDialog.title" })}
                    noMatchLabel={intl.formatMessage({ id: "timezoneDialog.select.noMatch" })}
                />
                {/* the live region is always rendered so that time updates on selection change
                    are announced; only the content is conditional */}
                <span className="gd-timezone-dialog-current-time" aria-live="polite">
                    {currentTimeOfTimezone
                        ? intl.formatMessage(
                              { id: "timezoneDialog.currentTime" },
                              { time: currentTimeOfTimezone },
                          )
                        : null}
                </span>
            </div>
            <Message type="progress" className="gd-timezone-dialog-description s-timezone-dialog-description">
                <FormattedMessage
                    id="timezoneDialog.description"
                    values={{
                        b: (chunks: ReactNode) => <strong>{chunks}</strong>,
                    }}
                />
            </Message>
        </ConfirmDialog>
    );
}
