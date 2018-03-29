import * as React from 'react';
import { ErrorStates } from '../../../constants/errorStates';
import {
    ICommonVisualizationProps,
    ILoadingInjectedProps
} from './VisualizationLoadingHOC';
import { ILoadingProps } from '../../simple/LoadingComponent';
import { IErrorProps } from '../../simple/ErrorComponent';

export abstract class BaseVisualization<P extends ICommonVisualizationProps & ILoadingInjectedProps, S>
extends React.Component<P, S> {

    public render(): JSX.Element {
        const {
            execution,
            error,
            isLoading,
            intl
        } = this.props;

        const ErrorComponent = this.props.ErrorComponent as React.ComponentType<IErrorProps>;
        const LoadingComponent = this.props.LoadingComponent as React.ComponentType<ILoadingProps>;

        if (error !== ErrorStates.OK) {
            const errorMap = {
                [ErrorStates.DATA_TOO_LARGE_TO_DISPLAY]: {
                    icon: 'icon-cloud-rain',
                    message: intl.formatMessage({ id: 'visualization.ErrorMessageDataTooLarge' }),
                    description: intl.formatMessage({ id: 'visualization.ErrorDescriptionDataTooLarge' })
                },
                [ErrorStates.NO_DATA]: {
                    icon: 'icon-filter',
                    message: intl.formatMessage({ id: 'visualization.ErrorMessageNoData' }),
                    description: intl.formatMessage({ id: 'visualization.ErrorDescriptionNoData' })
                },
                [ErrorStates.UNKNOWN_ERROR]: {
                    message: intl.formatMessage({ id: 'visualization.ErrorMessageGeneric' }),
                    description: intl.formatMessage({ id: 'visualization.ErrorDescriptionGeneric' })
                }
            };
            const errorProps = errorMap[errorMap.hasOwnProperty(error) ? error : ErrorStates.UNKNOWN_ERROR];
            return ErrorComponent ? (
                <ErrorComponent
                    code={error}
                    {...errorProps}
                />
            ) : null;
        }

        if (isLoading || !execution) {
            return LoadingComponent ? <LoadingComponent /> : null;
        }

        return this.renderVisualization();
    }

    protected abstract renderVisualization(): JSX.Element;
}
