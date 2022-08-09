// (C) 2020-2021 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import isEqual from "lodash/isEqual";
import { useCallback, useState } from "react";
import {
    addDrillTargets,
    selectDrillTargetsByWidgetRef,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model";

/**
 *  useDashboardDrillTargets hook request
 *
 *  @internal
 */
export interface UseDashboardDrillTargetsProps {
    widgetRef: ObjRef;
}

/**
 *  useDashboardDrillTargets hook result
 *
 *  @internal
 */
interface UseDashboardDrillTargetsResult {
    /**
     * widget reported available drill targets
     */
    drillTargets?: IAvailableDrillTargets;

    /**
     * Handle available drill targets received
     */
    onAvailableDrillTargetsReceived?: (availableDrillTargets?: IAvailableDrillTargets) => void;
}

/**
 * useDashboardDrillTargets hook store drillTargets in Redux store
 *
 * @internal
 */
export const useDashboardDrillTargets = (
    props: UseDashboardDrillTargetsProps,
): UseDashboardDrillTargetsResult => {
    const { widgetRef } = props;

    const dispatch = useDashboardDispatch();

    const drillTargets = useDashboardSelector(selectDrillTargetsByWidgetRef(widgetRef));

    const onAvailableDrillTargetsReceived = useCallback(
        (availableDrillTargets?: IAvailableDrillTargets): void => {
            if (
                availableDrillTargets &&
                !isEqual(availableDrillTargets, drillTargets?.availableDrillTargets)
            ) {
                dispatch(addDrillTargets(widgetRef, availableDrillTargets));
            }
        },
        [widgetRef, drillTargets?.availableDrillTargets],
    );

    return {
        drillTargets: drillTargets?.availableDrillTargets,
        onAvailableDrillTargetsReceived,
    };
};

/**
 * useDashboardDrillTargets hook store drillTargets in local state
 *
 * @internal
 */
export const useDashboardDrillTargetsLocal = (): UseDashboardDrillTargetsResult => {
    const [drillTargets, setDrillTargets] = useState<IAvailableDrillTargets>();

    const onAvailableDrillTargetsReceived = useCallback(
        (availableDrillTargets?: IAvailableDrillTargets): void => {
            setDrillTargets((prevValue) => {
                if (availableDrillTargets && !isEqual(prevValue, availableDrillTargets)) {
                    return availableDrillTargets;
                }
                // returning prevValue effectively skips the setState
                return prevValue;
            });
        },
        [],
    );

    return {
        drillTargets,
        onAvailableDrillTargetsReceived,
    };
};
