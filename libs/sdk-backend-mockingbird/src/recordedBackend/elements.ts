// (C) 2019-2023 GoodData Corporation

import {
    IElementsQuery,
    IElementsQueryFactory,
    IElementsQueryOptions,
    IElementsQueryResult,
    NotImplemented,
    UnexpectedResponseError,
    IFilterElementsQuery,
    FilterWithResolvableElements,
    IElementsQueryAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import {
    filterAttributeElements,
    filterObjRef,
    isAttributeElementsByRef,
    isAttributeFilter,
    isUriRef,
    ObjRef,
    IAttributeElement,
    IRelativeDateFilter,
    IMeasure,
} from "@gooddata/sdk-model";
import { RecordedBackendConfig, RecordingIndex } from "./types.js";
import { identifierToRecording } from "./utils.js";
import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import flow from "lodash/fp/flow.js";
import { invariant } from "ts-invariant";
import { resolveLimitingItems, resolveSelectedElements, resolveStringFilter } from "./elementsUtils.js";

/**
 * @internal
 */
export class RecordedElementQueryFactory implements IElementsQueryFactory {
    constructor(private recordings: RecordingIndex, private readonly config: RecordedBackendConfig) {}

    public forDisplayForm(ref: ObjRef): IElementsQuery {
        return new RecordedElements(ref, this.recordings, this.config);
    }

    public forFilter(filter: FilterWithResolvableElements): IFilterElementsQuery {
        return new RecordedFilterElements(filter, this.recordings);
    }
}

class RecordedElements implements IElementsQuery {
    private limit = 50;
    private offset = 0;
    private options: IElementsQueryOptions = {};
    private attributeFilters: IElementsQueryAttributeFilter[] = [];
    private dateFilters: IRelativeDateFilter[] = [];
    private measures: IMeasure[] = [];

    constructor(
        private ref: ObjRef,
        private recordings: RecordingIndex,
        private readonly config: RecordedBackendConfig,
    ) {}

    public query(): Promise<IElementsQueryResult> {
        if (!this.recordings.metadata?.displayForms) {
            return Promise.reject(new UnexpectedResponseError("No displayForm recordings", 404, {}));
        }

        if (isUriRef(this.ref)) {
            return Promise.reject(new NotImplemented("Identifying displayForm by uri is not supported yet"));
        }

        const recording =
            this.recordings.metadata.displayForms["df_" + identifierToRecording(this.ref.identifier)];

        if (!recording) {
            return Promise.reject(
                new UnexpectedResponseError(`No element recordings for df ${this.ref.identifier}`, 404, {}),
            );
        }

        let elements = flow(
            // resolve limiting items first so that they do not need to care about the other filters
            // and have nice indexes for the limiting strategies
            resolveLimitingItems(
                this.config.attributeElementsFiltering,
                this.attributeFilters,
                this.dateFilters,
                this.measures,
            ),
            resolveSelectedElements(this.options.elements),
            resolveStringFilter(this.options.filter),
        )(recording.elements);

        if (this.options.order === "desc") {
            elements = [...elements].reverse();
        }

        return Promise.resolve(new InMemoryPaging<IAttributeElement>(elements, this.limit, this.offset));
    }

    public withLimit(limit: number): this {
        invariant(limit > 0, "Limit must be positive number");
        this.limit = limit;
        return this;
    }

    public withOffset(offset: number): this {
        this.offset = offset;
        return this;
    }

    public withOptions(options: IElementsQueryOptions): this {
        this.options = options ?? {};
        return this;
    }

    public withDateFilters(filters: IRelativeDateFilter[]): this {
        this.dateFilters = filters ?? [];
        return this;
    }

    public withAttributeFilters(filters: IElementsQueryAttributeFilter[]): this {
        this.attributeFilters = filters ?? [];
        return this;
    }

    public withMeasures(measures: IMeasure[]): this {
        this.measures = measures ?? [];
        return this;
    }

    public withSignal(_: AbortSignal): this {
        return this;
    }
}

class RecordedFilterElements implements IFilterElementsQuery {
    private limit = 50;
    private offset = 0;
    private readonly ref: ObjRef;

    constructor(private filter: FilterWithResolvableElements, private recordings: RecordingIndex) {
        this.ref = filterObjRef(filter);
    }

    // eslint-disable-next-line sonarjs/no-identical-functions
    public withLimit(limit: number): this {
        invariant(limit > 0, "Limit must be positive number");
        this.limit = limit;
        return this;
    }

    // eslint-disable-next-line sonarjs/no-identical-functions
    public withOffset(offset: number): this {
        this.offset = offset;
        return this;
    }

    public query(): Promise<IElementsQueryResult> {
        if (!this.recordings.metadata?.displayForms) {
            return Promise.reject(new UnexpectedResponseError("No displayForm recordings", 404, {}));
        }

        if (isUriRef(this.ref)) {
            return Promise.reject(new NotImplemented("Identifying displayForm by uri is not supported yet"));
        }

        const recording =
            this.recordings.metadata.displayForms["df_" + identifierToRecording(this.ref.identifier)];

        if (!recording) {
            return Promise.reject(
                new UnexpectedResponseError(`No element recordings for df ${this.ref.identifier}`, 404, {}),
            );
        }

        if (isAttributeFilter(this.filter)) {
            let elements = recording.elements;
            const selectedElements = filterAttributeElements(this.filter);
            if (isAttributeElementsByRef(selectedElements)) {
                elements = elements.filter((element) =>
                    selectedElements.uris.find((uri) => uri === element.uri),
                );
            } else {
                elements = elements.filter((element) =>
                    selectedElements.values.find((value) => value === element.title),
                );
            }

            return Promise.resolve(new InMemoryPaging<IAttributeElement>(elements, this.limit, this.offset));
        } else {
            return Promise.reject(new NotImplemented("Date filter is not supported yet"));
        }
    }
}
