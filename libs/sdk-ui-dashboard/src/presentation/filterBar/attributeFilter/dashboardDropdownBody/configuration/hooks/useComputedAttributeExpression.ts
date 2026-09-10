// (C) 2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import { type IMeasureExpressionToken } from "@gooddata/sdk-backend-spi";
import { type ObjRef } from "@gooddata/sdk-model";

import {
    type IQueryComputedAttributeExpression,
    queryComputedAttributeExpression,
} from "../../../../../../model/queries/computedAttributeExpression.js";
import { useDashboardQueryProcessing } from "../../../../../../model/react/useDashboardQueryProcessing.js";

/**
 * Loads the tokenized MAQL expression of a computed attribute, with referenced objects resolved
 * to their titles. Fires only when `loadQuery` is true and the ref points at a computed attribute.
 *
 * @internal
 */
export function useComputedAttributeExpression(ref: ObjRef, loadQuery?: boolean) {
    const {
        run: getExpressionTokens,
        result: expressionTokens,
        status: expressionTokensLoadingStatus,
        error: expressionTokensLoadingError,
    } = useDashboardQueryProcessing<
        IQueryComputedAttributeExpression,
        IMeasureExpressionToken[],
        Parameters<typeof queryComputedAttributeExpression>
    >({
        queryCreator: queryComputedAttributeExpression,
    });

    useEffect(() => {
        if (loadQuery) {
            getExpressionTokens(ref);
        }
    }, [ref, loadQuery, getExpressionTokens]);

    const expressionTokensLoading = useMemo(() => {
        return expressionTokensLoadingStatus === "pending" || expressionTokensLoadingStatus === "running";
    }, [expressionTokensLoadingStatus]);

    return {
        expressionTokens,
        expressionTokensLoading,
        expressionTokensLoadingError,
    };
}
