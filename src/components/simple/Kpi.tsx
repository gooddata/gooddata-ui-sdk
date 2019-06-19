// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { SDK, DataLayer } from "@gooddata/gooddata-js";
import { colors2Object, ISeparators, numberFormat } from "@gooddata/numberjs";
import noop = require("lodash/noop");
import { AFM, Execution } from "@gooddata/typings";
import { injectIntl, intlShape, InjectedIntlProps } from "react-intl";

import { Execute, IExecuteChildrenProps, IExecuteProps } from "../../execution/Execute";
import { LoadingComponent, ILoadingProps } from "./LoadingComponent";
import { IErrorProps } from "./ErrorComponent";
import { IEvents } from "../../interfaces/Events";
import { KpiPropTypes, Requireable } from "../../proptypes/Kpi";
import { isEmptyResult } from "../../helpers/errorHandlers";
import { IntlWrapper } from "../core/base/IntlWrapper";

export { Requireable };

export interface IKpiProps extends IEvents {
    measure: string;
    projectId: string;
    locale?: string;
    sdk?: SDK;
    filters?: AFM.FilterItem[];
    format?: string;
    separators?: ISeparators;
    ExecuteComponent?: React.ComponentType<IExecuteProps>;
    LoadingComponent?: React.ComponentType<ILoadingProps>;
    ErrorComponent?: React.ComponentType<IErrorProps>;
}

const DEFAULT_FORMAT = "#,#.##";

function getFormatFromExecution(result: Execution.IExecutionResponses): string {
    if (isEmptyResult(result)) {
        return null;
    }
    const measureGroupHeader = result.executionResponse.dimensions[0]
        .headers[0] as Execution.IMeasureGroupHeader;
    return measureGroupHeader.measureGroupHeader.items[0].measureHeaderItem.format;
}

function buildAFM(measure: string, filters: AFM.FilterItem[] = []): AFM.IAfm {
    const item = DataLayer.Uri.isUri(measure) ? { uri: measure } : { identifier: measure };

    return {
        measures: [
            {
                localIdentifier: "m1",
                definition: {
                    measure: {
                        item,
                    },
                },
            },
        ],
        filters: filters.filter(DataLayer.Filters.isNotEmptyFilter),
    };
}

const defaultErrorHandler = (error: object) => {
    console.error(error); // tslint:disable-line:no-console
};

const resultSpec: AFM.IResultSpec = {
    dimensions: [
        {
            itemIdentifiers: ["measureGroup"],
        },
    ],
};

export const KpiError = (props: IErrorProps) => {
    const message: string = props.message;
    return (
        <span
            className="gdc-kpi-error"
            style={{
                whiteSpace: "normal",
                lineHeight: "normal",
                fontSize: "14px",
                fontWeight: 700,
                verticalAlign: "middle",
                color: "#94a1ad",
                fontFamily: "avenir, Helvetica Neue, arial, sans-serif",
            }}
        >
            {message}
        </span>
    );
};

export class KpiWrapped extends React.PureComponent<IKpiProps & InjectedIntlProps> {
    public static defaultProps: Partial<IKpiProps> = {
        filters: [],
        onError: defaultErrorHandler,
        onLoadingChanged: noop,
        ExecuteComponent: Execute,
        LoadingComponent: () => <LoadingComponent inline={true} />,
        ErrorComponent: KpiError,
    };

    public static propTypes = {
        ...KpiPropTypes,
        intl: intlShape.isRequired,
    };

    public render() {
        const {
            ExecuteComponent,
            measure,
            filters,
            LoadingComponent,
            ErrorComponent,
            intl,
            ...executeProps
        } = this.props;
        const afm = buildAFM(measure, filters);
        return (
            <ExecuteComponent
                afm={afm}
                resultSpec={resultSpec}
                {...executeProps}
                telemetryComponentName="KPI"
            >
                {({ result, error, isLoading }: IExecuteChildrenProps) => {
                    if (error) {
                        return ErrorComponent ? (
                            <ErrorComponent
                                code={error.getMessage()}
                                message={intl.formatMessage({ id: "visualization.ErrorMessageKpi" })}
                            />
                        ) : null;
                    }
                    if (isLoading || !result) {
                        return LoadingComponent ? <LoadingComponent /> : null;
                    }
                    return (
                        <span className="gdc-kpi">
                            {this.getFormattedResult(this.extractNumber(result), result)}
                        </span>
                    );
                }}
            </ExecuteComponent>
        );
    }

    private getFormattedResult(num: number | string, result: Execution.IExecutionResponses) {
        const format = this.props.format || getFormatFromExecution(result) || DEFAULT_FORMAT;
        const formattedNumber = numberFormat(num, format, undefined, this.props.separators);
        const { label, color, backgroundColor } = colors2Object(formattedNumber);
        return color ? <span style={{ color, backgroundColor }}>{label}</span> : label;
    }

    private extractNumber(result: Execution.IExecutionResponses) {
        if (isEmptyResult(result)) {
            return "";
        }
        return parseFloat(result.executionResult.data[0].toString());
    }
}

export const IntlKpi = injectIntl(KpiWrapped);

/**
 * [Kpi](http://sdk.gooddata.com/gooddata-ui/docs/react_components.html#kpi)
 * is a component that renders a KPI using bucket props measure, filters
 */
export class Kpi extends React.Component<IKpiProps, null> {
    public render() {
        return (
            <IntlWrapper locale={this.props.locale}>
                <IntlKpi {...this.props} />
            </IntlWrapper>
        );
    }
}
