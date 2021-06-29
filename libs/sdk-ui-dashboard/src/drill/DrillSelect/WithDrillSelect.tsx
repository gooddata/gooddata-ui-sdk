// (C) 2020-2021 GoodData Corporation
import React, { useState, useCallback, useRef } from "react";
import cx from "classnames";
import { v4 as uuid } from "uuid";
import { IDashboardDrillEvent, isDrillDownDefinition } from "@gooddata/sdk-ui-ext";
import { DrillSelectDropdown } from "./DrillSelectDropdown";
import {
    DashboardDrillDefinition,
    OnDashboardDrill,
    OnDrillDown,
    OnDrillToAttributeUrl,
    OnDrillToCustomUrl,
    OnDrillToDashboard,
    OnDrillToInsight,
} from "../interfaces";
import { DrillSelectContext } from "./interfaces";
import { IInsight } from "@gooddata/sdk-model";
import {
    isDrillToCustomUrl,
    isDrillToAttributeUrl,
    isDrillToDashboard,
    isDrillToInsight,
} from "@gooddata/sdk-backend-spi";
import { useDashboardSelector } from "../../model/state/dashboardStore";
import { useDrill } from "../hooks/useDrill";
import { IntlWrapper } from "../../localization/IntlWrapper";
import { selectLocale } from "../../model/state/config/configSelectors";
import { useDrillDown } from "../hooks/useDrillDown";
import { useDrillToInsight } from "../hooks/useDrillToInsight";
import { useDrillToDashboard } from "../hooks/useDrillToDashboard";
import { useDrillToAttributeUrl } from "../hooks/useDrillToAttributeUrl";
import { useDrillToCustomUrl } from "../hooks/useDrillToCustomUrl";
import { DashboardCommandFailed } from "../../model";

/**
 * @internal
 */
export type WithDrillSelectProps = {
    insight: IInsight;
    onDrillDown?: OnDrillDown;
    onDrillToInsight?: OnDrillToInsight;
    onDrillToDashboard?: OnDrillToDashboard;
    onDrillToAttributeUrl?: OnDrillToAttributeUrl;
    onDrillToCustomUrl?: OnDrillToCustomUrl;
    onError?: (error: any) => void;
    children: (props: { onDrill: OnDashboardDrill }) => JSX.Element;
};

/**
 * @internal
 */
export function WithDrillSelect({
    children,
    insight,
    onDrillDown,
    onDrillToInsight,
    onDrillToDashboard,
    onDrillToAttributeUrl,
    onDrillToCustomUrl,
    onError,
}: WithDrillSelectProps): JSX.Element {
    const { current: drillPickerId } = useRef(uuid());
    const [dropdownProps, setDropdownProps] = useState<DrillSelectContext | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const locale = useDashboardSelector(selectLocale);
    const handleError = (e: DashboardCommandFailed) => onError?.(e.payload.error);

    const drillDown = useDrillDown({
        onSuccess: (s) => {
            onDrillDown?.({
                drillDefinition: s.payload.drillDefinition,
                drillEvent: s.payload.drillEvent,
                insight: s.payload.insight,
            });
        },
        onError: handleError,
    });

    const drillToInsight = useDrillToInsight({
        onSuccess: (s) => {
            onDrillToInsight?.({
                drillDefinition: s.payload.drillDefinition,
                drillEvent: s.payload.drillEvent,
                insight: s.payload.insight,
            });
        },
        onError: handleError,
    });

    const drillToDashboard = useDrillToDashboard({
        onSuccess: (s) => {
            onDrillToDashboard?.({
                drillDefinition: s.payload.drillDefinition,
                drillEvent: s.payload.drillEvent,
                filters: s.payload.filters,
            });
        },
        onError: handleError,
    });

    const drillToAttributeUrl = useDrillToAttributeUrl({
        onSuccess: (s) => {
            onDrillToAttributeUrl?.({
                drillDefinition: s.payload.drillDefinition,
                drillEvent: s.payload.drillEvent,
                url: s.payload.url,
            });
        },
        onError: handleError,
    });

    const drillToCustomUrl = useDrillToCustomUrl({
        onSuccess: (s) => {
            onDrillToCustomUrl?.({
                drillDefinition: s.payload.drillDefinition,
                drillEvent: s.payload.drillEvent,
                url: s.payload.url,
            });
        },
        onError: handleError,
    });

    const onSelect = useCallback(
        (drillDefinition: DashboardDrillDefinition, drillEvent?: IDashboardDrillEvent) => {
            const effectiveDrillEvent = drillEvent ?? dropdownProps?.drillEvent;
            if (effectiveDrillEvent) {
                if (isDrillDownDefinition(drillDefinition)) {
                    drillDown.run(insight, drillDefinition, effectiveDrillEvent);
                } else if (isDrillToInsight(drillDefinition)) {
                    drillToInsight.run(drillDefinition, effectiveDrillEvent);
                } else if (isDrillToDashboard(drillDefinition)) {
                    drillToDashboard.run(drillDefinition, effectiveDrillEvent);
                } else if (isDrillToAttributeUrl(drillDefinition)) {
                    drillToAttributeUrl.run(drillDefinition, effectiveDrillEvent);
                } else if (isDrillToCustomUrl(drillDefinition)) {
                    drillToCustomUrl.run(drillDefinition, effectiveDrillEvent);
                }
                setDropdownProps(null);
                setIsOpen(false);
            }
        },
        [dropdownProps],
    );

    const drill = useDrill({
        onSuccess: (s) => {
            if (s.payload.drillEvent.drillDefinitions!.length === 1) {
                onSelect(s.payload.drillEvent.drillDefinitions![0], s.payload.drillEvent);
            } else {
                setDropdownProps({
                    drillDefinitions: s.payload.drillEvent.drillDefinitions!,
                    drillEvent: s.payload.drillEvent,
                    drillContext: s.payload.drillContext,
                });
                setIsOpen(true);
            }
        },
        onError: handleError,
    });

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
            {children({ onDrill: drill.run })}
            {drillDownDropdown}
        </div>
    );
}
