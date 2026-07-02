// (C) 2025-2026 GoodData Corporation

import {
    type MouseEvent,
    type ReactNode,
    type RefObject,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";

import { type ObjRefInScope, areObjRefsEqual, objRefToString } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, UiIconButton } from "@gooddata/sdk-ui-kit";

import type { IDimensionalityItem } from "./typings.js";
import { useLazyCatalogDimensionality } from "./useLazyCatalogDimensionality.js";

/**
 * Compare two dimensionality arrays for equality (order-insensitive).
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

/**
 * An empty dimensionality selection is only valid when the insight itself has no attributes. When the
 * insight has attributes they are always the fallback, so an explicitly empty selection must be blocked
 * (the Apply button is disabled). Shared by the measure value filter and the ranking filter "out of" section.
 */
export const isEmptyDimensionalityInvalid = (
    selection: IDimensionalityItem[] | undefined,
    insightDimensionality: IDimensionalityItem[] | undefined,
): boolean => (selection?.length ?? 0) === 0 && (insightDimensionality?.length ?? 0) > 0;

const areDimensionalityItemsDeepEqual = (
    availableItem: IDimensionalityItem,
    filterItem: IDimensionalityItem,
): boolean => {
    if (availableItem.ref && filterItem.ref) {
        return areObjRefsEqual(availableItem.ref, filterItem.ref);
    }
    if (availableItem.ref) {
        return areObjRefsEqual(availableItem.ref, filterItem.identifier);
    }
    if (filterItem.ref) {
        return areObjRefsEqual(availableItem.identifier, filterItem.ref);
    }
    return areObjRefsEqual(availableItem.identifier, filterItem.identifier);
};

interface IWithAddButtonProps {
    children: ReactNode;
    appendAddButton: boolean;
    isDisabled: boolean;
    tooltip: string;
    buttonRef: RefObject<HTMLButtonElement | null>;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
    /** Test id of the inline "+" button - differs between the measure value filter and the ranking filter. */
    dataTestId: string;
}

/**
 * Renders the children and, when {@link IWithAddButtonProps.appendAddButton} is set, an inline "+" button
 * that opens the attribute picker. Shared by the measure value filter dimensionality and the ranking filter
 * "out of" sections.
 */
export function WithAddButton({
    children,
    appendAddButton,
    isDisabled,
    tooltip,
    buttonRef,
    onClick,
    dataTestId,
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
                    dataTestId={dataTestId}
                />
                <Bubble alignPoints={[{ align: "bc tc" }]}>{tooltip}</Bubble>
            </BubbleHoverTrigger>
        </div>
    );
}

/**
 * Inputs for {@link useDimensionalityEditor}. Neutral names so both the measure value filter (dimensionality)
 * and the ranking filter ("out of" attributes) can use it.
 */
export interface IUseDimensionalityEditorParams {
    /** The currently selected dimensionality items. */
    items: IDimensionalityItem[];
    /** Insight default items (from buckets), used for the reset action and the "From visualization" list. */
    insightItems?: IDimensionalityItem[];
    /** Catalog items, used when not lazily loaded via {@link IUseDimensionalityEditorParams.loadCatalog}. */
    catalogItems?: IDimensionalityItem[];
    /** Lazily loads catalog items valid for the current selection (on picker open). */
    loadCatalog?: (items: ObjRefInScope[]) => Promise<IDimensionalityItem[]>;
    /** Whether eagerly-provided catalog items are loading (only used when {@link loadCatalog} is absent). */
    isLoadingCatalog?: boolean;
    /** Called whenever the selection changes (add / remove / reset). */
    onChange: (items: IDimensionalityItem[]) => void;
}

/**
 * Shared state and logic for the dimensionality-items editor used by both the measure value filter
 * dimensionality section and the ranking filter "out of" attributes section: the attribute-picker open/anchor
 * state, the reset visibility, the available insight/catalog items (deduplicated against the current
 * selection and against each other), and the add/remove/reset/open/close handlers. The two filter sections
 * supply this with neutrally-named inputs and render their own (test-id / class / header) markup around it.
 */
