// (C) 2025 GoodData Corporation
import { MutableRefObject, useCallback, useRef, useState } from "react";

import { CompletionContext, CompletionResult, CompletionSource } from "@codemirror/autocomplete";
import { useIntl } from "react-intl";

import { IWorkspaceCatalog } from "@gooddata/sdk-backend-spi";
import { CatalogItem, ICatalogDateAttribute } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { CompletionItem, getCatalogItemId, getCompletionItemId, getOptions } from "./utils.js";

const WORD_REGEX = /\p{L}[\p{L}\p{N}_]*/u;

export interface IUseCompletion {
    onCompletion: CompletionSource;
    used: MutableRefObject<(CatalogItem | ICatalogDateAttribute)[]>;
}

export function useCompletion(
    items: CatalogItem[] | undefined,
    selected: CatalogItem[] | undefined,
    { canManage, canAnalyze }: { canManage?: boolean; canAnalyze?: boolean },
): IUseCompletion {
    const [catalogItems, setCatalogItems] = useState<CatalogItem[] | undefined>(items);
    const usedItems = useRef<(CatalogItem | ICatalogDateAttribute)[]>(selected ?? []);
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const intl = useIntl();

    const searchRef = useRef<string>("");
    const promiseSearchRef = useRef<{
        promise: Promise<IWorkspaceCatalog>;
        abort: AbortController;
    } | null>(null);
    const promiseAllRef = useRef<{
        promise: Promise<IWorkspaceCatalog>;
    } | null>(null);

    const onCompletionSelected = useCallback((completion: CompletionItem) => {
        usedItems.current = [
            ...usedItems.current.filter((item) => {
                return getCompletionItemId(completion) !== getCatalogItemId(item);
            }),
            completion.item,
        ];
    }, []);

    const loadItemsBySearch = useCallback(
        async (search: string) => {
            // If catalog items are provided, do not do any call
            if (catalogItems) {
                return catalogItems;
            }

            // If catalog items are not provided, do a call and all caching stuff
            const starts = search.startsWith(searchRef.current) && searchRef.current.length > 0;

            // If the search term starts with the previous search term, do not trigger a new search, we can do in on client side
            if (starts && promiseSearchRef.current) {
                const catalog = await promiseSearchRef.current.promise;
                return catalog.allItems();
            }

            // If the search term is different, reset the promise
            if (!starts) {
                promiseSearchRef.current?.abort.abort();
                promiseSearchRef.current = null;
            }

            // Create a new search call
            if (!promiseSearchRef.current) {
                searchRef.current = search;
                const abort = new AbortController();
                promiseSearchRef.current = {
                    abort,
                    promise: backend
                        .workspace(workspace)
                        .catalog()
                        .withOptions({
                            search,
                        })
                        .withSignal(abort.signal)
                        .load(),
                };
            }

            const catalog = await promiseSearchRef.current.promise;
            return catalog.allItems();
        },
        [backend, workspace, catalogItems],
    );

    const loadItemsByExplicit = useCallback(async () => {
        // If catalog items are provided, do not do any call
        if (catalogItems) {
            return catalogItems;
        }

        // If catalog is already loading, do not trigger a new call
        if (promiseAllRef.current) {
            const catalog = await promiseAllRef.current.promise;
            return catalog.allItems();
        }

        const promise = backend.workspace(workspace).catalog().load();
        promiseAllRef.current = {
            promise,
        };

        const catalog = await promise;
        const items = catalog.allItems();
        setCatalogItems(items);
        return items;
    }, [backend, workspace, catalogItems]);

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

            const items = await loadItemsBySearch(search);
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
        [loadItemsBySearch, intl, onCompletionSelected, canManage, canAnalyze],
    );

    const onExplicitCompletion = useCallback(
        async (context: CompletionContext): Promise<CompletionResult | null> => {
            // Match the word before the cursor
            const word = context.matchBefore(WORD_REGEX);

            const items = await loadItemsByExplicit();
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
        [loadItemsByExplicit, intl, onCompletionSelected, canManage, canAnalyze],
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
