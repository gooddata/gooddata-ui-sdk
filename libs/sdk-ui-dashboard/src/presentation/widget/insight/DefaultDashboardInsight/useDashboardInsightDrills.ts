// (C) 2020-2021 GoodData Corporation
import { useCallback, useMemo, useRef, useEffect } from "react";
import flatMap from "lodash/flatMap";
import isEqual from "lodash/isEqual";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";
import {
    IAvailableDrillTargetAttribute,
    IPushData,
    IDrillEvent,
    isSomeHeaderPredicateMatched,
    DataViewFacade,
    IDrillableItem,
    IHeaderPredicate,
} from "@gooddata/sdk-ui";

import { getImplicitDrillsWithPredicates } from "../../../../_staging/drills/drillingUtils";
import { OnDashboardDrill } from "../../../drill";
import {
    useDashboardSelector,
    selectAttributesWithDrillDown,
    selectDrillTargetsByWidgetRef,
    useDashboardDispatch,
    addDrillTargets,
} from "../../../../model";
import { IDashboardDrillEvent } from "../../../../types";

/**
 * @internal
 */
export interface UseDashboardInsightDrillsProps {
    disableWidgetImplicitDrills?: boolean;
    widget: IInsightWidget;
    insight: IInsight;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnDashboardDrill;
}

interface UseDashboardInsightDrillsResult {
    handleDrill?: (event: IDrillEvent) => false | void;
    handlePushData: (data: IPushData) => void;
    drillableItems: (IDrillableItem | IHeaderPredicate)[] | undefined;
}

/**
 * @internal
 */
export const useDashboardInsightDrills = (
    props: UseDashboardInsightDrillsProps,
): UseDashboardInsightDrillsResult => {
    const { widget, insight, drillableItems, disableWidgetImplicitDrills, onDrill } = props;
    const { ref: widgetRef } = widget;

    const dispatch = useDashboardDispatch();
    const attributesWithDrillDown = useDashboardSelector(selectAttributesWithDrillDown);

    const drillTargets = useDashboardSelector(selectDrillTargetsByWidgetRef(widgetRef));
    const drillTargetsAttributes = drillTargets?.availableDrillTargets?.attributes;

    const possibleDrills: IAvailableDrillTargetAttribute[] = useMemo(() => {
        return drillTargetsAttributes ? drillTargetsAttributes : [];
    }, [drillTargetsAttributes]);

    const handlePushData = useCallback((data: IPushData): void => {
        if (
            data.availableDrillTargets &&
            !isEqual(drillTargets?.availableDrillTargets, data.availableDrillTargets)
        ) {
            dispatch(addDrillTargets(widgetRef, data.availableDrillTargets));
        }
    }, []);

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

    // since InsightRendererImpl only sets onDrill on the first render (this is a PlugVis API, there is no way to update onDrill there)
    // we have to sync the implicitDrillDefinitions into a ref so that the handleDrill can access the most recent value (thanks to the .current)
    // without this, handleDrill just closes over the first implicitDrillDefinitions which will never contain drillDown drills
    // as they are added *after* the first render of the PlugVis.
    const cachedImplicitDrillDefinitions = useRef(implicitDrillDefinitions);
    useEffect(() => {
        cachedImplicitDrillDefinitions.current = implicitDrillDefinitions;
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
              let enrichedEvent: IDashboardDrillEvent = {
                  ...event,
                  widgetRef: widget.ref,
              };

              // if there are drillable items, we do not want to return any drillDefinitions as the implicit drills are not even used
              if (drillableItems && typeof onDrill === "function") {
                  return onDrill(enrichedEvent, drillContext);
              }

              const facade = DataViewFacade.for(event.dataView);

              const definitions = cachedImplicitDrillDefinitions.current;

              const matchingImplicitDrillDefinitions = definitions.filter((info) => {
                  return event.drillContext.intersection?.some((intersection) =>
                      isSomeHeaderPredicateMatched(info.predicates, intersection.header, facade),
                  );
              });

              enrichedEvent = {
                  ...enrichedEvent,
                  drillDefinitions: matchingImplicitDrillDefinitions.map((info) => info.drillDefinition),
              };
              return typeof onDrill === "function" && onDrill(enrichedEvent, drillContext);
          }
        : undefined;

    return {
        handleDrill,
        handlePushData,
        drillableItems: drillableItemsToUse,
    };
};
