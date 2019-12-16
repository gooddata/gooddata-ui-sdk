// (C) 2019 GoodData Corporation
import * as React from "react";
import { InjectedIntlProps, injectIntl } from "react-intl";
import noop = require("lodash/noop");
import { convertDrillableItemsToPredicates, fireDrillEvent } from "../../../base/vis/drilling";
import { IChartConfig } from "../../../highcharts";
import { IDrillableItem, IDrillEventCallback } from "../../../base/vis/DrillEvents";
import { IHeaderPredicate } from "../../../base/headerMatching/HeaderPredicate";
import { getHeadlineData, applyDrillableItems, buildDrillEventData } from "./utils/XirrTransformationUtils";
import { IDataView } from "@gooddata/sdk-backend-spi";
import Headline, { IHeadlineFiredDrillEventItemContext } from "../../headline/internal/Headline";

export interface IXirrTransformationProps {
    dataView: IDataView;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    config?: IChartConfig;

    onDrill?: IDrillEventCallback;
    onAfterRender?: () => void;
}

/**
 * The React component that handles the transformation of the execution objects into the data accepted by the {Headline}
 * React component that this components wraps. It also handles the propagation of the drillable items to the component
 * and drill events out of it.
 */
class XirrTransformation extends React.Component<IXirrTransformationProps & InjectedIntlProps> {
    public static defaultProps: Partial<IXirrTransformationProps> = {
        drillableItems: [],
        onDrill: () => true,
        onAfterRender: noop,
    };

    public render(): React.ReactNode {
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

    private handleFiredDrillEvent(item: IHeadlineFiredDrillEventItemContext, target: HTMLElement) {
        const { onDrill, dataView } = this.props;
        const drillEventData = buildDrillEventData(item, dataView);

        fireDrillEvent(onDrill, drillEventData, target);
    }
}

export default injectIntl(XirrTransformation);
