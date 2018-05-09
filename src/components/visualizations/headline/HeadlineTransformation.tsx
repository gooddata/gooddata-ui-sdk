// (C) 2007-2018 GoodData Corporation
import { Execution, AFM } from '@gooddata/typings';
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import noop = require('lodash/noop');
import { IDrillableItem, IDrillEventCallback } from '../../../interfaces/DrillEvents';
import Headline, { IHeadlineFiredDrillEventItemContext } from './Headline';
import {
    applyDrillableItems,
    buildDrillEventData,
    fireDrillEvent,
    getHeadlineData
} from './utils/HeadlineTransformationUtils';

export interface IHeadlineTransformationProps {
    executionRequest: AFM.IExecution['execution'];
    executionResponse: Execution.IExecutionResponse;
    executionResult: Execution.IExecutionResult;

    drillableItems?: IDrillableItem[];

    onFiredDrillEvent?: IDrillEventCallback;
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
        onAfterRender: noop
    };

    constructor(props: IHeadlineTransformationProps & InjectedIntlProps) {
        super(props);

        this.handleFiredDrillEvent = this.handleFiredDrillEvent.bind(this);
    }

    public render() {
        const {
            intl,
            executionRequest,
            executionResponse,
            executionResult,
            drillableItems,
            onAfterRender
        } = this.props;

        const data = getHeadlineData(executionResponse, executionResult, intl);
        const dataWithUpdatedDrilling = applyDrillableItems(data, drillableItems, executionRequest);

        return (
            <Headline
                data={dataWithUpdatedDrilling}
                onFiredDrillEvent={this.handleFiredDrillEvent}
                onAfterRender={onAfterRender}
            />
        );
    }

    private handleFiredDrillEvent(item: IHeadlineFiredDrillEventItemContext, target: HTMLElement) {
        const { onFiredDrillEvent, executionRequest, executionResponse } = this.props;
        const drillEventData = buildDrillEventData(item, executionRequest, executionResponse);

        fireDrillEvent(onFiredDrillEvent, drillEventData, target);
    }
}

export default injectIntl(HeadlineTransformation);
