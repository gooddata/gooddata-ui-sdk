import * as React from 'react';
import { ErrorStates } from '../../../constants/errorStates';
import {
    ICommonVisualizationProps,
    ILoadingInjectedProps
} from './VisualizationLoadingHOC';

export abstract class BaseVisualization<P extends ICommonVisualizationProps & ILoadingInjectedProps, S>
    extends React.Component<P, S> {

    public render(): JSX.Element {
        const {
            ErrorComponent,
            LoadingComponent,
            execution,
            error,
            isLoading
        } = this.props;

        if (error !== ErrorStates.OK) {
            return ErrorComponent ? <ErrorComponent error={{ status: error }} props={this.props} /> : null;
        }

        if (isLoading || !execution) {
            return LoadingComponent ? <LoadingComponent props={this.props} /> : null;
        }

        return this.renderVisualization();
    }

    protected abstract renderVisualization(): JSX.Element;
}
