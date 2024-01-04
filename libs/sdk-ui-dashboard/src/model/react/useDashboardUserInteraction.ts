// (C) 2020-2023 GoodData Corporation
import { useCallback } from "react";
import {
    AttributeFilterInteractionType,
    DescriptionTooltipOpenedData,
    ShareDialogInteractionData,
    userInteractionTriggered,
    AttributeHierarchiesInteractionType,
} from "../events/index.js";

import { useDashboardEventDispatch } from "./useDashboardEventDispatch.js";

/**
 * Hook for dispatching relevant user interaction commands.
 * These commands enable to track user interactions that cannot be tracked by other existing events.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDashboardUserInteraction = () => {
    const eventDispatch = useDashboardEventDispatch();

    const poweredByGDLogoClicked = useCallback(() => {
        eventDispatch(userInteractionTriggered("poweredByGDLogoClicked"));
    }, [eventDispatch]);

    const kpiAlertDialogClosed = useCallback(() => {
        eventDispatch(userInteractionTriggered("kpiAlertDialogClosed"));
    }, [eventDispatch]);

    const kpiAlertDialogOpened = useCallback(
        (alreadyHasAlert: boolean) => {
            eventDispatch(
                userInteractionTriggered({ interaction: "kpiAlertDialogOpened", data: { alreadyHasAlert } }),
            );
        },
        [eventDispatch],
    );

    const descriptionTooltipOpened = useCallback(
        (eventData: DescriptionTooltipOpenedData) => {
            eventDispatch(
                userInteractionTriggered({ interaction: "descriptionTooltipOpened", data: eventData }),
            );
        },
        [eventDispatch],
    );

    const shareDialogInteraction = useCallback(
        (eventData: ShareDialogInteractionData) => {
            eventDispatch(
                userInteractionTriggered({ interaction: "shareDialogInteraction", data: eventData }),
            );
        },
        [eventDispatch],
    );

    const attributeFilterInteraction = useCallback(
        (eventType: AttributeFilterInteractionType) => {
            eventDispatch(userInteractionTriggered(eventType));
        },
        [eventDispatch],
    );

    const attributeHierarchiesInteraction = useCallback(
        (eventType: AttributeHierarchiesInteractionType) => {
            eventDispatch(userInteractionTriggered(eventType));
        },
        [eventDispatch],
    );

    const filterContextStateReset = useCallback(() => {
        eventDispatch(userInteractionTriggered("filterContextStateReset"));
    }, [eventDispatch]);

    const interactionPanelOpened = useCallback(() => {
        eventDispatch(userInteractionTriggered("interactionPanelOpened"));
    }, [eventDispatch]);

    const addInteractionClicked = useCallback(() => {
        eventDispatch(userInteractionTriggered("addInteractionClicked"));
    }, [eventDispatch]);

    return {
        poweredByGDLogoClicked,
        kpiAlertDialogClosed,
        kpiAlertDialogOpened,
        descriptionTooltipOpened,
        shareDialogInteraction,
        attributeFilterInteraction,
        filterContextStateReset,
        interactionPanelOpened,
        addInteractionClicked,
        attributeHierarchiesInteraction,
    };
};
