// (C) 2026 GoodData Corporation

import { type ComponentProps, type ReactElement, useCallback, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    type DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterConfigModeValues,
    type IMeasureValueFilter,
    type MeasureValueFilterCondition,
    type ObjRef,
    areObjRefsEqual,
    objRefToString,
} from "@gooddata/sdk-model";
import {
    type IFilterButtonCustomIcon,
    type IMeasureValueFilterBodyProps,
    type IMeasureValueFilterDropdownActionsProps,
    type IMeasureValueFilterDropdownButtonProps,
    MeasureValueFilter,
    getMeasureValueFilterConditionLabel,
} from "@gooddata/sdk-ui-filters";
import { Bubble, BubbleHoverTrigger, type IAlignPoint, UiControlButton } from "@gooddata/sdk-ui-kit";

import { setDashboardMeasureValueFilterConfigMode } from "../../../model/commands/dashboard.js";
import { setMeasureValueFilterTitle } from "../../../model/commands/filters.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../model/react/useDashboardCommandProcessing.js";
import { selectBackendCapabilities } from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectCatalogMeasures } from "../../../model/store/catalog/catalogSelectors.js";
import {
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    selectLocale,
    selectSeparators,
} from "../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { selectWorkingFilterContextMeasureValueFilterByLocalId } from "../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { selectMeasureValueFilterConfigsModeMap } from "../../../model/store/tabs/measureValueFilterConfigs/measureValueFilterConfigsSelectors.js";
import { useAttributeFilterConfigTexts } from "../attributeFilter/useAttributeFilterConfigTexts.js";
import { getVisibilityIcon } from "../utils.js";
import {
    CustomConfigureMeasureValueFilterDropdownActions,
    CustomMeasureValueFilterDropdownActions,
} from "./CustomDropdownActions.js";
import { MeasureValueFilterConfiguration } from "./MeasureValueFilterConfiguration.js";
import { type IDashboardMeasureValueFilterProps } from "./types.js";

const PERCENT_FORMAT_REGEX = /%/;
const DEFAULT_VISIBILITY_BUBBLE_ALIGN_POINTS: IAlignPoint[] = [{ align: "bc tl", offset: { x: 0, y: 5 } }];

function isPercentageFormat(format: string | undefined): boolean {
    return !!format && PERCENT_FORMAT_REGEX.test(format);
}

function findCatalogMetric(
    measure: ObjRef,
    measures: ReturnType<typeof selectCatalogMeasures>,
): ReturnType<typeof selectCatalogMeasures>[number] | undefined {
    return measures.find((m) => areObjRefsEqual(m.measure.ref, measure));
}

function normalizeMeasureValueFilterConditions(
    updated: IMeasureValueFilter | null,
): MeasureValueFilterCondition[] | undefined {
    const body = updated?.measureValueFilter;
    return body?.conditions && body.conditions.length > 0
        ? body.conditions
        : body?.condition
          ? [body.condition]
          : undefined;
}

