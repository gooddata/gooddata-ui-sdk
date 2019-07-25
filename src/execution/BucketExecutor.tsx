// (C) 2007-2018 GoodData Corporation
// tslint:disable:member-ordering
import * as React from "react";
import { SDK, factory as createSdk } from "@gooddata/gooddata-js";
import { AFM, Execution, VisualizationObject, VisualizationInput } from "@gooddata/typings";

import { setTelemetryHeaders } from "../helpers/utils";
import { convertErrors } from "../helpers/errorHandlers";
import { RuntimeError } from "../errors/RuntimeError";
import { convertBucketsToAFM } from "../helpers/conversion";
import { MEASURES, ATTRIBUTES } from "../constants/bucketNames";
import { MEASUREGROUP } from "../internal/constants/bucket";
import { LoadingComponent } from "../components/simple/LoadingComponent";
import { ErrorComponent } from "../components/simple/ErrorComponent";

type dimensionItem = VisualizationInput.AttributeOrMeasure | VisualizationInput.IAttribute;

export const getExecutionFromDimensions = (
    dimensions: dimensionItem[][],
    filters: VisualizationInput.IFilter[],
    sorts: VisualizationInput.ISort[],
): AFM.IExecution => {
    const measuresBucket: VisualizationObject.IBucket = {
        localIdentifier: MEASURES,
        items: [],
    };
    const attributesBucket: VisualizationObject.IBucket = {
        localIdentifier: ATTRIBUTES,
        items: [],
    };

    const resultSpec: AFM.IResultSpec = {
        dimensions: [],
        sorts,
    };

    let measureDimension: number | null = null;

    dimensions.forEach((dimension, dimensionIndex) => {
        const itemIdentifiers: string[] = [];
        dimension.forEach(dimensionItem => {
            if (VisualizationInput.isAttribute(dimensionItem)) {
                itemIdentifiers.push(dimensionItem.visualizationAttribute.localIdentifier);
                attributesBucket.items.push(dimensionItem);
            } else if (VisualizationInput.isMeasure(dimensionItem)) {
                const measureLocalIdentifier = dimensionItem.measure.localIdentifier;
                if (measureDimension === null) {
                    measureDimension = dimensionIndex;
                    itemIdentifiers.push(MEASUREGROUP);
                } else if (measureDimension !== dimensionIndex) {
                    throw new RuntimeError(
                        `All measures have to be on the same dimension. There are some measures already on dimension ${measureDimension} but measure ${measureLocalIdentifier} is on dimension ${dimensionIndex}.`,
                    );
                }
                measuresBucket.items.push(dimensionItem);
            }
        });
        resultSpec.dimensions.push({
            itemIdentifiers,
        });
    });

    const buckets: VisualizationObject.IBucket[] = [];
    if (attributesBucket.items.length > 0) {
        buckets.push(attributesBucket);
    }
    if (measuresBucket.items.length > 0) {
        buckets.push(measuresBucket);
    }
    if (buckets.length === 0) {
        throw new RuntimeError("No measures nor attributes defined");
    }

    const afm = convertBucketsToAFM(buckets, filters);

    return {
        execution: {
            afm,
            resultSpec,
        },
    };
};

export interface IPaging {
    offset: number[];
    limit: number[];
}

export interface IBucketExecutorChildrenProps {
    result: Execution.IExecutionResult | null;
    response: Execution.IExecutionResponse | null;
    getPage: (paging: IPaging) => void;
}

export interface IBucketExecutorProps {
    telemetryComponentName?: string;
    autoLoadFirstPage?: boolean;
    initialPaging?: IPaging;
    sdk?: SDK;

    ErrorComponent?: React.ComponentType<{
        code?: string;
        message?: string;
        getPage?: (paging: IPaging) => void;
    }>;
    LoadingComponent?: React.ComponentType;

    children: (childrenProps: IBucketExecutorChildrenProps) => React.ReactNode;
    dimensions: dimensionItem[][];
    projectId: string;
    filters?: VisualizationInput.IFilter[];
    sortBy?: VisualizationInput.ISort[];
}

export interface IBucketExecutorState {
    result: Execution.IExecutionResult | null;
    response: Execution.IExecutionResponse | null;
    isLoading: boolean;
    error: any;
    responsePromise: Promise<Execution.IExecutionResponse> | null;
    resultPromise: Promise<Execution.IExecutionResult> | null;

    children: IBucketExecutorProps["children"];
    dimensions: IBucketExecutorProps["dimensions"];
    projectId: IBucketExecutorProps["projectId"];
    filters: IBucketExecutorProps["filters"];
    sortBy: IBucketExecutorProps["sortBy"];
}

export interface IBucketExecutorChildrenProps {
    response: Execution.IExecutionResponse | null;
    result: Execution.IExecutionResult | null;
    getPage: (paging: IPaging) => void;
}

const propsRequiringDataReset: Array<keyof IBucketExecutorProps> = [
    "projectId",
    "dimensions",
    "filters",
    "sortBy",
];

const propsRequiringStateUpdate: Array<keyof IBucketExecutorProps> = [...propsRequiringDataReset, "children"];

export type propList = Array<keyof IBucketExecutorProps>;

const didPropsChange = <V extends {}>(propList: propList, prevProps: V, props: V): boolean => {
    return propList.some(propName => prevProps[propName] !== props[propName]);
};

const setupSdk = (props: IBucketExecutorProps) => {
    const clonedSdk = props.sdk ? props.sdk.clone() : createSdk();
    setTelemetryHeaders(clonedSdk, props.telemetryComponentName, props);
    return clonedSdk;
};

