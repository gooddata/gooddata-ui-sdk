// (C) 2026 GoodData Corporation

import { type ReactElement, useEffect, useMemo, useState } from "react";

import { defineMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { BROWSER_DETECTED, resolveTimezoneId } from "@gooddata/sdk-model";
import {
    ConfirmDialog,
    type ITimezoneSelectSpecialItem,
    TimezoneSelect,
    getCurrentTimeByTimezoneId,
    getTimezoneDisplayLabel,
    useToastMessage,
} from "@gooddata/sdk-ui-kit";

import { setTimezoneOverride } from "../../actions/timezone_override_actions.js";
import { getWorkspaceTimezone } from "../../selectors/feature_flag_selector.js";
import { getTimezoneOverride } from "../../selectors/timezone_override_selectors.js";
import { type AppDispatch, type IAppState } from "../../store/types.js";

export interface ITimezoneDialogProps {
    onClose: () => void;
}

/**
 * Dialog for the ad-hoc, session-only change of the insight timezone in Analytical Designer.
 *
 * @remarks
 * Mirrors the KD {@code TimezoneDialog}: hosts the shared timezone picker with "Default" (clears
 * the override so the workspace configuration applies again) and "From browser" special items.
 * Applying a selection resolves the browser-detected sentinel locally so the session-only Redux
 * state always stores a concrete IANA timezone ID. The override is never persisted with the insight.
 */
export function TimezoneDialog({ onClose }: ITimezoneDialogProps): ReactElement {
    const intl = useIntl();
    // explicit Dispatch instead of the react-redux UnknownAction default
    const dispatch = useDispatch<AppDispatch>();
    const currentOverride = useSelector((state: IAppState) => getTimezoneOverride(state));
    const workspaceTimezone = useSelector((state: IAppState) => getWorkspaceTimezone(state));
    const { addSuccess } = useToastMessage();
    const [selected, setSelected] = useState<string | undefined>(currentOverride);
    const [currentTimeOfTimezone, setCurrentTimeOfTimezone] = useState<string>();

    const defaultTimezoneId = workspaceTimezone;

    const specialItems: ITimezoneSelectSpecialItem[] = useMemo(() => {
        const defaultItemLabel = intl.formatMessage({ id: "timezoneDialog.default" });

        // plain ID here — the label template already brackets the value, so the "id (offset)"
        // display label would produce nested brackets
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

    const onApply = () => {
        onClose();
        // Resolve locally so Redux always stores a concrete IANA ID (or undefined for Default).
        // Skip dispatching when the selection matches the current override.
        const resolved = resolveTimezoneId(selected);
        if (resolved !== currentOverride) {
            dispatch(setTimezoneOverride(resolved));
            addSuccess(defineMessage({ id: "timezoneDialog.success" }));
        }
    };

    return (
        <ConfirmDialog
            onCancel={onClose}
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
                {currentTimeOfTimezone ? (
                    <span className="gd-timezone-dialog-current-time">
                        {intl.formatMessage(
                            { id: "timezoneDialog.currentTime" },
                            { time: currentTimeOfTimezone },
                        )}
                    </span>
                ) : null}
            </div>
        </ConfirmDialog>
    );
}
