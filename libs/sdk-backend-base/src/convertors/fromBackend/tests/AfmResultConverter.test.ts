// (C) 2020-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { type IResultHeader, isResultAttributeHeader } from "@gooddata/sdk-model";

import { resultHeaders, transformedResultHeaders } from "./AfmResultConverter.fixtures.js";
import { transformResultHeaders } from "../afm/result.js";

const transformResultHeader = (resultHeader: IResultHeader): IResultHeader => {
    if (!isResultAttributeHeader(resultHeader)) {
        return resultHeader;
    }
    return {
        attributeHeaderItem: {
            name: `${resultHeader.attributeHeaderItem.name}-transformed`,
            uri: resultHeader.attributeHeaderItem.uri,
        },
    };
};

describe("transformResultHeaders", () => {
    it("should transform the header results in an AFM execution response", () => {
        expect(transformResultHeaders(resultHeaders, transformResultHeader)).toEqual(
            transformedResultHeaders,
        );
    });
});
