// (C) 2026 GoodData Corporation

import { type IGoodmockMapping, type IWorkspaceIdMapping } from "../types.js";

function sanitizeWorkspaceId(
    mappings: IGoodmockMapping[],
    sourceWorkspaceId: string,
    targetWorkspaceId: string,
): IGoodmockMapping[] {
    if (sourceWorkspaceId === targetWorkspaceId) {
        return mappings;
    }

    const dataString = JSON.stringify({ mappings });
    const sanitizedDataString = dataString.split(sourceWorkspaceId).join(targetWorkspaceId);
    const sanitizedData = JSON.parse(sanitizedDataString) as { mappings: IGoodmockMapping[] };

    // oxlint-disable-next-line eslint-js/no-console
    console.log(`Sanitized workspaceId in mappings (${sourceWorkspaceId} -> ${targetWorkspaceId})`);

    return sanitizedData.mappings;
}

/** Apply every source/target workspace ID rewrite, in order. */
export function sanitizeWorkspaceIds(
    mappings: IGoodmockMapping[],
    workspaceIdMappings: IWorkspaceIdMapping | IWorkspaceIdMapping[] | undefined,
): IGoodmockMapping[] {
    const mappingsToApply = Array.isArray(workspaceIdMappings)
        ? workspaceIdMappings
        : workspaceIdMappings
          ? [workspaceIdMappings]
          : [];
    return mappingsToApply.reduce(
        (acc, { sourceWorkspaceId, targetWorkspaceId }) =>
            sanitizeWorkspaceId(acc, sourceWorkspaceId, targetWorkspaceId),
        mappings,
    );
}
