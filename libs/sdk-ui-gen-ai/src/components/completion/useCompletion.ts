// (C) 2025-2026 GoodData Corporation

import { type MutableRefObject, useCallback, useRef } from "react";

import {
    type CompletionContext,
    type CompletionResult,
    type CompletionSource,
} from "@codemirror/autocomplete";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { type CatalogItem, type ICatalogDateAttribute } from "@gooddata/sdk-model";

import { catalogItemsSelector, tagsSelector } from "../../store/chatWindow/chatWindowSelectors.js";

import { type ICompletionItem, getCatalogItemId, getCompletionItemId, getOptions } from "./utils.js";

const TRIGGER_REGEX = /@[\p{L}\p{N}_]*/u;

export interface IUseCompletion {
    onCompletion: CompletionSource;
    used: MutableRefObject<(CatalogItem | ICatalogDateAttribute)[]>;
}

export function useCompletion(
    selected: CatalogItem[] | undefined,
    { canManage, canAnalyze }: { canManage?: boolean; canAnalyze?: boolean },
): IUseCompletion {
    const catalogItemsList = useSelector(catalogItemsSelector);
    const { includeTags, excludeTags } = useSelector(tagsSelector);

    const usedItems = useRef<(CatalogItem | ICatalogDateAttribute)[]>(selected ?? []);
    const intl = useIntl();

    const onCompletionSelected = useCallback((completion: ICompletionItem) => {
        usedItems.current = [
            ...usedItems.current.filter((item) => {
                return getCompletionItemId(completion) !== getCatalogItemId(item);
            }),
            completion.item,
        ];
    }, []);

    const onWordCompletion = useCallback(
        async (context: CompletionContext): Promise<CompletionResult | null> => {
            // Match the @ trigger before the cursor
            const trigger = context.matchBefore(TRIGGER_REGEX);

            // Trigger and min length
            if (!trigger) {
                return null;
            }

            const search = trigger?.text.substring(1) ?? "";
            const from = (trigger?.from ?? context.pos) + 1;

            const items = catalogItemsList;
            // If no items are found, do not show the completion
            if (items.length === 0) {
                return null;
            }

            const options = getOptions(intl, {
                items,
                search,
                onCompletionSelected,
                canManage,
                canAnalyze,
                includeTags,
                excludeTags,
            });
            // No options were found at all
            if (options.length === 0) {
                return null;
            }

            return {
                options,
                from,
                validFor: (text) => {
                    return !!options.find((opt) => opt.label.includes(text));
                },
            };
        },
        [catalogItemsList, intl, onCompletionSelected, canManage, canAnalyze, includeTags, excludeTags],
    );

    const onCompletion = useCallback(
        async (context: CompletionContext): Promise<CompletionResult | null> => {
            return onWordCompletion(context);
        },
        [onWordCompletion],
    );

    return {
        onCompletion,
        used: usedItems,
    };
}
