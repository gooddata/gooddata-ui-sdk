// (C) 2024 GoodData Corporation

import React from "react";
import {
    newErrorMapping,
    IErrorDescriptors,
    IntlWrapper,
    ErrorCodes,
    ILoadingInjectedProps,
    withEntireDataView,
} from "@gooddata/sdk-ui";
import { ICoreChartProps } from "../../interfaces/index.js";
import RepeaterTransformation from "./internal/RepeaterTransformation.js";
import { defaultCoreChartProps } from "../_commons/defaultProps.js";

type Props = ICoreChartProps & ILoadingInjectedProps;

export class RepeaterStateless extends React.Component<Props> {
    public static defaultProps = defaultCoreChartProps;

    private errorMap: IErrorDescriptors;

    constructor(props: Props) {
        super(props);
        this.errorMap = newErrorMapping(props.intl);
    }

    public render(): JSX.Element {
        const { dataView, error, isLoading } = this.props;

        const ErrorComponent = this.props.ErrorComponent;
        const LoadingComponent = this.props.LoadingComponent;

        if (error) {
            const errorProps =
                this.errorMap[
                    Object.prototype.hasOwnProperty.call(this.errorMap, error)
                        ? error
                        : ErrorCodes.UNKNOWN_ERROR
                ];
            return ErrorComponent ? <ErrorComponent code={error} {...errorProps} /> : null;
        }

        if (isLoading || !dataView) {
            return LoadingComponent ? <LoadingComponent /> : null;
        }

        return this.renderVisualization();
    }

    protected renderVisualization(): JSX.Element {
        const { afterRender, drillableItems, locale, dataView, onDrill, config } = this.props;

        return (
            <IntlWrapper locale={locale}>
                <RepeaterTransformation
                    dataView={dataView}
                    onAfterRender={afterRender}
                    onDrill={onDrill}
                    drillableItems={drillableItems}
                    config={config}
                />
            </IntlWrapper>
        );
    }
}
/**
 * @internal
 */
export const CoreRepeater = withEntireDataView(RepeaterStateless);
