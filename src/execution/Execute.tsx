// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { DataLayer, SDK, factory as createSdk } from "@gooddata/gooddata-js";
import isEqual = require("lodash/isEqual");
import noop = require("lodash/noop");
import { AFM, Execution } from "@gooddata/typings";

import { IEvents } from "../interfaces/Events";
import { ExecutePropType, Requireable } from "../proptypes/Execute";
import { setTelemetryHeaders } from "../helpers/utils";
import { convertErrors } from "../helpers/errorHandlers";
import { RuntimeError } from "../errors/RuntimeError";
import { getGeneralDimensionsFromAFM } from "../helpers/dimensions";

export { Requireable };

const { DataTable, ExecuteAfmAdapter } = DataLayer;

export type IDataTableFactory = (
    sdk: SDK,
    projectId: string,
) => DataLayer.DataTable<Execution.IExecutionResponses>;

function dataTableFactory(sdk: SDK, projectId: string): DataLayer.DataTable<Execution.IExecutionResponses> {
    return new DataTable(new ExecuteAfmAdapter(sdk, projectId));
}

export interface IExecuteProps extends IEvents {
    afm: AFM.IAfm;
    resultSpec?: AFM.IResultSpec;
    projectId: string;
    children?: any;
    sdk?: SDK;
    dataTableFactory?: IDataTableFactory; // only for tests
    telemetryComponentName?: string;
}

export interface IExecuteState {
    result: Execution.IExecutionResponses;
    isLoading: boolean;
    error?: RuntimeError;
}

export interface IExecuteChildrenProps {
    result: Execution.IExecutionResponses;
    error: RuntimeError;
    isLoading: boolean;
}

/**
 * [Execute](http://sdk.gooddata.com/gooddata-ui/docs/execute_component.html)
 * is a component that does execution based on afm and resultSpec props and passes the result to it's children function
 */
export class Execute extends React.Component<IExecuteProps, IExecuteState> {
    public static propTypes = ExecutePropType;
    public static defaultProps: Partial<IExecuteProps> = {
        dataTableFactory,
        onError: noop,
        onLoadingChanged: noop,
        onLoadingFinish: noop,
        telemetryComponentName: "Execute",
    };

    private dataTable: DataLayer.DataTable<Execution.IExecutionResponses>;

    private sdk: SDK;

    public constructor(props: IExecuteProps) {
        super(props);

        this.state = {
            result: null,
            isLoading: true,
            error: null,
        };

        const sdk = props.sdk || createSdk();
        this.sdk = sdk.clone();
        setTelemetryHeaders(this.sdk, this.props.telemetryComponentName, props);
        this.initDataTable(props);
    }

    public componentWillMount() {
        this.runExecution(this.props);
    }

    public componentWillReceiveProps(nextProps: IExecuteProps) {
        if (nextProps.sdk && this.sdk !== nextProps.sdk) {
            this.sdk = nextProps.sdk.clone();
            setTelemetryHeaders(this.sdk, this.props.telemetryComponentName, nextProps);
            this.initDataTable(nextProps);
        }
        if (this.hasPropsChanged(nextProps, ["sdk", "projectId", "afm", "resultSpec"])) {
            this.initDataTable(nextProps);
            this.runExecution(nextProps);
        }
    }

    public shouldComponentUpdate(nextProps: IExecuteProps, nextState: IExecuteState) {
        return (
            !isEqual(this.state, nextState) ||
            this.hasPropsChanged(nextProps, ["sdk", "projectId", "afm", "resultSpec", "children"])
        );
    }

    public render() {
        const { result, isLoading, error } = this.state;
        return this.props.children({ result, isLoading, error });
    }

    private isPropChanged(nextProps: IExecuteProps, propName: string) {
        if (propName === "children") {
            return nextProps.children !== this.props.children;
        }

        return !isEqual(nextProps[propName], this.props[propName]);
    }

    private hasPropsChanged(nextProps: IExecuteProps, propNames: string[]) {
        return propNames.some(propName => this.isPropChanged(nextProps, propName));
    }

    private runExecution(props: IExecuteProps) {
        const { afm, resultSpec, onLoadingChanged } = props;

        this.setState({
            isLoading: true,
            result: null,
            error: null,
        });

        onLoadingChanged({
            isLoading: true,
        });

        const finalResultSpec = {
            ...(resultSpec || {}),
        };
        if (!finalResultSpec.dimensions) {
            finalResultSpec.dimensions = getGeneralDimensionsFromAFM(afm);
        }
        this.dataTable.getData(afm, finalResultSpec);
    }

    private initDataTable(props: IExecuteProps) {
        const { onError, onLoadingChanged, onLoadingFinish, projectId } = props;
        this.dataTable = props.dataTableFactory(this.sdk, projectId);
        this.dataTable.onData((result: Execution.IExecutionResponses) => {
            this.setState({
                result,
                isLoading: false,
            });
            onLoadingChanged({ isLoading: false });
            onLoadingFinish({ result });
        });

        this.dataTable.onError(error => {
            const newError: RuntimeError = convertErrors(error);

            onError(newError);

            onLoadingChanged({ isLoading: false });

            this.setState({
                result: null,
                isLoading: false,
                error: newError,
            });
        });
    }
}
