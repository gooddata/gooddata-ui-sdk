// (C) 2020-2025 GoodData Corporation

import { ReactElement, useCallback, useRef, useState } from "react";

import cx from "classnames";
import { v4 as uuid } from "uuid";

import {
    IInsight,
    ObjRef,
    isCrossFiltering,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
    isKeyDriveAnalysis,
} from "@gooddata/sdk-model";
import { useAutoupdateRef } from "@gooddata/sdk-ui";

import { DrillSelectDropdown } from "./DrillSelectDropdown.js";
import { DrillSelectContext, IDrillSelectCloseBehavior } from "./types.js";
import {
    DashboardCommandFailed,
    DashboardDrillCommand,
    selectBackendCapabilities,
    selectDisableDefaultDrills,
    selectLocale,
    selectWidgetDrills,
    useDashboardSelector,
} from "../../../model/index.js";
import {
    DashboardDrillContext,
    DashboardDrillDefinition,
    IDashboardDrillEvent,
    isDrillDownDefinition,
} from "../../../types.js";
import { IntlWrapper } from "../../localization/index.js";
import { useDrills } from "../hooks/useDrills.js";
import {
    OnDrillDownSuccess,
    OnDrillToAttributeUrlSuccess,
    OnDrillToCustomUrlSuccess,
    OnDrillToDashboardSuccess,
    OnDrillToInsightSuccess,
    OnWidgetDrill,
} from "../types.js";
import { filterDrillFromAttributeByPriority } from "../utils/drillDownUtils.js";

/**
 * @internal
 */
export interface WithDrillSelectProps {
    widgetRef: ObjRef;
    insight: IInsight;
    closeBehavior?: IDrillSelectCloseBehavior;
    visualizationId?: string;
    onDrillDownSuccess?: OnDrillDownSuccess;
    onDrillToInsightSuccess?: OnDrillToInsightSuccess;
    onDrillToDashboardSuccess?: OnDrillToDashboardSuccess;
    onDrillToAttributeUrlSuccess?: OnDrillToAttributeUrlSuccess;
    onDrillToCustomUrlSuccess?: OnDrillToCustomUrlSuccess;
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
    closeBehavior,
    visualizationId,
    onDrillDownSuccess,
    onDrillToInsightSuccess,
    onDrillToDashboardSuccess,
    onDrillToAttributeUrlSuccess,
    onDrillToCustomUrlSuccess,
    onError,
}: WithDrillSelectProps): ReactElement {
    const { current: drillPickerId } = useRef(uuid());
    const [dropdownProps, setDropdownProps] = useState<DrillSelectContext | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const locale = useDashboardSelector(selectLocale);
    const disableDefaultDrills = useDashboardSelector(selectDisableDefaultDrills); // TODO: maybe remove?
    const configuredDrills = useDashboardSelector(selectWidgetDrills(widgetRef));
    const { supportsAttributeHierarchies } = useDashboardSelector(selectBackendCapabilities);

    const drills = useDrills({
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
        onDrillToDashboardSuccess,
        onDrillToAttributeUrlSuccess,
        onDrillToCustomUrlSuccess,
        onError: (e: DashboardCommandFailed<DashboardDrillCommand>) => onError?.(e.payload.error),
    });

    const onSelectDepsRef = useAutoupdateRef({
        drills,
        dropdownProps: { correlationId: dropdownProps?.correlationId, drillEvent: dropdownProps?.drillEvent },
        insight,
        closeBehavior,
    });
    const onSelect = useCallback(
        (
            drillDefinition: DashboardDrillDefinition,
            _context: unknown,
            drillEvent?: IDashboardDrillEvent,
            correlationId?: string,
            drillContext?: DashboardDrillContext,
        ) => {
            const { drills, dropdownProps, insight, closeBehavior } = onSelectDepsRef.current;

            const effectiveDrillEvent = drillEvent ?? dropdownProps?.drillEvent;
            const effectiveCorrelationId = correlationId ?? dropdownProps?.correlationId;
            const effectiveInsight = drillContext?.insight ?? insight;

            if (effectiveDrillEvent) {
                if (isDrillDownDefinition(drillDefinition)) {
                    drills.drillDown.run(
                        effectiveInsight,
                        drillDefinition,
                        effectiveDrillEvent,
                        effectiveCorrelationId,
                    );
                } else if (isDrillToInsight(drillDefinition)) {
                    drills.drillToInsight.run(drillDefinition, effectiveDrillEvent, effectiveCorrelationId);
                } else if (isDrillToDashboard(drillDefinition)) {
                    drills.drillToDashboard.run(drillDefinition, effectiveDrillEvent, effectiveCorrelationId);
                } else if (isDrillToAttributeUrl(drillDefinition)) {
                    drills.drillToAttributeUrl.run(
                        drillDefinition,
                        effectiveDrillEvent,
                        effectiveCorrelationId,
                    );
                } else if (isDrillToCustomUrl(drillDefinition)) {
                    drills.drillToCustomUrl.run(drillDefinition, effectiveDrillEvent, effectiveCorrelationId);
                } else if (isCrossFiltering(drillDefinition)) {
                    drills.crossFiltering.run(
                        insight,
                        drillDefinition,
                        effectiveDrillEvent,
                        effectiveCorrelationId,
                    );
                } else if (isKeyDriveAnalysis(drillDefinition)) {
                    //TODO: Run kda analysis dialog
                }

                if (closeBehavior === "closeOnSelect") {
                    setIsOpen(false);
                }
            }
        },
        [onSelectDepsRef],
    );

    const handleClose = () => {
        if (closeBehavior === "preventClose") {
            return;
        }
        setIsOpen(false);
    };

    const dropDownAnchorClass = `s-drill-picker-${drillPickerId}`;

    const drillDownDropdown = dropdownProps ? (
        <IntlWrapper locale={locale}>
            <DrillSelectDropdown
                {...dropdownProps}
                dropDownAnchorClass={dropDownAnchorClass}
                isOpen={isOpen}
                onClose={handleClose}
                onSelect={onSelect}
                visualizationId={visualizationId}
            />
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
