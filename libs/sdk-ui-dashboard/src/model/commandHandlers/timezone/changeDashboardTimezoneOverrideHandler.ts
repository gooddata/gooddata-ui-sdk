// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { type IDashboardTimezoneConfig, resolveTimezoneId } from "@gooddata/sdk-model";

import { type IChangeDashboardTimezoneOverride } from "../../commands/timezone.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import {
    type IDashboardTimezoneOverrideChanged,
    dashboardTimezoneOverrideChanged,
} from "../../events/timezone.js";
import { selectEnableDashboardTimezone } from "../../store/config/configSelectors.js";
import {
    selectDashboardTimezoneConfig,
    selectEffectiveDashboardTimezone,
} from "../../store/meta/metaSelectors.js";
import { uiActions } from "../../store/ui/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

function isValidIanaTimezoneId(timezoneId: string): boolean {
    try {
        new Intl.DateTimeFormat(undefined, { timeZone: timezoneId });
        return true;
    } catch {
        return false;
    }
}

export function* changeDashboardTimezoneOverrideHandler(
    ctx: DashboardContext,
    cmd: IChangeDashboardTimezoneOverride,
): SagaIterator<IDashboardTimezoneOverrideChanged> {
    // the gating protects paths that arrive from outside the UI (e.g. the embedding
    // setTimezone postMessage), which do not go through the menu-item visibility checks
    const isTimezoneEnabled: boolean = yield select(selectEnableDashboardTimezone);
    if (!isTimezoneEnabled) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            "Cannot change the timezone override: the dashboard timezone feature is disabled.",
        );
    }

    const timezoneConfig: IDashboardTimezoneConfig | undefined = yield select(selectDashboardTimezoneConfig);
    if (timezoneConfig?.allowUserOverrideInViewMode !== true) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            "Cannot change the timezone override: the dashboard's timezone configuration does not allow user overrides in view mode.",
        );
    }

    // the model layer is the single resolution point of the browser-detected sentinel for the
    // override: state and the emitted event must only ever carry concrete IANA ids
    const resolvedTimezoneId = resolveTimezoneId(cmd.payload.timezoneId);

    if (resolvedTimezoneId !== undefined && !isValidIanaTimezoneId(resolvedTimezoneId)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `The provided timezone override "${resolvedTimezoneId}" is not a valid IANA timezone ID.`,
        );
    }

    yield put(uiActions.setTimezoneOverride(resolvedTimezoneId));

    // put dispatches synchronously, so the selector already sees the new override
    const effectiveTimezone: string | undefined = yield select(selectEffectiveDashboardTimezone);

    return dashboardTimezoneOverrideChanged(ctx, resolvedTimezoneId, effectiveTimezone, cmd.correlationId);
}
