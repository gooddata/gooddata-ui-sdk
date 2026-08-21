// (C) 2026 GoodData Corporation

import { FormattedMessage, useIntl } from "react-intl";

import {
    TimezoneSelect,
    getCurrentTimeByTimezoneId,
    getTimezoneDisplayLabel,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { type IScheduledEmailDialogTimezoneProps } from "../../../types.js";

/**
 * The "Time zone" section of the scheduled-email dialog's General tab. Unlike the
 * dashboard-settings timezone picker, the dropdown offers no browser-detected option — the
 * schedule runs without a browser. Dashboard schedules offer a Default option (the backend
 * derives the persisted dashboard/settings timezone at run time); widget schedules always show
 * a concrete timezone.
 *
 * The default implementation of the dialog's `Timezone` slot; its props are the slot contract
 * (see {@link IScheduledEmailDialogTimezoneProps}).
 *
 * @internal
 */
export function ScheduleTimezoneSelect({
    isWidget,
    selection,
    defaultResolvedTimezone,
    onTimezoneChange,
}: IScheduledEmailDialogTimezoneProps) {
    const intl = useIntl();

    const selectId = useIdPrefixed("schedule-timezone");
    const currentTimeId = useIdPrefixed("schedule-timezone-current-time");
    const usageNoteId = useIdPrefixed("schedule-timezone-note");

    const isDefaultSelected = selection.id === undefined;
    const currentTimezoneId = selection.id ?? defaultResolvedTimezone;
    const currentTime = currentTimezoneId ? getCurrentTimeByTimezoneId(currentTimezoneId) : "";

    // "Now: 14:45" preview of the current time in the effective selection; the Default option
    // additionally prints out the concrete timezone it resolves to right now.
    const currentTimeCaption = currentTime
        ? isDefaultSelected
            ? intl.formatMessage(
                  { id: "dialogs.automation.timezone.defaultNow" },
                  { timezone: getTimezoneDisplayLabel(currentTimezoneId!), time: currentTime },
              )
            : intl.formatMessage({ id: "dialogs.automation.timezone.now" }, { time: currentTime })
        : null;

    // the current-time caption and the usage note describe the trigger for assistive tech
    const describedBy = [currentTimeCaption ? currentTimeId : undefined, usageNoteId]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="gd-input-component gd-schedule-timezone-field s-gd-schedule-timezone">
            <label htmlFor={selectId} className="gd-label">
                <FormattedMessage id="dialogs.schedule.email.timezone" />
            </label>
            <div className="gd-schedule-timezone-field__content">
                <div className="gd-schedule-timezone-field__row">
                    <TimezoneSelect
                        value={selection.id}
                        onChange={onTimezoneChange}
                        id={selectId}
                        ariaDescribedBy={describedBy}
                        showTooltip
                        specialItems={
                            isWidget
                                ? []
                                : [
                                      {
                                          id: undefined,
                                          label: intl.formatMessage({
                                              id: "dialogs.automation.timezone.default",
                                          }),
                                          tooltip: intl.formatMessage({
                                              id: "dialogs.automation.timezone.default.tooltip",
                                          }),
                                      },
                                  ]
                        }
                        searchPlaceholder={intl.formatMessage({
                            id: "dialogs.automation.timezone.select.searchPlaceholder",
                        })}
                        ariaLabel={intl.formatMessage({ id: "dialogs.schedule.email.timezone" })}
                        noMatchLabel={intl.formatMessage({
                            id: "dialogs.automation.timezone.select.noMatch",
                        })}
                    />
                    {currentTimeCaption ? (
                        <div
                            id={currentTimeId}
                            className="gd-schedule-timezone-field__current-time s-gd-schedule-timezone-current-time"
                        >
                            {currentTimeCaption}
                        </div>
                    ) : null}
                </div>
                <div
                    id={usageNoteId}
                    className="gd-schedule-timezone-field__message s-gd-schedule-timezone-note"
                >
                    <FormattedMessage id="dialogs.automation.timezone.usage" />
                </div>
            </div>
        </div>
    );
}
