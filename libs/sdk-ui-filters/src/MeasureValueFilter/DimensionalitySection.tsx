// (C) 2025-2026 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import { type ObjRefInScope, objRefToString } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, UiButton, UiIconButton, UiTag } from "@gooddata/sdk-ui-kit";

import { AttributePicker } from "./AttributePicker.js";
import type { IDimensionalityItem } from "./typings.js";
import { WithAddButton, useDimensionalityEditor } from "./useDimensionalityEditor.js";

interface IDimensionalitySectionProps {
    /**
     * Current dimensionality items in the filter.
     */
    dimensionality: IDimensionalityItem[];
    /**
     * Insight default dimensionality items (from buckets).
     */
    insightDimensionality?: IDimensionalityItem[];
    /**
     * Catalog dimensionality items (from computeValidObjects).
     */
    catalogDimensionality?: IDimensionalityItem[];
    /**
     * Optional callback to load catalog dimensionality items lazily (e.g. on picker open).
     */
    loadCatalogDimensionality?: (dimensionality: ObjRefInScope[]) => Promise<IDimensionalityItem[]>;
    /**
     * Whether catalog dimensionality is currently being loaded.
     */
    isLoadingCatalogDimensionality?: boolean;
    /**
     * Callback when dimensionality changes.
     */
    onDimensionalityChange: (dimensionality: IDimensionalityItem[]) => void;
    /**
     * Indicates whether the filter is migrated from the old filter dialog (has no set dimensionality).
     * This is used to determine whether to show the backward compatibility note.
     */
    isMigratedFilter: boolean;
    /**
     * Wraps the pills in a bounded scroll container. Use when the section is rendered outside
     * a dialog-level scroll container (e.g. the dashboard filter configuration panel); the pills
     * list itself never scrolls, so without any scroll container the section grows unbounded.
     */
    withScrollContainer?: boolean;
}

/**
 * @internal
 * Dimensionality section for the measure value filter dropdown.
 * Allows users to select which attributes/dates define the granularity of the filter.
 */
export const DimensionalitySection = memo(function DimensionalitySection({
    dimensionality,
    insightDimensionality,
    catalogDimensionality,
    loadCatalogDimensionality,
    isLoadingCatalogDimensionality,
    onDimensionalityChange,
    isMigratedFilter,
    withScrollContainer = false,
}: IDimensionalitySectionProps) {
    const intl = useIntl();

    const {
        inlineAddButtonRef,
        isAttributePickerOpen,
        actualAnchor,
        shouldShowResetButton,
        availableInsightItems,
        availableCatalogItems,
        isLoadingCatalogForPicker,
        handleRemove: handleRemoveDimensionality,
        handleReset: handleResetDimensionality,
        handleOpenInlinePicker: handleOpenInlineAttributePicker,
        handleOpenStandalonePicker: handleOpenStandaloneAttributePicker,
        handleClosePicker: handleCloseAttributePicker,
        handleAddItems: handleAddDimensionalityItems,
    } = useDimensionalityEditor({
        items: dimensionality,
        insightItems: insightDimensionality,
        catalogItems: catalogDimensionality,
        loadCatalog: loadCatalogDimensionality,
        isLoadingCatalog: isLoadingCatalogDimensionality,
        onChange: onDimensionalityChange,
    });

    const addButtonTooltip = intl.formatMessage({ id: "mvf.dimensionality.addButton.tooltip" });
    const resetButtonTooltip = intl.formatMessage({
        id: "mvf.dimensionality.reset.tooltip",
    });

    const itemsList = (
        <div className="gd-mvf-dimensionality-items">
            {dimensionality.map((item, index) => {
                // Select icon and color based on item type: date items get date icon (blue)
                const isDateItem = item.type === "chronologicalDate" || item.type === "genericDate";
                const icon = isDateItem ? "date" : "ldmAttribute";
                const iconColor = isDateItem ? "primary" : "warning";

                return (
                    <WithAddButton
                        key={objRefToString(item.identifier)}
                        appendAddButton={index === dimensionality.length - 1}
                        isDisabled={false}
                        tooltip={addButtonTooltip}
                        buttonRef={inlineAddButtonRef}
                        onClick={handleOpenInlineAttributePicker}
                        dataTestId="mvf-dimensionality-plus"
                    >
                        <div className="gd-mvf-dimensionality-tag-wrapper">
                            <UiTag
                                variant="outlined"
                                size="large"
                                iconBefore={icon}
                                iconBeforeColor={iconColor}
                                label={item.title}
                                isDeletable
                                onDelete={() => handleRemoveDimensionality(index)}
                                dataTestId={`dimensionality-tag-${index}`}
                            />
                        </div>
                    </WithAddButton>
                );
            })}
            {shouldShowResetButton ? (
                <div className="gd-mvf-dimensionality-reset-button">
                    <BubbleHoverTrigger>
                        <UiIconButton
                            icon="history"
                            size="small"
                            variant="tertiary"
                            onClick={handleResetDimensionality}
                            label={resetButtonTooltip}
                            dataTestId="mvf-dimensionality-reset"
                        />
                        <Bubble alignPoints={[{ align: "cr cl" }]}>{resetButtonTooltip}</Bubble>
                    </BubbleHoverTrigger>
                </div>
            ) : null}
        </div>
    );

    return (
        <div
            className="gd-mvf-dropdown-section gd-mvf-dimensionality s-mvf-dimensionality"
            data-testid="mvf-dimensionality"
        >
            <div className="gd-mvf-dimensionality-header">
                <label>{intl.formatMessage({ id: "mvf.dimensionality.forEach" })}</label>
            </div>
            {dimensionality.length > 0 ? (
                withScrollContainer ? (
                    <div className="gd-mvf-dimensionality-scroll-container">{itemsList}</div>
                ) : (
                    itemsList
                )
            ) : (
                <div className="gd-mvf-dimensionality-empty-actions">
                    <UiButton
                        label={intl.formatMessage({ id: "mvf.dimensionality.addAttributes" })}
                        variant="tertiary"
                        size="small"
                        iconBefore="plus"
                        onClick={handleOpenStandaloneAttributePicker}
                    />
                    {shouldShowResetButton ? (
                        <BubbleHoverTrigger>
                            <UiButton
                                size="small"
                                variant="tertiary"
                                iconBefore="history"
                                label={intl.formatMessage({ id: "mvf.dimensionality.reset" })}
                                onClick={handleResetDimensionality}
                                dataTestId="mvf-dimensionality-reset"
                            />
                            <Bubble alignPoints={[{ align: "cr cl" }]}>{resetButtonTooltip}</Bubble>
                        </BubbleHoverTrigger>
                    ) : null}
                </div>
            )}
            {isMigratedFilter ? null : (
                <div
                    role="status"
                    aria-live="polite"
                    className="gd-message information gd-mvf-backward-compatibility-message"
                    data-testid="mvf-backward-compatibility-note"
                >
                    <div className="gd-message-text">
                        {intl.formatMessage({ id: "mvf.dimensionality.backwardCompatibilityNote" })}
                    </div>
                </div>
            )}
            {isAttributePickerOpen && actualAnchor ? (
                <AttributePicker
                    anchorElement={actualAnchor}
                    onAdd={handleAddDimensionalityItems}
                    onCancel={handleCloseAttributePicker}
                    availableInsightItems={availableInsightItems}
                    availableCatalogItems={availableCatalogItems}
                    isLoadingCatalogDimensionality={isLoadingCatalogForPicker}
                />
            ) : null}
        </div>
    );
});
