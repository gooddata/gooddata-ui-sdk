// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type ReactElement, useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import {
    type IMeasureMetadataObject,
    type IMeasureValueFilter,
    type MeasureValueFilterCondition,
    type ObjRef,
    areObjRefsEqual,
    objRefToString,
} from "@gooddata/sdk-model";
import {
    FilterButtonCustomIcon,
    type IMeasureValueFilterDropdownButtonProps,
    MeasureValueFilter,
    getMeasureValueFilterConditionLabel,
} from "@gooddata/sdk-ui-filters";
import { ShortenedText, isActionKey } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectBackendCapabilities } from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectCatalogMeasures } from "../../../model/store/catalog/catalogSelectors.js";
import { selectLocale, selectSeparators } from "../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import {
    selectMeasureValueFilterConfigsModeMap,
    selectMeasureValueFilterConfigsModeMapByTab,
} from "../../../model/store/tabs/measureValueFilterConfigs/measureValueFilterConfigsSelectors.js";
import { getVisibilityIcon } from "../utils.js";
import { type IDashboardMeasureValueFilterProps } from "./types.js";

const PERCENT_FORMAT_REGEX = /%/;

// Tooltip alignment points reused from the attribute-filter chip so the MVF tooltip
// for a truncated title appears in the same position relative to the button.
const TITLE_TOOLTIP_ALIGN_POINTS = [
    { align: "tc bc", offset: { x: 0, y: -2 } },
    { align: "cc tc", offset: { x: 0, y: 10 } },
    { align: "bl tr", offset: { x: -2, y: -8 } },
];

function isPercentageFormat(format: string | undefined): boolean {
    return !!format && PERCENT_FORMAT_REGEX.test(format);
}

function findCatalogMetric(
    measure: ObjRef,
    measures: ReturnType<typeof selectCatalogMeasures>,
): ReturnType<typeof selectCatalogMeasures>[number] | undefined {
    return measures.find((m) => areObjRefsEqual(m.measure.ref, measure));
}

/**
 * @alpha
 */
export function DefaultDashboardMeasureValueFilter(
    props: IDashboardMeasureValueFilterProps,
): ReactElement | null {
    const { filter, readonly, autoOpen, onMeasureValueFilterChanged, tabId } = props;
    const intl = useIntl();

    const measures = useDashboardSelector(selectCatalogMeasures);
    const separators = useDashboardSelector(selectSeparators);
    const locale = useDashboardSelector(selectLocale);
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const modeMapActive = useDashboardSelector(selectMeasureValueFilterConfigsModeMap);
    const modeMapByTab = useDashboardSelector(selectMeasureValueFilterConfigsModeMapByTab);
    const modeMap = useMemo(
        () => (tabId ? (modeMapByTab[tabId] ?? new Map()) : modeMapActive),
        [tabId, modeMapByTab, modeMapActive],
    );

    const { measure, localIdentifier, conditions, title: customTitle } = filter.dashboardMeasureValueFilter;

    const catalogMetric = useMemo(() => findCatalogMetric(measure, measures), [measure, measures]);
    const metricTitle = customTitle ?? catalogMetric?.measure.title ?? objRefToString(measure);
    const format = catalogMetric?.measure.format;
    const usePercentage = isPercentageFormat(format);

    const conditionLabel = useMemo(
        () =>
            getMeasureValueFilterConditionLabel(intl, conditions, {
                usePercentage,
                separators,
            }),
        [intl, conditions, usePercentage, separators],
    );

    const dropdownFilter = useMemo<IMeasureValueFilter>(
        () => ({
            measureValueFilter: {
                measure,
                localIdentifier,
                ...(conditions && conditions.length > 0 ? { conditions } : {}),
            },
        }),
        [measure, localIdentifier, conditions],
    );

    const loadMetricDetails = useCallback(
        async (): Promise<IMeasureMetadataObject | undefined> => catalogMetric?.measure,
        [catalogMetric],
    );

    const visibilityIcon = useMemo(
        () =>
            getVisibilityIcon(
                modeMap.get(localIdentifier),
                isInEditMode,
                !!capabilities.supportsHiddenAndLockedFiltersOnUI,
                intl,
            ),
        [modeMap, localIdentifier, isInEditMode, capabilities.supportsHiddenAndLockedFiltersOnUI, intl],
    );

    const handleApply = useCallback(
        (updated: IMeasureValueFilter | null) => {
            // The SDK's MeasureValueFilterDropdown returns the filter using either `condition`
            // (singular, for a single comparison/range) or `conditions` (plural, for multi-condition
            // OR). The dashboard model only has `conditions` (plural), so normalize both forms into
            // the array shape. When the user selected "All", neither is present and conditions is
            // undefined.
            const body = updated?.measureValueFilter;
            const newConditions: MeasureValueFilterCondition[] | undefined =
                body?.conditions && body.conditions.length > 0
                    ? body.conditions
                    : body?.condition
                      ? [body.condition]
                      : undefined;
            onMeasureValueFilterChanged(filter, newConditions);
        },
        [filter, onMeasureValueFilterChanged],
    );

    const DropdownButtonComponent = useMemo(() => {
        function CustomDropdownButton({
            isActive,
            buttonTitle,
            onClick,
        }: IMeasureValueFilterDropdownButtonProps) {
            const handleClick = useCallback(() => {
                if (readonly) {
                    return;
                }
                onClick();
            }, [onClick]);

            const handleKeyDown = useCallback(
                (e: KeyboardEvent<HTMLDivElement>) => {
                    if (readonly || !isActionKey(e)) {
                        return;
                    }
                    e.preventDefault();
                    onClick();
                },
                [onClick],
            );

            return (
                <div
                    className={`gd-mvf-dashboard-filter-button__next s-dashboard-mvf-button ${
                        isActive ? "gd-is-active" : ""
                    } ${readonly ? "disabled" : ""}`}
                    role="button"
                    aria-haspopup="dialog"
                    aria-expanded={isActive}
                    aria-disabled={readonly || undefined}
                    tabIndex={readonly ? -1 : 0}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    data-mvf-local-id={localIdentifier}
                >
                    <div className="gd-attribute-filter-dropdown-button-content__next">
                        <div className="gd-attribute-filter-dropdown_button-title-content__next">
                            <div className="gd-attribute-filter-dropdown-button-title__next">
                                <ShortenedText
                                    tooltipAlignPoints={TITLE_TOOLTIP_ALIGN_POINTS}
                                    className="s-mvf-button-title"
                                >
                                    {buttonTitle}
                                </ShortenedText>
                            </div>
                            <FilterButtonCustomIcon customIcon={visibilityIcon} disabled={readonly} />
                        </div>
                        <div className="gd-attribute-filter-dropdown-button-subtitle__next">
                            <span className="gd-attribute-filter-dropdown-button-selected-items__next s-mvf-button-subtitle">
                                {conditionLabel}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return CustomDropdownButton;
    }, [readonly, localIdentifier, conditionLabel, visibilityIcon]);

    return (
        <MeasureValueFilter
            onApply={handleApply}
            filter={dropdownFilter}
            measureIdentifier={localIdentifier}
            buttonTitle={metricTitle}
            measureTitle={metricTitle}
            usePercentage={usePercentage}
            format={format}
            useShortFormat
            separators={separators}
            locale={locale}
            enableOperatorSelection
            enableMultipleConditions
            isDimensionalityEnabled={false}
            isFilterSummaryEnabled
            autoOpen={autoOpen}
            DropdownButtonComponent={DropdownButtonComponent}
            loadMetricDetails={isInEditMode ? loadMetricDetails : undefined}
            isHeaderEnabled
        />
    );
}
