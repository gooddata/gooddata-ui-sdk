// (C) 2020-2021 GoodData Corporation
import { useMemo } from "react";
import flatMap from "lodash/flatMap";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";
import {
    IAvailableDrillTargetAttribute,
    IDrillEvent,
    isSomeHeaderPredicateMatched,
    DataViewFacade,
    IDrillableItem,
    IHeaderPredicate,
    IAvailableDrillTargets,
} from "@gooddata/sdk-ui";

import { getImplicitDrillsWithPredicates } from "../../../../_staging/drills/drillingUtils";
import { OnDashboardDrill } from "../../../drill";
import { IDashboardDrillEvent } from "../../../../types";
import { useDashboardSelector, selectAttributesWithDrillDown } from "../../../../model";

/**
 * @internal
 */
export interface UseDashboardInsightDrillsProps {
    disableWidgetImplicitDrills?: boolean;
    widget: IInsightWidget;
    insight: IInsight;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    drillTargets?: IAvailableDrillTargets;
    onDrill?: OnDashboardDrill;
}

interface UseDashboardInsightDrillsResult {
    handleDrill?: (event: IDrillEvent) => false | void;
    drillableItems?: (IDrillableItem | IHeaderPredicate)[];
}

/**
 * @internal
 */
export const useDashboardInsightDrills = (
    props: UseDashboardInsightDrillsProps,
): UseDashboardInsightDrillsResult => {
    const { widget, insight, drillableItems, disableWidgetImplicitDrills, drillTargets, onDrill } = props;
    const attributesWithDrillDown = useDashboardSelector(selectAttributesWithDrillDown);
    const drillTargetsAttributes = drillTargets?.attributes;

    const possibleDrills: IAvailableDrillTargetAttribute[] = useMemo(() => {
        return drillTargetsAttributes ? drillTargetsAttributes : [];
    }, [drillTargetsAttributes]);

    const implicitDrillDefinitions = useMemo(() => {
        return getImplicitDrillsWithPredicates(
            widget.drills,
            possibleDrills,
            attributesWithDrillDown,
            disableWidgetImplicitDrills,
        );
    }, [widget.drills, possibleDrills, attributesWithDrillDown, disableWidgetImplicitDrills]);

    const implicitDrills = useMemo(() => {
        return flatMap(implicitDrillDefinitions, (info) => info.predicates);
    }, [implicitDrillDefinitions]);

    /*
     * if there are drillable items from the user, use them and only them
     *
     * also pass any drillable items only if there is an onDrill specified, otherwise pass undefined
     * so that the items are not shown as active since nothing can happen on click without the onDrill provided
     */
    const drillableItemsToUse = props.onDrill ? drillableItems ?? implicitDrills : undefined;

    const handleDrill = onDrill
        ? (event: IDrillEvent) => {
              const drillContext = {
                  insight,
                  widget,
              };

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
              return typeof onDrill === "function" && onDrill(drillEvent, drillContext);
          }
        : undefined;

    return {
        handleDrill,
        drillableItems: drillableItemsToUse,
    };
};
