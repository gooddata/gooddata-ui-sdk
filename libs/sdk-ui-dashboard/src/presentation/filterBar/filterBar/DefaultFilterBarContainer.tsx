// (C) 2021-2026 GoodData Corporation

import { type ReactNode, type Ref, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { isFocusVisible } from "@react-aria/interactions";
import cx from "classnames";
import { defaultImport } from "default-import";
import { FormattedMessage, useIntl } from "react-intl";
import DefaultMeasure, { type ContentRect } from "react-measure";

import {
    Bubble,
    BubbleHoverTrigger,
    Message,
    UiButton,
    makeHorizontalKeyboardNavigation,
} from "@gooddata/sdk-ui-kit";

import { FilterViews } from "./filterViews/FilterViews.js";
import { useFilterBarState } from "./hooks/useFilterBarState.js";
import { useFilterExpansionByDragAndDrop } from "./hooks/useFilterExpansionByDragAndDrop.js";
import { type CalculatedRows, useRowsCalculator } from "./hooks/useRowsCalculator.js";
import { ShowAllFiltersButton } from "./ShowAllFiltersButton.js";
import { useExecutionTimestampMessage } from "./useExecutionTimestampMessage.js";
import { applyFilterContextWorkingSelection } from "../../../model/commands/filters.js";
import { isDashboardFilterContextSelectionReset } from "../../../model/events/filters.js";
import { useDashboardEventsContext } from "../../../model/react/DashboardEventsContext.js";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import {
    selectEnableFilterViews,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    selectLocale,
} from "../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import {
    selectIsWorkingFilterContextChanged,
    selectNamesOfFiltersWithInvalidSelection,
} from "../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { BulletsBar as FlexibleBulletsBar } from "../../flexibleLayout/dragAndDrop/Resize/BulletsBar.js";
import { IntlWrapper } from "../../localization/IntlWrapper.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Measure = defaultImport(DefaultMeasure);

