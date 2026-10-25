// (C) 2007-2026 GoodData Corporation

import { parse as queryStringParse } from "query-string";

export interface IHashFragments {
    reportId: string;
    forceReload?: boolean;
    query?: {
        dataset?: string;
        includeObjectsWithTags?: string;
        excludeObjectsWithTags?: string;
        hideControl?: string;
        sourceDashboard?: string;
        sourceInsight?: string;
        hideAction?: string;
        displayAction?: string;
        allowDashboardLinks?: string;
        isEmbeddedFromKD?: string;
        showEmbedButton?: string;
        apiTokenAuthentication?: string;
        externalProviderId?: string;
        /**
         * Declared here because the route selectors read them off `route.params.query`, and
         * `parseQuery` returns whatever the hash carries.
         */
        explainType?: string;
        asOfDate?: string;
        thousandSeparator?: string;
        decimalSeparator?: string;
    };
    explainRequested?: boolean;
}

function safeMatch(regExp: RegExp, group = 1) {
    return (str: string) => {
        return (str.match(regExp) || [])[group];
    };
}

function extract(str: string) {
    const queryStart = str.indexOf("?");
    if (queryStart === -1) {
        return "";
    }
    return str.slice(queryStart + 1);
}

function parseQuery(hash: string) {
    const queryPart = extract(hash);
    return queryStringParse(queryPart);
}

// The hash carries no workspace prefix (the host owns the workspace in the pathname), so the
// reportId is the first segment.
const extractors = {
    reportId: safeMatch(/#\/([^/?]+)/),
    debugAfm: safeMatch(/#\/([^/?]+)\/debug/),
    forceReload: (str: string) => /#(?:\/[^/]+)+\/reload(?:\W|$)/.test(str),
};

export function parseHash(hash: string): IHashFragments {
    return {
        reportId: extractors.reportId(hash),
        forceReload: extractors.forceReload(hash),
        query: parseQuery(hash),
        explainRequested: extractors.debugAfm(hash) !== undefined,
    };
}
