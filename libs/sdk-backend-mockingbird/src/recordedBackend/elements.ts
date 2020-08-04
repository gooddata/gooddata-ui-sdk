// (C) 2019-2020 GoodData Corporation

import {
    IElementQuery,
    IElementQueryFactory,
    IElementQueryOptions,
    IElementQueryResult,
    NotImplemented,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { IAttributeElement, isUriRef, ObjRef } from "@gooddata/sdk-model";
import { RecordingIndex } from "./types";
import { identifierToRecording, RecordingPager } from "./utils";

/**
 * @internal
 */
export class RecordedElementQueryFactory implements IElementQueryFactory {
    constructor(private recordings: RecordingIndex) {}

    public forDisplayForm(ref: ObjRef): IElementQuery {
        return new RecordedElements(ref, this.recordings);
    }
}

class RecordedElements implements IElementQuery {
    private limit = 50;
    private offset = 0;
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
            elements = elements.filter((item) => item.title.toLowerCase().includes(filter.toLowerCase()));
        }

        return Promise.resolve(new RecordingPager<IAttributeElement>(elements, this.limit, this.offset));
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
