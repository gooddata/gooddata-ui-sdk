// (C) 2023-2025 GoodData Corporation

import { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
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

export type IIntlLocalizedUnknownVisualizationClass = { onAfterRender?: () => void };

function IntlLocalizedUnknownVisualizationClass({ onAfterRender }: IIntlLocalizedUnknownVisualizationClass) {
    const intl = useIntl();

    const errorDetails = useMemo(() => {
        return newErrorMapping(intl)[ErrorCodes.VISUALIZATION_CLASS_UNKNOWN];
    }, [intl]);

    useEffect(() => {
        onAfterRender?.();
    }, [onAfterRender]);

    const { message, description } = errorDetails;
    return <ErrorComponent message={message} description={description} />;
}

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