function DefaultFilterBarContainerCore({ children }: { children?: ReactNode }) {
    const { rows, height, isFilterBarExpanded, scrollable, setFilterBarExpanded, setCalculatedRows } =
        useFilterBarState();

    const dropRef = useFilterExpansionByDragAndDrop(
        rows.length > 1,
        isFilterBarExpanded,
        setFilterBarExpanded,
    );

    const isFilterViewsFeatureFlagEnabled = useDashboardSelector(selectEnableFilterViews);
    const isWorkingFilterContextChanged = useDashboardSelector(selectIsWorkingFilterContextChanged);
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const filtersWithInvalidSelection = useDashboardSelector(selectNamesOfFiltersWithInvalidSelection);
    const hasInvalidFilterSelections = filtersWithInvalidSelection.length > 0;
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    const { showExecutionTimestampMessage, formattedDate, onShowCurrentTimestampDashboard } =
        useExecutionTimestampMessage();
    const dispatch = useDashboardDispatch();

    const applyAllDashboardFilters = useCallback(() => {
        dispatch(applyFilterContextWorkingSelection());
    }, [dispatch]);

    const configurationStyle = useMemo(
        () => ({
            alignItems: isApplyAllAtOnceEnabledAndSet ? "center" : undefined,
            paddingRight: isApplyAllAtOnceEnabledAndSet ? "10px" : undefined,
        }),
        [isApplyAllAtOnceEnabledAndSet],
    );
    const intl = useIntl();

    const [expandedAutomatically, setExpandedAutomatically] = useState(false);

    const onContainerFocus = useCallback(() => {
        // detect if event is mouse
        if (!isFocusVisible()) {
            return;
        }
        setFilterBarExpanded(true);
        setExpandedAutomatically(true);
    }, [setFilterBarExpanded]);

    const onContainerBlur = useCallback(() => {
        if (isFocusVisible() && expandedAutomatically) {
            setFilterBarExpanded(false);
            setExpandedAutomatically(false);
        }
    }, [setFilterBarExpanded, expandedAutomatically]);

    const bubbleText = hasInvalidFilterSelections
        ? intl.formatMessage(
              { id: "filterBar.invalidFilterSelection" },
              { names: filtersWithInvalidSelection.join(", ") },
          )
        : null;

    return (
        <>
            <div
                className="dash-filters-wrapper s-gd-dashboard-filter-bar"
                ref={dropRef as unknown as Ref<HTMLDivElement> | undefined}
                onFocus={onContainerFocus}
                onBlur={onContainerBlur}
            >
                <div
                    style={{ height }}
                    className={cx("dash-filters-visible", {
                        scrollable: scrollable,
                        "s-dash-filters-visible-all": isFilterBarExpanded,
                        "apply-all-at-once": isApplyAllAtOnceEnabledAndSet,
                    })}
                >
                    <AllFiltersContainer setCalculatedRows={setCalculatedRows}>
                        {children}
                    </AllFiltersContainer>
                    <FiltersRows rows={rows} />
                    <div className="filter-bar-configuration" style={configurationStyle}>
                        {isApplyAllAtOnceEnabledAndSet && isWorkingFilterContextChanged ? (
                            <BubbleHoverTrigger showDelay={100} hideDelay={0}>
                                <UiButton
                                    label={intl.formatMessage({ id: "apply" })}
                                    variant="primary"
                                    onClick={applyAllDashboardFilters}
                                    isDisabled={hasInvalidFilterSelections}
                                />
                                {bubbleText ? <Bubble>{bubbleText}</Bubble> : null}
                            </BubbleHoverTrigger>
                        ) : null}
                        {isFilterViewsFeatureFlagEnabled ? <FilterViews /> : null}
                    </div>
                </div>
                <ShowAllFiltersButton
                    isFilterBarExpanded={isFilterBarExpanded}
                    isVisible={rows.length > 1}
                    onToggle={(isExpanded) => setFilterBarExpanded(isExpanded)}
                />
                {isInEditMode ? <FlexibleBulletsBar /> : null}
            </div>
            {isWorkingFilterContextChanged && isApplyAllAtOnceEnabledAndSet ? (
                <div className="filters-message" style={{ marginTop: rows.length > 1 ? "35px" : "10px" }}>
                    <Message type="progress">
                        <FormattedMessage
                            id="filterBar.unappliedFiltersNotification"
                            values={{
                                link: (chunks) => (
                                    <strong>
                                        <BubbleHoverTrigger showDelay={100} hideDelay={0}>
                                            <UiButton
                                                variant="link"
                                                onClick={applyAllDashboardFilters}
                                                label={chunks as unknown as string}
                                                isDisabled={hasInvalidFilterSelections}
                                            />
                                            {hasInvalidFilterSelections ? (
                                                <Bubble>{bubbleText}</Bubble>
                                            ) : null}
                                        </BubbleHoverTrigger>
                                    </strong>
                                ),
                            }}
                        />
                    </Message>
                </div>
            ) : null}
            {showExecutionTimestampMessage ? (
                <div className="filters-message" style={{ marginTop: rows.length > 1 ? "35px" : "10px" }}>
                    <Message type="progress">
                        <FormattedMessage
                            id="filterBar.executionTimestampNotificationMessage"
                            values={{
                                bold: (chunks) => <strong>{chunks}</strong>,
                                date: formattedDate,
                            }}
                        />
                        <span className="filters-message-spacer" />
                        <FormattedMessage
                            id="filterBar.executionTimestampNotificationAction"
                            values={{
                                link: (chunks) => <a onClick={onShowCurrentTimestampDashboard}>{chunks}</a>,
                            }}
                        />
                    </Message>
                </div>
            ) : null}
        </>
    );
}

function AllFiltersContainer({
    setCalculatedRows,
    children,
}: {
    setCalculatedRows: (data: CalculatedRows) => void;
    children?: ReactNode;
}) {
    const ref = useRef<Element | null>(null);
    const rowCalculator = useRowsCalculator(ref);

    const prevDimensions = useRef<ContentRect | null>(null);

    const handleResize = useCallback(
        (dimensions: ContentRect) => {
            const areBoundsEqual = (
                prevBounds: ContentRect["bounds"],
                currentBounds: ContentRect["bounds"],
            ) => {
                return (
                    prevBounds?.width === currentBounds?.width && prevBounds?.height === currentBounds?.height
                );
            };
            // Only call setCalculatedRows when dimensions actually change
            if (
                !prevDimensions.current ||
                !areBoundsEqual(prevDimensions.current.bounds, dimensions.bounds)
            ) {
                setCalculatedRows(rowCalculator(dimensions));
                prevDimensions.current = dimensions;
            }
        },
        [rowCalculator, setCalculatedRows],
    );

    return (
        <Measure
            bounds
            innerRef={(rf) => {
                ref.current = rf;
            }}
            onResize={handleResize}
        >
            {({ measureRef }) => <MeasuredDiv measureRef={measureRef}>{children}</MeasuredDiv>}
        </Measure>
    );
}

