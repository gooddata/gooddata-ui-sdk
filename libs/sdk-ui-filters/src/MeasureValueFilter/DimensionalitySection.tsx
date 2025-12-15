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
     * Callback when dimensionality changes.
     */
    onDimensionalityChange: (dimensionality: IDimensionalityItem[]) => void;
}

/**
 * @internal
 * Dimensionality section for the measure value filter dropdown.
 * Allows users to select which attributes/dates define the granularity of the filter.
 */
export const DimensionalitySection = memo(function DimensionalitySection({
    dimensionality,
    insightDimensionality,
    onDimensionalityChange,
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
     * These are items from insight dimensionality that are not yet in filter dimensionality.
     */
    const availableDimensionalityItems = useMemo(() => {
        if (!insightDimensionality?.length) {
            return [];
        }
        return insightDimensionality.filter(
            (insightItem) =>
                !dimensionality.some((filterItem) =>
                    areObjRefsEqual(insightItem.identifier, filterItem.identifier),
                ),
        );
    }, [insightDimensionality, dimensionality]);

    // Disable add buttons when there are no more items to add
    const isAddButtonDisabled = availableDimensionalityItems.length === 0;

    const handleRemoveDimensionality = useCallback(
        (index: number) => {
            onDimensionalityChange(dimensionality.filter((_, i) => i !== index));
        },
        [dimensionality, onDimensionalityChange],
    );

    /**
     * Reset dimensionality to insight defaults (bucket attributes).
     */
    const handleResetDimensionality = useCallback(() => {
        onDimensionalityChange(insightDimensionality ?? []);
    }, [insightDimensionality, onDimensionalityChange]);

    const handleOpenInlineAttributePicker = useCallback(() => {
        if (availableDimensionalityItems.length > 0) {
            setAnchorType("inline");
            setIsAttributePickerOpen(true);
        }
    }, [availableDimensionalityItems.length]);

    const handleOpenStandaloneAttributePicker = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            if (availableDimensionalityItems.length > 0) {
                setAnchorType("standalone");
                setStandaloneAnchor(event.currentTarget);
                setIsAttributePickerOpen(true);
            }
        },
        [availableDimensionalityItems.length],
    );

    const handleCloseAttributePicker = useCallback(() => {
        setIsAttributePickerOpen(false);
        setStandaloneAnchor(null);
    }, []);

    const handleAddDimensionalityItems = useCallback(
        (items: IDimensionalityItem[]) => {
            onDimensionalityChange([...dimensionality, ...items]);
            setIsAttributePickerOpen(false);
            setStandaloneAnchor(null);
        },
        [dimensionality, onDimensionalityChange],
    );

    const addButtonTooltip = isAddButtonDisabled
        ? intl.formatMessage({ id: "mvf.dimensionality.addButton.tooltip.disabled" })
        : intl.formatMessage({ id: "mvf.dimensionality.addButton.tooltip" });

    // Determine the actual anchor element to use
    const actualAnchor = anchorType === "inline" ? inlineAddButtonRef.current : standaloneAnchor;

    return (
        <div className="gd-mvf-dropdown-section gd-mvf-dimensionality s-mvf-dimensionality">
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
                                isDisabled={isAddButtonDisabled}
                                tooltip={addButtonTooltip}
                                buttonRef={inlineAddButtonRef}
                                onClick={handleOpenInlineAttributePicker}
                            >
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
                    isDisabled={isAddButtonDisabled}
                    onClick={handleOpenStandaloneAttributePicker}
                />
            )}
            {isAttributePickerOpen && actualAnchor ? (
                <AttributePicker
                    availableItems={availableDimensionalityItems}
                    anchorElement={actualAnchor}
                    onAdd={handleAddDimensionalityItems}
                    onCancel={handleCloseAttributePicker}
                />
            ) : null}
        </div>
    );
});
