// (C) 2026 GoodData Corporation

import {
    type IExecutionConfig,
    type IFilter,
    type IInsight,
    type IInsightWidget,
    type IRichTextWidget,
    type ISeparators,
    type ObjRef,
} from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { useTextParameters } from "../../model/react/useTextParameters.js";
import { selectSeparators } from "../../model/store/config/configSelectors.js";
import { selectRestrictedRichTextReferences } from "../../model/store/unavailableObjects/unavailableObjectsSelectors.js";

import { useRichTextWidgetFilters, useSectionDescriptionFilters } from "./useRichTextFilters.js";

/**
 * The props a dashboard rich text resolves its references with.
 *
 * @internal
 */
export interface IRichTextInputs {
    filters: IFilter[] | undefined;
    isExecutionInputLoading: boolean;
    execConfig: IExecutionConfig;
    separators: ISeparators;
    restrictedReferences: ObjRef[];
    parameterDisplayValues: ReadonlyMap<string, string> | undefined;
}

/**
 * @internal
 */
export function useRichTextWidgetInputs(
    widget: IRichTextWidget | IInsightWidget,
    content: string,
    insight?: IInsight,
): IRichTextInputs {
    return useRichTextInputs(content, useRichTextWidgetFilters(widget), { widgetRef: widget.ref, insight });
}

/**
 * @internal
 */
export function useSectionDescriptionInputs(content: string): IRichTextInputs {
    return useRichTextInputs(content, useSectionDescriptionFilters());
}

interface IRichTextInputsOptions {
    widgetRef?: ObjRef;
    insight?: IInsight;
}

/**
 * For a host that gets its filters from its parent. The filters are `undefined` while they load, and
 * the references wait for them.
 *
 * @internal
 */
export function useRichTextInputs(
    content: string,
    filters: IFilter[] | undefined,
    { widgetRef, insight }: IRichTextInputsOptions = {},
): IRichTextInputs {
    const separators = useDashboardSelector(selectSeparators);
    const restrictedReferences = useDashboardSelector(selectRestrictedRichTextReferences);
    const { execConfig, parameterDisplayValues, loading } = useTextParameters(content, widgetRef, insight);
    return {
        filters,
        isExecutionInputLoading: filters === undefined || loading,
        execConfig,
        separators,
        restrictedReferences,
        parameterDisplayValues,
    };
}