export function useDimensionalityEditor({
    items,
    insightItems,
    catalogItems,
    loadCatalog,
    isLoadingCatalog,
    onChange,
}: IUseDimensionalityEditorParams) {
    // Ref for the inline add button (the "+" next to the last tag).
    const inlineAddButtonRef = useRef<HTMLButtonElement | null>(null);

    // Attribute picker state - whether it is open and which button (inline vs standalone) triggered it.
    const [isAttributePickerOpen, setIsAttributePickerOpen] = useState(false);
    const [anchorType, setAnchorType] = useState<"inline" | "standalone">("standalone");
    const [standaloneAnchor, setStandaloneAnchor] = useState<HTMLElement | null>(null);

    const { lazyCatalogDimensionality, isLoadingLazyCatalogDimensionality } = useLazyCatalogDimensionality({
        isOpen: isAttributePickerOpen,
        dimensionality: items,
        loadCatalogDimensionality: loadCatalog,
    });

    // Reset is offered whenever the current selection differs from the insight defaults (order-insensitive).
    const shouldShowResetButton = useMemo(
        () => !areDimensionalitySetsEqual(items, insightItems),
        [items, insightItems],
    );

    // Keep insight items and catalog items separate so the picker does not need to guess their origin.
    const availableInsightItems = useMemo(
        () =>
            (insightItems ?? []).filter(
                (availableItem) =>
                    !items.some((filterItem) => areDimensionalityItemsDeepEqual(availableItem, filterItem)),
            ),
        [insightItems, items],
    );

    const availableCatalogItems = useMemo(() => {
        const effectiveCatalog = loadCatalog ? (lazyCatalogDimensionality ?? []) : (catalogItems ?? []);

        const selectedFilteredOut = effectiveCatalog.filter(
            (availableItem) =>
                !items.some((filterItem) => areDimensionalityItemsDeepEqual(availableItem, filterItem)),
        );

        // Prevent duplicates between the "From visualization" and catalog lists. Insight items may be
        // LocalIdRefs; when available, use `ref` (display-form ObjRef) for stable deduplication against
        // catalog candidates (which use ObjRefs).
        const insightRefKeys = new Set(
            availableInsightItems
                .map((i) => (i.ref ? objRefToString(i.ref) : undefined))
                .filter((x): x is string => !!x),
        );
        const insightTitlesWithoutRef = new Set(
            (insightItems ?? []).filter((i) => !i.ref).map((i) => i.title),
        );

        return selectedFilteredOut.filter((item) => {
            const itemKey = objRefToString(item.identifier);
            if (insightRefKeys.has(itemKey)) {
                return false;
            }
            // Fallback for environments where insight items do not provide refs.
            return !insightTitlesWithoutRef.has(item.title);
        });
    }, [catalogItems, items, insightItems, availableInsightItems, lazyCatalogDimensionality, loadCatalog]);

    const handleRemove = useCallback(
        (index: number) => {
            onChange(items.filter((_, i) => i !== index));
        },
        [items, onChange],
    );

    const handleReset = useCallback(() => {
        onChange(insightItems ?? []);
    }, [insightItems, onChange]);

    const handleOpenInlinePicker = useCallback(() => {
        setAnchorType("inline");
        setIsAttributePickerOpen(true);
    }, []);

    const handleOpenStandalonePicker = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        setAnchorType("standalone");
        setStandaloneAnchor(event.currentTarget);
        setIsAttributePickerOpen(true);
    }, []);

    const handleClosePicker = useCallback(() => {
        setIsAttributePickerOpen(false);
        setStandaloneAnchor(null);
    }, []);

    const handleAddItems = useCallback(
        (added: IDimensionalityItem[]) => {
            onChange([...items, ...added]);
            setIsAttributePickerOpen(false);
            setStandaloneAnchor(null);
        },
        [items, onChange],
    );

    const actualAnchor = anchorType === "inline" ? inlineAddButtonRef.current : standaloneAnchor;
    const isLoadingCatalogForPicker = loadCatalog ? isLoadingLazyCatalogDimensionality : isLoadingCatalog;

    return {
        inlineAddButtonRef,
        isAttributePickerOpen,
        actualAnchor,
        shouldShowResetButton,
        availableInsightItems,
        availableCatalogItems,
        isLoadingCatalogForPicker,
        handleRemove,
        handleReset,
        handleOpenInlinePicker,
        handleOpenStandalonePicker,
        handleClosePicker,
        handleAddItems,
    };
}
