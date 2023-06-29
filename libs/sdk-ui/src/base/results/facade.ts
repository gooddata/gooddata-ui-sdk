// (C) 2019-2022 GoodData Corporation
import { defFingerprint, IExecutionDefinition, IResultWarning } from "@gooddata/sdk-model";
import { IDataView, IExecutionResult } from "@gooddata/sdk-backend-spi";
import { DataAccessConfig } from "./dataAccessConfig.js";
import { IExecutionDefinitionMethods, newExecutionDefinitonMethods } from "./internal/definitionMethods.js";
import { IResultMetaMethods, newResultMetaMethods } from "./internal/resultMetaMethods.js";
import { IResultDataMethods, newResultDataMethods } from "./internal/resultDataMethods.js";
import { IDataAccessMethods } from "./dataAccess.js";
import { newDataAccessMethods } from "./internal/dataAccessMethods.js";

/**
 * Wrapper for {@link @gooddata/sdk-backend-spi#IDataView}.
 *
 * @remarks
 * This provides various convenience methods to work with data and metadata stored inside
 * the provided instance of {@link @gooddata/sdk-backend-spi#IDataView}.
 *
 * The facade keeps an ephemeral state - such as calculated indexes on top of the headers in the {@link @gooddata/sdk-backend-spi#IDataView} -
 * to optimize performance of often-used lookups at the cost of extra memory.
 *
 * The facade is part of the public API and we strongly recommend to use it whenever client code needs to work with
 * data view; ideally, single instance of data view facade
 *
 * @public
 */
export class DataViewFacade {
    private static Facades: WeakMap<IDataView, DataViewFacade> = new WeakMap<IDataView, DataViewFacade>();
    private static FacadesForResult: WeakMap<IExecutionResult, DataViewFacade> = new WeakMap<
        IExecutionResult,
        DataViewFacade
    >();

    public readonly definition: IExecutionDefinition;

    private definitionMethods: IExecutionDefinitionMethods | undefined;
    private resultMetaMethods: IResultMetaMethods | undefined;
    private resultDataMethods: IResultDataMethods | undefined;
    private dataAccessMethods: IDataAccessMethods | undefined;

    protected constructor(public readonly dataView: IDataView) {
        this.definition = dataView.definition;
    }

    //
    // Own methods
    //

    /**
     * @param dataView - instance of data view to create the facade for
     * @public
     */
    public static for(dataView: IDataView): DataViewFacade {
        if (!DataViewFacade.Facades.has(dataView)) {
            DataViewFacade.Facades.set(dataView, new DataViewFacade(dataView));
        }

        return DataViewFacade.Facades.get(dataView)!;
    }

    /**
     * Creates a DataViewFacade with provided execution result.
     *
     * @remarks
     * Only use this when execution result is unable to load data and some
     * form of DataViewFacade is still needed. Beware that the calculated data view is empty after the creation. Only execution
     * definition and result is defined.
     *
     * @param result - instance of execution result to create the facade for
     * @public
     */
    public static forResult(result: IExecutionResult): DataViewFacade {
        if (!DataViewFacade.FacadesForResult.has(result)) {
            const emptyView = emptyDataViewForResult(result);
            DataViewFacade.FacadesForResult.set(result, new DataViewFacade(emptyView));
        }

        return DataViewFacade.FacadesForResult.get(result)!;
    }

    /**
     * @returns result of execution which returned this data view
     * @public
     */
    public result(): IExecutionResult {
        return this.dataView.result;
    }

    /**
     * @returns execution result warnings
     * @public
     */
    public warnings(): IResultWarning[] {
        return this.dataView.warnings ?? [];
    }

    /**
     * @remarks see {@link @gooddata/sdk-backend-spi#IDataView.fingerprint} for more contractual information
     * @returns fingerprint of the data view
     * @public
     */
    public fingerprint(): string {
        return this.dataView.fingerprint();
    }

    /**
     * @returns methods to access data in a curated fashion using data slices and data series iterators
     * @public
     */
    public data(config?: DataAccessConfig): IDataAccessMethods {
        if (!this.dataAccessMethods) {
            this.dataAccessMethods = newDataAccessMethods(this.dataView, config);
        }

        return this.dataAccessMethods;
    }

    //
    //
    //

    /**
     * @returns methods to work with execution definition
     * @internal
     */
    public def(): IExecutionDefinitionMethods {
        if (!this.definitionMethods) {
            this.definitionMethods = newExecutionDefinitonMethods(this.dataView.definition);
        }

        return this.definitionMethods;
    }

    /**
     * @returns methods to work with result metadata
     * @internal
     */
    public meta(): IResultMetaMethods {
        if (!this.resultMetaMethods) {
            this.resultMetaMethods = newResultMetaMethods(this.dataView);
        }

        return this.resultMetaMethods;
    }

    /**
     * @returns methods to work with the raw data included in the result
     * @internal
     */
    public rawData(): IResultDataMethods {
        if (!this.resultDataMethods) {
            this.resultDataMethods = newResultDataMethods(this.dataView);
        }

        return this.resultDataMethods;
    }
}

/**
 * Constructs an empty data view with given execution result.
 *
 * @param result - execution result
 * @returns data view
 * @public
 */
export function emptyDataViewForResult(result: IExecutionResult): IDataView {
    const { definition } = result;
    const fp = defFingerprint(definition) + "/emptyView";

    return {
        definition,
        result,
        headerItems: [],
        data: [],
        offset: [0, 0],
        count: [0, 0],
        totalCount: [0, 0],
        fingerprint(): string {
            return fp;
        },
        equals(other: IDataView): boolean {
            return fp === other.fingerprint();
        },
    };
}
