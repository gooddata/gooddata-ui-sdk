// (C) 2020-2025 GoodData Corporation
import { useCallback, useState } from "react";

import isEqual from "lodash/isEqual.js";

import { IInsight, IInsightWidget } from "@gooddata/sdk-model";
import {
    DataViewFacade,
    IAvailableDrillTargets,
    IDrillEvent,
    IPushData,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";

import {
    selectDrillableItemsByAvailableDrillTargets,
    selectEnableKPIDashboardDrillFromAttribute,
    selectImplicitDrillsByAvailableDrillTargets,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { IDashboardDrillEvent } from "../../../../../types.js";
import { OnWidgetDrill } from "../../../../drill/types.js";

/**
 * @internal
 */
export interface UseDashboardInsightDrillsProps {
    widget: IInsightWidget;
    insight: IInsight;
    onDrill?: OnWidgetDrill;
}

/**
 * @internal
 */
export const useDrillDialogInsightDrills = ({
    widget,
    insight,
    onDrill: onDrillFn,
}: UseDashboardInsightDrillsProps) => {
    // Drilling
    const [drillTargets, setDrillTargets] = useState<IAvailableDrillTargets>();
    const isDrillFromAttributeEnabled = useDashboardSelector(selectEnableKPIDashboardDrillFromAttribute);
    const disableDrillDownOnInsight = insight.insight.properties.controls?.disableDrillDown;

    const onPushData = useCallback(
        (data: IPushData): void => {
            const targets = sanitizeAvailableDrillTargets(
                data?.availableDrillTargets,
                isDrillFromAttributeEnabled,
                !disableDrillDownOnInsight,
            );

            if (targets && !isEqual(drillTargets, data.availableDrillTargets)) {
                setDrillTargets(targets);
            }
        },
        [disableDrillDownOnInsight, drillTargets, isDrillFromAttributeEnabled],
    );

    const implicitDrillDefinitions = useDashboardSelector(
        selectImplicitDrillsByAvailableDrillTargets(drillTargets, widget.ignoredDrillDownHierarchies),
    );
    const drillableItems = useDashboardSelector(
        selectDrillableItemsByAvailableDrillTargets(drillTargets, widget.ignoredDrillDownHierarchies),
    );
    const onDrill = onDrillFn
        ? (event: IDrillEvent) => {
              const facade = DataViewFacade.for(event.dataView);

              const matchingImplicitDrillDefinitions = implicitDrillDefinitions.filter((info) => {
                  return event.drillContext.intersection?.some((intersection) =>
                      isSomeHeaderPredicateMatched(info.predicates, intersection.header, facade),
                  );
              });

              const drillEvent: IDashboardDrillEvent = {
                  ...event,
                  widgetRef: widget.ref,
                  drillDefinitions: matchingImplicitDrillDefinitions.map((info) => info.drillDefinition),
              };
              return (
                  typeof onDrillFn === "function" &&
                  onDrillFn(drillEvent, {
                      insight,
                      widget,
                  })
              );
          }
        : undefined;

    return {
        drillableItems,
        onPushData,
        onDrill,
    };
};

const sanitizeAvailableDrillTargets = (
    availableDrillTargets: IAvailableDrillTargets | undefined,
    isDrillFromAttributeEnabled: boolean,
    isDrillDownOnInsightEnabled: boolean,
) => {
    // if no drill targets went in (likely the pushData was fired in a non-drill-related case)
    // pass the undefined through, this avoids useless setting of the drill targets down the line
    if (!availableDrillTargets) {
        return availableDrillTargets;
    }

    // Both drill from attribute FF and drilldown enablement on insight level must be enabled
    return isDrillFromAttributeEnabled && isDrillDownOnInsightEnabled
        ? availableDrillTargets
        : { ...availableDrillTargets, attributes: undefined };
};
