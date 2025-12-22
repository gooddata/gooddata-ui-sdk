// (C) 2025 GoodData Corporation

import {
    type MouseEvent,
    type ReactNode,
    type RefObject,
    memo,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";

import { useIntl } from "react-intl";

import { areObjRefsEqual, objRefToString } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, UiButton, UiIconButton, UiTag } from "@gooddata/sdk-ui-kit";

import { AttributePicker } from "./AttributePicker.js";
import type { IDimensionalityItem } from "./typings.js";

interface IWithAddButtonProps {
    children: ReactNode;
    appendAddButton: boolean;
    isDisabled: boolean;
    tooltip: string;
    buttonRef: RefObject<HTMLButtonElement | null>;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

function WithAddButton({
    children,
    appendAddButton,
    isDisabled,
    tooltip,
    buttonRef,
    onClick,
}: IWithAddButtonProps): ReactNode {
    if (!appendAddButton) {
        return children;
    }

    return (
        <div className="gd-mvf-dimensionality-add-wrapper">
            {children}
            <BubbleHoverTrigger>
                <UiIconButton
                    ref={buttonRef}
                    icon="plus"
                    size="small"
                    variant="tertiary"
                    isDisabled={isDisabled}
                    onClick={onClick}
                    dataTestId="mvf-dimensionality-plus"
                />
                <Bubble alignPoints={[{ align: "bc tc" }]}>{tooltip}</Bubble>
            </BubbleHoverTrigger>
        </div>
    );
}

/**
 * Compare two-dimensionality arrays for equality (order-insensitive).
 * Returns true if they contain the same identifiers regardless of order.
 */
export const areDimensionalitySetsEqual = (
    a: IDimensionalityItem[] | undefined,
    b: IDimensionalityItem[] | undefined,
): boolean => {
    const aItems = a ?? [];
    const bItems = b ?? [];

    if (aItems.length !== bItems.length) {
        return false;
    }

    // Check that every item in 'a' exists in 'b'
    return aItems.every((aItem) =>
        bItems.some((bItem) => areObjRefsEqual(aItem.identifier, bItem.identifier)),
    );
};

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
    isLoadingCatalogDimensionality,
    onDimensionalityChange,
    isMigratedFilter,
}: IDimensionalitySectionProps) {
    const intl = useIntl();

    // Ref for the inline add button (plus icon next to last tag)
    const inlineAddButtonRef = useRef<HTMLButtonElement | null>(null);

    // AttributePicker state - stores whether it's open and which button triggered it
    const [isAttributePickerOpen, setIsAttributePickerOpen] = useState(false);
    const [anchorType, setAnchorType] = useState<"inline" | "standalone">("standalone");

    // Store standalone button anchor separately since it's not a ref
    const [standaloneAnchor, setStandaloneAnchor] = useState<HTMLElement | null>(null);

    /**
     * Check if the current dimensionality differs from the insight defaults (order-insensitive).
     * Reset button should be visible when they differ.
     */
    const shouldShowResetButton = useMemo(() => {
        return !areDimensionalitySetsEqual(dimensionality, insightDimensionality);
    }, [dimensionality, insightDimensionality]);

    /**
     * Compute available items for the AttributePicker.
     * Keep insight items and catalog items separate so the picker does not need to guess origin.
     */
    const availableInsightItems = useMemo(() => {
        return (insightDimensionality ?? []).filter(
            (availableItem) =>
                !dimensionality.some((filterItem) =>
                    areObjRefsEqual(availableItem.identifier, filterItem.identifier),
                ),
        );
    }, [insightDimensionality, dimensionality]);

    const availableCatalogItems = useMemo(() => {
        const selectedFilteredOut = (catalogDimensionality ?? []).filter(
            (availableItem) =>
                !dimensionality.some((filterItem) =>
                    areObjRefsEqual(availableItem.identifier, filterItem.ref),
                ),
        );

        // Prevent duplicates between "From visualization" and catalog lists.
        // Insight items may be represented as LocalIdRefs; when available, use `ref` (display-form ObjRef)
        // for stable deduplication against catalog candidates (which use ObjRefs).
        const insightRefKeys = new Set(
            availableInsightItems
                .map((i) => (i.ref ? objRefToString(i.ref) : undefined))
                .filter((x): x is string => !!x),
        );
        const insightTitlesWithoutRef = new Set(
            availableInsightItems.filter((i) => !i.ref).map((i) => i.title),
        );

        return selectedFilteredOut.filter((item) => {
            const itemKey = objRefToString(item.identifier);
            if (insightRefKeys.has(itemKey)) {
                return false;
            }
            // Fallback for environments where insight items do not provide refs.
            return !insightTitlesWithoutRef.has(item.title);
        });
    }, [catalogDimensionality, dimensionality, availableInsightItems]);

    const handleRemoveDimensionality = useCallback(
        (index: number) => {
            const newDimensionality = dimensionality.filter((_, i) => i !== index);
            onDimensionalityChange(newDimensionality);
        },
        [dimensionality, onDimensionalityChange],
    );

    /**
     * Reset dimensionality to insight defaults (bucket attributes).
     */
    const handleResetDimensionality = useCallback(() => {
        const newDimensionality = insightDimensionality ?? [];
        onDimensionalityChange(newDimensionality);
    }, [insightDimensionality, onDimensionalityChange]);

    const handleOpenInlineAttributePicker = useCallback(() => {
        setAnchorType("inline");
        setIsAttributePickerOpen(true);
    }, []);

    const handleOpenStandaloneAttributePicker = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        setAnchorType("standalone");
        setStandaloneAnchor(event.currentTarget);
        setIsAttributePickerOpen(true);
    }, []);

    const handleCloseAttributePicker = useCallback(() => {
        setIsAttributePickerOpen(false);
        setStandaloneAnchor(null);
    }, []);

    const handleAddDimensionalityItems = useCallback(
        (items: IDimensionalityItem[]) => {
            const newDimensionality = [...dimensionality, ...items];
            onDimensionalityChange(newDimensionality);
            setIsAttributePickerOpen(false);
            setStandaloneAnchor(null);
        },
        [dimensionality, onDimensionalityChange],
    );

    const addButtonTooltip = intl.formatMessage({ id: "mvf.dimensionality.addButton.tooltip" });

    // Determine the actual anchor element to use
    const actualAnchor = anchorType === "inline" ? inlineAddButtonRef.current : standaloneAnchor;

    return (
        <div
            className="gd-mvf-dropdown-section gd-mvf-dimensionality s-mvf-dimensionality"
            data-testid="mvf-dimensionality"
        >
            <div className="gd-mvf-dimensionality-header">
                <label>{intl.formatMessage({ id: "mvf.dimensionality.forEach" })}</label>
                {shouldShowResetButton ? (
                    <span>
                        <BubbleHoverTrigger>
                            <UiButton
                                size="small"
                                variant="tertiary"
                                label={intl.formatMessage({ id: "mvf.dimensionality.reset" })}
                                onClick={handleResetDimensionality}
                            />
                            <Bubble alignPoints={[{ align: "bc tc" }]}>
                                {intl.formatMessage({ id: "mvf.dimensionality.reset.tooltip" })}
                            </Bubble>
                        </BubbleHoverTrigger>
                    </span>
                ) : null}
            </div>
            {dimensionality.length > 0 ? (
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
                </div>
            ) : (
                <UiButton
                    label={intl.formatMessage({ id: "mvf.dimensionality.addAttributes" })}
                    variant="tertiary"
                    size="small"
                    iconBefore="plus"
                    onClick={handleOpenStandaloneAttributePicker}
                />
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
                    isLoadingCatalogDimensionality={isLoadingCatalogDimensionality}
                />
            ) : null}
        </div>
    );
});
