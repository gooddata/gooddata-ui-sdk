// (C) 2007-2026 GoodData Corporation

import {
    type ComponentType,
    type KeyboardEvent,
    type KeyboardEventHandler,
    type ReactElement,
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import cx from "classnames";
import { isEqual } from "lodash-es";
import { useIntl } from "react-intl";

import { type IAttributeMetadataObject } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";
import {
    Dropdown,
    DropdownList,
    FilterGroupItem,
    type IAlignPoint,
    type IDropdownBodyRenderProps,
    type IDropdownButtonRenderProps,
    UiIcon,
    isArrowKey,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";

import { useFilterGroupStatus } from "./useFilterGroupStatus.js";
import type { IAttributeFilterProps } from "../AttributeFilter/AttributeFilter.js";
import { AttributeFilterButton } from "../AttributeFilter/AttributeFilterButton.js";
import { AttributeFilterDropdownButton } from "../AttributeFilter/Components/DropdownButton/AttributeFilterDropdownButton.js";
import {
    ATTRIBUTE_DISPLAY_FORM_DROPDOWN_BODY_CLASS,
    ATTRIBUTE_FILTER_DROPDOWN_BODY_CLASS,
    ATTRIBUTE_FILTER_DROPDOWN_BUBBLE_CLASS,
} from "../AttributeFilter/constants.js";
import { FilterButtonCustomIcon } from "../shared/components/internal/FilterButtonCustomIcon.js";

/**
 * @public
 */
export interface IFilterGroupProps<P> {
    title: string;
    filters: P[];
    getFilterIdentifier: (filter: P) => string;
    hasSelectedElements: (filter: P) => boolean;
    getTitleExtension?: (filterIdentifier: string, filterTitle?: string) => ReactNode;
    renderFilter: (
        filter: P,
        AttributeFilterComponent?: ComponentType<IAttributeFilterProps>,
    ) => ReactElement;
}

const GROUP_ALIGN_POINTS: IAlignPoint[] = [
    { align: "bl tl", offset: { x: 0, y: 0 } },
    { align: "br tr", offset: { x: 0, y: 0 } },
    { align: "tr tl", offset: { x: 0, y: 0 } },
    { align: "tl tr", offset: { x: 0, y: 0 } },
];

const ITEM_ALIGN_POINTS: IAlignPoint[] = [
    { align: "tr tl", offset: { x: -1, y: -1 } },
    { align: "br bl", offset: { x: -1, y: 0 } },
    { align: "bl tl", offset: { x: 0, y: 0 } },
    { align: "tl bl", offset: { x: 0, y: 0 } },
];

/**
 * FilterGroup contains nested dropdowns (attribute filter dropdown rendered in portal).
 * Closing the group dropdown must be prevented when interacting with the nested filter dropdown content.
 */
const IGNORE_CLICKS_ON_BY_CLASS = [
    ATTRIBUTE_FILTER_DROPDOWN_BODY_CLASS,
    ATTRIBUTE_DISPLAY_FORM_DROPDOWN_BODY_CLASS,
    ATTRIBUTE_FILTER_DROPDOWN_BUBBLE_CLASS,
];

/**
 * FilterGroup is a component that renders a dropdown button with multiple attribute filters
 *
 * @public
 */
export function FilterGroup<P>(props: IFilterGroupProps<P>) {
    const { title, filters, getFilterIdentifier, hasSelectedElements, getTitleExtension, renderFilter } =
        props;
    const intl = useIntl();
    const [isOpen, setIsOpen] = useState(false);
    const filtersIdentifiersUnstable = useMemo(
        () => filters.map(getFilterIdentifier),
        [filters, getFilterIdentifier],
    );
    // we need to stabilize this, otherwise it will cause unnecessary re-renders of dropdown
    // which will cause unexpected closing of dropdown content
    const availableFilterIdentifiers = useDeepEqualRefStablizer(filtersIdentifiersUnstable);

    const { isAnyFilterLoading, isAnyFilterError, getFilterStatus, setFilterStatus } =
        useFilterGroupStatus(availableFilterIdentifiers);

    const subtitle = useMemo(() => {
        if (isAnyFilterLoading) {
            return intl.formatMessage({ id: "loading" });
        }
        if (isAnyFilterError) {
            return intl.formatMessage({ id: "gs.list.notAvailableAbbreviation" });
        }
        const activeFilters = filters.filter((filter) => hasSelectedElements(filter));
        const activeFiltersCount = activeFilters.length;
        if (activeFiltersCount === 0) {
            return intl.formatMessage({ id: "gs.list.allAndCount" }, { count: filters.length });
        } else {
            const listOfTitles = activeFilters
                .map((filter) => getFilterStatus(getFilterIdentifier(filter))?.attribute?.title)
                .filter((title) => !!title)
                .join(", ");
            return `${listOfTitles} (${activeFiltersCount}/${availableFilterIdentifiers.length})`;
        }
    }, [
        filters,
        isAnyFilterError,
        isAnyFilterLoading,
        getFilterStatus,
        hasSelectedElements,
        intl,
        availableFilterIdentifiers,
        getFilterIdentifier,
    ]);

    const { selectedItemsCount, totalItemsCount } = useMemo((): {
        selectedItemsCount?: number;
        totalItemsCount?: number;
    } => {
        if (isAnyFilterLoading) {
            return {};
        }
        if (isAnyFilterError) {
            return {};
        }
        const activeFilters = filters.filter((filter) => hasSelectedElements(filter));
        const activeFiltersCount = activeFilters.length;
        if (activeFiltersCount === 0) {
            return { totalItemsCount: filters.length };
        } else {
            return { selectedItemsCount: activeFiltersCount, totalItemsCount: filters.length };
        }
    }, [filters, isAnyFilterError, isAnyFilterLoading, hasSelectedElements]);

    const errorHandler = useCallback(
        (filterIdentifier: string) => (error: GoodDataSdkError) => {
            setFilterStatus(filterIdentifier, { error });
        },
        [setFilterStatus],
    );

    const initLoadingChangedHandler = useCallback(
        (filterIdentifier: string) => (loading: boolean, attribute?: IAttributeMetadataObject) => {
            setFilterStatus(filterIdentifier, {
                loading,
                error: loading ? null : undefined,
                attribute,
            });
        },
        [setFilterStatus],
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
                const onError = useCallback(
                    (error: GoodDataSdkError) => errorHandler(filterIdentifier)(error),
                    [],
                );
                const onInitLoadingChanged = useCallback(
                    (loading: boolean, attribute?: IAttributeMetadataObject) => {
                        initLoadingChangedHandler(filterIdentifier)(loading, attribute);
                    },
                    [],
                );
                useEffect(
                    () => () =>
                        // stop loading on unmount
                        setFilterStatus(filterIdentifier, { loading: false }),
                    [],
                );
                return (
                    <AttributeFilterButton
                        {...attributeFilterProps}
                        alignPoints={ITEM_ALIGN_POINTS}
                        onError={onError}
                        onInitLoadingChanged={onInitLoadingChanged}
                        DropdownButtonComponent={(props) => {
                            const titleExtension = getTitleExtension?.(filterIdentifier, props.title);
                            const CustomDropdownButtonComponent =
                                attributeFilterProps.DropdownButtonComponent ?? FilterGroupItem;
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
                                />
                            );
                        }}
                        LoadingComponent={() => <FilterGroupItem isLoading />}
                        ErrorComponent={() => <FilterGroupItem isError />}
                    />
                );
            }

            result.set(filterIdentifier, AttributeFilterComponent);
        });

        return result;
    }, [
        availableFilterIdentifiers,
        getTitleExtension,
        errorHandler,
        initLoadingChangedHandler,
        setFilterStatus,
    ]);

    const renderItem = useCallback(
        ({ item }: { item: P }) => {
            const identifier = getFilterIdentifier(item);
            const AttributeFilterComponent = attributeFilterComponentsByIdentifier.get(identifier);
            return renderFilter(item, AttributeFilterComponent);
        },
        [attributeFilterComponentsByIdentifier, getFilterIdentifier, renderFilter],
    );

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>((e: KeyboardEvent) => {
        //stop arrow keys from leaking to filter bar
        if (isArrowKey(e)) {
            e.stopPropagation();
        }
    }, []);

    const renderBody = useCallback(
        ({ isMobile }: IDropdownBodyRenderProps) => (
            <div onKeyDown={handleKeyDown}>
                <DropdownList
                    className="gd-filter-group-body"
                    items={filters}
                    maxHeight={450}
                    itemHeight={53}
                    renderItem={renderItem}
                    isMobile={isMobile}
                />
            </div>
        ),
        [filters, renderItem, handleKeyDown],
    );

    const isMobile = useMediaQuery("mobileDevice");

    const renderButton = useCallback(
        ({ toggleDropdown, isOpen, buttonRef, dropdownId }: IDropdownButtonRenderProps) => (
            <div className={cx({ "gd-is-mobile": isMobile && isOpen })}>
                <AttributeFilterDropdownButton
                    title={title}
                    subtitle={subtitle}
                    isLoaded={!isAnyFilterLoading && !isAnyFilterError}
                    isOpen={isOpen}
                    selectedItemsCount={selectedItemsCount}
                    totalItemsCount={totalItemsCount}
                    showSelectionCount={selectedItemsCount !== undefined || totalItemsCount !== undefined}
                    icon={<UiIcon type="folder" size={12} color="currentColor" />}
                    dropdownId={dropdownId}
                    buttonRef={buttonRef}
                    onClick={toggleDropdown}
                    isError={isAnyFilterError}
                    isLoading={isAnyFilterLoading}
                />
            </div>
        ),
        [
            title,
            subtitle,
            isAnyFilterLoading,
            isAnyFilterError,
            selectedItemsCount,
            totalItemsCount,
            isMobile,
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
