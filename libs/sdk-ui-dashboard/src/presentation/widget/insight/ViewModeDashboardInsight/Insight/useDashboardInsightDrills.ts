// (C) 2020-2025 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { isEqual } from "lodash-es";

import { IInsight, IInsightWidget } from "@gooddata/sdk-model";
import { DataViewFacade, IDrillEvent, IPushData, isSomeHeaderPredicateMatched } from "@gooddata/sdk-ui";

import {
    addDrillTargets,
    selectAccessibleDashboardsLoaded,
    selectCatalogIsLoaded,
    selectConfiguredAndImplicitDrillsByWidgetRef,
    selectDrillTargetsByWidgetRef,
    selectDrillableItemsByWidgetRef,
    selectIsInEditMode,
    useDashboardDispatch,
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
export const useDashboardInsightDrills = ({
    widget,
    insight,
    onDrill: onDrillFn,
}: UseDashboardInsightDrillsProps) => {
    const dispatch = useDashboardDispatch();
    const drillTargets = useDashboardSelector(selectDrillTargetsByWidgetRef(widget.ref));
    const disableDrillDownOnWidget = insight.insight.properties["controls"]?.["disableDrillDown"];
    const catalogIsLoaded = useDashboardSelector(selectCatalogIsLoaded);
    const accessibleDashboardsLoaded = useDashboardSelector(selectAccessibleDashboardsLoaded);
    const [isLoadingDrillTargets, setIsLoadingDrillTargets] = useState(true);

    const onPushData = useCallback(
        (data: IPushData): void => {
            const targets = data?.availableDrillTargets;

            if (targets && !isEqual(drillTargets?.availableDrillTargets, targets)) {
                dispatch(addDrillTargets(widget.ref, targets));
            }

            if ("availableDrillTargets" in data) {
                setIsLoadingDrillTargets(false);
            }
        },
        [drillTargets, widget.ref, dispatch],
    );

    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const rawDrillableItems = useDashboardSelector(selectDrillableItemsByWidgetRef(widget.ref));
    const drillableItems = useMemo(() => {
        return isInEditMode ? [] : rawDrillableItems;
    }, [isInEditMode, rawDrillableItems]);

    const implicitDrillDefinitions = useDashboardSelector(
        selectConfiguredAndImplicitDrillsByWidgetRef(widget.ref),
    );

    const onDrill = onDrillFn
        ? (event: IDrillEvent) => {
              const facade = DataViewFacade.for(event.dataView);

              const matchingImplicitDrillDefinitions = implicitDrillDefinitions.filter((info) => {
                  const isDrillDownDisabled =
                      disableDrillDownOnWidget && info.drillDefinition.type === "drillDown";
                  return (
                      !isDrillDownDisabled &&
                      event.drillContext.intersection?.some((intersection) =>
                          isSomeHeaderPredicateMatched(info.predicates, intersection.header, facade),
                      )
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

    // disable all drills until necessary items are loaded
    const drillActive = catalogIsLoaded && accessibleDashboardsLoaded && !isLoadingDrillTargets;
    return {
        drillableItems: drillActive ? drillableItems : [],
        onPushData,
        onDrill,
    };
};
