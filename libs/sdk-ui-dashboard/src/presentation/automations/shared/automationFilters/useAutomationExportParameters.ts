// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { mapValues } from "lodash-es";

import {
    DashboardParameterModeValues,
    type IAutomationMetadataObject,
    type IDashboardExportParameter,
    type IDashboardParameter,
    type IParameterMetadataObject,
    type IdentifierRef,
    areObjRefsEqual,
    objRefToString,
} from "@gooddata/sdk-model";

import { getAutomationExportParametersByTab } from "../../../../_staging/automation/index.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectCatalogParameters } from "../../../../model/store/catalog/catalogSelectors.js";
import { selectEnableParameters } from "../../../../model/store/config/configSelectors.js";
import { selectWidgetLocalIdToTabIdMap } from "../../../../model/store/tabs/layout/layoutSelectors.js";
import {
    selectExportEffectiveParameters,
    selectSmartPersistedTabsParameters,
} from "../../../../model/store/tabs/parameters/parametersSelectors.js";
import { selectTabs } from "../../../../model/store/tabs/tabsSelectors.js";
import { type ITabState } from "../../../../model/store/tabs/tabsState.js";
import type { ExtendedDashboardWidget } from "../../../../model/types/layoutTypes.js";

import {
    type IAutomationParameter,
    availableAutomationParameters,
    exportParametersToValues,
    reconstructAutomationParametersFromExportParameters,
    shouldStoreExportParameters,
    toEffectiveParametersByTab,
} from "./automationParameters.js";

/**
 * Per-tab parameter working set, keyed by tab `localIdentifier`.
 * @internal
 */
export type EditedParametersByTab = Record<string, IAutomationParameter[]>;

/**
 * @internal
 */
export interface IUseAutomationExportParametersProps {
    automationToEdit?: IAutomationMetadataObject;
    widget?: ExtendedDashboardWidget;
    /**
     * Persist parameter values onto the export, versus omitting them so the server resolves the
     * latest dashboard defaults. Widget schedules force-store (no store-filters checkbox).
     */
    storeParameters?: boolean;
    /**
     * Writes the per-tab parameter wire back onto the edited automation; `undefined` clears it.
     * The user-edit path into `content.parametersByTab` (export-definition rebuilds re-carry it separately).
     */
    setParametersWire: (wire: Record<string, IDashboardExportParameter[]> | undefined) => void;
}

/**
 * Scheduled-export parameter editing behind one seam: chips and addable sets to render, the
 * add/change/delete handlers (flat + per-tab), and the wire write-back onto the edited automation.
 * The working set (full execution set incl. `hidden` entries) is implementation — it is held outside
 * the automation so turning persistence off can drop the stored wire without losing the chips. Mirrors
 * {@link useAutomationAlertParameters} in role.
 *
 * The automation is written only at user interactions, never on mount — new automations are seeded
 * at document creation by the owning dialog, and an edited automation's stored wire must survive an
 * open-and-close untouched, or the dialog would open dirty (reconstruct → re-encode is lossy).
 *
 * @internal
 */
export interface IUseAutomationExportParameters {
    parametersEnabled: boolean;
    /**
     * Per-tab visible parameters to render as chips (the execution set minus `hidden` entries).
     */
    visibleParametersByTab: EditedParametersByTab;
    /**
     * Per-tab workspace parameters addable via the "+" menu (catalog minus selected/hidden/readonly).
     */
    availableParametersByTab: EditedParametersByTab;
    /**
     * The tab the flat (non-tabbed) UI edits — the widget's owning tab or the single dashboard tab.
     * Undefined for multi-tab dashboards (per-tab rendering) or when no parameter context applies.
     */
    flatTabId: string | undefined;
    onParameterAdd: (ref: IdentifierRef) => void;
    onParameterChange: (ref: IdentifierRef, value: number) => void;
    onParameterDelete: (ref: IdentifierRef) => void;
    onParameterAddByTab: (tabId: string, ref: IdentifierRef) => void;
    onParameterChangeByTab: (tabId: string, ref: IdentifierRef, value: number) => void;
    onParameterDeleteByTab: (tabId: string, ref: IdentifierRef) => void;
    /**
     * Resets the working set to the current dashboard's effective values and writes it back — the
     * "apply latest" flow, dropping any stale stored entries the staleness gate flagged.
     */
    applyLatest: () => void;
    /**
     * `storeParameters` still holds the old value at call time, so the new value is passed in;
     * re-encodes the working set onto the automation with it.
     */
    onStoreParametersChange: (storeParameters: boolean) => void;
}