function MeasureValueFilterVisibilityIcon({
    visibilityIcon,
    disabled,
}: {
    visibilityIcon?: IFilterButtonCustomIcon;
    disabled?: boolean;
}) {
    if (!visibilityIcon) {
        return null;
    }

    return (
        <div
            className={cx("gd-filter-button-custom-icon-wrapper", "s-gd-filter-button-custom-icon-wrapper", {
                disabled,
                "s-disabled": disabled,
            })}
        >
            <BubbleHoverTrigger>
                <i
                    className={`gd-filter-button-custom-icon s-gd-filter-button-custom-icon ${visibilityIcon.icon}`}
                />
                <Bubble
                    className={`bubble-primary ${visibilityIcon.bubbleClassNames || ""}`}
                    alignPoints={visibilityIcon.bubbleAlignPoints || DEFAULT_VISIBILITY_BUBBLE_ALIGN_POINTS}
                >
                    {visibilityIcon.tooltip}
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
}

/**
 * @alpha
 */
export function DefaultDashboardMeasureValueFilter(
    props: IDashboardMeasureValueFilterProps,
): ReactElement | null {
    const { filter, readonly, autoOpen, onMeasureValueFilterChanged, onMeasureValueFilterClose } = props;
    const intl = useIntl();

    const measures = useDashboardSelector(selectCatalogMeasures);
    const separators = useDashboardSelector(selectSeparators);
    const locale = useDashboardSelector(selectLocale);
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const measureValueFilterConfigsModeMap = useDashboardSelector(selectMeasureValueFilterConfigsModeMap);
    const { cancelText, closeText, saveText, applyText, titleText, resetTitleText, modeCategoryTitleText } =
        useAttributeFilterConfigTexts();

    const { measure, localIdentifier, title: customTitle } = filter.dashboardMeasureValueFilter;
    const workingFilter = useDashboardSelector(
        selectWorkingFilterContextMeasureValueFilterByLocalId(localIdentifier),
    );
    const filterToDisplay = isApplyAllAtOnceEnabledAndSet ? (workingFilter ?? filter) : filter;
    const conditions = filterToDisplay.dashboardMeasureValueFilter.conditions;

    const catalogMetric = useMemo(() => findCatalogMetric(measure, measures), [measure, measures]);
    const defaultMetricTitle = catalogMetric?.measure.title ?? objRefToString(measure);
    const metricTitle = customTitle ?? defaultMetricTitle;
    const format = catalogMetric?.measure.format;
    const usePercentage = isPercentageFormat(format);
    const mode =
        measureValueFilterConfigsModeMap.get(localIdentifier) ??
        DashboardAttributeFilterConfigModeValues.ACTIVE;
    const visibilityIcon = getVisibilityIcon(
        mode,
        isEditMode,
        !!capabilities.supportsHiddenAndLockedFiltersOnUI,
        intl,
    );

    const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);
    const [draftTitle, setDraftTitle] = useState(metricTitle);
    const [draftMode, setDraftMode] = useState<DashboardAttributeFilterConfigMode>(mode);

    const { run: changeMeasureValueFilterTitle } = useDashboardCommandProcessing({
        commandCreator: setMeasureValueFilterTitle,
        successEvent: "GDC.DASH/EVT.FILTER_CONTEXT.MEASURE_VALUE_FILTER.TITLE_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

    const { run: changeMeasureValueFilterMode } = useDashboardCommandProcessing({
        commandCreator: setDashboardMeasureValueFilterConfigMode,
        successEvent: "GDC.DASH/EVT.MEASURE_VALUE_FILTER_CONFIG.MODE_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

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

    const handleClose = useCallback(() => {
        setIsConfigurationOpen(false);
        onMeasureValueFilterClose?.();
    }, [onMeasureValueFilterClose]);

    const handleApply = useCallback(
        (updated: IMeasureValueFilter | null) => {
            const newConditions = normalizeMeasureValueFilterConditions(updated);
            onMeasureValueFilterChanged(filter, newConditions);
            onMeasureValueFilterClose?.();
        },
        [filter, onMeasureValueFilterChanged, onMeasureValueFilterClose],
    );

    const handleChange = useCallback(
        (updated: IMeasureValueFilter | null) => {
            onMeasureValueFilterChanged(filter, normalizeMeasureValueFilterConditions(updated), true);
        },
        [filter, onMeasureValueFilterChanged],
    );

    const openConfiguration = useCallback(() => {
        setDraftTitle(metricTitle);
        setDraftMode(mode);
        setIsConfigurationOpen(true);
    }, [metricTitle, mode]);

    const closeConfiguration = useCallback(() => {
        setDraftTitle(metricTitle);
        setDraftMode(mode);
        setIsConfigurationOpen(false);
    }, [metricTitle, mode]);

    const saveConfiguration = useCallback(() => {
        const normalizedTitle = draftTitle.trim();
        const titleToSave = normalizedTitle === defaultMetricTitle ? undefined : normalizedTitle;

        if (titleToSave !== customTitle) {
            changeMeasureValueFilterTitle(localIdentifier, titleToSave);
        }
        if (draftMode !== mode) {
            changeMeasureValueFilterMode(localIdentifier, draftMode);
        }
        setIsConfigurationOpen(false);
    }, [
        changeMeasureValueFilterMode,
        changeMeasureValueFilterTitle,
        customTitle,
        defaultMetricTitle,
        draftMode,
        draftTitle,
        localIdentifier,
        mode,
    ]);

    const isConfigurationSaveDisabled =
        draftTitle.trim().length === 0 || (draftTitle === metricTitle && draftMode === mode);

    const configurationBodyPropsRef = useRef<ComponentProps<typeof MeasureValueFilterConfiguration> | null>(
        null,
    );
    configurationBodyPropsRef.current = {
        intl,
        titleText,
        resetTitleText,
        modeCategoryTitleText,
        title: draftTitle,
        defaultTitle: defaultMetricTitle,
        mode: draftMode,
        showConfigModeSection: !!capabilities.supportsHiddenAndLockedFiltersOnUI,
        onTitleChange: setDraftTitle,
        onTitleReset: () => setDraftTitle(defaultMetricTitle),
        onModeChange: setDraftMode,
    };

    const DropdownActionsComponent = useMemo(() => {
        function DropdownActions(props: IMeasureValueFilterDropdownActionsProps) {
            return isConfigurationOpen ? (
                <CustomConfigureMeasureValueFilterDropdownActions
                    isSaveDisabled={isConfigurationSaveDisabled}
                    onSaveButtonClick={saveConfiguration}
                    onCancelButtonClick={closeConfiguration}
                    cancelText={cancelText}
                    saveText={saveText}
                />
            ) : (
                <CustomMeasureValueFilterDropdownActions
                    {...props}
                    isConfigurationButtonVisible={isEditMode}
                    onConfigurationButtonClick={openConfiguration}
                    cancelText={props.withoutApply ? closeText : cancelText}
                    applyText={applyText}
                />
            );
        }

        return DropdownActions;
    }, [
        applyText,
        cancelText,
        closeConfiguration,
        closeText,
        isConfigurationOpen,
        isConfigurationSaveDisabled,
        isEditMode,
        openConfiguration,
        saveConfiguration,
        saveText,
    ]);

    const ConfigurationBodyComponent = useMemo(() => {
        function ConfigurationBody(_props: IMeasureValueFilterBodyProps) {
            const configurationBodyProps = configurationBodyPropsRef.current;
            return configurationBodyProps ? (
                <MeasureValueFilterConfiguration {...configurationBodyProps} />
            ) : null;
        }

        return ConfigurationBody;
    }, []);

    const BodyComponent = isConfigurationOpen ? ConfigurationBodyComponent : undefined;

    const DropdownButtonComponent = useMemo(() => {
        function DashboardMeasureValueFilterDropdownButton({
            isActive,
            buttonTitle,
            onClick,
        }: IMeasureValueFilterDropdownButtonProps) {
            return (
                <UiControlButton
                    title={buttonTitle}
                    titleClassName="s-mvf-button-title"
                    subtitle={
                        <span className="gd-measure-value-filter-dropdown-button-selected-items__next s-mvf-button-subtitle">
                            {conditionLabel}
                        </span>
                    }
                    titleExtension={
                        <MeasureValueFilterVisibilityIcon
                            visibilityIcon={visibilityIcon}
                            disabled={readonly}
                        />
                    }
                    isOpen={isActive}
                    isDraggable={isEditMode}
                    disabled={readonly}
                    disabledTooltip={
                        readonly ? intl.formatMessage({ id: "filters.locked.filter.tooltip" }) : undefined
                    }
                    onClick={onClick}
                    className={cx("gd-mvf-dashboard-filter-button__next", "s-dashboard-mvf-button", {
                        "gd-is-active": isActive,
                        "gd-is-draggable": isEditMode,
                        disabled: readonly,
                    })}
                />
            );
        }

        return DashboardMeasureValueFilterDropdownButton;
    }, [conditionLabel, intl, isEditMode, readonly, visibilityIcon]);

    return (
        <MeasureValueFilter
            onApply={handleApply}
            onChange={isApplyAllAtOnceEnabledAndSet ? handleChange : undefined}
            withoutApply={isApplyAllAtOnceEnabledAndSet}
            BodyComponent={BodyComponent}
            DropdownActionsComponent={DropdownActionsComponent}
            DropdownButtonComponent={DropdownButtonComponent}
            onCancel={handleClose}
            filter={dropdownFilter}
            measureIdentifier={localIdentifier}
            buttonTitle={metricTitle}
            measureTitle={metricTitle}
            usePercentage={usePercentage}
            format={format}
            useShortFormat
            displayTreatNullAsZeroOption
            separators={separators}
            locale={locale}
            enableOperatorSelection
            enableMultipleConditions
            isDimensionalityEnabled={false}
            isFilterSummaryEnabled
            autoOpen={autoOpen}
        />
    );
}
