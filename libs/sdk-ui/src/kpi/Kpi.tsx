// (C) 2019-2023 GoodData Corporation
import React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IMeasure, INullableFilter } from "@gooddata/sdk-model";
import NumberJs from "@gooddata/numberjs";
import { IRawExecuteProps, IWithLoadingEvents, RawExecute } from "../execution/index.js";
import { FormattedNumber } from "./FormattedNumber.js";
import { KpiError } from "./KpiError.js";
import { injectIntl, WrappedComponentProps } from "react-intl";
import isNil from "lodash/isNil.js";
import isArray from "lodash/isArray.js";
import {
    DataViewFacade,
    IErrorProps,
    ILoadingProps,
    IntlWrapper,
    LoadingComponent,
    withContexts,
} from "../base/index.js";
import { invariant } from "ts-invariant";

//
// Internals
//

const KpiLoading = () => <LoadingComponent inline={true} />;

const CoreKpi: React.FC<IKpiProps & WrappedComponentProps> = (props) => {
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
};

const getMeasureData = (result: DataViewFacade) => {
    const data = result.rawData().data();
    const dataValue = data?.[0];
    const measure = isArray(dataValue) ? dataValue?.[0] : dataValue;

    if (isNil(measure)) {
        return "";
    }

    return parseFloat(measure as string);
};

const getMeasureFormat = (result: DataViewFacade) => {
    const headerItems = result.meta().measureDescriptors();
    return headerItems?.[0]?.measureHeaderItem?.format;
};

const IntlKpi = injectIntl(CoreKpi);

const RenderKpi: React.FC<IKpiProps> = (props) => {
    const { locale } = props;
    return (
        <IntlWrapper locale={locale}>
            <IntlKpi {...props} />
        </IntlWrapper>
    );
};

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
    separators?: NumberJs.ISeparators;

    /**
     * Specify locale to use for strings that the Kpi component may render (for instance when encountering
     * errors).
     */
    locale?: string;

    /**
     * Specify react component to render while the data is loading.
     */
    LoadingComponent?: React.ComponentType<ILoadingProps>;

    /**
     * Specify react component to render if execution fails.
     */
    ErrorComponent?: React.ComponentType<IErrorProps>;
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
