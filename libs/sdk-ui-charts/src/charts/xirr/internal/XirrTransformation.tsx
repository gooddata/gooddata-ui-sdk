// (C) 2019-2022 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
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
import Headline, { IHeadlineFiredDrillEventItemContext } from "../../headline/internal/Headline.js";

export interface IXirrTransformationProps {
    dataView: IDataView;
    drillableItems?: ExplicitDrill[];
    config?: IChartConfig;

    onDrill?: IDrillEventCallback;
    onAfterRender?: () => void;
}

/**
 * The React component that handles the transformation of the execution objects into the data accepted by the {@link Headline}
 * React component that this components wraps. It also handles the propagation of the drillable items to the component
 * and drill events out of it.
 */
class XirrTransformation extends React.Component<IXirrTransformationProps & WrappedComponentProps> {
    public static defaultProps: Pick<
        IXirrTransformationProps,
        "config" | "drillableItems" | "onDrill" | "onAfterRender"
    > = {
        config: {},
        drillableItems: [],
        onDrill: () => true,
        onAfterRender: noop,
    };

    public render() {
        const { drillableItems, config, onAfterRender, dataView } = this.props;

        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);
        const data = getHeadlineData(dataView);
        const dataWithUpdatedDrilling = applyDrillableItems(data, drillablePredicates, dataView);
        const disableDrillUnderline = this.getDisableDrillUnderlineFromConfig();
        return (
            <Headline
                data={dataWithUpdatedDrilling}
                config={config}
                onDrill={this.handleFiredDrillEvent}
                onAfterRender={onAfterRender}
                disableDrillUnderline={disableDrillUnderline}
            />
        );
    }

    private getDisableDrillUnderlineFromConfig = (): boolean =>
        this.props.config ? this.props.config.disableDrillUnderline : false;

    private handleFiredDrillEvent = (item: IHeadlineFiredDrillEventItemContext, target: HTMLElement) => {
        const { onDrill, dataView } = this.props;
        const drillEventData = buildDrillEventData(item, dataView);

        fireDrillEvent(onDrill, drillEventData, target);
    };
}

export default injectIntl(XirrTransformation);
