// (C) 2007-2018 GoodData Corporation
import { IMappingHeader } from "../../../../../interfaces/MappingHeader";
import { ALIGN_LEFT, ALIGN_RIGHT } from "../../constants/align";
import { getColumnAlign } from "../column";

import { TABLE_HEADERS_2A_3M } from "../../fixtures/2attributes3measures";

const ATTRIBUTE_HEADER: IMappingHeader = TABLE_HEADERS_2A_3M[0];
const FIRST_MEASURE_HEADER: IMappingHeader = TABLE_HEADERS_2A_3M[2];

describe("Table utils - Column", () => {
    describe("getColumnAlign", () => {
        it("should get column align for attribute", () => {
            expect(getColumnAlign(ATTRIBUTE_HEADER)).toEqual(ALIGN_LEFT);
        });

        it("should get column align for measure", () => {
            expect(getColumnAlign(FIRST_MEASURE_HEADER)).toEqual(ALIGN_RIGHT);
        });
    });
});
