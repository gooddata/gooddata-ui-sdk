// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { v4 as uuid } from "uuid";

import {
    type IInsight,
    type ObjRef,
    isAttributeDescriptor,
    isCrossFiltering,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
    isKeyDriveAnalysis,
} from "@gooddata/sdk-model";
import { useAutoupdateRef } from "@gooddata/sdk-ui";
import { DRILL_MENU_HOST_ATTRIBUTE, notifyDrillMenuExpandedChange } from "@gooddata/sdk-ui-charts";
import { OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";

import { getDrillSourceLocalIdentifierFromEvent } from "../../../_staging/drills/drillingUtils.js";
import type { DashboardDrillCommand } from "../../../model/commands/drill.js";
import type { IDashboardKeyDriverCombinationItem } from "../../../model/events/drill.js";
import type { IDashboardCommandFailed } from "../../../model/events/general.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectBackendCapabilities } from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectAllCatalogAttributesMap } from "../../../model/store/catalog/catalogSelectors.js";
import {
    selectDisableDefaultDrills,
    selectEnableDashboardPartialRendering,
    selectLocale,
} from "../../../model/store/config/configSelectors.js";
import { selectExecutableDashboardFiltersWithoutCrossFiltering } from "../../../model/store/filtering/dashboardFilterSelectors.js";
import {
    selectIgnoredDrillDownHierarchiesByWidgetRef,
    selectWidgetDrills,
} from "../../../model/store/tabs/layout/layoutSelectors.js";
import { selectIsDrillRestricted } from "../../../model/store/widgetDrills/drillRestrictionSelectors.js";
import { getRestrictedDrillDowns } from "../../../model/store/widgetDrills/widgetDrillSelectors.js";
import {
    type DashboardDrillDefinition,
    type IDashboardDrillContext,
    type IDashboardDrillEvent,
    isDrillDownDefinition,
} from "../../../types.js";
import { DASHBOARD_DRILL_MENU_Z_INDEX } from "../../constants/zIndex.js";
import { IntlWrapper } from "../../localization/IntlWrapper.js";
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

import { DrillSelectDropdown } from "./DrillSelectDropdown.js";
import { type IDrillSelectContext } from "./types.js";

/**
 * @internal
 */
export interface IWithDrillSelectProps {
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
}: IWithDrillSelectProps): ReactElement {
    const { current: drillPickerId } = useRef(uuid());
    const [dropdownProps, setDropdownProps] = useState<IDrillSelectContext | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const locale = useDashboardSelector(selectLocale);
    const disableDefaultDrills = useDashboardSelector(selectDisableDefaultDrills); // TODO: maybe remove?
    const filters = useDashboardSelector(selectExecutableDashboardFiltersWithoutCrossFiltering);
    const isDrillRestricted = useDashboardSelector(selectIsDrillRestricted);
    const catalogAttributes = useDashboardSelector(selectAllCatalogAttributesMap);
    const ignoredHierarchies = useDashboardSelector(selectIgnoredDrillDownHierarchiesByWidgetRef(widgetRef));
    const enablePartialRendering = useDashboardSelector(selectEnableDashboardPartialRendering);
    const configuredDrills = useDashboardSelector(selectWidgetDrills(widgetRef));
    const { supportsAttributeHierarchies } = useDashboardSelector(selectBackendCapabilities);
    // useDrills keeps the success handler of the first render; the catalog loads after it
    const restrictedDrillDownDepsRef = useAutoupdateRef({
        catalogAttributes,
        ignoredHierarchies,
        enablePartialRendering,
        supportsAttributeHierarchies,
        insight,
    });

    const drills = useDrills({
        onDrill: onDrillStart,
        onDrillSuccess: (s) => {
            const drillDefinitions = s.payload.drillEvent.drillDefinitions;
            const drillEvent = s.payload.drillEvent;
            const context = s.payload.drillContext;
            const drillSources = getDrillSourceLocalIdentifierFromEvent(drillEvent);
            const clickedAttributes = (drillEvent.drillContext.intersection ?? [])
                .map(({ header }) => header)
                .filter(isAttributeDescriptor)
                .filter(({ attributeHeader }) => drillSources.includes(attributeHeader.localIdentifier));
            const deps = restrictedDrillDownDepsRef.current;
            const restrictedDrillDowns = getRestrictedDrillDowns(
                clickedAttributes,
                deps.catalogAttributes,
                deps.ignoredHierarchies ?? [],
                {
                    supportsAttributeHierarchies: deps.supportsAttributeHierarchies,
                    enablePartialRendering: deps.enablePartialRendering,
                    disableDrillDown: deps.insight.insight.properties["controls"]?.disableDrillDown,
                },
            );
            if (
                disableDefaultDrills ||
                (drillDefinitions.length === 0 && restrictedDrillDowns.length === 0)
            ) {
                return;
            }

            const validDrillDefinitions = supportsAttributeHierarchies
                ? drillDefinitions
                : filterDrillFromAttributeByPriority(drillDefinitions, configuredDrills);

            const type =
                restrictedDrillDowns.length > 0 || validDrillDefinitions.some(isDrillRestricted)
                    ? "multiple"
                    : getDrillDefinitionType(validDrillDefinitions);
            if (type === "single") {
                onSelect(validDrillDefinitions[0], undefined, drillEvent, s.correlationId, context);
            } else if (type === "multiple") {
                setDropdownProps({
                    drillDefinitions: validDrillDefinitions,
                    restrictedDrillDowns,
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
        onError: (e: IDashboardCommandFailed<DashboardDrillCommand>) => onError?.(e.payload.error),
    });

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);
    const handleCloseReturnFocus = useCallback(() => {
        returnFocusToInsight?.();
        handleClose();
    }, [handleClose, returnFocusToInsight]);

    const openDrillEvent = isOpen ? dropdownProps?.drillEvent : undefined;
    useEffect(() => {
        const target = openDrillEvent?.target;
        if (!target) {
            return undefined;
        }
        notifyDrillMenuExpandedChange(target, true);
        return () => notifyDrillMenuExpandedChange(target, false);
    }, [openDrillEvent]);

    const onSelectDepsRef = useAutoupdateRef({
        drills,
        dropdownProps: { correlationId: dropdownProps?.correlationId, drillEvent: dropdownProps?.drillEvent },
        insight,
        isDrillRestricted,
        handleClose,
        returnFocusToInsight,
    });
    const onSelect = useCallback(
        (
            drillDefinition: DashboardDrillDefinition,
            context: unknown,
            drillEvent?: IDashboardDrillEvent,
            correlationId?: string,
            drillContext?: IDashboardDrillContext,
        ) => {
            const { drills, dropdownProps, insight, handleClose, isDrillRestricted } =
                onSelectDepsRef.current;
            if (isDrillRestricted(drillDefinition)) {
                return;
            }

            const effectiveDrillEvent = drillEvent ?? dropdownProps?.drillEvent;
            const effectiveCorrelationId = correlationId ?? dropdownProps?.correlationId;
            const effectiveInsight = drillContext?.insight ?? insight;

            if (!effectiveDrillEvent) {
                return;
            }

            const isNavigatingByKeyboard = document.querySelector(":focus-visible") !== null;
            handleClose();

            // onSelect may be a stale closure (useDrills keeps the first-render success handler),
            // so read the return-focus callback from the ref when the focus is actually returned.
            const returnFocusLater = (force: boolean, delay: number) => {
                window.setTimeout(() => {
                    onSelectDepsRef.current.returnFocusToInsight?.(force);
                }, delay);
            };

            // URL drills keep the dashboard in place (the link usually opens in a new tab),
            // so return focus to the drilled data point once the menu is gone.
            const returnFocusAfterMenuClose = (force: boolean) => returnFocusLater(force, 0);

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
                returnFocusAfterMenuClose(isNavigatingByKeyboard);
                return;
            }

            if (isDrillToCustomUrl(drillDefinition)) {
                drills.drillToCustomUrl.run(drillDefinition, effectiveDrillEvent, effectiveCorrelationId);
                returnFocusAfterMenuClose(isNavigatingByKeyboard);
                return;
            }

            if (isCrossFiltering(drillDefinition)) {
                drills.crossFiltering.run(
                    insight,
                    drillDefinition,
                    effectiveDrillEvent,
                    effectiveCorrelationId,
                );

                // We need to wait a bit so the chart reloads after the filter changes
                returnFocusLater(isNavigatingByKeyboard, 150);

                return;
            }

            if (isKeyDriveAnalysis(drillDefinition)) {
                drills.keyDriverAnalysis.run(
                    drillDefinition,
                    effectiveDrillEvent,
                    filters,
                    context as IDashboardKeyDriverCombinationItem,
                    effectiveCorrelationId,
                );
            }
        },
        [onSelectDepsRef, filters],
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
        <div
            className={cx("gd-drill-modal-wrapper-mask", dropDownAnchorClass)}
            {...{ [DRILL_MENU_HOST_ATTRIBUTE]: "true" }}
        >
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