/**
 * @internal
 */
export function useAutomationExportParameters({
    automationToEdit,
    widget,
    storeParameters,
    setParametersWire,
}: IUseAutomationExportParametersProps): IUseAutomationExportParameters {
    const parametersEnabled = useDashboardSelector(selectEnableParameters);
    const catalog = useDashboardSelector(selectCatalogParameters);
    const dashboardParametersByTab = useDashboardSelector(selectSmartPersistedTabsParameters);
    const tabs = useDashboardSelector(selectTabs);
    const widgetTabMap = useDashboardSelector(selectWidgetLocalIdToTabIdMap);
    const widgetIds = widget ? [objRefToString(widget.ref)] : undefined;
    const effectiveParametersByTab = useDashboardSelector(selectExportEffectiveParameters(widgetIds));

    const flatTabId = resolveFlatTabId(widget, widgetTabMap, tabs);
    const shouldStore = shouldStoreExportParameters(!!widget, storeParameters);

    const [editedParametersByTab, setEditedParametersByTab] = useState<EditedParametersByTab>(() => {
        if (!parametersEnabled) {
            return {};
        }
        const storedByTab = getAutomationExportParametersByTab(automationToEdit);
        return reconstructParametersByTab(
            storedByTab ?? effectiveParametersByTab,
            dashboardParametersByTab,
            catalog,
        );
    });

    // Encodes the gated wire shape and writes it onto the automation — the only path to the document.
    const persistWire = useCallback(
        (parametersByTab: EditedParametersByTab, store: boolean) =>
            setParametersWire(toEffectiveParametersByTab(parametersByTab, parametersEnabled && store)),
        [parametersEnabled, setParametersWire],
    );

    const visibleParametersByTab = useMemo(
        () => mapValues(editedParametersByTab, (parameters) => parameters.filter(isVisibleParameter)),
        [editedParametersByTab],
    );

    const availableParametersByTab = useMemo(() => {
        if (!parametersEnabled) {
            return {};
        }
        // The set of tabs the export covers: the widget's owning tab, or every dashboard tab. Keyed by
        // every in-scope tab (not just seeded ones) so tabs with no current override can still add params.
        const scopeTabIds = widget
            ? flatTabId
                ? [flatTabId]
                : []
            : (tabs ?? []).map((tab) => tab.localIdentifier);
        const result: EditedParametersByTab = {};
        for (const tabId of scopeTabIds) {
            // Widget schedules seed addable chips from the widget-effective values, mirroring the alert
            // path; dashboard schedules have no widget context and fall back to dashboard/default
            // inside availableAutomationParameters.
            const widgetParameterValues = widget
                ? exportParametersToValues(effectiveParametersByTab[tabId] ?? [])
                : [];
            result[tabId] = availableAutomationParameters(
                catalog,
                editedParametersByTab[tabId] ?? [],
                dashboardParametersByTab[tabId] ?? [],
                widgetParameterValues,
            );
        }
        return result;
    }, [
        parametersEnabled,
        widget,
        flatTabId,
        tabs,
        editedParametersByTab,
        catalog,
        dashboardParametersByTab,
        effectiveParametersByTab,
    ]);

    // The fresh per-tab execution set reconstructed from the current dashboard's effective values.
    const parametersForNewAutomation = useMemo(
        () =>
            parametersEnabled
                ? reconstructParametersByTab(effectiveParametersByTab, dashboardParametersByTab, catalog)
                : {},
        [parametersEnabled, effectiveParametersByTab, dashboardParametersByTab, catalog],
    );

    const applyLatest = useCallback(() => {
        setEditedParametersByTab(parametersForNewAutomation);
        persistWire(parametersForNewAutomation, shouldStore);
    }, [parametersForNewAutomation, persistWire, shouldStore]);

    const onStoreParametersChange = useCallback(
        (nextStoreParameters: boolean) => {
            persistWire(editedParametersByTab, nextStoreParameters);
        },
        [editedParametersByTab, persistWire],
    );

    // Patches one tab's parameter execution set by ref, updates the working state, and writes the
    // gated wire shape onto the automation. Edits never touch `hidden`/untouched entries.
    const patchTabParameters = useCallback(
        (tabId: string, update: (current: IAutomationParameter[]) => IAutomationParameter[]) => {
            const next: EditedParametersByTab = {
                ...editedParametersByTab,
                [tabId]: update(editedParametersByTab[tabId] ?? []),
            };
            setEditedParametersByTab(next);
            persistWire(next, shouldStore);
        },
        [editedParametersByTab, persistWire, shouldStore],
    );

    const onParameterChangeByTab = useCallback(
        (tabId: string, ref: IdentifierRef, value: number) => {
            patchTabParameters(tabId, (current) =>
                current.map((parameter) =>
                    areObjRefsEqual(parameter.ref, ref) ? { ...parameter, value } : parameter,
                ),
            );
        },
        [patchTabParameters],
    );

    const onParameterDeleteByTab = useCallback(
        (tabId: string, ref: IdentifierRef) => {
            patchTabParameters(tabId, (current) =>
                current.filter((parameter) => !areObjRefsEqual(parameter.ref, ref)),
            );
        },
        [patchTabParameters],
    );

    const onParameterAddByTab = useCallback(
        (tabId: string, ref: IdentifierRef) => {
            const parameter = availableParametersByTab[tabId]?.find((candidate) =>
                areObjRefsEqual(candidate.ref, ref),
            );
            if (parameter) {
                patchTabParameters(tabId, (current) => [...current, parameter]);
            }
        },
        [availableParametersByTab, patchTabParameters],
    );

    // Flat handlers serve the non-tabbed UI; they delegate to the per-tab ones via `flatTabId`.
    const onParameterChange = useCallback(
        (ref: IdentifierRef, value: number) => {
            if (flatTabId) {
                onParameterChangeByTab(flatTabId, ref, value);
            }
        },
        [flatTabId, onParameterChangeByTab],
    );

    const onParameterDelete = useCallback(
        (ref: IdentifierRef) => {
            if (flatTabId) {
                onParameterDeleteByTab(flatTabId, ref);
            }
        },
        [flatTabId, onParameterDeleteByTab],
    );

    const onParameterAdd = useCallback(
        (ref: IdentifierRef) => {
            if (flatTabId) {
                onParameterAddByTab(flatTabId, ref);
            }
        },
        [flatTabId, onParameterAddByTab],
    );

    return {
        parametersEnabled,
        visibleParametersByTab,
        availableParametersByTab,
        flatTabId,
        onParameterAdd,
        onParameterChange,
        onParameterDelete,
        onParameterAddByTab,
        onParameterChangeByTab,
        onParameterDeleteByTab,
        applyLatest,
        onStoreParametersChange,
    };
}

function resolveFlatTabId(
    widget: ExtendedDashboardWidget | undefined,
    widgetTabMap: Record<string, string>,
    tabs: ITabState[] | undefined,
): string | undefined {
    if (widget) {
        return widget.localIdentifier ? widgetTabMap[widget.localIdentifier] : undefined;
    }
    return (tabs?.length ?? 0) <= 1 ? tabs?.[0]?.localIdentifier : undefined;
}

function isVisibleParameter(parameter: IAutomationParameter): boolean {
    return parameter.mode !== DashboardParameterModeValues.HIDDEN;
}

function reconstructParametersByTab(
    byTab: Record<string, IDashboardExportParameter[]>,
    dashboardParametersByTab: Record<string, IDashboardParameter[]>,
    catalog: IParameterMetadataObject[],
): EditedParametersByTab {
    return mapValues(byTab, (exportParameters, tabId) =>
        reconstructAutomationParametersFromExportParameters(
            exportParameters,
            dashboardParametersByTab[tabId] ?? [],
            catalog,
        ),
    );
}
