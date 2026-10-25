// (C) 2007-2026 GoodData Corporation

import { simplifyText } from "@gooddata/util";

export function getCssClass(value: string, prefix = ""): string {
    return prefix + simplifyText(value);
}
