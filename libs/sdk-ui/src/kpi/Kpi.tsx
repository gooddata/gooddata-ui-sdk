// (C) 2019-2025 GoodData Corporation

import { ComponentType } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";
import { invariant } from "ts-invariant";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IMeasure, INullableFilter, ISeparators } from "@gooddata/sdk-model";

import { FormattedNumber } from "./FormattedNumber.js";
import { KpiError } from "./KpiError.js";
import {
    DataViewFacade,
    IErrorProps,
    ILoadingProps,
    IntlWrapper,
    LoadingComponent,
    withContexts,
} from "../base/index.js";
import { IRawExecuteProps, IWithLoadingEvents, RawExecute } from "../execution/index.js";

//
// Internals
//

function KpiLoading() {
    return <LoadingComponent inline />;
}

function CoreKpi(props: IKpiProps & WrappedComponentProps) {
    const {
        backend,
        workspace,
        measure,
        filters,
        separators,
        LoadingComponent = KpiLoading,
        ErrorComponent = KpiError,
        onError,
        onLoadingChanged,
        onLoadingFinish,
        onLoadingStart,
        intl,
    } = props;

    invariant(
        backend && workspace,
        "backend and workspace must be either specified explicitly or be provided by context",
    );

    const execution = backend
        .withTelemetry("KPI", props)
        .workspace(workspace)
        .execution()
        .forItems([measure], filters);

    return (
        <RawExecute
            execution={execution}
            onLoadingStart={onLoadingStart}
            onLoadingChanged={onLoadingChanged}
            onLoadingFinish={onLoadingFinish}
            onError={onError}
        >
            {({ error, isLoading, result }) => {
                if (error) {
                    return (
                        <ErrorComponent
                            code={error.message}
                            message={intl.formatMessage({ id: "visualization.ErrorMessageKpi" })}
                        />
                    );
                }
                if (isLoading || !result) {
                    return <LoadingComponent />;
                }

                const measureData = getMeasureData(result);
                const measureFormat = measure.measure.format || getMeasureFormat(result);

                return (
                    <FormattedNumber
                        className="gdc-kpi"
                        value={measureData}
                        format={measureFormat}
                        separators={separators}
                    />
                );
            }}
        </RawExecute>
    );
}

const getMeasureData = (result: DataViewFacade) => {
    const data = result.rawData().data();
    const dataValue = data?.[0];
    const measure = Array.isArray(dataValue) ? dataValue?.[0] : dataValue;

    if (measure === null || measure === undefined) {
        return "";
    }

    return parseFloat(measure as string);
};

const getMeasureFormat = (result: DataViewFacade) => {
    const headerItems = result.meta().measureDescriptors();
    return headerItems?.[0]?.measureHeaderItem?.format;
};

const IntlKpi = injectIntl(CoreKpi);

function RenderKpi(props: IKpiProps) {
    const { locale } = props;
    return (
        <IntlWrapper locale={locale}>
            <IntlKpi {...props} />
        </IntlWrapper>
    );
}

//
// Public interface
//

/**
 * Props of the {@link Kpi} component.
 * @public
 */
export interface IKpiProps extends IWithLoadingEvents<IRawExecuteProps> {
    /**
     * Specify an instance of analytical backend instance to work with.
     *
     * @remarks
     * Note: if you do not have a BackendProvider above in the component tree, then you MUST specify the backend.
     */
    backend?: IAnalyticalBackend;

    /**
     * Specify workspace to work with.
     *
     * @remarks
     * Note: if you do not have a WorkspaceProvider above in the component tree, then you MUST specify the workspace.
     */
    workspace?: string;

    /**
     * Specify measure whose value should be calculated and rendered.
     */
    measure: IMeasure;

    /**
     * Specify filters to apply during calculation
     */
    filters?: INullableFilter[];

    /**
     * Specify number separators to use when rendering (segment delimiters, decimal point character)
     */
    separators?: ISeparators;

    /**
     * Specify locale to use for strings that the Kpi component may render (for instance when encountering
     * errors).
     */
    locale?: string;

    /**
     * Specify react component to render while the data is loading.
     */
    LoadingComponent?: ComponentType<ILoadingProps>;

    /**
     * Specify react component to render if execution fails.
     */
    ErrorComponent?: ComponentType<IErrorProps>;
}

/**
 * Kpi is a simple component which calculates and renders a single formatted measure value.
 *
 * @remarks
 * The the value is rendered inside a <span> element.
 *
 * Kpi component is useful for instance for embedding data values into text paragraphs.
 *
 * See also the {@link @gooddata/sdk-ui-charts#Headline} component for a more 'chart-like' variant.
 *
 * @public
 */
export const Kpi = withContexts(RenderKpi);
