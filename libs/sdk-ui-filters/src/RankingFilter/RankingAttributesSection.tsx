// (C) 2025-2026 GoodData Corporation

import { memo } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { type ObjRefInScope, objRefToString } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, UiButton, UiIconButton, UiTag } from "@gooddata/sdk-ui-kit";

import { AttributePicker } from "../MeasureValueFilter/AttributePicker.js";
import type { IDimensionalityItem } from "../MeasureValueFilter/typings.js";
import { WithAddButton, useDimensionalityEditor } from "../MeasureValueFilter/useDimensionalityEditor.js";

/**
 * @internal
 */
export interface IRankingAttributesSectionProps {
    /**
     * Current "out of" attribute items in the filter.
     */
    attributes: IDimensionalityItem[];
    /**
     * Insight default attribute items (from buckets).
     */
    insightAttributes?: IDimensionalityItem[];
    /**
     * Catalog attribute items (from computeValidObjects).
     */
    catalogAttributes?: IDimensionalityItem[];
    /**
     * Optional callback to load catalog attribute items lazily (e.g. on picker open).
     */
    loadCatalogAttributes?: (attributes: ObjRefInScope[]) => Promise<IDimensionalityItem[]>;
    /**
     * Whether catalog attributes are currently being loaded.
     */
    isLoadingCatalogAttributes?: boolean;
    /**
     * Callback when the "out of" attributes change.
     */
    onAttributesChange: (attributes: IDimensionalityItem[]) => void;
    /**
     * Whether the filter already has its own "out of" attributes (or the insight has none). When false, the
     * ranking currently follows the visualization's attributes and an informational note is shown - mirroring
     * the measure value filter dimensionality. Defaults to true (no note).
     */
    isMigratedFilter?: boolean;
}

/**
 * @internal
 * "Out of" attributes section for the ranking filter dropdown. Allows users to rank "out of" the insight's
 * own attributes (default) or custom attributes picked from the catalog, with a reset to defaults.
 */
export const RankingAttributesSection = memo(function RankingAttributesSection({
    attributes,
    insightAttributes,
    catalogAttributes,
    loadCatalogAttributes,
    isLoadingCatalogAttributes,
    onAttributesChange,
    isMigratedFilter = true,
}: IRankingAttributesSectionProps) {
    const intl = useIntl();

    const {
        inlineAddButtonRef,
        isAttributePickerOpen,
        actualAnchor,
        shouldShowResetButton,
        availableInsightItems,
        availableCatalogItems,
        isLoadingCatalogForPicker,
        handleRemove: handleRemoveAttribute,
        handleReset: handleResetAttributes,
        handleOpenInlinePicker: handleOpenInlineAttributePicker,
        handleOpenStandalonePicker: handleOpenStandaloneAttributePicker,
        handleClosePicker: handleCloseAttributePicker,
        handleAddItems: handleAddAttributeItems,
    } = useDimensionalityEditor({
        items: attributes,
        insightItems: insightAttributes,
        catalogItems: catalogAttributes,
        loadCatalog: loadCatalogAttributes,
        isLoadingCatalog: isLoadingCatalogAttributes,
        onChange: onAttributesChange,
    });

    const addButtonTooltip = intl.formatMessage({ id: "mvf.dimensionality.addButton.tooltip" });
    const resetButtonTooltip = intl.formatMessage({ id: "mvf.dimensionality.reset.tooltip" });

    return (
        <div className="gd-mvf-dimensionality gd-rf-attributes s-rf-attributes" data-testid="rf-attributes">
            <div className="gd-rf-dropdown-section-title">
                <FormattedMessage id="rankingFilter.outOf" />
            </div>
            {attributes.length > 0 ? (
                <div className="gd-mvf-dimensionality-items">
                    {attributes.map((item, index) => {
                        const isDateItem = item.type === "chronologicalDate" || item.type === "genericDate";
                        const icon = isDateItem ? "date" : "ldmAttribute";
                        const iconColor = isDateItem ? "primary" : "warning";

                        return (
                            <WithAddButton
                                key={objRefToString(item.identifier)}
                                appendAddButton={index === attributes.length - 1}
                                isDisabled={false}
                                tooltip={addButtonTooltip}
                                buttonRef={inlineAddButtonRef}
                                onClick={handleOpenInlineAttributePicker}
                                dataTestId="rf-attributes-plus"
                            >
                                <div className="gd-mvf-dimensionality-tag-wrapper">
                                    <UiTag
                                        variant="outlined"
                                        size="large"
                                        iconBefore={icon}
                                        iconBeforeColor={iconColor}
                                        label={item.title}
                                        isDeletable
                                        onDelete={() => handleRemoveAttribute(index)}
                                        dataTestId={`rf-attributes-tag-${index}`}
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
                                    onClick={handleResetAttributes}
                                    label={resetButtonTooltip}
                                    dataTestId="rf-attributes-reset"
                                />
                                <Bubble alignPoints={[{ align: "cr cl" }]}>{resetButtonTooltip}</Bubble>
                            </BubbleHoverTrigger>
                        </div>
                    ) : null}
                </div>
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
                                onClick={handleResetAttributes}
                                dataTestId="rf-attributes-reset"
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
                    className="gd-message information gd-rf-attributes-backward-compatibility-message"
                    data-testid="rf-backward-compatibility-note"
                >
                    <div className="gd-message-text">
                        {intl.formatMessage({ id: "rankingFilter.outOf.backwardCompatibilityNote" })}
                    </div>
                </div>
            )}
            {isAttributePickerOpen && actualAnchor ? (
                <AttributePicker
                    anchorElement={actualAnchor}
                    onAdd={handleAddAttributeItems}
                    onCancel={handleCloseAttributePicker}
                    availableInsightItems={availableInsightItems}
                    availableCatalogItems={availableCatalogItems}
                    isLoadingCatalogDimensionality={isLoadingCatalogForPicker}
                />
            ) : null}
        </div>
    );
});
