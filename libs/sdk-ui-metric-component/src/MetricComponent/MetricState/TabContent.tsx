// (C) 2021-2026 GoodData Corporation

import {
    type IInsight,
    type IMeasureMetadataObject,
    type IMetadataObject,
    type ISeparators,
    type IWorkspacePermissions,
} from "@gooddata/sdk-model";

import { type ITab } from "../../shared/Tabs/Tab.js";
import { type SaveNameMode } from "../Content/EditMetricContent.data.js";
import { EditMetric } from "../EditMetric.js";
import { type FormField } from "../Form/data.js";
import { type IPrefixes } from "../Form/Prefixes/PrefixesContext.js";
import { type IMeasureDef } from "../metric/metricHelpers.js";
import { type ISaveMetricInfo } from "../metric/saveInfo.js";

import { useOnChangeCallback } from "./hooks/useOnChangeCallback.js";
import { useOnDeleteCallback } from "./hooks/useOnDeleteCallback.js";
import { useOnSaveCallback } from "./hooks/useOnSaveCallback.js";
import { type IMetricInfo } from "./metricState.data.js";

interface ITabContentProps {
    tab: ITab<IMetricInfo>;
    generateNewId?: boolean;
    focusedField?: FormField;
    saveMode?: SaveNameMode;
    locale?: string;
    prefixes?: IPrefixes;
    permissions?: IWorkspacePermissions;
    updateTab: (tab: ITab<IMetricInfo>, props: Partial<ITab<IMetricInfo>>) => void;
    updateData: (tab: ITab<IMetricInfo>, data: IMetricInfo) => void;
    onSave?: (
        tab: ITab<IMetricInfo>,
        metric: IMeasureMetadataObject,
        info: ISaveMetricInfo,
        err: Error | null,
    ) => Promise<void> | void;
    onDelete?: (tab: ITab<IMetricInfo>, metric: IMeasureMetadataObject) => void;
    onMetricsChange?: (metric: IMeasureDef) => void;
    activeInsight?: IInsight;
    insightOpenType?: "external" | "internal";
    onInsightClick?: (object: IInsight) => void;
    metricOpenType?: "external" | "internal";
    onMetricClick?: (object: IMetadataObject) => void;
    onCancel?: (tab: ITab<IMetricInfo>) => void;
    onValueChange?: (metric: IMeasureDef, valid: boolean) => void;
    isWhiteLabeled?: boolean;
    separators?: ISeparators;
    useReferences?: boolean;
    currencyFormatOverride?: string | null;
    enableMetricFormatOverrides?: boolean;
}

export function TabContent({
    tab,
    locale,
    prefixes,
    focusedField,
    generateNewId,
    saveMode,
    updateTab,
    onSave,
    updateData,
    onDelete,
    onMetricsChange,
    metricOpenType,
    onMetricClick,
    activeInsight,
    insightOpenType,
    onInsightClick,
    permissions,
    onCancel,
    onValueChange,
    isWhiteLabeled,
    separators,
    useReferences,
    currencyFormatOverride,
    enableMetricFormatOverrides,
}: ITabContentProps) {
    const { onChangeMetric, onChangeSetting, onChangeDraftAccess } = useOnChangeCallback({
        tab,
        updateTab,
        updateData,
        onValueChange,
    });

    const onSaveCallback = useOnSaveCallback(tab, onSave);
    const onDeleteCallback = useOnDeleteCallback(tab, onDelete);

    return (
        <EditMetric
            initial={tab.data.initial}
            metric={tab.data.current}
            draftAccess={tab.data.draftAccess}
            onDraftAccessChange={onChangeDraftAccess}
            setting={{
                sqlOpen: tab.data.sqlOpen,
                computedFor: tab.data.computedFor,
                display: tab.data.display,
                attributes: tab.data.attributes,
            }}
            prefixes={prefixes}
            locale={locale}
            focusedField={focusedField}
            generateNewId={generateNewId}
            saveMode={saveMode}
            onMetricsChange={onMetricsChange}
            onCancel={() => onCancel?.(tab)}
            activeInsight={activeInsight}
            insightOpenType={insightOpenType}
            onInsightClick={onInsightClick}
            metricOpenType={metricOpenType}
            onMetricClick={onMetricClick}
            onValueChange={onChangeMetric}
            onSettingChange={onChangeSetting}
            onSave={onSaveCallback}
            onDelete={onDeleteCallback}
            showCloseButton={false}
            permissions={permissions}
            isWhiteLabeled={isWhiteLabeled}
            separators={separators}
            useReferences={useReferences}
            currencyFormatOverride={currencyFormatOverride}
            enableMetricFormatOverrides={enableMetricFormatOverrides}
        />
    );
}
