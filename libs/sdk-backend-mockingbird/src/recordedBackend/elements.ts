// (C) 2019-2020 GoodData Corporation

import {
    IElementsQuery,
    IElementsQueryFactory,
    IElementsQueryOptions,
    IElementsQueryResult,
    NotImplemented,
    UnexpectedResponseError,
    IAttributeElement,
} from "@gooddata/sdk-backend-spi";
import { isUriRef, ObjRef } from "@gooddata/sdk-model";
import { RecordingIndex } from "./types";
import { identifierToRecording, RecordingPager } from "./utils";

/**
 * @internal
 */
export class RecordedElementQueryFactory implements IElementsQueryFactory {
    constructor(private recordings: RecordingIndex) {}

    public forDisplayForm(ref: ObjRef): IElementsQuery {
        return new RecordedElements(ref, this.recordings);
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

        const recording = this.recordings.metadata.displayForms[
            "df_" + identifierToRecording(this.ref.identifier)
        ];

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

        return Promise.resolve(new RecordingPager<IAttributeElement>(elements, this.limit, this.offset));
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

    public withAttributeFilters(): IElementsQuery {
        // eslint-disable-next-line no-console
        console.warn("recorded backend does not support withAttributeFilters yet, ignoring...");
        return this;
    }
}
