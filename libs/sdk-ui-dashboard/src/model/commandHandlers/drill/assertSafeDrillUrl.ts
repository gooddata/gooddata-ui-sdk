// (C) 2026 GoodData Corporation

import { BLANK_URL, sanitizeUrl } from "@braintree/sanitize-url";

import { type IDrillToAttributeUrl, type IDrillToCustomUrl } from "../../commands/drill.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function assertSafeDrillUrl(
    ctx: DashboardContext,
    cmd: IDrillToCustomUrl | IDrillToAttributeUrl,
    url: string | null | undefined,
): asserts url is string {
    if (!url || sanitizeUrl(url) === BLANK_URL) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            "Drill to URL resolved to an empty URL or to a URL that can run script.",
        );
    }
}
