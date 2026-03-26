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

import { type ICompletionItem, getCatalogItemId, getCompletionItemId, getOptions } from "./utils.js";
import { catalogItemsSelector } from "../../store/chatWindow/chatWindowSelectors.js";

const WORD_REGEX = /\p{L}[\p{L}\p{N}_]*/u;

export interface IUseCompletion {
    onCompletion: CompletionSource;
    used: MutableRefObject<(CatalogItem | ICatalogDateAttribute)[]>;
}

export function useCompletion(
    selected: CatalogItem[] | undefined,
    { canManage, canAnalyze }: { canManage?: boolean; canAnalyze?: boolean },
): IUseCompletion {
    const catalogItemsList = useSelector(catalogItemsSelector);
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
            // Match the word before the cursor
            const word = context.matchBefore(WORD_REGEX);

            const search = word?.text ?? "";
            const length = search.length >= 3;

            // Word and min length
            const isValidAutocomplete = word && length;
            if (!isValidAutocomplete) {
                return null;
            }

            const items = catalogItemsList;
            // If no items are found, do not show the completion
            if (items.length === 0) {
                return null;
            }

            const options = getOptions(intl, { items, search, onCompletionSelected, canManage, canAnalyze });
            // No options were found at all
            if (options.length === 0) {
                return null;
            }

            return {
                options,
                from: word?.from ?? context.pos,
                validFor: (text) => {
                    return !!options.find((opt) => opt.label.includes(text));
                },
            };
        },
        [catalogItemsList, intl, onCompletionSelected, canManage, canAnalyze],
    );

    const onExplicitCompletion = useCallback(
        async (context: CompletionContext): Promise<CompletionResult | null> => {
            // Match the word before the cursor
            const word = context.matchBefore(WORD_REGEX);
            const items = catalogItemsList;
            // If no items are found, do not show the completion
            if (!items) {
                return null;
            }

            const options = getOptions(intl, { items, onCompletionSelected, canManage, canAnalyze });
            // No options were found at all
            if (options.length === 0) {
                return null;
            }

            return {
                options,
                from: word?.from ?? context.pos,
                validFor: (text) => {
                    return !!options.find((opt) => opt.label.includes(text));
                },
            };
        },
        [catalogItemsList, intl, onCompletionSelected, canManage, canAnalyze],
    );

    const onCompletion = useCallback(
        async (context: CompletionContext): Promise<CompletionResult | null> => {
            if (context.explicit) {
                return onExplicitCompletion(context);
            } else {
                return onWordCompletion(context);
            }
        },
        [onWordCompletion, onExplicitCompletion],
    );

    return {
        onCompletion,
        used: usedItems,
    };
}
