// (C) 2019-2022 GoodData Corporation

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
    IElementsQueryAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import {
    filterAttributeElements,
    filterObjRef,
    IMeasure,
    IRelativeDateFilter,
    isAttributeElementsByRef,
    isAttributeFilter,
    isUriRef,
    ObjRef,
    objRefToString,
    UriRef,
} from "@gooddata/sdk-model";
import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import { RecordingIndex } from "./types";
import { elementsQueryParamsToElementsEntryId, identifierToRecording } from "./utils";

function getIdentifierFromUriRef(ref: UriRef, recordings: RecordingIndex): string | undefined {
    const allDisplayFormsIdentifiers = Object.keys(recordings?.metadata?.displayForms ?? {});
    return allDisplayFormsIdentifiers
        .map((id) => recordings?.metadata?.displayForms?.[id].obj)
        .find((displayForm) => displayForm?.uri === ref.uri)?.id;
}

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
    private options?: IElementsQueryOptions;
    private attributeFilters?: IElementsQueryAttributeFilter[];
    private dateFilters?: IRelativeDateFilter[];
    private measures?: IMeasure[];

    constructor(private ref: ObjRef, private recordings: RecordingIndex) {}

    public query(): Promise<IElementsQueryResult> {
        if (!this.recordings.metadata || !this.recordings.metadata.displayForms) {
            return Promise.reject(new UnexpectedResponseError("No displayForm recordings", 404, {}));
        }

        const identifier = isUriRef(this.ref)
            ? getIdentifierFromUriRef(this.ref, this.recordings)
            : this.ref.identifier;

        if (!identifier) {
            return Promise.reject(
                new UnexpectedResponseError(
                    `No element recordings for df ${objRefToString(this.ref)}`,
                    404,
                    {},
                ),
            );
        }

        const elementsEntry = elementsQueryParamsToElementsEntryId({
            options: this.options,
            attributeFilters: this.attributeFilters,
            dateFilters: this.dateFilters,
            measures: this.measures,
        });

        let elements = this.recordings.metadata.displayForms[`df_${identifierToRecording(identifier)}`]?.[
            elementsEntry
        ] as IAttributeElement[];

        if (!elements) {
            return Promise.reject(
                new UnexpectedResponseError(`No element recordings for df ${identifier}`, 404, {}),
            );
        }

        const { filter } = this.options ?? {};

        if (filter !== undefined) {
            elements = elements.filter((item) => item.title.toLowerCase().includes(filter.toLowerCase()));
        }

        return Promise.resolve(new InMemoryPaging<IAttributeElement>(elements, this.limit, this.offset));
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

    public withDateFilters(dateFilters: IRelativeDateFilter[]): IElementsQuery {
        this.dateFilters = dateFilters;

        return this;
    }
    public withAttributeFilters(attributeFilters: IElementsQueryAttributeFilter[]): IElementsQuery {
        this.attributeFilters = attributeFilters;

        return this;
    }

    public withMeasures(measures: IMeasure[]): IElementsQuery {
        this.measures = measures;

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

        const identifier = isUriRef(this.ref)
            ? getIdentifierFromUriRef(this.ref, this.recordings)
            : this.ref.identifier;

        if (!identifier) {
            return Promise.reject(
                new UnexpectedResponseError(
                    `No element recordings for df ${objRefToString(this.ref)}`,
                    404,
                    {},
                ),
            );
        }

        const elementsEntry = elementsQueryParamsToElementsEntryId();

        let elements = this.recordings.metadata.displayForms[`df_${identifierToRecording(identifier)}`]?.[
            elementsEntry
        ] as IAttributeElement[];

        if (!elements) {
            return Promise.reject(
                new UnexpectedResponseError(`No element recordings for df ${identifier}`, 404, {}),
            );
        }

        if (isAttributeFilter(this.filter)) {
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
