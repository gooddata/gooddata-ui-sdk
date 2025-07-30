// (C) 2023-2025 GoodData Corporation

import React, { ReactElement } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IExecutionFactory, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IInsightDefinition } from "@gooddata/sdk-model";
import { AbstractPluggableVisualization } from "./AbstractPluggableVisualization.js";
import { ErrorComponent, ErrorCodes, newErrorMapping, IntlWrapper } from "@gooddata/sdk-ui";
import {
    IExtendedReferencePoint,
    IVisConstruct,
    IReferencePoint,
    IVisProps,
    RenderFunction,
    UnmountFunction,
} from "../../interfaces/Visualization.js";

export type IIntlLocalizedUnknownVisualizationClass = WrappedComponentProps & { onAfterRender?: () => void };
export class LocalizedUnknownVisualizationClass extends React.Component<IIntlLocalizedUnknownVisualizationClass> {
    private errorDetails: {
        message: string;
        description: string;
    };

    public componentDidMount(): void {
        this.props.onAfterRender?.();
    }

    constructor(props: IIntlLocalizedUnknownVisualizationClass) {
        super(props);
        this.errorDetails = newErrorMapping(props.intl)[ErrorCodes.VISUALIZATION_CLASS_UNKNOWN];
    }

    public render(): ReactElement {
        const { message, description } = this.errorDetails;
        return <ErrorComponent message={message} description={description} />;
    }
}
export const IntlLocalizedUnknownVisualizationClass = injectIntl<
    "intl",
    IIntlLocalizedUnknownVisualizationClass
>(LocalizedUnknownVisualizationClass);

export class PluggableUnknownChart extends AbstractPluggableVisualization {
    private renderFun: RenderFunction;
    private unmountFun: UnmountFunction;

    constructor(props: IVisConstruct) {
        super(props);
        this.renderFun = props.renderFun;
        this.unmountFun = props.unmountFun;
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        return Promise.resolve({ ...referencePoint, uiConfig: null });
    }

    public getExecution(
        _options: IVisProps,
        _insight: IInsightDefinition,
        _executionFactory: IExecutionFactory,
    ) {
        const result: IPreparedExecution = null;
        return result;
    }

    protected renderConfigurationPanel(_insight: IInsightDefinition): void {}
    protected renderVisualization(
        options: IVisProps,
        _insight: IInsightDefinition,
        _executionFactory: IExecutionFactory,
    ): void {
        this.renderFun(
            <IntlWrapper locale={options.locale}>
                <IntlLocalizedUnknownVisualizationClass onAfterRender={this.afterRender} />
            </IntlWrapper>,
            this.getElement(),
        );

        this.onLoadingChanged?.({ isLoading: false });
    }

    public unmount(): void {
        this.unmountFun([this.getElement()]);
    }
}
