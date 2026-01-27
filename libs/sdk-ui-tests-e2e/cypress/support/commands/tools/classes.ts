// (C) 2021-2026 GoodData Corporation

import { simplifyText } from "@gooddata/util";

export function getTestClassByTitle(title: string, prefix = ""): string {
    return `.s-${prefix}${simplifyText(title)}`;
}
