// (C) 2020-2022 GoodData Corporation
import { describe, it, expect } from "vitest";
import { IResultHeader, isResultAttributeHeader } from "@gooddata/sdk-model";
import { transformResultHeaders } from "../afm/result.js";
import { resultHeaders, transformedResultHeaders } from "./AfmResultConverter.fixtures.js";

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
