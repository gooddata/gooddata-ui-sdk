// (C) 2007-2026 GoodData Corporation

import {
    type ComponentType,
    type KeyboardEvent,
    type KeyboardEventHandler,
    type ReactElement,
    type ReactNode,
    type Ref,
    type RefCallback,
    type RefObject,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";

import cx from "classnames";
import { isEqual } from "lodash-es";
import { useIntl } from "react-intl";

import { type GoodDataSdkError } from "@gooddata/sdk-ui";
import {
    Dropdown,
    DropdownList,
    FilterGroupItem,
    type IAlignPoint,
    type IDropdownBodyRenderProps,
    type IDropdownButtonRenderProps,
    type IRenderDropdownListItemProps,
    UiIcon,
    isArrowKey,
    isSpaceKey,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";

import type { IAttributeFilterProps } from "../AttributeFilter/AttributeFilter.js";
import { AttributeFilterButton } from "../AttributeFilter/AttributeFilterButton.js";
import {
    AttributeFilterDropdownButton,
    type IAttributeFilterDropdownButtonProps,
} from "../AttributeFilter/Components/DropdownButton/AttributeFilterDropdownButton.js";
import { AttributeFilterElementsSearchBar } from "../AttributeFilter/Components/ElementsSelect/AttributeFilterElementsSearchBar.js";
import {
    ATTRIBUTE_DISPLAY_FORM_DROPDOWN_BODY_CLASS,
    ATTRIBUTE_FILTER_DROPDOWN_BODY_CLASS,
    ATTRIBUTE_FILTER_DROPDOWN_BUBBLE_CLASS,
} from "../AttributeFilter/constants.js";
import {
    MEASURE_VALUE_FILTER_DETAILS_BUBBLE_CLASS,
    MEASURE_VALUE_FILTER_DROPDOWN_BODY_CLASS,
    MEASURE_VALUE_FILTER_OPERATOR_DROPDOWN_BODY_CLASS,
} from "../MeasureValueFilter/constants.js";
import {
    type IMeasureValueFilterProps,
    MeasureValueFilter,
} from "../MeasureValueFilter/MeasureValueFilter.js";
import { type IMeasureValueFilterDropdownButtonProps } from "../MeasureValueFilter/MeasureValueFilterButton.js";
import { FilterButtonCustomIcon } from "../shared/components/internal/FilterButtonCustomIcon.js";

import { useFilterGroupStatus } from "./useFilterGroupStatus.js";

/**
 * @public
 */
export interface IFilterGroupProps<P> {
    title: string;
    filters: P[];
    getFilterIdentifier: (filter: P) => string;
    isFilterActive: (filter: P) => boolean;
    /**
     * @deprecated
     * Use isFilterActive instead.
     */
    hasSelectedElements?: (filter: P) => boolean;
    getTitleExtension?: (filterIdentifier: string, filterTitle?: string) => ReactNode;
    /**
     * @beta
     */
    renderFilter: (
        filter: P,
        AttributeFilterComponent?: ComponentType<IAttributeFilterProps>,
        MeasureValueFilterComponent?: ComponentType<IMeasureValueFilterProps>,
    ) => ReactElement;
}

/**
 * @internal
 */
export type IFilterGroupDropdownListItemProps<P> = Pick<IRenderDropdownListItemProps<P>, "item" | "rowIndex">;

const GROUP_ALIGN_POINTS: IAlignPoint[] = [
    { align: "bl tl", offset: { x: 3, y: -7 } },
    { align: "br tr", offset: { x: -10, y: -7 } },
    { align: "tr tl", offset: { x: -11, y: 7 } },
    { align: "tl tr", offset: { x: 3, y: 7 } },
];

const ITEM_ALIGN_POINTS: IAlignPoint[] = [
    { align: "tr tl", offset: { x: 1, y: -1 } },
    { align: "br bl", offset: { x: 1, y: 0 } },
    { align: "bl tl", offset: { x: 0, y: 0 } },
    { align: "tl bl", offset: { x: 0, y: -2 } },
];

/**
 * FilterGroup contains nested dropdowns (attribute filter dropdown rendered in portal).
 * Closing the group dropdown must be prevented when interacting with the nested filter dropdown content.
 */
const IGNORE_CLICKS_ON_BY_CLASS = [
    `.${ATTRIBUTE_FILTER_DROPDOWN_BODY_CLASS}`,
    `.${ATTRIBUTE_DISPLAY_FORM_DROPDOWN_BODY_CLASS}`,
    `.${ATTRIBUTE_FILTER_DROPDOWN_BUBBLE_CLASS}`,
    `.${MEASURE_VALUE_FILTER_DROPDOWN_BODY_CLASS}`,
    `.${MEASURE_VALUE_FILTER_OPERATOR_DROPDOWN_BODY_CLASS}`,
    `.${MEASURE_VALUE_FILTER_DETAILS_BUBBLE_CLASS}`,
];

function isEditableElement(target: EventTarget | null): boolean {
    return (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
    );
}

/**
 * FilterGroup is a component that renders a dropdown button with multiple attribute filters
 *
 * @public
 */
export function FilterGroup<P>(props: IFilterGroupProps<P>) {
    const {
        title,
        filters,
        getFilterIdentifier,
        isFilterActive: propsIsFilterActive,
        hasSelectedElements,
        getTitleExtension,
        renderFilter,
    } = props;
    const isFilterActive = propsIsFilterActive ?? hasSelectedElements;
    const intl = useIntl();
    const [isOpen, setIsOpen] = useState(false);
    const filterItemRefs = useRef(new Map<string, HTMLElement | null>());
    const filtersIdentifiersUnstable = useMemo(
        () => filters.map(getFilterIdentifier),
        [filters, getFilterIdentifier],
    );
    // we need to stabilize this, otherwise it will cause unnecessary re-renders of dropdown
    // which will cause unexpected closing of dropdown content
    const availableFilterIdentifiers = useDeepEqualRefStablizer(filtersIdentifiersUnstable);

    const { isAnyFilterError, setFilterError } = useFilterGroupStatus(availableFilterIdentifiers);

    const subtitle = useMemo(() => {
        if (isAnyFilterError) {
            return intl.formatMessage({ id: "gs.list.notAvailableAbbreviation" });
        }
        const activeFilters = filters.filter((filter) => isFilterActive(filter));
        const activeFiltersCount = activeFilters.length;
        if (activeFiltersCount === 0) {
            return intl.formatMessage({ id: "gs.list.allAndCount" }, { count: filters.length });
        } else {
            return `(${activeFiltersCount}/${availableFilterIdentifiers.length})`;
        }
    }, [filters, isAnyFilterError, isFilterActive, intl, availableFilterIdentifiers]);

    const { selectedItemsCount, totalItemsCount } = useMemo((): {
        selectedItemsCount?: number;
        totalItemsCount?: number;
    } => {
        if (isAnyFilterError) {
            return {};
        }
        const activeFilters = filters.filter((filter) => isFilterActive(filter));
        const activeFiltersCount = activeFilters.length;
        if (activeFiltersCount === 0) {
            return { totalItemsCount: filters.length };
        } else {
            return { selectedItemsCount: activeFiltersCount, totalItemsCount: filters.length };
        }
    }, [filters, isAnyFilterError, isFilterActive]);

    const errorHandler = useCallback(
        (filterIdentifier: string) => (error: GoodDataSdkError) => {
            setFilterError(filterIdentifier, error);
        },
        [setFilterError],
    );

    const initLoadingChangedHandler = useCallback(
        (filterIdentifier: string) => (loading: boolean) => {
            setFilterError(filterIdentifier, loading ? null : undefined);
        },
        [setFilterError],
    );

    /**
     * We need to create a stable component type for each filter identifier.
     * Not passing an inline component type created during render. It could cause a loop of re-renders.
     */
    const attributeFilterComponentsByIdentifier = useMemo(() => {
        const result = new Map<string, ComponentType<IAttributeFilterProps>>();

        availableFilterIdentifiers.forEach((filterIdentifier) => {
            if (result.has(filterIdentifier)) {
                return;
            }

            function AttributeFilterComponent(attributeFilterProps: IAttributeFilterProps) {
                // When the filter swaps between Loading / Error / DropdownButton renderings,
                // the focused DOM node is unmounted. Capture focus on ref-cleanup and
                // re-apply it when the replacement mounts, so the user doesn't visually lose focus.
                const wasFocusedRef = useRef(false);
                const setFilterItemRef = useCallback((element: HTMLElement | null) => {
                    if (element === null) {
                        const prev = filterItemRefs.current.get(filterIdentifier);
                        wasFocusedRef.current =
                            !!prev &&
                            (prev === document.activeElement || prev.contains(document.activeElement));
                        filterItemRefs.current.set(filterIdentifier, null);
                        return;
                    }
                    filterItemRefs.current.set(filterIdentifier, element);
                    if (wasFocusedRef.current) {
                        wasFocusedRef.current = false;
                        element.focus();
                    }
                }, []);
                const onError = useCallback(
                    (error: GoodDataSdkError) => errorHandler(filterIdentifier)(error),
                    [],
                );
                const onInitLoadingChanged = useCallback((loading: boolean) => {
                    initLoadingChangedHandler(filterIdentifier)(loading);
                }, []);
                const DropdownButtonComponent: NonNullable<IAttributeFilterProps["DropdownButtonComponent"]> =
                    useCallback(
                        function DropdownButtonComponent({
                            buttonRef,
                            ...props
                        }: IAttributeFilterDropdownButtonProps) {
                            const titleExtension = getTitleExtension?.(filterIdentifier, props.title);
                            const CustomDropdownButtonComponent: ComponentType<IAttributeFilterDropdownButtonProps> =
                                attributeFilterProps.DropdownButtonComponent ??
                                (FilterGroupItem as ComponentType<IAttributeFilterDropdownButtonProps>);
                            const handleButtonRef = useMergeRefs(buttonRef, setFilterItemRef);
                            return (
                                <CustomDropdownButtonComponent
                                    {...props}
                                    titleExtension={
                                        <>
                                            {props.titleExtension}
                                            {titleExtension}
                                            <FilterButtonCustomIcon
                                                customIcon={props.customIcon}
                                                disabled={props.disabled}
                                            />
                                        </>
                                    }
                                    buttonRef={handleButtonRef}
                                />
                            );
                        },
                        [attributeFilterProps.DropdownButtonComponent, setFilterItemRef],
                    );
                const LoadingComponent: NonNullable<IAttributeFilterProps["LoadingComponent"]> = useCallback(
                    () => <FilterGroupItem isLoading buttonRef={setFilterItemRef} />,
                    [setFilterItemRef],
                );
                const ErrorComponent: NonNullable<IAttributeFilterProps["ErrorComponent"]> = useCallback(
                    () => <FilterGroupItem isError buttonRef={setFilterItemRef} />,
                    [setFilterItemRef],
                );
                const ElementsSearchBarComponent: NonNullable<
                    IAttributeFilterProps["ElementsSearchBarComponent"]
                > = useCallback(
                    (props) => (
                        <AttributeFilterElementsSearchBar
                            {...props}
                            onKeyDown={(e) => {
                                // allow space key to be handled by filter search bar
                                // and not stolen by filter group dropdown keyboard navigation
                                if (isSpaceKey(e)) {
                                    e.stopPropagation();
                                }
                            }}
                        />
                    ),
                    [],
                );
                return (
                    <AttributeFilterButton
                        {...attributeFilterProps}
                        alignPoints={ITEM_ALIGN_POINTS}
                        onError={onError}
                        onInitLoadingChanged={onInitLoadingChanged}
                        DropdownButtonComponent={DropdownButtonComponent}
                        LoadingComponent={LoadingComponent}
                        ErrorComponent={ErrorComponent}
                        ElementsSearchBarComponent={ElementsSearchBarComponent}
                    />
                );
            }

            result.set(filterIdentifier, AttributeFilterComponent);
        });

        return result;
    }, [availableFilterIdentifiers, getTitleExtension, errorHandler, initLoadingChangedHandler]);

    const measureValueFilterComponentsByIdentifier = useMemo(() => {
        const result = new Map<string, ComponentType<IMeasureValueFilterProps>>();

        availableFilterIdentifiers.forEach((filterIdentifier) => {
            if (result.has(filterIdentifier)) {
                return;
            }

            function MeasureValueFilterComponent(measureValueFilterProps: IMeasureValueFilterProps) {
                const setFilterItemRef = useCallback((element: HTMLElement | null) => {
                    filterItemRefs.current.set(filterIdentifier, element);
                }, []);
                const DropdownButtonComponent: NonNullable<
                    IMeasureValueFilterProps["DropdownButtonComponent"]
                > = useCallback(
                    function DropdownButtonComponent({
                        buttonTitle,
                        buttonSubtitle,
                        buttonTitleExtension,
                        disabled,
                        isActive,
                        onClick,
                    }: IMeasureValueFilterDropdownButtonProps) {
                        const titleExtension = getTitleExtension?.(filterIdentifier, buttonTitle);
                        return (
                            <FilterGroupItem
                                title={buttonTitle}
                                subtitle={buttonSubtitle ?? undefined}
                                isOpen={isActive}
                                isLoaded
                                disabled={disabled}
                                titleExtension={
                                    <>
                                        {buttonTitleExtension}
                                        {titleExtension}
                                    </>
                                }
                                onClick={onClick}
                                buttonRef={setFilterItemRef}
                            />
                        );
                    },
                    [setFilterItemRef],
                );

                return (
                    <MeasureValueFilter
                        {...measureValueFilterProps}
                        alignPoints={ITEM_ALIGN_POINTS}
                        DropdownButtonComponent={
                            measureValueFilterProps.DropdownButtonComponent ?? DropdownButtonComponent
                        }
                    />
                );
            }

            result.set(filterIdentifier, MeasureValueFilterComponent);
        });

        return result;
    }, [availableFilterIdentifiers, getTitleExtension]);

    const renderItem = useCallback(
        ({ item }: IFilterGroupDropdownListItemProps<P>) => {
            const identifier = getFilterIdentifier(item);
            const AttributeFilterComponent = attributeFilterComponentsByIdentifier.get(identifier);
            const MeasureValueFilterComponent = measureValueFilterComponentsByIdentifier.get(identifier);
            return renderFilter(item, AttributeFilterComponent, MeasureValueFilterComponent);
        },
        [
            attributeFilterComponentsByIdentifier,
            measureValueFilterComponentsByIdentifier,
            getFilterIdentifier,
            renderFilter,
        ],
    );

    const handleKeyDownCapture = useCallback<KeyboardEventHandler<HTMLDivElement>>((e: KeyboardEvent) => {
        if (isSpaceKey(e) && isEditableElement(e.target)) {
            e.stopPropagation();
        }
    }, []);

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>((e: KeyboardEvent) => {
        //stop arrow keys from leaking to filter bar
        if (isArrowKey(e)) {
            e.stopPropagation();
        }
    }, []);

    const handleItemKeyboardAction = useCallback(
        (item: P) => {
            const filterIdentifier = getFilterIdentifier(item);
            const filterItem = filterItemRefs.current.get(filterIdentifier);

            if (!filterItem) {
                return;
            }

            filterItem.click();
        },
        [getFilterIdentifier],
    );

    const groupAriaLabel = intl.formatMessage({ id: "filterGroup.aria.label" }, { title });
    const groupAriaLabelWithState = intl.formatMessage(
        { id: "filterGroup.aria.label.withState" },
        { title, state: subtitle },
    );
    const renderBody = useCallback(
        ({ isMobile, closeDropdown }: IDropdownBodyRenderProps) => (
            <div
                role="dialog"
                aria-label={groupAriaLabel}
                onKeyDownCapture={handleKeyDownCapture}
                onKeyDown={handleKeyDown}
            >
                <DropdownList
                    className="gd-filter-group-body"
                    items={filters}
                    maxHeight={450}
                    itemHeight={53}
                    accessibilityConfig={{
                        role: "list",
                        ariaLabel: groupAriaLabel,
                    }}
                    renderItem={renderItem}
                    onKeyDownSelect={handleItemKeyboardAction}
                    closeDropdown={closeDropdown}
                    isMobile={isMobile}
                />
            </div>
        ),
        [filters, renderItem, handleKeyDown, handleKeyDownCapture, handleItemKeyboardAction, groupAriaLabel],
    );

    const isMobile = useMediaQuery("mobileDevice");

    const renderButton = useCallback(
        ({ toggleDropdown, isOpen, buttonRef, dropdownId }: IDropdownButtonRenderProps) => (
            <div className={cx({ "gd-is-mobile": isMobile && isOpen })}>
                <AttributeFilterDropdownButton
                    title={title}
                    subtitle={subtitle}
                    isLoaded={!isAnyFilterError}
                    isOpen={isOpen}
                    selectedItemsCount={selectedItemsCount}
                    totalItemsCount={totalItemsCount}
                    showSelectionCount={selectedItemsCount !== undefined || totalItemsCount !== undefined}
                    icon={<UiIcon type="folderSmall" size={12} color="complementary-6" />}
                    dropdownId={dropdownId}
                    buttonRef={buttonRef}
                    onClick={toggleDropdown}
                    isError={isAnyFilterError}
                    ariaLabel={groupAriaLabelWithState}
                />
            </div>
        ),
        [
            title,
            subtitle,
            isAnyFilterError,
            selectedItemsCount,
            totalItemsCount,
            isMobile,
            groupAriaLabelWithState,
        ],
    );

    return (
        <Dropdown
            isOpen={isOpen}
            className="gd-filter-group"
            closeOnParentScroll
            closeOnMouseDrag
            closeOnOutsideClick
            closeOnEscape
            ignoreClicksOnByClass={IGNORE_CLICKS_ON_BY_CLASS}
            enableEventPropagation
            alignPoints={GROUP_ALIGN_POINTS}
            fullscreenOnMobile
            autofocusOnOpen
            renderButton={renderButton}
            renderBody={renderBody}
            onOpenStateChanged={setIsOpen}
        />
    );
}

/**
 * @public
 */
export function useDeepEqualRefStablizer<T>(unstableState: T): T {
    const stableRef = useRef<T>(unstableState);
    // Compare and update the ref synchronously to keep the reference stable
    const prevState = stableRef.current;
    if (!isEqual(prevState, unstableState)) {
        stableRef.current = unstableState;
    }
    return stableRef.current;
}

function useMergeRefs<T>(ref1: Ref<T> | undefined, ref2: Ref<T> | undefined, ref3?: Ref<T>): RefCallback<T> {
    return useCallback(
        (value: T) => {
            [ref1, ref2, ref3].forEach((ref) => {
                if (!ref) return;
                if (typeof ref === "function") {
                    ref(value);
                } else {
                    (ref as RefObject<T | null>).current = value;
                }
            });
        },
        [ref1, ref2, ref3],
    );
}
