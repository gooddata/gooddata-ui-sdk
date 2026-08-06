// (C) 2026 GoodData Corporation

import { type IDashboardTimezoneConfig, resolveTimezoneId } from "@gooddata/sdk-model";
import { getTimezoneLabels } from "@gooddata/sdk-ui-kit";

import { type IDashboardTimezoneInfo } from "./types.js";

/**
 * Resolves the dashboard timezone configuration to displayable timezone information: a concrete
 * IANA timezone ID, the friendly name and the UTC offset label.
 *
 * When `effectiveTimezoneId` is provided (the concrete IANA ID already preferred by the
 * dashboard — including any session-only view-mode override), it takes precedence. Otherwise
 * falls back to the configured timezone (resolving the browser-detected sentinel) and then to
 * the effective workspace/organization timezone.
 *
 * @alpha
 */
export function resolveDashboardTimezoneInfo(
    timezoneConfig: IDashboardTimezoneConfig | undefined,
    defaultTimezone?: string,
    effectiveTimezoneId?: string,
): IDashboardTimezoneInfo | undefined {
    const timezoneId =
        effectiveTimezoneId ?? resolveTimezoneId(timezoneConfig?.timezoneId) ?? defaultTimezone;
    if (!timezoneId) {
        return undefined;
    }

    const { name, offsetLabel } = getTimezoneLabels(timezoneId);
    return { timezoneId, name, offsetLabel };
}
