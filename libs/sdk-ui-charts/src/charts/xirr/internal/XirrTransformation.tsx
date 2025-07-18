// (C) 2019-2025 GoodData Corporation
import noop from "lodash/noop.js";
import { IChartConfig } from "../../../interfaces/index.js";
import {
    ExplicitDrill,
    IDrillEventCallback,
    convertDrillableItemsToPredicates,
    fireDrillEvent,
} from "@gooddata/sdk-ui";
import {
    getHeadlineData,
    applyDrillableItems,
    buildDrillEventData,
} from "./utils/XirrTransformationUtils.js";
import { IDataView } from "@gooddata/sdk-backend-spi";
import LegacyHeadline from "../../headline/internal/headlines/LegacyHeadline.js";
import { IHeadlineFiredDrillEventItemContext } from "../../headline/internal/interfaces/DrillEvents.js";

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
export default function XirrTransformation({
    drillableItems = [],
    config = {},
    onDrill = () => true,
    onAfterRender = noop,
    dataView,
}: IXirrTransformationProps) {
    const getDisableDrillUnderlineFromConfig = (): boolean => (config ? config.disableDrillUnderline : false);

    const handleFiredDrillEvent = (item: IHeadlineFiredDrillEventItemContext, target: HTMLElement) => {
        const drillEventData = buildDrillEventData(item, dataView);

        fireDrillEvent(onDrill, drillEventData, target);
    };

    const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);
    const data = getHeadlineData(dataView);
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
