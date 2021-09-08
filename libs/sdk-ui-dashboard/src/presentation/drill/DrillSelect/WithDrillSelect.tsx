// (C) 2020-2021 GoodData Corporation
import React, { useState, useCallback, useRef } from "react";
import cx from "classnames";
import { v4 as uuid } from "uuid";
import { DrillSelectDropdown } from "./DrillSelectDropdown";
import {
    OnWidgetDrill,
    OnDrillDownSuccess,
    OnDrillToAttributeUrlSuccess,
    OnDrillToCustomUrlSuccess,
    OnDrillToDashboardSuccess,
    OnDrillToInsightSuccess,
} from "../types";
import { DrillSelectContext } from "./types";
import { IInsight } from "@gooddata/sdk-model";
import {
    isDrillToCustomUrl,
    isDrillToAttributeUrl,
    isDrillToDashboard,
    isDrillToInsight,
} from "@gooddata/sdk-backend-spi";
import { IntlWrapper } from "../../localization";
import {
    DashboardCommandFailed,
    selectLocale,
    useDashboardSelector,
    selectDisableDefaultDrills,
    DashboardDrillCommand,
} from "../../../model";
import { DashboardDrillDefinition, IDashboardDrillEvent, isDrillDownDefinition } from "../../../types";
import { filterDrillFromAttributeByPriority } from "../utils/drillDownUtils";
import { useDrills } from "../hooks/useDrills";

/**
 * @internal
 */
export type WithDrillSelectProps = {
    insight: IInsight;
    onDrillDownSuccess?: OnDrillDownSuccess;
    onDrillToInsightSuccess?: OnDrillToInsightSuccess;
    onDrillToDashboardSuccess?: OnDrillToDashboardSuccess;
    onDrillToAttributeUrlSuccess?: OnDrillToAttributeUrlSuccess;
    onDrillToCustomUrlSuccess?: OnDrillToCustomUrlSuccess;
    onError?: (error: any) => void;
    children: (props: { onDrill: OnWidgetDrill }) => JSX.Element;
};

/**
 * @internal
 */
export function WithDrillSelect({
    children,
    insight,
    onDrillDownSuccess,
    onDrillToInsightSuccess,
    onDrillToDashboardSuccess,
    onDrillToAttributeUrlSuccess,
    onDrillToCustomUrlSuccess,
    onError,
}: WithDrillSelectProps): JSX.Element {
    const { current: drillPickerId } = useRef(uuid());
    const [dropdownProps, setDropdownProps] = useState<DrillSelectContext | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const locale = useDashboardSelector(selectLocale);
    const disableDefaultDrills = useDashboardSelector(selectDisableDefaultDrills); // TODO: maybe remove?

    const drills = useDrills({
        onDrillSuccess: (s) => {
            if (disableDefaultDrills || s.payload.drillEvent.drillDefinitions.length === 0) {
                return;
            }
            const drillDefinitions = s.payload.drillEvent.drillDefinitions;
            const drillEvent = s.payload.drillEvent;
            const context = s.payload.drillContext;

            const filteredByPriority = filterDrillFromAttributeByPriority(drillDefinitions);

            if (filteredByPriority.length === 1) {
                onSelect(filteredByPriority[0], drillEvent, s.correlationId);
            } else if (filteredByPriority.length > 1) {
                setDropdownProps({
                    drillDefinitions: filteredByPriority,
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

    const onSelect = useCallback(
        (
            drillDefinition: DashboardDrillDefinition,
            drillEvent?: IDashboardDrillEvent,
            correlationId?: string,
        ) => {
            const effectiveDrillEvent = drillEvent ?? dropdownProps?.drillEvent;
            const effectiveCorrelationId = correlationId ?? dropdownProps?.correlationId;
            if (effectiveDrillEvent) {
                if (isDrillDownDefinition(drillDefinition)) {
                    drills.drillDown.run(
                        insight,
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
                }
                setDropdownProps(null);
                setIsOpen(false);
            }
        },
        [dropdownProps],
    );

    const onClose = () => {
        setIsOpen(false);
    };

    const dropDownAnchorClass = `s-drill-picker-${drillPickerId}`;

    const drillDownDropdown = dropdownProps ? (
        <IntlWrapper locale={locale}>
            <DrillSelectDropdown
                {...dropdownProps}
                dropDownAnchorClass={dropDownAnchorClass}
                isOpen={isOpen}
                onClose={onClose}
                onSelect={onSelect}
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
