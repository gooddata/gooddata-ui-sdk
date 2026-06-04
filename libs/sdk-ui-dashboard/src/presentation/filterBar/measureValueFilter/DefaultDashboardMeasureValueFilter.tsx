// (C) 2026 GoodData Corporation

import { type ComponentProps, type ReactElement, useCallback, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    type DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterConfigModeValues,
    type IMeasureMetadataObject,
    type IMeasureValueFilter,
    type ObjRef,
    areObjRefsEqual,
    isObjRef,
} from "@gooddata/sdk-model";
import {
    type IDimensionalityItem,
    type IFilterButtonCustomIcon,
    type IMeasureValueFilterBodyProps,
    type IMeasureValueFilterDropdownActionsProps,
    type IMeasureValueFilterDropdownButtonProps,
    MeasureValueFilter,
} from "@gooddata/sdk-ui-filters";
import { Bubble, BubbleHoverTrigger, type IAlignPoint, UiControlButton } from "@gooddata/sdk-ui-kit";

import { setDashboardMeasureValueFilterConfigMode } from "../../../model/commands/dashboard.js";
import {
    setMeasureValueFilterDimensionality,
    setMeasureValueFilterTitle,
} from "../../../model/commands/filters.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../model/react/useDashboardCommandProcessing.js";
import { selectBackendCapabilities } from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectIsApplyFiltersAllAtOnceEnabledAndSet } from "../../../model/store/config/configSelectors.js";
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
import {
    getSharedDashboardMvfProps,
    normalizeMeasureValueFilterConditions,
    useDashboardMeasureValueFilterData,
} from "./useDashboardMeasureValueFilterData.js";

const DEFAULT_VISIBILITY_BUBBLE_ALIGN_POINTS: IAlignPoint[] = [{ align: "bc tl", offset: { x: 0, y: 5 } }];

function areDimensionalityRefsEqual(a: ObjRef[] | undefined, b: ObjRef[] | undefined): boolean {
    const aRefs = a ?? [];
    const bRefs = b ?? [];

    return aRefs.length === bRefs.length && aRefs.every((aRef, index) => areObjRefsEqual(aRef, bRefs[index]));
}

