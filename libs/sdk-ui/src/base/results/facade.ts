// (C) 2019-2020 GoodData Corporation
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { IDataView, IExecutionResult } from "@gooddata/sdk-backend-spi";
import { IExecutionDefinitionMethods, newExecutionDefinitonMethods } from "./internal/definitionMethods";
import { IResultMetaMethods, newResultMetaMethods } from "./internal/resultMetaMethods";
import { IResultDataMethods, newResultDataMethods } from "./internal/resultDataMethods";

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
 * TODO: move more added-value functions here, clean up, consolidate, modularize
 * @alpha
 */
export class DataViewFacade {
    public readonly definition: IExecutionDefinition;

    private readonly definitionMethods: IExecutionDefinitionMethods;
    private readonly resultMetaMethods: IResultMetaMethods;
    private readonly resultDataMethods: IResultDataMethods;

    protected constructor(public readonly dataView: IDataView) {
        this.definition = dataView.definition;

        this.definitionMethods = newExecutionDefinitonMethods(dataView.definition);
        this.resultMetaMethods = newResultMetaMethods(dataView);
        this.resultDataMethods = newResultDataMethods(dataView);
    }

    //
    // Own methods
    //

    public static for(dataView: IDataView): DataViewFacade {
        return new DataViewFacade(dataView);
    }

    /**
     * @returns result of execution which returned this data view
     */
    public result(): IExecutionResult {
        return this.dataView.result;
    }

    /**
     * @remarks see {@link IDataView.fingerprint} for more contractual information
     * @returns fingerprint of the data view
     */
    public fingerprint(): string {
        return this.dataView.fingerprint();
    }

    /**
     * @returns methods to work with execution definition
     */
    public def(): IExecutionDefinitionMethods {
        return this.definitionMethods;
    }

    /**
     * @returns methods to work with result metadata
     */
    public meta(): IResultMetaMethods {
        return this.resultMetaMethods;
    }

    /**
     * @returns methods to work with the raw data included in the result
     */
    public rawData(): IResultDataMethods {
        return this.resultDataMethods;
    }
}
