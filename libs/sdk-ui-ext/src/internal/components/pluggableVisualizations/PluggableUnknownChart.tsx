// (C) 2023-2025 GoodData Corporation

import { Component, ReactElement } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import { IExecutionFactory, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IInsightDefinition } from "@gooddata/sdk-model";
import { ErrorCodes, ErrorComponent, IntlWrapper, newErrorMapping } from "@gooddata/sdk-ui";

import { AbstractPluggableVisualization } from "./AbstractPluggableVisualization.js";
import {
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
    RenderFunction,
    UnmountFunction,
} from "../../interfaces/Visualization.js";

export type IIntlLocalizedUnknownVisualizationClass = WrappedComponentProps & { onAfterRender?: () => void };
export class LocalizedUnknownVisualizationClass extends Component<IIntlLocalizedUnknownVisualizationClass> {
    private errorDetails: {
        message: string;
        description: string;
    };

    public override componentDidMount(): void {
        this.props.onAfterRender?.();
    }

    constructor(props: IIntlLocalizedUnknownVisualizationClass) {
        super(props);
        this.errorDetails = newErrorMapping(props.intl)[ErrorCodes.VISUALIZATION_CLASS_UNKNOWN];
    }

    public override render(): ReactElement {
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
