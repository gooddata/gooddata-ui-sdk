// (C) 2007-2018 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import * as React from "react";
import { InjectedIntlProps, injectIntl } from "react-intl";
import { convertDrillableItemsToPredicates2 } from "../../../base/helpers/headerPredicate";
import { IChartConfig } from "../../../interfaces/Config";
import { IDrillableItem, IDrillEventCallback2 } from "../../../interfaces/DrillEvents";
import { IHeaderPredicate2 } from "../../../interfaces/HeaderPredicate";
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

    onFiredDrillEvent?: IDrillEventCallback2;
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
        onFiredDrillEvent: () => true,
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
                onFiredDrillEvent={this.handleFiredDrillEvent}
                onAfterRender={onAfterRender}
            />
        );
    }

    private handleFiredDrillEvent(item: IHeadlineFiredDrillEventItemContext, target: HTMLElement) {
        const { onFiredDrillEvent, dataView } = this.props;
        const drillEventData = buildDrillEventData(item, dataView);

        fireDrillEvent(onFiredDrillEvent, drillEventData, target);
    }
}

export default injectIntl(HeadlineTransformation);
