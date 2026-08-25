// (C) 2026 GoodData Corporation

import { getAutomationTimezone } from "../../../../_staging/automation/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";

/**
 * Loads the timezone baked into the automation the dashboard is deep-linked to (the focus
 * object's `automationId`, as used by the links in alert and scheduled-export notifications).
 * Restoring it is what makes the dashboard match the numbers the recipient was mailed.
 * Undefined means the dashboard's own (or workspace/organization) timezone applies.
 */
export async function loadAutomationTimezone(ctx: DashboardContext): Promise<string | undefined> {
    const { automationId } = ctx.config?.focusObject ?? {};

    if (!automationId) {
        return undefined;
    }

    try {
        // the service getter itself throws on backends without automation support
        const automation = await ctx.backend
            .workspace(ctx.workspace)
            .automations()
            .getAutomation(automationId);
        return getAutomationTimezone(automation);
    } catch (error) {
        // a missing or inaccessible automation must not fail the dashboard load
        console.error("Loading of the automation timezone failed", error);
        return undefined;
    }
}
