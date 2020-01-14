// (C) 2019-2020 GoodData Corporation

import {
    IElementQuery,
    IElementQueryFactory,
    IElementQueryOptions,
    IElementQueryResult,
    IPagedResource,
    UnexpectedResponseError,
    NotImplemented,
} from "@gooddata/sdk-backend-spi";
import { RecordingIndex } from "./types";
import { IAttributeElement, ObjRef, isUriRef } from "@gooddata/sdk-model";
import { identifierToRecording } from "./utils";

export class RecordedElementQueryFactory implements IElementQueryFactory {
    constructor(private recordings: RecordingIndex) {}

    public forDisplayForm(ref: ObjRef): IElementQuery {
        return new RecordedElements(ref, this.recordings);
    }
}

class RecordedElements implements IElementQuery {
    private limit: number = 50;
    private offset: number = 0;
    private options: IElementQueryOptions = {};

    constructor(private ref: ObjRef, private recordings: RecordingIndex) {}

    public query(): Promise<IElementQueryResult> {
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
            elements = elements.filter(item => item.title.toLowerCase().includes(filter.toLowerCase()));
        }

        return Promise.resolve(new RecordedResult(elements, this.limit, this.offset));
    }

    public withLimit(limit: number): IElementQuery {
        if (limit <= 0) {
            throw new Error("Limit must be positive number");
        }

        this.limit = limit;

        return this;
    }

    public withOffset(offset: number): IElementQuery {
        this.offset = offset;

        return this;
    }

    public withOptions(options: IElementQueryOptions): IElementQuery {
        this.options = options;

        return this;
    }
}

class RecordedResult implements IElementQueryResult {
    public readonly items: IAttributeElement[];
    public readonly limit: number;
    public readonly offset: number;
    public readonly totalCount: number;

    constructor(private all: IAttributeElement[], limit: number, offset: number) {
        // this will naturally return empty items if at the end of data; limit will always be positive
        this.items = all.slice(offset, offset + limit);

        // offset is at most at the end of all available elements
        this.offset = Math.min(offset, this.all.length);
        // limit is capped to size of current page

        this.limit = Math.max(limit, this.items.length);

        this.totalCount = all.length;
    }

    public next(): Promise<IPagedResource<IAttributeElement>> {
        if (this.items.length === 0) {
            return Promise.resolve(this);
        }

        return Promise.resolve(new RecordedResult(this.all, this.limit, this.offset + this.items.length));
    }
}
