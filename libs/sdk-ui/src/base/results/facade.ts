// (C) 2019-2020 GoodData Corporation
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { IDataView, IExecutionResult } from "@gooddata/sdk-backend-spi";
import { DataAccessConfig } from "./dataAccessConfig";
import { IExecutionDefinitionMethods, newExecutionDefinitonMethods } from "./internal/definitionMethods";
import { IResultMetaMethods, newResultMetaMethods } from "./internal/resultMetaMethods";
import { IResultDataMethods, newResultDataMethods } from "./internal/resultDataMethods";
import { IDataAccessMethods } from "./dataAccess";
import { newDataAccessMethods } from "./internal/dataAccessMethods";

/**
 * This wrapper for {@link IDataView} provides various convenience methods to work with data and metadata stored inside
 * the provided instance of {@link IDataView}.
 *
 * The facade keeps an ephemeral state - such as calculated indexes on top of the headers in the {@link IDataView} -
 * to optimize performance of often-used lookups at the cost of extra memory.
 *
 * The facade is part of the public API and we strongly recommend to use it whenever client code needs to work with
 * data view; ideally, single instance of data view facade
 *
 * Note: the facade is currently in alpha quality - mix-match of various functions we found useful so far; consolidation
 * and further enhancements will happen, the methods will be removed, renamed and added in the future. The public
 * API WILL break.
 *
 * @alpha
 */
export class DataViewFacade {
    private static Facades: WeakMap<IDataView, DataViewFacade> = new WeakMap<IDataView, DataViewFacade>();

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
     * @param dataView
     * @alpha
     */
    public static for(dataView: IDataView): DataViewFacade {
        if (!DataViewFacade.Facades.has(dataView)) {
            DataViewFacade.Facades.set(dataView, new DataViewFacade(dataView));
        }

        return DataViewFacade.Facades.get(dataView)!;
    }

    /**
     * @returns result of execution which returned this data view
     * @alpha
     */
    public result(): IExecutionResult {
        return this.dataView.result;
    }

    /**
     * @remarks see {@link IDataView.fingerprint} for more contractual information
     * @returns fingerprint of the data view
     * @alpha
     */
    public fingerprint(): string {
        return this.dataView.fingerprint();
    }

    /**
     * @returns methods to access data in a curated fashion using data slices and data series iterators
     * @alpha
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
