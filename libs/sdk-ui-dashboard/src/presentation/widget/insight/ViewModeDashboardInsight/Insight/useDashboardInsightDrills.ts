// (C) 2020-2022 GoodData Corporation
import { useCallback, useMemo } from "react";
import isEqual from "lodash/isEqual.js";
import {
    useDashboardSelector,
    useDashboardDispatch,
    selectDrillTargetsByWidgetRef,
    addDrillTargets,
    selectDrillableItemsByWidgetRef,
    selectConfiguredAndImplicitDrillsByWidgetRef,
    selectIsInEditMode,
    selectEnableKPIDashboardDrillFromAttribute,
} from "../../../../../model/index.js";
import { OnWidgetDrill } from "../../../../drill/types.js";
import {
    DataViewFacade,
    IAvailableDrillTargets,
    IDrillEvent,
    IPushData,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";
import { IDashboardDrillEvent } from "../../../../../types.js";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";
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
    const isDrillFromAttributeEnabled = useDashboardSelector(selectEnableKPIDashboardDrillFromAttribute);

    const onPushData = useCallback(
        (data: IPushData): void => {
            const targets = sanitizeAvailableDrillTargets(
                data?.availableDrillTargets,
                isDrillFromAttributeEnabled,
            );

            if (targets && !isEqual(drillTargets?.availableDrillTargets, targets)) {
                dispatch(addDrillTargets(widget.ref, targets));
            }
        },
        [drillTargets, widget.ref, isDrillFromAttributeEnabled, dispatch],
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
) => {
    // if no drill targets went in (likely the pushData was fired in a non-drill-related case)
    // pass the undefined through, this avoids useless setting of the drill targets down the line
    if (!availableDrillTargets) {
        return availableDrillTargets;
    }
    // base on ff we remove attributes targets if is not supported
    return isDrillFromAttributeEnabled
        ? availableDrillTargets
        : { ...availableDrillTargets, attributes: undefined };
};
