import * as React from 'react';
import noop = require('lodash/noop');
import { Afm, Transformation } from '@gooddata/data-layer';
import LineFamilyChartTransformation from '@gooddata/indigo-visualizations/lib/Chart/LineFamilyChartTransformation';
import PieChartTransformation from '@gooddata/indigo-visualizations/lib/Chart/PieChartTransformation';

import { Execute } from '../../execution/Execute';
import { generateConfig } from '../../helpers/config';
import { IEvents } from '../../interfaces/Events';
import { IntlWrapper } from './IntlWrapper';
import {
    DATA_TOO_LARGE_DISPLAY,
    NEGATIVE_VALUES
} from '../../constants/errorStates';

export type ChartTypes = 'line' | 'bar' | 'column' | 'pie';

export interface IChartConfig {
    colors?: String[];
    legend?: {
        enabled?: boolean;
        position?: 'top' | 'left' | 'right' | 'bottom';
    };
    limits?: {
        series?: Number,
        categories?: Number
    };
}

export interface IChartProps extends IEvents {
    afm: Afm.IAfm;
    projectId: string;
    transformation?: Transformation.ITransformation;
    config?: IChartConfig;
    type: ChartTypes;
}

export interface IChartState {
    error: boolean;
    result: any;
    isLoading: boolean;
}

const defaultErrorHandler = (error) => {
    console.error(error);
};

export class BaseChart extends React.Component<IChartProps, IChartState> {
    public static defaultProps: Partial<IChartProps> = {
        onError: defaultErrorHandler,
        onLoadingChanged: noop,
        config: {}
    };

    private isUnmounted = false;

    constructor(props) {
        super(props);

        this.state = {
            error: false,
            result: null,
            isLoading: true
        };

        this.onError = this.onError.bind(this);
        this.onExecute = this.onExecute.bind(this);
        this.onLoading = this.onLoading.bind(this);
    }

    public onExecute(data) {
        if (this.isUnmounted) {
            return;
        }

        this.setState({ result: data, error: false });
    }

    public onError(error) {
        if (this.isUnmounted) {
            return;
        }

        this.setState({ error: true });
        this.props.onError(error);
    }

    public onLoading(isLoading: boolean) {
        if (this.isUnmounted) {
            return;
        }

        this.setState({ isLoading });
        this.props.onLoadingChanged({ isLoading });
    }

    public componentWillUnmount() {
        this.isUnmounted = true;
    }

    public render() {
        const {
            afm,
            projectId,
            type,
            transformation
        } = this.props;

        if (this.state.error) {
            return null;
        }

        return (
            <Execute
                className={`gdc-${type}-chart`}
                afm={afm}
                transformation={transformation}
                onError={this.onError}
                onExecute={this.onExecute}
                onLoading={this.onLoading}
                projectId={projectId}
            >
                {this.getComponent()}
            </Execute>
        );
    }

    private getChartTransformation() {
        const { type, afm, config, transformation } = this.props;
        const { result } = this.state;

        const visConfig = generateConfig(type, afm, transformation, config, result.headers);

        if (type === 'pie') {
            return (
                <PieChartTransformation
                    config={visConfig}
                    data={result}
                    onDataTooLarge={() => this.onError({ status: DATA_TOO_LARGE_DISPLAY })}
                    onNegativeValues={() => this.onError({ status: NEGATIVE_VALUES })}
                />
            );
        }

        return (
            <LineFamilyChartTransformation
                config={visConfig}
                data={result}
                onDataTooLarge={() => this.onError({ status: DATA_TOO_LARGE_DISPLAY })}
                limits={config.limits}
            />
        );
    }

    private getComponent() {
        if (this.state.isLoading) {
            return null;
        }
        return (
            <IntlWrapper>
                {this.getChartTransformation()}
            </IntlWrapper>
        );
    }

}
