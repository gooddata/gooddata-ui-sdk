// (C) 2023-2026 GoodData Corporation

import { type ReactElement, useEffect, useMemo } from "react";

import { useIntl } from "react-intl";

import { type IExecutionFactory, type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { type IInsightDefinition } from "@gooddata/sdk-model";
import { ErrorCodes, ErrorComponent, IntlWrapper, newErrorMapping } from "@gooddata/sdk-ui";

import {
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IVisConstruct,
    type IVisProps,
    type RenderFunction,
    type UnmountFunction,
} from "../../interfaces/Visualization.js";

import { AbstractPluggableVisualization } from "./AbstractPluggableVisualization.js";

export interface ILocalizedUnknownVisualizationClassProps {
    onAfterRender?: () => void;
}

export function LocalizedUnknownVisualizationClass({
    onAfterRender,
}: ILocalizedUnknownVisualizationClassProps): ReactElement {
    const intl = useIntl();
    const errorDetails = useMemo(() => newErrorMapping(intl)[ErrorCodes.VISUALIZATION_CLASS_UNKNOWN], [intl]);

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
    ): IPreparedExecution | null {
        return null;
    }

    protected renderConfigurationPanel(_insight: IInsightDefinition): void {}
    protected renderVisualization(
        options: IVisProps,
        _insight: IInsightDefinition,
        _executionFactory: IExecutionFactory,
    ): void {
        this.renderFun(
            <IntlWrapper locale={options.locale}>
                <LocalizedUnknownVisualizationClass onAfterRender={this.afterRender} />
            </IntlWrapper>,
            this.getElement(),
        );

        this.onLoadingChanged?.({ isLoading: false });
    }

    public unmount(): void {
        this.unmountFun([this.getElement()!]);
    }
}
