// (C) 2020-2025 GoodData Corporation

import { type ReactElement, useCallback, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { v4 as uuid } from "uuid";

import {
    type IInsight,
    type ObjRef,
    isCrossFiltering,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
    isKeyDriveAnalysis,
} from "@gooddata/sdk-model";
import { useAutoupdateRef } from "@gooddata/sdk-ui";
import { OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";

import { DrillSelectDropdown } from "./DrillSelectDropdown.js";
import { type DrillSelectContext } from "./types.js";
import {
    type DashboardCommandFailed,
    type DashboardDrillCommand,
    type DashboardKeyDriverCombinationItem,
    selectBackendCapabilities,
    selectDashboardFiltersWithoutCrossFiltering,
    selectDisableDefaultDrills,
    selectLocale,
    selectWidgetDrills,
    useDashboardSelector,
} from "../../../model/index.js";
import {
    type DashboardDrillContext,
    type DashboardDrillDefinition,
    type IDashboardDrillEvent,
    isDrillDownDefinition,
} from "../../../types.js";
import { DASHBOARD_DRILL_MENU_Z_INDEX } from "../../constants/index.js";
import { IntlWrapper } from "../../localization/index.js";
import { useDrills } from "../hooks/useDrills.js";
import {
    type OnDashboardDrill,
    type OnDrillDownSuccess,
    type OnDrillToAttributeUrlSuccess,
    type OnDrillToCustomUrlSuccess,
    type OnDrillToDashboardSuccess,
    type OnDrillToInsightSuccess,
    type OnKeyDriverAnalysisSuccess,
    type OnWidgetDrill,
} from "../types.js";
import { filterDrillFromAttributeByPriority } from "../utils/drillDownUtils.js";

/**
 * @internal
 */
export interface WithDrillSelectProps {
    widgetRef: ObjRef;
    insight: IInsight;
    visualizationId?: string;
    returnFocusToInsight?: (force?: boolean) => void;
    onDrillStart?: OnDashboardDrill;
    onDrillDownSuccess?: OnDrillDownSuccess;
    onDrillToInsightSuccess?: OnDrillToInsightSuccess;
    onDrillToDashboardSuccess?: OnDrillToDashboardSuccess;
    onDrillToAttributeUrlSuccess?: OnDrillToAttributeUrlSuccess;
    onDrillToCustomUrlSuccess?: OnDrillToCustomUrlSuccess;
    onKeyDriverAnalysisSuccess?: OnKeyDriverAnalysisSuccess;
    onError?: (error: any) => void;
    children: (props: { onDrill: OnWidgetDrill }) => ReactElement;
}

/**
 * @internal
 */
export function WithDrillSelect({
    widgetRef,
    children,
    insight,
    returnFocusToInsight,
    onDrillStart,
    onDrillDownSuccess,
    onDrillToInsightSuccess,
    onDrillToDashboardSuccess,
    onDrillToAttributeUrlSuccess,
    onDrillToCustomUrlSuccess,
    onKeyDriverAnalysisSuccess,
    onError,
}: WithDrillSelectProps): ReactElement {
    const { current: drillPickerId } = useRef(uuid());
    const [dropdownProps, setDropdownProps] = useState<DrillSelectContext | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const locale = useDashboardSelector(selectLocale);
    const disableDefaultDrills = useDashboardSelector(selectDisableDefaultDrills); // TODO: maybe remove?
    const filters = useDashboardSelector(selectDashboardFiltersWithoutCrossFiltering);
    const configuredDrills = useDashboardSelector(selectWidgetDrills(widgetRef));
    const { supportsAttributeHierarchies } = useDashboardSelector(selectBackendCapabilities);

    const drills = useDrills({
        onDrill: onDrillStart,
        onDrillSuccess: (s) => {
            if (disableDefaultDrills || s.payload.drillEvent.drillDefinitions.length === 0) {
                return;
            }
            const drillDefinitions = s.payload.drillEvent.drillDefinitions;
            const drillEvent = s.payload.drillEvent;
            const context = s.payload.drillContext;

            const validDrillDefinitions = supportsAttributeHierarchies
                ? drillDefinitions
                : filterDrillFromAttributeByPriority(drillDefinitions, configuredDrills);

            const type = getDrillDefinitionType(validDrillDefinitions);
            if (type === "single") {
                onSelect(validDrillDefinitions[0], undefined, drillEvent, s.correlationId, context);
            } else if (type === "multiple") {
                setDropdownProps({
                    drillDefinitions: validDrillDefinitions,
                    drillEvent: drillEvent,
                    drillContext: context,
                    correlationId: s.correlationId,
                });
                setIsOpen(true);
            }
        },
        onDrillDownSuccess,
        onDrillToInsightSuccess,
        onKeyDriverAnalysisSuccess,
        onDrillToDashboardSuccess,
        onDrillToAttributeUrlSuccess,
        onDrillToCustomUrlSuccess,
        onError: (e: DashboardCommandFailed<DashboardDrillCommand>) => onError?.(e.payload.error),
    });

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);
    const handleCloseReturnFocus = useCallback(() => {
        returnFocusToInsight?.();
        handleClose();
    }, [handleClose, returnFocusToInsight]);

    const onSelectDepsRef = useAutoupdateRef({
        drills,
        dropdownProps: { correlationId: dropdownProps?.correlationId, drillEvent: dropdownProps?.drillEvent },
        insight,
        handleClose,
    });
    const onSelect = useCallback(
        (
            drillDefinition: DashboardDrillDefinition,
            context: unknown,
            drillEvent?: IDashboardDrillEvent,
            correlationId?: string,
            drillContext?: DashboardDrillContext,
        ) => {
            const { drills, dropdownProps, insight, handleClose } = onSelectDepsRef.current;

            const effectiveDrillEvent = drillEvent ?? dropdownProps?.drillEvent;
            const effectiveCorrelationId = correlationId ?? dropdownProps?.correlationId;
            const effectiveInsight = drillContext?.insight ?? insight;

            if (!effectiveDrillEvent) {
                return;
            }

            const isNavigatingByKeyboard = document.querySelector(":focus-visible") !== null;
            handleClose();

            if (isDrillDownDefinition(drillDefinition)) {
                drills.drillDown.run(
                    effectiveInsight,
                    drillDefinition,
                    effectiveDrillEvent,
                    effectiveCorrelationId,
                );
                return;
            }

            if (isDrillToInsight(drillDefinition)) {
                drills.drillToInsight.run(drillDefinition, effectiveDrillEvent, effectiveCorrelationId);
                return;
            }

            if (isDrillToDashboard(drillDefinition)) {
                drills.drillToDashboard.run(drillDefinition, effectiveDrillEvent, effectiveCorrelationId);
                return;
            }

            if (isDrillToAttributeUrl(drillDefinition)) {
                drills.drillToAttributeUrl.run(drillDefinition, effectiveDrillEvent, effectiveCorrelationId);
                return;
            }

            if (isDrillToCustomUrl(drillDefinition)) {
                drills.drillToCustomUrl.run(drillDefinition, effectiveDrillEvent, effectiveCorrelationId);
                return;
            }

            if (isCrossFiltering(drillDefinition)) {
                drills.crossFiltering.run(
                    insight,
                    drillDefinition,
                    effectiveDrillEvent,
                    effectiveCorrelationId,
                );

                if (!returnFocusToInsight) {
                    return;
                }

                // We need to wait a bit so the chart reloads after the filter changes
                window.setTimeout(() => {
                    returnFocusToInsight(isNavigatingByKeyboard);
                }, 150);

                return;
            }

            if (isKeyDriveAnalysis(drillDefinition)) {
                drills.keyDriverAnalysis.run(
                    drillDefinition,
                    effectiveDrillEvent,
                    filters,
                    context as DashboardKeyDriverCombinationItem,
                    effectiveCorrelationId,
                );
            }
        },
        [onSelectDepsRef, returnFocusToInsight, filters],
    );

    const dropDownAnchorClass = `s-drill-picker-${drillPickerId}`;

    const overlayController = useMemo(() => {
        return OverlayController.getInstance(DASHBOARD_DRILL_MENU_Z_INDEX);
    }, []);

    const drillDownDropdown = dropdownProps ? (
        <IntlWrapper locale={locale}>
            <OverlayControllerProvider overlayController={overlayController}>
                <DrillSelectDropdown
                    {...dropdownProps}
                    dropDownAnchorClass={dropDownAnchorClass}
                    isOpen={isOpen}
                    onClose={handleClose}
                    onCloseReturnFocus={handleCloseReturnFocus}
                    onSelect={onSelect}
                />
            </OverlayControllerProvider>
        </IntlWrapper>
    ) : null;

    return (
        <div className={cx("gd-drill-modal-wrapper-mask", dropDownAnchorClass)}>
            {children({ onDrill: drills.drill.run })}
            {drillDownDropdown}
        </div>
    );
}

function getDrillDefinitionType(validDrillDefinitions: DashboardDrillDefinition[]) {
    if (validDrillDefinitions.length === 1) {
        const firstDrillDefinition = validDrillDefinitions[0];
        //NOTE: Key drive analysis has always items to choose
        if (firstDrillDefinition.type === "keyDriveAnalysis") {
            return "multiple";
        }
        return "single";
    } else if (validDrillDefinitions.length > 1) {
        return "multiple";
    } else {
        return "none";
    }
}
