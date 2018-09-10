// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { ErrorStates } from '../../../constants/errorStates';
import {
    ICommonVisualizationProps,
    ILoadingInjectedProps
} from './VisualizationLoadingHOC';
import { ILoadingProps } from '../../simple/LoadingComponent';
import { IErrorProps } from '../../simple/ErrorComponent';
import { generateErrorMap, IErrorMap } from '../../../helpers/errorHandlers';

export abstract class BaseVisualization<P extends ICommonVisualizationProps & ILoadingInjectedProps, S>
extends React.Component<P, S> {
    private errorMap: IErrorMap;

    constructor(props: P) {
        super(props);

        this.errorMap = generateErrorMap(props.intl);
    }

    public render(): JSX.Element {
        const {
            execution,
            error,
            isLoading
        } = this.props;

        const ErrorComponent = this.props.ErrorComponent as React.ComponentType<IErrorProps>;
        const LoadingComponent = this.props.LoadingComponent as React.ComponentType<ILoadingProps>;

        if (error) {
            const errorProps = this.errorMap[this.errorMap.hasOwnProperty(error) ? error : ErrorStates.UNKNOWN_ERROR];
            return ErrorComponent ? (
                <ErrorComponent
                    code={error}
                    {...errorProps}
                />
            ) : null;
        }

        // when in pageble mode (getPage present) never show loading (its handled by the component)
        if ((isLoading || !execution) && !this.props.getPage) {
            return LoadingComponent ? <LoadingComponent /> : null;
        }

        return this.renderVisualization();
    }

    protected abstract renderVisualization(): JSX.Element;
}
