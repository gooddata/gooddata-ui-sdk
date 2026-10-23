// (C) 2021-2026 GoodData Corporation

import { type FC, type ReactNode, useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import {
    type IInsight,
    type IMeasureMetadataObject,
    type IMetadataObject,
    type ISeparators,
    type IWorkspacePermissions,
} from "@gooddata/sdk-model";

import { type ITab } from "../shared/Tabs/Tab.js";
import { type ITabContentProps, type ITabsProps } from "../shared/Tabs/Tabs.data.js";
import { Tabs } from "../shared/Tabs/Tabs.js";
import { makeStyles } from "../shared/theme/index.js";

import { useFeaturesAndSettings } from "./FeaturesAndSettings/index.js";
import { MaqlResultArea } from "./Form/EditMetricCenterForm.js";
import { MaqlResultTableArea } from "./Form/MaqlResult/MaqlResult.js";
import { type IPrefixes } from "./Form/Prefixes/PrefixesContext.js";
import { type IDeleteMetricInfo } from "./metric/deleteInfo.js";
import { type IMeasureDef } from "./metric/metricHelpers.js";
import { type ISaveMetricInfo } from "./metric/saveInfo.js";
import { type IMetricInfo } from "./MetricState/metricState.data.js";
import { TabContent } from "./MetricState/TabContent.js";

const useStyles = makeStyles()(() => {
    return {
        root: {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
        },
        content: {
            flex: "1 1 auto",
        },
        maximized: {
            [`*[data-area="${MaqlResultArea}"]`]: {
                [`*[data-area="${MaqlResultTableArea}"]`]: {
                    minHeight: "35vh",
                },
            },
        },
    };
});

export interface IMetricStateProps {
    permissions?: IWorkspacePermissions;
    prefixes?: IPrefixes;
    tabsProps: ITabsProps<IMetricInfo>;
    onDelete?: (metric: IMeasureMetadataObject, info: IDeleteMetricInfo, err: Error | null) => void;
    onSave?: (
        tab: ITab<IMetricInfo>,
        metric: IMeasureMetadataObject,
        info: ISaveMetricInfo,
        err: Error | null,
    ) => Promise<void> | void;
    onMetricsChange?: (metric: IMeasureDef) => void;
    onCancel?: (tab: ITab<IMetricInfo>) => void;
    onValueChange?: (metric: IMeasureDef, valid: boolean) => void;
    updateTab: (tab: ITab<IMetricInfo>, props: Partial<ITab<IMetricInfo>>) => void;
    updateData: (tab: ITab<IMetricInfo>, data: IMetricInfo) => void;
    closeTab: (tab: ITab<IMetricInfo>) => void;
    createTab?: () => void;
    activateTab: (tab: ITab<IMetricInfo>) => void;
    setMinimized?: (value: boolean) => void;
    setMaximized?: (value: boolean) => void;
    closeAllTabs?: () => void;
    activeInsight?: IInsight;
    insightOpenType?: "external" | "internal";
    onInsightClick?: (object: IInsight) => void;
    metricOpenType?: "external" | "internal";
    onMetricClick?: (object: IMetadataObject) => void;
    isWhiteLabeled?: boolean;
    separators?: ISeparators;
    maximized?: boolean;
    useReferences?: boolean;
    currencyFormatOverride?: string | null;
    enableMetricFormatOverrides?: boolean;
}

const MetricTabs = Tabs as unknown as FC<ITabsProps<IMetricInfo>>;

export function MetricsState({
    permissions,
    prefixes,
    tabsProps,
    updateTab,
    updateData,
    createTab,
    closeAllTabs,
    setMinimized,
    maximized,
    setMaximized,
    metricOpenType,
    onMetricClick,
    activeInsight,
    insightOpenType,
    onInsightClick,
    onMetricsChange,
    onSave,
    onDelete,
    onCancel,
    onValueChange,
    isWhiteLabeled,
    separators,
    useReferences,
    currencyFormatOverride,
    enableMetricFormatOverrides,
}: IMetricStateProps) {
    const intl = useIntl();
    const { canMaximize } = useFeaturesAndSettings();
    const { classes, cx } = useStyles();

    const onDeleteCallback = useCallback(
        (_tab: ITab<IMetricInfo>, metric: IMeasureMetadataObject) => {
            if (onDelete) {
                onDelete(metric, { references: {} }, null);
            }
        },
        [onDelete],
    );

    const renderTab: (props: ITabContentProps<IMetricInfo>) => ReactNode | undefined = useCallback(
        ({ tab }) => (
            <div className={classes.content} key={tab.id}>
                <TabContent
                    key={tab.id}
                    locale={intl.locale}
                    focusedField={tab.data.focusedField}
                    generateNewId={tab.data.generateNewId}
                    saveMode={tab.data.saveMode}
                    tab={tab}
                    prefixes={prefixes}
                    permissions={permissions}
                    updateTab={updateTab}
                    updateData={updateData}
                    onSave={onSave}
                    onDelete={onDeleteCallback}
                    activeInsight={activeInsight}
                    insightOpenType={insightOpenType}
                    onInsightClick={onInsightClick}
                    metricOpenType={metricOpenType}
                    onMetricClick={onMetricClick}
                    onMetricsChange={onMetricsChange}
                    onCancel={onCancel}
                    onValueChange={onValueChange}
                    isWhiteLabeled={isWhiteLabeled}
                    separators={separators}
                    useReferences={useReferences}
                    currencyFormatOverride={currencyFormatOverride}
                    enableMetricFormatOverrides={enableMetricFormatOverrides}
                />
            </div>
        ),
        [
            activeInsight,
            classes.content,
            insightOpenType,
            intl.locale,
            isWhiteLabeled,
            separators,
            metricOpenType,
            onCancel,
            onDeleteCallback,
            onInsightClick,
            onMetricClick,
            onMetricsChange,
            onSave,
            onValueChange,
            prefixes,
            permissions,
            updateData,
            updateTab,
            useReferences,
            currencyFormatOverride,
            enableMetricFormatOverrides,
        ],
    );

    const handleMinimize = useCallback(() => setMinimized?.(true), [setMinimized]);
    const handleMaximize = useCallback((state: boolean) => setMaximized?.(state), [setMaximized]);

    const locales = useMemo(
        () => ({
            createTooltip: intl.formatMessage({ id: "metricComponent.createMetric.title" }),
            titlePlaceholder: intl.formatMessage({
                id: "metricComponent.editMetricForm.namePlaceholder",
            }),
        }),
        [intl],
    );

    return (
        <>
            {tabsProps.tabs.length > 0 && (
                <MetricTabs
                    {...tabsProps}
                    className={cx(classes.root, maximized && classes.maximized)}
                    minimizable
                    maximizable={canMaximize}
                    closeable
                    onTabCreate={createTab}
                    onTabsMinimize={handleMinimize}
                    maximized={maximized}
                    onTabsMaximizable={handleMaximize}
                    onTabsClose={closeAllTabs}
                    render={renderTab}
                    locales={locales}
                />
            )}
        </>
    );
}
