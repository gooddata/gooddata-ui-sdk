// (C) 2026 GoodData Corporation

import { type IDashboardTimezoneConfig, resolveTimezoneId } from "@gooddata/sdk-model";
import { getTimezoneLabels } from "@gooddata/sdk-ui-kit";

import { type IDashboardTimezoneInfo } from "./types.js";

/**
 * Resolves the dashboard timezone configuration to displayable timezone information: a concrete
 * IANA timezone ID, the friendly name and the UTC offset label.
 *
 * Falls back to the effective workspace/organization timezone when the timezone is not explicitly
 * configured.
 *
 * @alpha
 */
export function resolveDashboardTimezoneInfo(
    timezoneConfig: IDashboardTimezoneConfig | undefined,
    defaultTimezone?: string,
): IDashboardTimezoneInfo | undefined {
    const timezoneId = resolveTimezoneId(timezoneConfig?.timezoneId) ?? defaultTimezone;
    if (!timezoneId) {
        return undefined;
    }

    const { name, offsetLabel } = getTimezoneLabels(timezoneId);
    return { timezoneId, name, offsetLabel };
}
