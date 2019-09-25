// (C) 2019 GoodData Corporation
import * as React from "react";
import { IAnalyticalBackend, DataViewFacade } from "@gooddata/sdk-backend-spi";
import { IMeasure, IFilter } from "@gooddata/sdk-model";
import { ISeparators } from "@gooddata/numberjs";
import { ILoadingProps, LoadingComponent } from "../base/simple/LoadingComponent";
import { IErrorProps } from "../base/simple/ErrorComponent";
import { Executor, IExecutorProps } from "../execution/Executor";
import { FormattedNumber } from "./FormattedNumber";
import { KpiError } from "./KpiError";
import { InjectedIntlProps, injectIntl } from "react-intl";
import { IntlWrapper } from "../base/translations/IntlWrapper";
import get = require("lodash/get");
import isNil = require("lodash/isNil");

//
// Public interface
//

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IKpiProps {
    backend: IAnalyticalBackend;
    workspace: string;
    measure: IMeasure;
    filters?: IFilter[];
    separators?: ISeparators;
    locale?: string;
    LoadingComponent?: React.ComponentType<ILoadingProps>;
    ErrorComponent?: React.ComponentType<IErrorProps>;
    onLoadingStart?: IExecutorProps["onLoadingStart"];
    onLoadingChanged?: IExecutorProps["onLoadingChanged"];
    onLoadingFinish?: IExecutorProps["onLoadingFinish"];
    onError?: IExecutorProps["onError"];
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export const Kpi: React.StatelessComponent<IKpiProps> = props => {
    const { locale } = props;
    return (
        <IntlWrapper locale={locale}>
            <IntlKpi {...props} />
        </IntlWrapper>
    );
};

//
// Internals
//

const KpiLoading = () => <LoadingComponent inline={true} />;

const CoreKpi: React.StatelessComponent<IKpiProps & InjectedIntlProps> = props => {
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

    const execution = backend
        .withTelemetry("KPI", props)
        .workspace(workspace)
        .execution()
        .forItems([measure], filters);

    return (
        <Executor
            execution={execution}
            onLoadingStart={onLoadingStart}
            onLoadingChanged={onLoadingChanged}
            onLoadingFinish={onLoadingFinish}
            onError={onError}
        >
            {({ error, isLoading, result }) => {
                if (error) {
                    return ErrorComponent ? (
                        <ErrorComponent
                            code={error.message}
                            message={intl.formatMessage({ id: "visualization.ErrorMessageKpi" })}
                        />
                    ) : null;
                }
                if (isLoading || !result) {
                    return LoadingComponent ? <LoadingComponent /> : null;
                }

                const measureData = getMeasureData(result);

                return (
                    <FormattedNumber
                        className="gdc-kpi"
                        number={measureData}
                        format={measure.measure.format}
                        separators={separators}
                    />
                );
            }}
        </Executor>
    );
};

const getMeasureData = (result: DataViewFacade) => {
    const data = result.data();
    const measure = get(data, [0, 0]);

    if (isNil(measure)) {
        return "";
    }

    return parseFloat(measure);
};

const IntlKpi = injectIntl(CoreKpi);
