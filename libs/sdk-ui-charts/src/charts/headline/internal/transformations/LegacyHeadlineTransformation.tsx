// (C) 2007-2025 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { convertDrillableItemsToPredicates, fireDrillEvent } from "@gooddata/sdk-ui";
import LegacyHeadline from "../headlines/LegacyHeadline.js";
import {
    applyDrillableItems,
    buildDrillEventData,
    getHeadlineData,
} from "../utils/HeadlineTransformationUtils.js";
import noop from "lodash/noop.js";
import { IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import { IHeadlineFiredDrillEventItemContext } from "../interfaces/DrillEvents.js";

/**
 * The React component that handles the transformation of the execution objects into the data accepted by the {@link LegacyHeadline}
 * React component that this components wraps. It also handles the propagation of the drillable items to the component
 * and drill events out of it.
 */
function LegacyHeadlineTransformation(props: IHeadlineTransformationProps & WrappedComponentProps) {
    const { intl, drillableItems = [], dataView, config, onAfterRender = noop, onDrill = () => true } = props;

    const getDisableDrillUnderlineFromConfig = () => {
        if (config) {
            return config.disableDrillUnderline;
        }

        return undefined;
    };

    const handleFiredDrillEvent = (item: IHeadlineFiredDrillEventItemContext, target: HTMLElement) => {
        const drillEventData = buildDrillEventData(item, dataView);

        fireDrillEvent(onDrill, drillEventData, target);
    };

    const data = getHeadlineData(dataView, intl);
    const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);
    const dataWithUpdatedDrilling = applyDrillableItems(data, drillablePredicates, dataView);
    const disableDrillUnderline = getDisableDrillUnderlineFromConfig();

    return (
        <LegacyHeadline
            data={dataWithUpdatedDrilling}
            config={config}
            onDrill={handleFiredDrillEvent}
            onAfterRender={onAfterRender}
            disableDrillUnderline={disableDrillUnderline}
        />
    );
}

export default injectIntl(LegacyHeadlineTransformation);
