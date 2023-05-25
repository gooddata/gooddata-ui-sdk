// (C) 2019-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import {
    IBucketItem,
    IBucketOfFun,
    IExtendedReferencePoint,
    IReferencePoint,
    IVisCallbacks,
    IVisConstruct,
    IVisProps,
    IVisualization,
    IVisualizationOptions,
    IVisualizationProperties,
    IDrillDownContext,
    EmptyAfmSdkError,
    isEmptyAfm,
    ElementSelectorFunction,
} from "../../interfaces/Visualization.js";
import {
    findDerivedBucketItem,
    hasDerivedBucketItems,
    isDerivedBucketItem,
} from "../../utils/bucketHelper.js";
import { IInsight, IInsightDefinition, insightHasDataDefined, insightProperties } from "@gooddata/sdk-model";
import { IExecutionFactory, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    DefaultLocale,
    GoodDataSdkError,
    IDrillEvent,
    IExportFunction,
    ILoadingState,
    ILocale,
    IPushData,
    isGoodDataSdkError,
    UnexpectedSdkError,
} from "@gooddata/sdk-ui";
import { IntlShape } from "react-intl";
import { createInternalIntl } from "../../utils/internalIntlProvider.js";
import { getSupportedProperties } from "../../utils/propertiesHelper.js";
import { ISortConfig } from "../../interfaces/SortConfig.js";

export abstract class AbstractPluggableVisualization implements IVisualization {
    protected intl: IntlShape;
    protected locale: ILocale;

    /**
     * Standard callback
     */
    private readonly callbacks: IVisCallbacks;

    /**
     * Insight that is currently rendered by the pluggable visualization. This field is set during
     * every call to {@link update} and will remain the same until the next update() call.
     */
    protected currentInsight: IInsightDefinition;
    protected visualizationProperties: IVisualizationProperties;
    protected supportedPropertiesList: string[];
    protected propertiesMeta: any;

    /**
     * Classname or a getter function of the element where visualization should be mounted
     */
    private readonly element: string | ElementSelectorFunction;

    /**
     * Classname or a getter of the element where config panel should be mounted
     */
    private readonly configPanelElement: string | ElementSelectorFunction;

    private hasError: boolean;
    private hasEmptyAfm: boolean;

    protected isLoading: boolean;

    protected getIsError = (): boolean => {
        return this.hasEmptyAfm || this.hasError;
    };

    protected constructor(props: IVisConstruct) {
        this.callbacks = props.callbacks;
        this.locale = props.locale ?? DefaultLocale;
        this.intl = createInternalIntl(this.locale);
        this.element = props.element;
        this.configPanelElement = props.configPanelElement;
    }

    /**
     * Get an element where the visualization should be mounted
     */
    protected getElement(): HTMLElement {
        if (typeof this.element === "function") {
            return this.element();
        }

        return document.querySelector(this.element);
    }

    /**
     * Get an element where the config panel should be mounted
     */
    protected getConfigPanelElement(): HTMLElement {
        if (typeof this.configPanelElement === "function") {
            return this.configPanelElement();
        }

        return document.querySelector(this.configPanelElement);
    }

    public abstract unmount(): void;

    public abstract getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint>;

    //
    // Templated implementation of update contract
    //

    /**
     * Templated implementation of the update method. Given options, insight to render and the execution
     * factory, this function will drive the update process. It consists of the following:
     *
     * 1. call to {@link updateInstanceProperties} - this method should update any internal state
     *    of the instance's properties. Subclasses MAY override this to update state of their own private
     *    properties.
     *
     * 2. call to {@link checkBeforeRender} - this method is called as a hook to perform final check before
     *    the actual rendering is triggered:
     *    - if hook returns true, vis will be rendered
     *    - if hook returns false, vis will not be rendered
     *    - if hook throws an exception, it will be sent via onError callback; vis will not be rendered
     *
     * 3. vis rendering is triggered (unless step 2 determines it should not be)
     *
     * 4. configuration panel is rendered (always)
     *
     * Note: do not override this method.
     */
    public update(
        options: IVisProps,
        insight: IInsightDefinition,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        insightPropertiesMeta: any,
        executionFactory: IExecutionFactory,
    ): void {
        this.updateInstanceProperties(options, insight, insightPropertiesMeta);
        this.hasEmptyAfm = !insightHasDataDefined(insight);

        let shouldRenderVisualization: boolean;
        try {
            shouldRenderVisualization = this.checkBeforeRender(insight);
        } catch (e) {
            const sdkError = isGoodDataSdkError(e) ? e : new UnexpectedSdkError(undefined, e);

            this.onError(sdkError);

            return;
        }

        if (shouldRenderVisualization) {
            this.renderVisualization(options, insight, executionFactory);
        }

        this.renderConfigurationPanel(insight);
    }

    /**
     * Get visualization execution based on provided options, insight and execution factory.
     *
     * @param options - visualization options
     * @param insight - insight to be executed
     * @param executionFactory - execution factory to use when triggering calculation on backend
     */
    public abstract getExecution(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): IPreparedExecution;

