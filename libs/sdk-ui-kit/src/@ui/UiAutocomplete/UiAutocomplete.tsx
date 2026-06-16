// (C) 2026 GoodData Corporation

import { Fragment, type KeyboardEvent, useCallback, useId, useMemo } from "react";

import { useIntl } from "react-intl";

import { uiAutocompleteMessages } from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { makeKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import type { IUiComboboxOption, IUiComboboxState } from "../UiCombobox/types.js";
import { UiComboboxContextProvider } from "../UiCombobox/UiComboboxContext.js";
import { UiComboboxInput } from "../UiCombobox/UiComboboxInput.js";
import { UiComboboxListItem } from "../UiCombobox/UiComboboxListItem.js";
import { UiComboboxPopup } from "../UiCombobox/UiComboboxPopup.js";
import { useComboboxChrome } from "../UiCombobox/useComboboxChrome.js";
import { UiSectionHeading } from "../UiSectionHeading/UiSectionHeading.js";

import type { IUiAutocompleteOption, IUiAutocompleteProps, IUiAutocompleteSection } from "./types.js";
import { useAsyncListSource } from "./useAsyncListSource.js";

const { b, e } = bem("gd-ui-kit-autocomplete");

const DEFAULT_DEBOUNCE_MS = 400;

// Per-instance, per-generation synthetic id for the Load-more row; activating
// it triggers a page fetch instead of `onSelect`. `listboxId` keeps it unique
// across autocompletes on one page; `generation` makes it differ once the
// query reloads, so a stale highlight can't carry onto the next query's row.
const loadMoreId = (listboxId: string, generation: number) => `${listboxId}-load-more-${generation}`;

// Stable default so an omitted `selectedIds` doesn't feed a fresh array into the
// memo deps every render.
const NO_SELECTED_IDS: ReadonlyArray<string> = [];

// Mirrors `useCombobox`'s key map. Space, Home and End are left to the input
// so the user can edit the query text natively.
const autocompleteKeys = makeKeyboardNavigation<{
    onArrowDown: Array<{ code: string }>;
    onArrowUp: Array<{ code: string }>;
    onEnter: Array<{ code: string[] }>;
    onEscape: Array<{ code: string }>;
}>({
    onArrowDown: [{ code: "ArrowDown" }],
    onArrowUp: [{ code: "ArrowUp" }],
    onEnter: [{ code: ["Enter", "NumpadEnter"] }],
    onEscape: [{ code: "Escape" }],
});

/**
 * Async autocomplete: text input + sectioned listbox driven by a `loadOptions`
 * loader. Implements the ARIA combobox+listbox APG pattern.
 *
 * @internal
 */
export function UiAutocomplete<T extends IUiAutocompleteOption = IUiAutocompleteOption>({
    loadOptions,
    selectedIds = NO_SELECTED_IDS,
    onSelect,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    messages,
    accessibilityConfig,
    dataTestId,
}: IUiAutocompleteProps<T>) {
    const intl = useIntl();
    const listboxId = useId();

    const copy = useMemo(
        () => ({
            searchPlaceholder:
                messages?.searchPlaceholder ?? intl.formatMessage(uiAutocompleteMessages.searchPlaceholder),
            stateLoading: messages?.stateLoading ?? intl.formatMessage(uiAutocompleteMessages.stateLoading),
            stateError: messages?.stateError ?? intl.formatMessage(uiAutocompleteMessages.stateError),
            stateNoMatch: messages?.stateNoMatch ?? intl.formatMessage(uiAutocompleteMessages.stateNoMatch),
            loadMore: messages?.loadMore ?? intl.formatMessage(uiAutocompleteMessages.loadMore),
        }),
        [intl, messages],
    );

    const source = useAsyncListSource<T>(loadOptions, { debounceMs });

    // The Load-more row's id is stamped with the load generation, so a highlight
    // left on it before a query change can't re-attach to the next query's row
    // (a constant id would survive and let Enter page the wrong query — the
    // synthetic row is the one id the by-id highlight tracking can't otherwise
    // tell apart across queries, since real options carry distinct ids).
    const loadMoreRowId = loadMoreId(listboxId, source.generation);

    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    // Flat list of the rows the highlight can land on. Section headings and
    // status rows render around it but never participate.
    const focusableOptions = useMemo<IUiComboboxOption[]>(() => {
        const options: IUiComboboxOption[] = [];
        for (const section of source.sections) {
            for (const option of section.options) {
                if (selectedIdSet.has(option.id)) {
                    continue;
                }
                options.push({ id: option.id, label: option.label });
            }
        }
        if (source.hasNextPage && source.status !== "loadingMore") {
            options.push({ id: loadMoreRowId, label: copy.loadMore });
        }
        return options;
    }, [source.sections, source.hasNextPage, source.status, selectedIdSet, copy.loadMore, loadMoreRowId]);

    // Chrome tracks the highlight by row id, so a row that disappears (results
    // change, Load-more row removed while its page loads) drops the highlight
    // on its own — no manual resets to keep in sync.
    const chrome = useComboboxChrome(focusableOptions);

    const activeOptionData = useMemo<T | "loadMore" | undefined>(() => {
        if (!chrome.activeOption) {
            return undefined;
        }
        if (chrome.activeOption.id === loadMoreRowId) {
            return "loadMore";
        }
        return findOptionById(source.sections, chrome.activeOption.id);
    }, [chrome.activeOption, source.sections, loadMoreRowId]);

    const handleSelect = useCallback(
        (target: T | "loadMore") => {
            if (target === "loadMore") {
                // Drop the highlight while the next page loads: the Load-more row
                // disappears, and a real option highlighted beforehand (e.g. clicked
                // Load-more without hovering it first) must not stay Enter-armed.
                chrome.setActiveIndex(null);
                source.loadMore();
                return;
            }
            onSelect(target);
            // Clear the input + re-prime the loader so the next open shows the
            // unfiltered first page rather than the previous query's results.
            source.reset();
            chrome.setIsOpen(false);
        },
        [chrome, source, onSelect],
    );

    // Reopening after a failed load re-runs it, so every open path (click, type,
    // and the keyboard arrows below) routes through this first to recover.
    const retryIfErrored = useCallback(() => {
        if (!chrome.isOpen && source.status === "error") {
            source.retry();
        }
    }, [chrome.isOpen, source]);

    const onInputKeyDown = useMemo(() => {
        const onEnter = chrome.isOpen && activeOptionData ? () => handleSelect(activeOptionData) : undefined;

        // Leave Escape unhandled when idle so an enclosing modal can dismiss.
        const hasSomethingToClose = chrome.isOpen || source.inputValue.length > 0;
        const onEscape = hasSomethingToClose
            ? (event: KeyboardEvent<HTMLInputElement>) => {
                  // Stop the native event too so an enclosing UiModalDialog's
                  // document Escape listener doesn't dismiss the whole dialog.
                  event.nativeEvent.stopPropagation();
                  if (chrome.isOpen) {
                      chrome.setIsOpen(false);
                      return;
                  }
                  source.reset();
              }
            : undefined;

        return autocompleteKeys<KeyboardEvent<HTMLInputElement>>({
            onArrowDown: () => {
                retryIfErrored();
                chrome.focusByDelta(1);
            },
            onArrowUp: () => {
                retryIfErrored();
                chrome.focusByDelta(-1);
            },
            onEnter,
            onEscape,
        });
    }, [chrome, source, activeOptionData, handleSelect, retryIfErrored]);

    const selectOptionFromContext = useCallback(
        (option: IUiComboboxOption) => {
            if (option.id === loadMoreRowId) {
                handleSelect("loadMore");
                return;
            }
            const resolved = findOptionById(source.sections, option.id);
            if (resolved) {
                handleSelect(resolved);
            }
        },
        [handleSelect, source.sections, loadMoreRowId],
    );

    // Stay visible across loading / error / no-match so the status row reaches
    // the user; the sync combobox's "hide when empty" default does not apply here.
    const shouldRenderPopup = chrome.isOpen;

    const setIsOpen = useCallback(
        (open: boolean) => {
            if (open) {
                retryIfErrored();
            }
            chrome.setIsOpen(open);
        },
        [chrome, retryIfErrored],
    );

    const state = useMemo<IUiComboboxState>(
        () => ({
            inputValue: source.inputValue,
            onInputChange: (next: string) => {
                source.setInputValue(next);
                setIsOpen(true);
            },
            onInputKeyDown,
            onInputBlur: () => chrome.setIsOpen(false),

            availableOptions: focusableOptions,
            activeIndex: chrome.activeIndex,
            setActiveIndex: chrome.setActiveIndex,
            activeOption: chrome.activeOption,
            selectedOption: undefined,
            selectOption: selectOptionFromContext,

            isOpen: chrome.isOpen,
            setIsOpen,
            shouldRenderPopup,
            anchorRef: chrome.anchorRef,
            registerItemRef: chrome.registerItemRef,

            creatable: false,
            listboxId,
        }),
        [
            chrome,
            source,
            setIsOpen,
            focusableOptions,
            shouldRenderPopup,
            onInputKeyDown,
            selectOptionFromContext,
            listboxId,
        ],
    );

    const visibleSections = source.sections
        .map((section) => ({
            ...section,
            options: section.options.filter((o) => !selectedIdSet.has(o.id)),
        }))
        .filter((section) => section.options.length > 0);

    // "No matching options" must mean the search found nothing — not that every
    // match was hidden because it's already selected (a successful search). Key
    // it off the loader's own result, before the selected-id filter.
    const loaderReturnedNothing = source.sections.every((section) => section.options.length === 0);
    const showEmptyState = source.status === "idle" && loaderReturnedNothing && !source.hasNextPage;

    return (
        <div className={b()} data-testid={dataTestId}>
            <UiComboboxContextProvider state={state}>
                <UiComboboxInput
                    placeholder={copy.searchPlaceholder}
                    accessibilityConfig={accessibilityConfig}
                />
                <UiComboboxPopup>
                    <ul className={e("list")} role="listbox" id={listboxId} tabIndex={-1}>
                        {source.status === "loading" ? <StatusRow text={copy.stateLoading} /> : null}
                        {source.status === "error" ? <StatusRow text={copy.stateError} /> : null}
                        {visibleSections.length > 0 ? (
                            <Sections sections={visibleSections} focusableOptions={focusableOptions} />
                        ) : null}
                        {source.hasNextPage && source.status !== "loadingMore" ? (
                            <LoadMoreRow
                                id={loadMoreRowId}
                                index={focusableOptions.findIndex((o) => o.id === loadMoreRowId)}
                                label={copy.loadMore}
                            />
                        ) : null}
                        {source.status === "loadingMore" ? <StatusRow text={copy.stateLoading} /> : null}
                        {showEmptyState ? <StatusRow text={copy.stateNoMatch} /> : null}
                    </ul>
                </UiComboboxPopup>
            </UiComboboxContextProvider>
        </div>
    );
}

// `index` on each item must be its position in `focusableOptions` — chrome's
// active-index navigation and item-ref registry are keyed off that.
function Sections<T extends IUiAutocompleteOption>({
    sections,
    focusableOptions,
}: {
    sections: IUiAutocompleteSection<T>[];
    focusableOptions: IUiComboboxOption[];
}) {
    return sections.map((section) => (
        <Fragment key={section.id}>
            <li role="presentation" className={e("section-header")}>
                <UiSectionHeading label={section.label} />
            </li>
            {section.options.map((option) => {
                const index = focusableOptions.findIndex((o) => o.id === option.id);
                if (index < 0) {
                    return null;
                }
                return (
                    <UiComboboxListItem
                        key={option.id}
                        option={{ id: option.id, label: option.label }}
                        index={index}
                        className={e("option")}
                    >
                        <span className={e("option-label")}>{option.label}</span>
                        {option.secondaryText ? (
                            <span className={e("option-secondary")}>{option.secondaryText}</span>
                        ) : null}
                    </UiComboboxListItem>
                );
            })}
        </Fragment>
    ));
}

function StatusRow({ text }: { text: string }) {
    return (
        <li role="presentation" className={e("state")}>
            {text}
        </li>
    );
}

function LoadMoreRow({ id, index, label }: { id: string; index: number; label: string }) {
    return (
        <UiComboboxListItem option={{ id, label }} index={index} className={e("load-more")}>
            <span>{label}</span>
        </UiComboboxListItem>
    );
}

function findOptionById<T extends IUiAutocompleteOption>(
    sections: { id: string; label: string; options: T[] }[],
    id: string,
): T | undefined {
    for (const section of sections) {
        const found = section.options.find((o) => o.id === id);
        if (found) {
            return found;
        }
    }
    return undefined;
}
