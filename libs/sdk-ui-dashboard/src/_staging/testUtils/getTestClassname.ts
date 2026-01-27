// (C) 2007-2026 GoodData Corporation

import { simplifyText } from "@gooddata/util";

export function getTestClassname(title: string): string {
    return `s-${simplifyText(title)}`;
}