    /**
     * This method will be called during the {@link update} processing. This is where internal properties of the
     * concrete plug vis class MAY be updated. If class overrides this method, it MUST call the method in
     * superclass.
     *
     * @param options - visualization options
     * @param insight - insight that is about to be rendered
     */
    protected updateInstanceProperties(
        // @ts-expect-error Ignoring here so that the JSDoc has the proper name (not _options)
        options: IVisProps,
        insight: IInsightDefinition,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        insightPropertiesMeta: any,
    ): void {
        this.visualizationProperties = getSupportedProperties(
            insightProperties(insight),
            this.supportedPropertiesList,
        );
        this.propertiesMeta = insightPropertiesMeta ?? null;
        this.currentInsight = insight;
    }

    /**
     * This method will be called during the {@link update} processing. It can be used to influence whether
     * visualization should be rendered and optionally whether particular error should be rendered by the app.
     *
     * @param insight - insight that is about to be rendered
     * @returns when true is returned (default), visualization will be rendered, when false is returned no rendering is done
     * @throws error - if anything is thrown, visualization will not be rendered and the exception will be passed via onError callback
     */
    protected checkBeforeRender(insight: IInsightDefinition): boolean {
        if (!insightHasDataDefined(insight)) {
            throw new EmptyAfmSdkError();
        }

        return true;
    }

    /**
     * Render visualization of the insight under the {@link element} node. Use the provided execution factory
     * to create execution to obtain data for the insight.
     *
     * @param options - visualization options to use
     * @param insight - insight to render
     * @param executionFactory - execution factory to construct execution that will obtain the necessary data
     */
    protected abstract renderVisualization(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): void;

    /**
     * Render configuration panel under the {@link configPanelElement} node. The values of visualization properties
     * are stored in {@link visualizationProperties}.
     *
     * @param insight - insight that is rendered
     */
    protected abstract renderConfigurationPanel(insight: IInsightDefinition): void;

    //
    // Callback delegates
    //

    protected onError = (error: GoodDataSdkError): void => {
        this.callbacks.onError?.(error);

        // EMPTY_AFM is handled in update as it can change on any render contrary to other error types
        // that have to be set manually or by loading
        if (!isEmptyAfm(error)) {
            this.hasError = true;
        }

        this.renderConfigurationPanel(this.currentInsight);
    };

    protected onLoadingChanged = (loadingState: ILoadingState): void => {
        this.callbacks.onLoadingChanged?.(loadingState);

        this.hasError = false;
        this.isLoading = loadingState.isLoading;
        this.renderConfigurationPanel(this.currentInsight);
    };

    protected onExportReady = (exportResult: IExportFunction): void => {
        this.callbacks.onExportReady?.(exportResult);
    };

    protected pushData = (data: IPushData, options?: IVisualizationOptions): void => {
        this.callbacks.pushData?.(data, options);
    };

    protected afterRender = (): void => {
        this.callbacks.afterRender?.();
    };

    protected onDrill = (event: IDrillEvent): void | boolean => {
        // in case onDrill is not specified, default to always firing drill events
        return this.callbacks.onDrill ? this.callbacks.onDrill(event) : true;
    };

    //
    // Templated implementation of addNewDerivedBucketItems contract
    //

    public addNewDerivedBucketItems(
        referencePoint: IReferencePoint,
        newDerivedBucketItems: IBucketItem[],
    ): Promise<IReferencePoint> {
        if (!referencePoint.buckets) {
            return Promise.resolve(referencePoint);
        }

        const newReferencePoint = cloneDeep<IReferencePoint>(referencePoint);
        newReferencePoint.buckets = referencePoint.buckets.map((bucket) => {
            return {
                ...bucket,
                items: this.mergeDerivedBucketItems(referencePoint, bucket, newDerivedBucketItems),
            };
        });

        return Promise.resolve(newReferencePoint);
    }

    protected mergeDerivedBucketItems(
        referencePoint: IReferencePoint,
        bucket: IBucketOfFun,
        newDerivedBucketItems: IBucketItem[],
    ): IBucketItem[] {
        return bucket.items.reduce((resultItems: IBucketItem[], bucketItem: IBucketItem) => {
            const newDerivedBucketItem = findDerivedBucketItem(bucketItem, newDerivedBucketItems);
            const shouldAddItem =
                newDerivedBucketItem &&
                !isDerivedBucketItem(bucketItem) &&
                !hasDerivedBucketItems(bucketItem, referencePoint.buckets);
            if (shouldAddItem) {
                resultItems.push(newDerivedBucketItem);
            }

            resultItems.push(bucketItem);
            return resultItems;
        }, []);
    }

    /**
     * Default no-op implementation of the drill down, which just returns the original visualization.
     *
     * @param sourceVisualization - drill down source {@link IInsight}
     * @param _drillDownContext - drill context (unused in this implementation)
     * @param _backendSupportsElementUris - whether backend supports elements by uri (unused in this implementation)
     * @returns the `sourceVisualization`
     * @see {@link IVisualization.getInsightWithDrillDownApplied} for more information
     */
    public getInsightWithDrillDownApplied(
        sourceVisualization: IInsight,
        _drillDownContext: IDrillDownContext,
        _backendSupportsElementUris: boolean,
    ): IInsight {
        return sourceVisualization;
    }

    /**
     * Default implementation of sort config getter returning empty object
     *
     * @param _referencePoint - reference point
     * @returns promise promise once resolved returns an sort config
     */
    public getSortConfig(_referencePoint: IReferencePoint): Promise<ISortConfig> {
        return Promise.resolve({
            defaultSort: [],
            availableSorts: [],
            supported: false,
            disabled: false,
        });
    }
}
