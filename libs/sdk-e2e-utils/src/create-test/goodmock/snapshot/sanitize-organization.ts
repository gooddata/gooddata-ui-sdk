// (C) 2026 GoodData Corporation

import { type IGoodmockMapping } from "../types.js";

export const DEFAULT_TEMPLATE_ORGANIZATION = "automation";

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replace every ephemeral organization name (`ephemeral-{templateOrganization}-{hex}`) with the
 * bare template organization name, so re-recording against a freshly created org does not churn
 * the organization id, name, or `/entities/admin/organizations/...` paths in the saved mappings.
 *
 * The hex suffix is exactly 8 lowercase hex characters; the lookahead makes sure a longer hex run
 * is not partially consumed.
 */
export function sanitizeOrganization(
    mappings: IGoodmockMapping[],
    templateOrganization: string = DEFAULT_TEMPLATE_ORGANIZATION,
): IGoodmockMapping[] {
    const template = escapeRegExp(templateOrganization);
    const ephemeralOrganizationPattern = new RegExp(`ephemeral-${template}-[0-9a-f]{8}(?![0-9a-f])`, "g");

    const dataString = JSON.stringify({ mappings });
    const matches = dataString.match(ephemeralOrganizationPattern);

    if (!matches) {
        return mappings;
    }

    const sanitizedDataString = dataString.replace(ephemeralOrganizationPattern, templateOrganization);
    const sanitizedData = JSON.parse(sanitizedDataString) as { mappings: IGoodmockMapping[] };

    const distinctOrganizations = [...new Set(matches)].join(", ");
    // oxlint-disable-next-line eslint-js/no-console
    console.log(`Sanitized organization in mappings (${distinctOrganizations} -> ${templateOrganization})`);

    return sanitizedData.mappings;
}
