// (C) 2021-2022 GoodData Corporation
import { ISettings } from "@gooddata/sdk-model";

const FREE = "free";
const GROWTH = "growth";

/**
 * @internal
 */

export function shouldHidePPExperience(featureFlags: ISettings): boolean {
    const hidePPExperience = Boolean(featureFlags.hidePixelPerfectExperience);
    const enablePPExperience = featureFlags.enablePixelPerfectExperience;
    const isFreemiumUser = isFreemiumEdition(featureFlags.platformEdition);

    return hidePPExperience || (isFreemiumUser && !enablePPExperience);
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

/**
 * @internal
 */

export function shouldEnableNewNavigation(featureFlags: ISettings): boolean {
    const enableNewNavigationForResponsiveUi = Boolean(featureFlags.enableNewNavigationForResponsiveUi);
    if (enableNewNavigationForResponsiveUi) {
        const platformEdition = featureFlags.platformEdition;

        // Free: always true
        if (platformEdition === FREE) {
            return true;
        }

        // Growth/Enterprise: with PP: false, without PP: On demand
        return shouldHidePPExperience(featureFlags);
    }

    return false;
}
