// (C) 2026 GoodData Corporation

import { type ObjRef, idRef, uriRef } from "@gooddata/sdk-model";

export function getInsightRef(projectId: string, reportIdentifierOrId: string): ObjRef {
    const isObjectIdIdentifier = /^\d+$/.test(reportIdentifierOrId);

    // The bear URIs can be constructed only from strictly numeric ids (objectIds)
    // otherwise, use the value as an ID as is
    return isObjectIdIdentifier
        ? uriRef(`/gdc/md/${projectId}/obj/${reportIdentifierOrId}`)
        : idRef(reportIdentifierOrId);
}