export class BucketExecutor extends React.Component<IBucketExecutorProps, IBucketExecutorState> {
    public static defaultProps: Partial<IBucketExecutorProps> = {
        sdk: createSdk(),
        filters: [],
        sortBy: [],
        autoLoadFirstPage: true,
        telemetryComponentName: "BucketExecutor",
        LoadingComponent,
        ErrorComponent,
    };

    public static getDerivedStateFromProps(nextProps: IBucketExecutorProps, prevState: IBucketExecutorState) {
        const newState: Partial<IBucketExecutorState> = {};
        let arePropsInSync = true;
        propsRequiringStateUpdate.forEach(propName => {
            if (nextProps[propName] !== prevState[propName]) {
                arePropsInSync = false;
                newState[propName] = nextProps[propName];
            }
        });
        if (arePropsInSync) {
            return null;
        }

        newState.isLoading = nextProps.autoLoadFirstPage;
        newState.response = null;
        newState.responsePromise = null;
        newState.result = null;
        newState.resultPromise = null;

        return newState;
    }

    public componentDidUpdate(prevProps: IBucketExecutorProps, prevState: IBucketExecutorState) {
        if (this.props.sdk !== prevProps.sdk) {
            // tslint:disable-next-line:no-console
            console.warn(
                "Do not change the sdk prop once set. If you need to do this, force remount using the key attribute.",
            );
        }
        if (didPropsChange(propsRequiringDataReset, prevState, this.state) && this.props.autoLoadFirstPage) {
            this.getResponse();
        }
    }

    public state: IBucketExecutorState;

    public hasUnmounted: boolean = false;

    private sdk: SDK;

    constructor(props: IBucketExecutorProps) {
        super(props);
        this.state = {
            result: null,
            response: null,
            isLoading: props.autoLoadFirstPage,
            error: null,
            responsePromise: null,
            resultPromise: null,
            children: props.children,
            projectId: props.projectId,
            dimensions: props.dimensions,
            filters: props.filters,
            sortBy: props.sortBy,
        };
        this.sdk = setupSdk(props);

        this.hasUnmounted = false;
    }

    public componentDidMount() {
        if (this.props.autoLoadFirstPage) {
            this.getResponse();
        }
    }

    public componentWillUnmount() {
        this.hasUnmounted = true;
    }

    public getPage = (paging: IPaging) => {
        const { response } = this.state;
        if (this.hasUnmounted) {
            // tslint:disable-next-line:no-console
            console.warn("You are calling a component that is already unmounted");
        }
        if (!response) {
            this.getResponse(true, paging);
        } else {
            this.getResult(response, paging);
        }
    };

    public getResponse = (
        triggerGetResult: boolean = this.props.autoLoadFirstPage,
        resultPaging = this.getInitialPaging(),
    ) => {
        const { dimensions, filters, sortBy, projectId } = this.state;
        const execution = getExecutionFromDimensions(dimensions, filters, sortBy);
        const responsePromise = this.sdk.execution.getExecutionResponse(projectId, execution);
        this.setState({
            result: null,
            response: null,
            isLoading: true,
            error: null,
            responsePromise,
        });
        responsePromise.then(
            response => {
                if (responsePromise !== this.state.responsePromise || this.hasUnmounted) {
                    // tslint:disable-next-line:no-console
                    console.warn("Discarding outdated response promise", responsePromise);
                    return;
                }
                if (triggerGetResult) {
                    this.setState({ response, responsePromise: null });
                    this.getResult(response, resultPaging);
                } else {
                    this.setState({ response, isLoading: false, responsePromise: null });
                }
            },
            error => {
                if (responsePromise !== this.state.responsePromise || this.hasUnmounted) {
                    // tslint:disable-next-line:no-console
                    console.warn("Discarding outdated response promise", responsePromise);
                    return;
                }
                this.setState({ error: convertErrors(error), isLoading: false, responsePromise: null });
            },
        );
    };

    public getResult = (response: Execution.IExecutionResponse, paging: IPaging) => {
        const resultPromise = this.sdk.execution.getPartialExecutionResult(
            response.links.executionResult,
            paging.limit,
            paging.offset,
        );
        this.setState({ isLoading: true, result: null, error: null, resultPromise });
        resultPromise.then(
            result => {
                if (resultPromise !== this.state.resultPromise || this.hasUnmounted) {
                    // tslint:disable-next-line:no-console
                    console.warn("Discarding outdated result promise", resultPromise);
                    return;
                }
                this.setState({ result, isLoading: false, resultPromise: null });
            },
            error => {
                if (resultPromise !== this.state.resultPromise || this.hasUnmounted) {
                    // tslint:disable-next-line:no-console
                    console.warn("Discarding outdated result promise", resultPromise);
                    return;
                }
                this.setState({ isLoading: false, error: convertErrors(error), resultPromise: null });
            },
        );
    };

    public getInitialPaging = () => {
        const { initialPaging, dimensions } = this.props;
        if (initialPaging) {
            return initialPaging;
        }
        const defaultDimensionOffset = 0;
        const defaultDimensionItemLimit = 100;
        const paging = {
            offset: dimensions.map(() => defaultDimensionOffset),
            limit: dimensions.map(() => defaultDimensionItemLimit),
        };
        return paging;
    };

    public render() {
        const { isLoading, result, response, error, children } = this.state;
        const { LoadingComponent, ErrorComponent } = this.props;
        const childrenProps: IBucketExecutorChildrenProps = {
            result,
            response,
            getPage: this.getPage,
        };

        if (error) {
            return <ErrorComponent code={error.code} message={error.message} getPage={this.getPage} />;
        }

        if (isLoading) {
            return <LoadingComponent />;
        }

        return children(childrenProps);
    }
}
