// (C) 2007-2022 GoodData Corporation
import { stringUtils } from "@gooddata/util";

export function getTestClassname(title: string): string {
    return `s-${stringUtils.simplifyText(title)}`;
}
