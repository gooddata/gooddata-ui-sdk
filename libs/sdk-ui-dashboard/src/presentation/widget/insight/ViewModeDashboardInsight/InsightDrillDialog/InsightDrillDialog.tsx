// (C) 2020-2025 GoodData Corporation
import React, { useCallback, useState } from "react";
import {
    idRef,
    IInsight,
    insightTitle,
    isInsight,
    IInsightWidget,
    IInsightWidgetDescriptionConfiguration,
    IFilter,
} from "@gooddata/sdk-model";
import {
    Button,
    FullScreenOverlay,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    RichText,
    UiIcon,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";
import { ILocale, OnLoadingChanged } from "@gooddata/sdk-ui";
import cx from "classnames";

import { DOWNLOADER_ID } from "../../../../../_staging/fileUtils/downloadFile.js";
import { useInsightExport } from "../../../common/index.js";
import { OnDrillDownSuccess, WithDrillSelect } from "../../../../drill/index.js";
import { IntlWrapper } from "../../../../localization/index.js";
import { useDashboardComponentsContext } from "../../../../dashboardContexts/index.js";
import {
    selectEnableRichTextDynamicReferences,
    selectExecutionTimestamp,
    selectSeparators,
    useDashboardSelector,
    useWidgetExecutionsHandler,
} from "../../../../../model/index.js";
import { ThemedLoadingEqualizer } from "../../../../presentationComponents/index.js";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../../../constants/index.js";

import { DrillDialog } from "./DrillDialog.js";
import { DrillDialogInsight } from "./DrillDialogInsight.js";
import { getTitleWithBreadcrumbs } from "./getTitleWithBreadcrumbs.js";
import { useIntl } from "react-intl";

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

export const InsightDrillDialog = (props: InsightDrillDialogProps): JSX.Element => {
    const {
        widget,
        locale,
        breadcrumbs,
        insight,
        enableDrillDescription,
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

    const handleLoadingChanged = useCallback<OnLoadingChanged>(({ isLoading }) => {
        setIsLoading(isLoading);
        executionsHandler.onLoadingChanged({ isLoading });
    }, []);

    const [widgetFilters, setWidgetFilters] = useState<IFilter[] | undefined>(undefined);
    const handleFiltersReady = useCallback((filters: IFilter[] | undefined) => {
        setWidgetFilters(filters);
    }, []);

    const baseInsightTitle = insightTitle(insight);

    const {
        exportCSVEnabled,
        exportXLSXEnabled,
        exportCSVRawEnabled,
        isExportRawVisible,
        isExporting,
        onExportRawCSV,
        onExportCSV,
        onExportXLSX,
    } = useInsightExport({
        title: getTitleWithBreadcrumbs(baseInsightTitle, breadcrumbs),
        widgetRef: DRILL_MODAL_EXECUTION_PSEUDO_REF,
        insight,
        widget,
    });

    const OverlayComponent = isMobileDevice ? FullScreenOverlay : Overlay;

    const [isOpen, setIsOpen] = useState(false);
    const descriptionConfig = widget.configuration?.description ?? defaultDescriptionConfig;
    const description = getInsightWidgetDescription(descriptionConfig, widget, insight.insight);

    return (
        <OverlayControllerProvider overlayController={overlayController}>
            <OverlayComponent
                className="gd-drill-modal-overlay"
                isModal
                closeOnEscape
                closeOnOutsideClick
                ignoreClicksOnByClass={overlayIgnoredClasses}
                onClose={onClose}
                positionType="fixed"
            >
                <IntlWrapper locale={locale}>
                    <DrillDialog
                        insightTitle={baseInsightTitle}
                        isBackButtonVisible={breadcrumbs.length > 1}
                        onBackButtonClick={onBackButtonClick}
                        onCloseDialog={onClose}
                        breadcrumbs={breadcrumbs}
                        exportAvailable={exportXLSXEnabled || exportCSVEnabled}
                        exportXLSXEnabled={exportXLSXEnabled}
                        exportCSVEnabled={exportCSVEnabled}
                        exportCSVRawEnabled={exportCSVRawEnabled}
                        enableDrillDescription={enableDrillDescription}
                        onExportXLSX={onExportXLSX}
                        onExportCSV={onExportCSV}
                        onExportCSVRaw={onExportRawCSV}
                        isLoading={isLoading}
                        isExporting={isExporting}
                        isExportRawVisible={isExportRawVisible}
                    >
                        <WithDrillSelect
                            widgetRef={widget.ref}
                            insight={props.insight}
                            onDrillDownSuccess={onDrillDown}
                        >
                            {({ onDrill }) => {
                                return description && enableDrillDescription ? (
                                    <div className="drill-dialog-insight-container">
                                        <InsightDrillDialogDescriptionContent
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
                                    />
                                );
                            }}
                        </WithDrillSelect>
                    </DrillDialog>
                </IntlWrapper>
            </OverlayComponent>
        </OverlayControllerProvider>
    );
};

interface InsightDrillDialogDescriptionButtonProps {
    isMobileDevice: boolean;
    isOpen: boolean;
    setIsOpen: (fn: (open: boolean) => boolean) => void;
}

function InsightDrillDialogDescriptionButton({
    isOpen,
    isMobileDevice,
    setIsOpen,
}: InsightDrillDialogDescriptionButtonProps) {
    const { formatMessage } = useIntl();

    const accessibilityAriaLabel = formatMessage({ id: "widget.options.description" });
    return (
        <Button
            className={cx("gd-button-primary gd-button-icon-only drill-dialog-insight-container-button", {
                "is-active": isOpen,
                "drill-dialog-insight-container-button--open": isOpen,
                "drill-dialog-insight-container-button--mobile": isMobileDevice,
            })}
            onClick={() => setIsOpen((open) => !open)}
            accessibilityConfig={{
                ariaLabel: accessibilityAriaLabel,
            }}
            value={<UiIcon type="question" size={18} />}
        />
    );
}

interface InsightDrillDialogDescriptionContentProps {
    isMobileDevice: boolean;
    isOpen: boolean;
    description: string;
    widgetFilters?: IFilter[];
    LoadingComponent?: React.ComponentType;
}

function InsightDrillDialogDescriptionContent({
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
