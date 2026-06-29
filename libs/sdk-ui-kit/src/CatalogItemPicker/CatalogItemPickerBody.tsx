// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type ReactNode } from "react";

import { bem } from "../@ui/@utils/bem.js";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner.js";

import {
    CatalogItemPickerFooter,
    CatalogItemPickerList,
    CatalogItemPickerSearch,
    CatalogItemPickerTabs,
} from "./CatalogItemPickerParts.js";
import { testIds } from "./messages.js";
import { type CatalogItemPickerController } from "./useCatalogItemPicker.js";

const { b, e } = bem("gd-ui-kit-catalog-item-picker");

/**
 * @internal
 */
export interface ICatalogItemPickerBodyProps {
    controller: CatalogItemPickerController;
    maxListHeight?: number;
    onClose: () => void;
    /**
     * Optional header slot rendered above the search + list. The full {@link CatalogItemPicker} passes
     * its header here; header-less usages (e.g. the ranking filter measure dropdown) omit it.
     */
    header?: ReactNode;
}

/**
 * The reusable inner part of the catalog item picker: the picker root, an optional header slot, search,
 * optional type tabs, the grouped list and (in multi-select mode) the footer. Driven by a
 * {@link useCatalogItemPicker} controller so it can be reused outside the full {@link CatalogItemPicker}
 * — e.g. embedded in the ranking filter measure dropdown, which provides its own anchor button instead
 * of the picker header.
 *
 * @internal
 */
export function CatalogItemPickerBody({
    controller,
    maxListHeight,
    onClose,
    header,
}: ICatalogItemPickerBodyProps) {
    const {
        variant,
        selectionMode,
        isLoading,
        searchString,
        handleSearchChange,
        handleSearchEscKeyPress,
        labels,
        showTabs,
        resolvedItemTypes,
        effectiveType,
        handleTabChange,
        listboxItems,
        isMultiSelect,
        listboxId,
        shouldShowEmptyStateMessage,
        emptyMessage,
        handleListboxSelect,
        isAddDisabled,
        handleAdd,
    } = controller;

    return (
        <div className={b({ variant, selectionMode })} data-testid={testIds.root}>
            {header}
            <div className={e("content", { variant })}>
                {isLoading ? (
                    <div className={e("loading", { variant })}>
                        <LoadingSpinner className="small" />
                    </div>
                ) : (
                    <>
                        <CatalogItemPickerSearch
                            variant={variant}
                            value={searchString}
                            onChange={handleSearchChange}
                            onEscKeyPress={handleSearchEscKeyPress as (e: KeyboardEvent) => void}
                            placeholder={labels.searchPlaceholder}
                            ariaLabel={labels.searchAriaLabel}
                        />
                        {showTabs ? (
                            <CatalogItemPickerTabs
                                variant={variant}
                                itemTypes={resolvedItemTypes}
                                effectiveType={effectiveType}
                                onChange={handleTabChange}
                                getAriaLabel={(type) => labels.tabLabels?.[type] ?? labels.title}
                            />
                        ) : null}
                        <CatalogItemPickerList
                            variant={variant}
                            listboxItems={listboxItems}
                            isMultiSelect={isMultiSelect}
                            maxListHeight={maxListHeight}
                            listboxId={listboxId}
                            ariaLabel={labels.title}
                            shouldShowEmptyStateMessage={shouldShowEmptyStateMessage}
                            emptyMessage={emptyMessage}
                            onSelect={handleListboxSelect}
                        />
                    </>
                )}
            </div>
            {isMultiSelect ? (
                <CatalogItemPickerFooter
                    variant={variant}
                    isAddDisabled={isAddDisabled}
                    onClose={onClose}
                    onAdd={handleAdd}
                    cancelLabel={labels.cancelLabel}
                    addLabel={labels.addLabel ?? ""}
                    addTooltip={labels.addTooltip}
                />
            ) : null}
        </div>
    );
}
