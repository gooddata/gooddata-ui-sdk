// (C) 2021-2026 GoodData Corporation

import { _compact } from "@gooddata/util";

export function getTitleWithBreadcrumbs(insightTitle: string, breadcrumbs: string[]): string {
    const separator = "\u203A";
    const paddedSeparator = ` ${separator} `;

    return _compact([insightTitle, ...breadcrumbs]).join(paddedSeparator);
}
