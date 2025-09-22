// (C) 2020-2025 GoodData Corporation

import { ComponentType, ReactElement, useCallback, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    IFilter,
    IInsight,
    IInsightWidget,
    IInsightWidgetDescriptionConfiguration,
    idRef,
    insightTitle,
    insightVisualizationType,
    isInsight,
} from "@gooddata/sdk-model";
import { ILocale, OnLoadingChanged } from "@gooddata/sdk-ui";
import {
    Button,
    FullScreenOverlay,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    RichText,
    UiIcon,
    UiTooltip,
    isNotDocumentFocused,
    useIdPrefixed,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";

import { DrillDialog } from "./DrillDialog.js";
import { DrillDialogInsight } from "./DrillDialogInsight.js";
import { getTitleWithBreadcrumbs } from "./getTitleWithBreadcrumbs.js";
import { DOWNLOADER_ID } from "../../../../../_staging/fileUtils/downloadFile.js";
import {
    selectEnableRichTextDynamicReferences,
    selectExecutionTimestamp,
    selectSeparators,
    useDashboardSelector,
    useWidgetExecutionsHandler,
} from "../../../../../model/index.js";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../../../constants/index.js";
import { useDashboardComponentsContext } from "../../../../dashboardContexts/index.js";
import { DrillStep, OnDrillDownSuccess, WithDrillSelect } from "../../../../drill/index.js";
import { IntlWrapper } from "../../../../localization/index.js";
import { ThemedLoadingEqualizer } from "../../../../presentationComponents/index.js";
import { useInsightExport } from "../../../common/index.js";
import { useShowAsTable } from "../../../showAsTableButton/useShowAsTable.js";
import { supportsShowAsTable } from "../../insightToTable.js";

// Header z-index start at  6000 so we need force all overlays z-indexes start at 6000 to be above header
const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

/**
 * @internal
 */
export interface InsightDrillDialogProps {
    enableDrillDescription: boolean;
    locale: ILocale;
    breadcrumbs: string[];
    widget: IInsightWidget;
    insight: IInsight;
    drillStep: DrillStep;
    onDrillDown?: OnDrillDownSuccess;
    onClose: () => void;
    onBackButtonClick: () => void;
}

const overlayIgnoredClasses = [
    ".s-sort-direction-arrow",
    ".gd-export-dialog",
    ".options-menu-export-xlsx",
    ".options-menu-export-csv",
    `#${DOWNLOADER_ID}`,
];

const defaultDescriptionConfig: IInsightWidgetDescriptionConfiguration = {
    source: "insight",
    includeMetrics: false,
    visible: true,
};

const getInsightWidgetDescription = (
    descriptionConfig: IInsightWidgetDescriptionConfiguration,
    widget: IInsightWidget | undefined,
    insight: IInsight["insight"] | undefined,
): string | undefined => {
    // We will handler description configuration only for insight widget that is
    // same as insight in dialog
    if (isInsight(widget) && widget.insight.identifier === insight?.identifier) {
        if (!descriptionConfig.visible) {
            return undefined;
        }
        const useInsightDescription = descriptionConfig.source === "insight";
        return useInsightDescription ? insight?.summary : widget?.description;
    }
    // If widget is not insight or insight is not same as insight in dialog, we will use insight summary as default
    return insight?.summary;
};

const DRILL_MODAL_EXECUTION_PSEUDO_REF = idRef("@@GDC_DRILL_MODAL");

export function InsightDrillDialog(props: InsightDrillDialogProps): ReactElement {
    const {
        widget,
        locale,
        breadcrumbs,
        insight,
        enableDrillDescription,
        drillStep,
        onClose,
        onBackButtonClick,
        onDrillDown,
    } = props;

    const isMobileDevice = useMediaQuery("mobileDevice");

    const [isLoading, setIsLoading] = useState(false);

    const executionsHandler = useWidgetExecutionsHandler(DRILL_MODAL_EXECUTION_PSEUDO_REF);

    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext({
        /**
         * There is a need to use Loading spinner instead of "Running three dots" loader while drill is loading.
         * If no custom loading component is provided, LoadingComponent defaults to Loading spinner.
         */
        LoadingComponent: ThemedLoadingEqualizer,
    });

    const handleLoadingChanged = useCallback<OnLoadingChanged>(
        ({ isLoading }) => {
            setIsLoading(isLoading);
            executionsHandler.onLoadingChanged.call(null, { isLoading });
        },
        [executionsHandler.onLoadingChanged],
    );

    const [widgetFilters, setWidgetFilters] = useState<IFilter[] | undefined>(undefined);
    const handleFiltersReady = useCallback((filters: IFilter[] | undefined) => {
        setWidgetFilters(filters);
    }, []);

    const baseInsightTitle = insightTitle(insight);

    const {
        exportCSVEnabled,
        exportXLSXEnabled,
        exportCSVRawEnabled,
        exportPdfTabularEnabled,
        isExportRawVisible,
        isExporting,
        isExportPdfTabularVisible,
        onExportRawCSV,
        onExportCSV,
        onExportXLSX,
        onExportPdfTabular,
    } = useInsightExport({
        title: getTitleWithBreadcrumbs(baseInsightTitle, breadcrumbs),
        widgetRef: DRILL_MODAL_EXECUTION_PSEUDO_REF,
        insight,
        widget,
        useNewTabularExport: false,
    });

    const dialogId = useIdPrefixed(`drillDialog-${breadcrumbs.length}`);
    const descriptionId = useIdPrefixed(`description-${breadcrumbs.length}`);
    const OverlayComponent = isMobileDevice ? FullScreenOverlay : Overlay;

    const [isOpen, setIsOpen] = useState(false);
    const descriptionConfig = widget.configuration?.description ?? defaultDescriptionConfig;
    const description = getInsightWidgetDescription(descriptionConfig, widget, insight.insight);

    // Get original widget state but don't use its toggleWidgetAsTable to avoid affecting original widget
    const originalWidgetShowAsTableState = useShowAsTable(widget).isWidgetAsTable;

    // Use local state for drill dialog to isolate from original widget
    const [drillDialogIsAsTable, setDrillDialogIsAsTable] = useState(originalWidgetShowAsTableState);

    // Create isolated toggle function that only affects local state
    const toggleWidgetAsTable = useCallback(() => {
        setDrillDialogIsAsTable((prev) => !prev);
    }, []);

    const onCloseDialog = () => {
        onClose();
    };

    const isShowAsTableVisible = supportsShowAsTable(insightVisualizationType(insight));

    return (
        <OverlayControllerProvider overlayController={overlayController}>
            <OverlayComponent
                className="gd-drill-modal-overlay"
                isModal
                closeOnEscape
                closeOnOutsideClick
                ignoreClicksOnByClass={overlayIgnoredClasses}
                onClose={onCloseDialog}
                positionType="fixed"
            >
                <IntlWrapper locale={locale}>
                    <DrillDialog
                        insightTitle={baseInsightTitle}
                        isBackButtonVisible={breadcrumbs.length > 1}
                        onBackButtonClick={onBackButtonClick}
                        onCloseDialog={onCloseDialog}
                        breadcrumbs={breadcrumbs}
                        exportAvailable={exportXLSXEnabled || exportCSVEnabled}
                        exportXLSXEnabled={exportXLSXEnabled}
                        exportCSVEnabled={exportCSVEnabled}
                        exportCSVRawEnabled={exportCSVRawEnabled}
                        exportPDFEnabled={exportPdfTabularEnabled}
                        exportPDFVisible={isExportPdfTabularVisible}
                        enableDrillDescription={enableDrillDescription}
                        onExportXLSX={onExportXLSX}
                        onExportCSV={onExportCSV}
                        onExportCSVRaw={onExportRawCSV}
                        onExportPDF={onExportPdfTabular}
                        isLoading={isLoading}
                        isExporting={isExporting}
                        isExportRawVisible={isExportRawVisible}
                        isShowAsTableVisible={isShowAsTableVisible}
                        isWidgetAsTable={drillDialogIsAsTable}
                        onShowAsTable={toggleWidgetAsTable}
                        focusCheckFn={isNotDocumentFocused}
                        accessibilityConfig={{
                            dialogId,
                        }}
                    >
                        <WithDrillSelect
                            widgetRef={widget.ref}
                            insight={props.insight}
                            onDrillDownSuccess={onDrillDown}
                            closeBehavior={"closeOnSelect"}
                        >
                            {({ onDrill }) => {
                                return description && enableDrillDescription ? (
                                    <div className="drill-dialog-insight-container">
                                        <InsightDrillDialogDescriptionContent
                                            id={descriptionId}
                                            isOpen={isOpen}
                                            isMobileDevice={isMobileDevice}
                                            description={description}
                                            widgetFilters={widgetFilters}
                                            LoadingComponent={LoadingComponent}
                                        />
                                        <div className="drill-dialog-insight-container-insight">
                                            <InsightDrillDialogDescriptionButton
                                                isOpen={isOpen}
                                                isMobileDevice={isMobileDevice}
                                                setIsOpen={setIsOpen}
                                                descriptionId={descriptionId}
                                            />
                                            <DrillDialogInsight
                                                {...props}
                                                onDrill={onDrill}
                                                onLoadingChanged={handleLoadingChanged}
                                                onError={executionsHandler.onError}
                                                onWidgetFiltersReady={handleFiltersReady}
                                                pushData={executionsHandler.onPushData}
                                                ErrorComponent={ErrorComponent}
                                                LoadingComponent={LoadingComponent}
                                                drillStep={drillStep}
                                                isWidgetAsTable={drillDialogIsAsTable}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <DrillDialogInsight
                                        {...props}
                                        onDrill={onDrill}
                                        onLoadingChanged={handleLoadingChanged}
                                        onError={executionsHandler.onError}
                                        pushData={executionsHandler.onPushData}
                                        ErrorComponent={ErrorComponent}
                                        LoadingComponent={LoadingComponent}
                                        drillStep={drillStep}
                                        isWidgetAsTable={drillDialogIsAsTable}
                                    />
                                );
                            }}
                        </WithDrillSelect>
                    </DrillDialog>
                </IntlWrapper>
            </OverlayComponent>
        </OverlayControllerProvider>
    );
}

interface InsightDrillDialogDescriptionButtonProps {
    isMobileDevice: boolean;
    isOpen: boolean;
    descriptionId: string;
    setIsOpen: (fn: (open: boolean) => boolean) => void;
}

function InsightDrillDialogDescriptionButton({
    isOpen,
    isMobileDevice,
    setIsOpen,
    descriptionId,
}: InsightDrillDialogDescriptionButtonProps) {
    const { formatMessage } = useIntl();

    const accessibilityAriaLabel = formatMessage({ id: "widget.options.description" });
    return (
        <UiTooltip
            triggerBy={["hover", "focus"]}
            arrowPlacement="left"
            offset={isOpen ? 15 : undefined}
            content={accessibilityAriaLabel}
            anchor={
                <Button
                    className={cx(
                        "gd-button-primary gd-button-icon-only drill-dialog-insight-container-button",
                        {
                            "is-active": isOpen,
                            "drill-dialog-insight-container-button--open": isOpen,
                            "drill-dialog-insight-container-button--mobile": isMobileDevice,
                        },
                    )}
                    onClick={() => setIsOpen((open) => !open)}
                    accessibilityConfig={{
                        ariaLabel: accessibilityAriaLabel,
                        ariaDescribedBy: isOpen ? descriptionId : undefined,
                        ariaControls: descriptionId,
                        ariaExpanded: isOpen,
                    }}
                    value={<UiIcon type="question" size={18} ariaHidden />}
                />
            }
        />
    );
}

interface InsightDrillDialogDescriptionContentProps {
    id: string;
    isMobileDevice: boolean;
    isOpen: boolean;
    description: string;
    widgetFilters?: IFilter[];
    LoadingComponent?: ComponentType;
}

function InsightDrillDialogDescriptionContent({
    id,
    isOpen,
    isMobileDevice,
    description,
    widgetFilters,
    LoadingComponent,
}: InsightDrillDialogDescriptionContentProps) {
    const isRichTextReferencesEnabled = useDashboardSelector(selectEnableRichTextDynamicReferences);
    const separators = useDashboardSelector(selectSeparators);
    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);

    return (
        <div
            id={id}
            className={cx("drill-dialog-insight-container-description", {
                "drill-dialog-insight-container-description--open": isOpen,
                "drill-dialog-insight-container-description--mobile": isMobileDevice,
            })}
        >
            <div className="drill-dialog-insight-container-description-content">
                <RichText
                    value={description}
                    execConfig={{
                        timestamp: executionTimestamp,
                    }}
                    renderMode="view"
                    referencesEnabled={isRichTextReferencesEnabled}
                    filters={widgetFilters}
                    separators={separators}
                    LoadingComponent={LoadingComponent}
                />
            </div>
        </div>
    );
}