function dimensionalityItemsToObjRefs(items: IDimensionalityItem[]): ObjRef[] | undefined {
    const refs = items.map((item) => item.identifier).filter(isObjRef);
    return refs.length > 0 ? refs : undefined;
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
    const {
        filter,
        readonly,
        autoOpen,
        onMeasureValueFilterChanged,
        onMeasureValueFilterClose,
        MeasureValueFilterComponent: CustomMeasureValueFilterComponent,
        passDropdownButton = true,
    } = props;
    const intl = useIntl();

    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const measureValueFilterConfigsModeMap = useDashboardSelector(selectMeasureValueFilterConfigsModeMap);
    const { cancelText, closeText, saveText, applyText, titleText, resetTitleText, modeCategoryTitleText } =
        useAttributeFilterConfigTexts();

    const workingFilter = useDashboardSelector(
        selectWorkingFilterContextMeasureValueFilterByLocalId(
            filter.dashboardMeasureValueFilter.localIdentifier,
        ),
    );
    const filterToDisplay = isApplyAllAtOnceEnabledAndSet ? (workingFilter ?? filter) : filter;
    const mvfData = useDashboardMeasureValueFilterData(filter, filterToDisplay);
    const {
        localIdentifier,
        customTitle,
        defaultMetricTitle,
        catalogMetric,
        isMissingMetric,
        metricTitle,
        conditionLabel,
        dimensionality,
        dimensionalityItems,
        catalogDimensionality,
        loadCatalogDimensionality,
    } = mvfData;

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
    const [draftDimensionalityItems, setDraftDimensionalityItems] = useState(dimensionalityItems);

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

    const { run: changeMeasureValueFilterDimensionality } = useDashboardCommandProcessing({
        commandCreator: setMeasureValueFilterDimensionality,
        successEvent: "GDC.DASH/EVT.FILTER_CONTEXT.MEASURE_VALUE_FILTER.DIMENSIONALITY_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

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

    const loadMetricDetails = useCallback(
        async (): Promise<IMeasureMetadataObject | undefined> => catalogMetric?.measure,
        [catalogMetric],
    );

    const openConfiguration = useCallback(() => {
        setDraftTitle(metricTitle);
        setDraftMode(mode);
        setDraftDimensionalityItems(dimensionalityItems);
        setIsConfigurationOpen(true);
    }, [dimensionalityItems, metricTitle, mode]);

    const closeConfiguration = useCallback(() => {
        setDraftTitle(metricTitle);
        setDraftMode(mode);
        setDraftDimensionalityItems(dimensionalityItems);
        setIsConfigurationOpen(false);
    }, [dimensionalityItems, metricTitle, mode]);

    const saveConfiguration = useCallback(() => {
        const normalizedTitle = draftTitle.trim();
        const titleToSave = normalizedTitle === defaultMetricTitle ? undefined : normalizedTitle;
        const dimensionalityToSave = dimensionalityItemsToObjRefs(draftDimensionalityItems);

        if (titleToSave !== customTitle) {
            changeMeasureValueFilterTitle(localIdentifier, titleToSave);
        }
        if (draftMode !== mode) {
            changeMeasureValueFilterMode(localIdentifier, draftMode);
        }
        if (!areDimensionalityRefsEqual(dimensionalityToSave, dimensionality)) {
            changeMeasureValueFilterDimensionality(localIdentifier, dimensionalityToSave);
        }
        setIsConfigurationOpen(false);
    }, [
        changeMeasureValueFilterDimensionality,
        changeMeasureValueFilterMode,
        changeMeasureValueFilterTitle,
        customTitle,
        defaultMetricTitle,
        dimensionality,
        draftDimensionalityItems,
        draftMode,
        draftTitle,
        localIdentifier,
        mode,
    ]);

    const draftDimensionality = useMemo(
        () => dimensionalityItemsToObjRefs(draftDimensionalityItems),
        [draftDimensionalityItems],
    );
    const isConfigurationSaveDisabled =
        draftTitle.trim().length === 0 ||
        (draftTitle === metricTitle &&
            draftMode === mode &&
            areDimensionalityRefsEqual(draftDimensionality, dimensionality));

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
        dimensionality: draftDimensionalityItems,
        catalogDimensionality,
        loadCatalogDimensionality,
        showConfigModeSection: !!capabilities.supportsHiddenAndLockedFiltersOnUI,
        onTitleChange: setDraftTitle,
        onTitleReset: () => setDraftTitle(defaultMetricTitle),
        onModeChange: setDraftMode,
        onDimensionalityChange: setDraftDimensionalityItems,
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
            buttonSubtitle,
            buttonTitleExtension,
            disabled,
            onClick,
            dropdownId,
        }: IMeasureValueFilterDropdownButtonProps) {
            const button = (
                <UiControlButton
                    title={buttonTitle}
                    titleClassName="s-mvf-button-title"
                    dropdownId={dropdownId}
                    subtitleClassName="gd-measure-value-filter-dropdown-button-selected-items__next s-mvf-button-subtitle"
                    icon={isMissingMetric ? <i className="gd-icon gd-icon-circle-cross" /> : undefined}
                    subtitle={
                        <span className="gd-measure-value-filter-dropdown-button-selected-items__next s-mvf-button-subtitle">
                            {buttonSubtitle ?? conditionLabel}
                        </span>
                    }
                    titleExtension={
                        buttonTitleExtension ?? (
                            <MeasureValueFilterVisibilityIcon
                                visibilityIcon={visibilityIcon}
                                disabled={readonly}
                            />
                        )
                    }
                    isOpen={isActive}
                    isDraggable={isEditMode}
                    isError={isMissingMetric}
                    disabled={disabled ?? readonly}
                    disabledTooltip={
                        readonly ? intl.formatMessage({ id: "filters.locked.filter.tooltip" }) : undefined
                    }
                    onClick={onClick}
                    className={cx("gd-mvf-dashboard-filter-button__next", "s-dashboard-mvf-button", {
                        "gd-is-active": isActive,
                        "gd-is-draggable": isEditMode,
                        disabled: readonly,
                        "s-mvf-missing-metric": isMissingMetric,
                    })}
                />
            );

            if (isMissingMetric && !isActive) {
                return (
                    <BubbleHoverTrigger tagName="div" showDelay={200} hideDelay={0}>
                        {button}
                        <Bubble className="bubble-negative" alignPoints={[{ align: "bc tc" }]}>
                            {intl.formatMessage({ id: "filters.mvf.missingMetric.tooltip" })}
                        </Bubble>
                    </BubbleHoverTrigger>
                );
            }

            return button;
        }

        return DashboardMeasureValueFilterDropdownButton;
    }, [conditionLabel, intl, isEditMode, isMissingMetric, readonly, visibilityIcon]);

    const MeasureValueFilterComponent = CustomMeasureValueFilterComponent ?? MeasureValueFilter;

    return (
        <MeasureValueFilterComponent
            {...getSharedDashboardMvfProps(mvfData)}
            onApply={handleApply}
            buttonSubtitle={conditionLabel}
            loadMetricDetails={isEditMode ? loadMetricDetails : undefined}
            isHeaderEnabled={!isConfigurationOpen}
            buttonTitleExtension={
                <MeasureValueFilterVisibilityIcon visibilityIcon={visibilityIcon} disabled={readonly} />
            }
            buttonDisabled={readonly}
            onChange={isApplyAllAtOnceEnabledAndSet ? handleChange : undefined}
            withoutApply={isApplyAllAtOnceEnabledAndSet}
            BodyComponent={BodyComponent}
            DropdownActionsComponent={DropdownActionsComponent}
            DropdownButtonComponent={passDropdownButton ? DropdownButtonComponent : undefined}
            onCancel={handleClose}
            autoOpen={autoOpen}
            fullscreenOnMobile
            isViewMode={!isEditMode}
        />
    );
}
