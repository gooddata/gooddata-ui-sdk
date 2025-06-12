// (C) 2007-2018 GoodData Corporation
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
class LegacyHeadlineTransformation extends React.Component<
    IHeadlineTransformationProps & WrappedComponentProps
> {
    public static defaultProps: Pick<
        IHeadlineTransformationProps,
        "drillableItems" | "onDrill" | "onAfterRender"
    > = {
        drillableItems: [],
        onDrill: () => true,
        onAfterRender: noop,
    };

    constructor(props: IHeadlineTransformationProps & WrappedComponentProps) {
        super(props);

        this.handleFiredDrillEvent = this.handleFiredDrillEvent.bind(this);
    }

    public render() {
        const { intl, drillableItems, dataView, config, onAfterRender } = this.props;

        const data = getHeadlineData(dataView, intl);
        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);
        const dataWithUpdatedDrilling = applyDrillableItems(data, drillablePredicates, dataView);
        const disableDrillUnderline = this.getDisableDrillUnderlineFromConfig();

        return (
            <LegacyHeadline
                data={dataWithUpdatedDrilling}
                config={config}
                onDrill={this.handleFiredDrillEvent}
                onAfterRender={onAfterRender}
                disableDrillUnderline={disableDrillUnderline}
            />
        );
    }

    private getDisableDrillUnderlineFromConfig() {
        if (this.props.config) {
            return this.props.config.disableDrillUnderline;
        }

        return undefined;
    }

    private handleFiredDrillEvent(item: IHeadlineFiredDrillEventItemContext, target: HTMLElement) {
        const { onDrill, dataView } = this.props;
        const drillEventData = buildDrillEventData(item, dataView);

        fireDrillEvent(onDrill, drillEventData, target);
    }
}

export default injectIntl(LegacyHeadlineTransformation);
