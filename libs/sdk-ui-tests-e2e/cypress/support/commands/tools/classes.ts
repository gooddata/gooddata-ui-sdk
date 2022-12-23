// (C) 2021 GoodData Corporation
import { stringUtils } from "@gooddata/util";

export function getTestClassByTitle(title: string, prefix = ""): string {
    return `.s-${prefix}${stringUtils.simplifyText(title)}`;
}
