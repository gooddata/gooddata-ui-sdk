// (C) 2007-2026 GoodData Corporation

import { type IntlShape, defineMessage } from "react-intl";

import { type IMeasureExpressionToken } from "@gooddata/sdk-backend-spi";
import { type ObjRef, isUriRef } from "@gooddata/sdk-model";

import { backend } from "../backend.js";
import { type IExpressionToken } from "../typings/catalog.js";

const EMPTY_VALUE = defineMessage({ id: "empty_value" }).id;
const DELETED_VALUE = defineMessage({ id: "deleted_value" }).id;

export async function getMeasureExpressionTokens(
    intl: IntlShape,
    projectId: string,
    ref: ObjRef,
): Promise<ReadonlyArray<IExpressionToken>> {
    const tokens = await backend.workspace(projectId).measures().getMeasureExpressionTokens(ref);

    return toDisplayTokens(intl, tokens);
}

/**
 * A computed attribute is a MAQL expression like a metric, so its definition is displayed the same
 * way: referenced objects resolved to their titles rather than raw `{type/id}` references.
 */
export async function getComputedAttributeExpressionTokens(
    intl: IntlShape,
    projectId: string,
    ref: ObjRef,
): Promise<ReadonlyArray<IExpressionToken>> {
    const tokens = await backend
        .workspace(projectId)
        .computedAttributes()
        .getComputedAttributeExpressionTokens(ref);

    return toDisplayTokens(intl, tokens);
}

function toDisplayTokens(
    intl: IntlShape,
    tokens: IMeasureExpressionToken[],
): ReadonlyArray<IExpressionToken> {
    return tokens.map((token) => {
        switch (token.type) {
            case "attributeElement":
                return {
                    title: token.deleted
                        ? `(${intl.formatMessage({ id: DELETED_VALUE })})`
                        : token.value || `(${intl.formatMessage({ id: EMPTY_VALUE })})`,
                    category: "attribute_element",
                };
            case "fact":
            case "attribute":
            case "dashboardPlugin":
            case "analyticalDashboard":
            case "displayForm":
            case "dataSet":
            case "filterContext":
            case "tag":
            case "measure":
            case "variable":
            case "insight":
                return {
                    title: token.value,
                    category: token.type,
                    uri: isUriRef(token.ref) ? token.ref.uri : undefined,
                    id: token.id,
                };
            default:
                return {
                    title: token.value,
                    category: "text",
                };
        }
    });
}
