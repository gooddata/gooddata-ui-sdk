// (C) 2007-2018 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import * as React from "react";
import { InjectedIntlProps, injectIntl } from "react-intl";
import { convertDrillableItemsToPredicates2 } from "../../../base/helpers/drilling";
import { IChartConfig } from "../../../highcharts";
import { IDrillableItem, IDrillEventCallback2 } from "../../../base/interfaces/DrillEvents";
import { IHeaderPredicate2 } from "../../../base/interfaces/HeaderPredicate";
import Headline, { IHeadlineFiredDrillEventItemContext } from "./Headline";
import {
    applyDrillableItems,
    buildDrillEventData,
    fireDrillEvent,
    getHeadlineData,
} from "./utils/HeadlineTransformationUtils";
import noop = require("lodash/noop");

export interface IHeadlineTransformationProps {
    dataView: IDataView;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate2>;
    config?: IChartConfig;

    onDrill?: IDrillEventCallback2;
    onAfterRender?: () => void;
}

/**
 * The React component that handles the transformation of the execution objects into the data accepted by the {Headline}
 * React component that this components wraps. It also handles the propagation of the drillable items to the component
 * and drill events out of it.
 */
class HeadlineTransformation extends React.Component<IHeadlineTransformationProps & InjectedIntlProps> {
    public static defaultProps: Partial<IHeadlineTransformationProps> = {
        drillableItems: [],
        onDrill: () => true,
        onAfterRender: noop,
    };

    constructor(props: IHeadlineTransformationProps & InjectedIntlProps) {
        super(props);

        this.handleFiredDrillEvent = this.handleFiredDrillEvent.bind(this);
    }

    public render() {
        const { intl, drillableItems, dataView, config, onAfterRender } = this.props;

        const data = getHeadlineData(dataView, intl);
        const drillablePredicates = convertDrillableItemsToPredicates2(drillableItems);
        const dataWithUpdatedDrilling = applyDrillableItems(data, drillablePredicates, dataView);

        return (
            <Headline
                data={dataWithUpdatedDrilling}
                config={config}
                onDrill={this.handleFiredDrillEvent}
                onAfterRender={onAfterRender}
            />
        );
    }

    private handleFiredDrillEvent(item: IHeadlineFiredDrillEventItemContext, target: HTMLElement) {
        const { onDrill, dataView } = this.props;
        const drillEventData = buildDrillEventData(item, dataView);

        fireDrillEvent(onDrill, drillEventData, target);
    }
}

export default injectIntl(HeadlineTransformation);
