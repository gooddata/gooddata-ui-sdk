// (C) 2019-2025 GoodData Corporation

import { useCallback } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import { IDataView } from "@gooddata/sdk-backend-spi";
import {
    ExplicitDrill,
    IDrillEventCallback,
    convertDrillableItemsToPredicates,
    fireDrillEvent,
} from "@gooddata/sdk-ui";

import {
    applyDrillableItems,
    buildDrillEventData,
    getHeadlineData,
} from "./utils/XirrTransformationUtils.js";
import { IChartConfig } from "../../../interfaces/index.js";
import LegacyHeadline from "../../headline/internal/headlines/LegacyHeadline.js";
import {
    HeadlineFiredDrillEvent,
    IHeadlineFiredDrillEventItemContext,
} from "../../headline/internal/interfaces/DrillEvents.js";

export interface IXirrTransformationProps {
    dataView: IDataView;
    drillableItems?: ExplicitDrill[];
    config?: IChartConfig;

    onDrill?: IDrillEventCallback;
    onAfterRender?: () => void;
}

/**
 * The React component that handles the transformation of the execution objects into the data accepted by the {@link LegacyHeadline}
 * React component that this components wraps. It also handles the propagation of the drillable items to the component
 * and drill events out of it.
 */
function XirrTransformation({
    drillableItems = [],
    config = {},
    onDrill = () => true,
    onAfterRender = () => {},
    dataView,
}: IXirrTransformationProps & WrappedComponentProps) {
    const getDisableDrillUnderlineFromConfig = useCallback(
        () => (config ? config.disableDrillUnderline : false),
        [config],
    );

    const handleFiredDrillEvent = useCallback(
        (item: IHeadlineFiredDrillEventItemContext, target: HTMLElement) => {
            const drillEventData = buildDrillEventData(item, dataView);

            fireDrillEvent(onDrill, drillEventData, target);
        },
        [dataView, onDrill],
    );

    const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);
    const data = getHeadlineData(dataView);
    const dataWithUpdatedDrilling = applyDrillableItems(data, drillablePredicates, dataView);
    const disableDrillUnderline = getDisableDrillUnderlineFromConfig();

    return (
        <LegacyHeadline
            data={dataWithUpdatedDrilling}
            config={config}
            onDrill={handleFiredDrillEvent as HeadlineFiredDrillEvent}
            onAfterRender={onAfterRender}
            disableDrillUnderline={disableDrillUnderline}
        />
    );
}

export default injectIntl(XirrTransformation);
