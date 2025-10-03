// (C) 2021-2025 GoodData Corporation

import { ISettings } from "@gooddata/sdk-model";

const FREE = "free";
const GROWTH = "growth";

/**
 * @internal
 */
export function shouldHidePPExperience(_featureFlags: ISettings): boolean {
    return true;
}

/**
 * @internal
 */
export function isFreemiumEdition(platformEdition: string | undefined): boolean {
    return platformEdition === FREE || platformEdition === GROWTH;
}

/**
 * @internal
 */
export function generateSupportUrl(projectId = "", sessionId = "", userEmail = "", url = ""): string {
    return [
        "https://support.gooddata.com/hc/en-us/requests/new",
        "?ticket_form_id=582387",
        `#sessionID=${encodeURIComponent(sessionId)}`,
        `&projectID=${encodeURIComponent(projectId)}`,
        `&email=${encodeURIComponent(userEmail)}`,
        `&url=${encodeURIComponent(url)}`,
    ].join("");
}