function MeasuredDiv({
    measureRef,
    children,
}: {
    measureRef: (node: Element | null) => void;
    children?: ReactNode;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [activeFilterIndex, setActiveFilterIndex] = useState<number | null>(null);

    const { registerHandler, unregisterHandler } = useDashboardEventsContext();

    // Focus management: Move focus to filter region when reset event occurs
    const moveToFilterRegion = useCallback(() => {
        const filterRegion = containerRef.current;
        if (filterRegion) {
            filterRegion.focus();
        }
    }, []);

    // Listen for filter context working selection reset events
    useEffect(() => {
        const handler = {
            eval: isDashboardFilterContextSelectionReset,
            handler: () => {
                moveToFilterRegion();
            },
        };

        registerHandler(handler);
        return () => unregisterHandler(handler);
    }, [registerHandler, unregisterHandler, moveToFilterRegion]);

    const getActiveIndexAndFilterElements = () => {
        const filterElements = containerRef.current
            ? Array.from(
                  containerRef.current.querySelectorAll<HTMLElement>(
                      'button, [tabindex]:not([tabindex="-1"])',
                  ),
              )
            : [];
        const activeIndex = filterElements.findIndex((el) => el === document.activeElement);
        return { activeIndex, filterElements };
    };

    // Handle arrow/tab key logic
    const keyboardNavigation = makeHorizontalKeyboardNavigation({
        onFocusNext: () => {
            const { activeIndex, filterElements } = getActiveIndexAndFilterElements();

            const next = (activeIndex + 1) % filterElements.length;
            filterElements[next]?.focus();
            setActiveFilterIndex(next);
        },
        onFocusPrevious: () => {
            const { activeIndex, filterElements } = getActiveIndexAndFilterElements();
            const prev = (activeIndex - 1 + filterElements.length) % filterElements.length;
            filterElements[prev]?.focus();
            setActiveFilterIndex(prev);
        },
        onFocusFirst: () => {
            const { filterElements } = getActiveIndexAndFilterElements();
            filterElements[0]?.focus();
            setActiveFilterIndex(0);
        },
        onFocusLast: () => {
            const { filterElements } = getActiveIndexAndFilterElements();
            filterElements[filterElements.length - 1]?.focus();
            setActiveFilterIndex(filterElements.length - 1);
        },
        onUnhandledKeyDown(e) {
            if (e.key === "Tab") {
                const { filterElements } = getActiveIndexAndFilterElements();
                if (activeFilterIndex === -1) {
                    // First tab into bar: focus first filter
                    e.preventDefault();
                    filterElements[0]?.focus();
                } else {
                    // move away from filter bar to next/previous element
                    // by letting the event bubble up to the browser with focus moved to the edge of container already
                    if (e.shiftKey) {
                        const first = filterElements[0];
                        first?.focus();
                    } else {
                        const last = filterElements.length - 1;
                        filterElements[last]?.focus();
                    }
                }
            }
        },
    });
    const setRefs = useCallback(
        (node: HTMLDivElement | null) => {
            measureRef(node);
            containerRef.current = node;
        },
        [measureRef],
    );
    const intl = useIntl();

    return (
        <div
            className="dash-filters-all"
            role="region"
            aria-label={intl.formatMessage({ id: "filterBar.label" })}
            tabIndex={-1}
            ref={setRefs}
            onKeyDown={keyboardNavigation}
        >
            {children}
        </div>
    );
}

function FiltersRows({ rows }: { rows: number[] }) {
    return (
        <>
            {rows.length > 1 && (
                <div className="dash-filters-rows">
                    {rows.map((height, index) => (
                        <div className="dash-filters-row" style={{ height }} key={index} />
                    ))}
                </div>
            )}
        </>
    );
}

/**
 * @internal
 */
export function DefaultFilterBarContainer({ children }: { children?: ReactNode }) {
    const locale = useDashboardSelector(selectLocale);

    return (
        <IntlWrapper locale={locale}>
            <DefaultFilterBarContainerCore>{children}</DefaultFilterBarContainerCore>
        </IntlWrapper>
    );
}
