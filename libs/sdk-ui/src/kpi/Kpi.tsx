// (C) 2019 GoodData Corporation
import * as React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IMeasure, IFilter } from "@gooddata/sdk-model";
import { ISeparators } from "@gooddata/numberjs";
import { RawExecutor, IRawExecutorProps, IWithLoadingEvents } from "../execution";
import { FormattedNumber } from "./FormattedNumber";
import { KpiError } from "./KpiError";
import { WrappedComponentProps, injectIntl } from "react-intl";
import get = require("lodash/get");
import isNil = require("lodash/isNil");
import {
    withContexts,
    IntlWrapper,
    ILoadingProps,
    LoadingComponent,
    IErrorProps,
    DataViewFacade,
} from "../base";
import { InvariantError } from "ts-invariant";

//
// Internals
//

const KpiLoading = () => <LoadingComponent inline={true} />;

const CoreKpi: React.FC<IKpiProps & WrappedComponentProps> = props => {
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

    if (!backend || !workspace) {
        throw new InvariantError(
            "backend and workspace must be either specified explicitly or be provided by context",
        );
    }

    const execution = backend
        .withTelemetry("KPI", props)
        .workspace(workspace)
        .execution()
        .forItems([measure], filters);

    return (
        <RawExecutor
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
        </RawExecutor>
    );
};

const getMeasureData = (result: DataViewFacade) => {
    const data = result.rawData().data();
    const measure = get(data, [0, 0]);

    if (isNil(measure)) {
        return "";
    }

    return parseFloat(measure);
};

const getMeasureFormat = (result: DataViewFacade) => {
    const headerItems = result.meta().measureDescriptors();
    const format = get(headerItems, [0, "measureHeaderItem", "format"]);

    return format;
};

const IntlKpi = injectIntl(CoreKpi);

const RenderKpi: React.FC<IKpiProps> = props => {
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
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IKpiProps extends IWithLoadingEvents<IRawExecutorProps> {
    backend?: IAnalyticalBackend;
    workspace?: string;
    measure: IMeasure;
    filters?: IFilter[];
    separators?: ISeparators;
    locale?: string;
    LoadingComponent?: React.ComponentType<ILoadingProps>;
    ErrorComponent?: React.ComponentType<IErrorProps>;
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export const Kpi = withContexts(RenderKpi);
