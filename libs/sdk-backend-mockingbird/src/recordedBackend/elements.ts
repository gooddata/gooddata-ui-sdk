// (C) 2019-2021 GoodData Corporation

import {
    IElementsQuery,
    IElementsQueryFactory,
    IElementsQueryOptions,
    IElementsQueryResult,
    NotImplemented,
    UnexpectedResponseError,
    IAttributeElement,
    IFilterElementsQuery,
    FilterWithResolvableElements,
} from "@gooddata/sdk-backend-spi";
import {
    filterAttributeElements,
    filterObjRef,
    isAttributeElementsByRef,
    isAttributeFilter,
    isUriRef,
    ObjRef,
} from "@gooddata/sdk-model";
import { RecordingIndex } from "./types";
import { identifierToRecording } from "./utils";
import { InMemoryPaging } from "@gooddata/sdk-backend-base";

/**
 * @internal
 */
export class RecordedElementQueryFactory implements IElementsQueryFactory {
    constructor(private recordings: RecordingIndex) {}

    public forDisplayForm(ref: ObjRef): IElementsQuery {
        return new RecordedElements(ref, this.recordings);
    }

    public forFilter(filter: FilterWithResolvableElements): IFilterElementsQuery {
        return new RecordedFilterElements(filter, this.recordings);
    }
}

class RecordedElements implements IElementsQuery {
    private limit = 50;
    private offset = 0;
    private options: IElementsQueryOptions = {};

    constructor(private ref: ObjRef, private recordings: RecordingIndex) {}

    public query(): Promise<IElementsQueryResult> {
        if (!this.recordings.metadata || !this.recordings.metadata.displayForms) {
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

        let elements = recording.elements;
        const { filter } = this.options;

        if (filter !== undefined) {
            elements = elements.filter((item) => item.title.toLowerCase().includes(filter.toLowerCase()));
        }

        return Promise.resolve(new InMemoryPaging<IAttributeElement>(elements, this.limit, this.offset));
    }

    public async queryTotalCount(): Promise<number> {
        const result = await this.query();
        return result.totalCount;
    }

    public withLimit(limit: number): IElementsQuery {
        if (limit <= 0) {
            throw new Error("Limit must be positive number");
        }

        this.limit = limit;

        return this;
    }

    public withOffset(offset: number): IElementsQuery {
        this.offset = offset;

        return this;
    }

    public withOptions(options: IElementsQueryOptions): IElementsQuery {
        this.options = options;

        return this;
    }

    public withDateFilters(): IElementsQuery {
        // eslint-disable-next-line no-console
        console.warn("recorded backend does not support withDateFilters yet, ignoring...");
        return this;
    }
    public withAttributeFilters(): IElementsQuery {
        // eslint-disable-next-line no-console
        console.warn("recorded backend does not support withAttributeFilters yet, ignoring...");
        return this;
    }

    public withMeasures(): IElementsQuery {
        // eslint-disable-next-line no-console
        console.warn("recorded backend does not support withMeasures yet, ignoring...");
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
    public withLimit(limit: number): IFilterElementsQuery {
        if (limit <= 0) {
            throw new Error("Limit must be positive number");
        }

        this.limit = limit;

        return this;
    }

    // eslint-disable-next-line sonarjs/no-identical-functions
    public withOffset(offset: number): IFilterElementsQuery {
        this.offset = offset;

        return this;
    }

    public query(): Promise<IElementsQueryResult> {
        if (!this.recordings.metadata || !this.recordings.metadata.displayForms) {
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
