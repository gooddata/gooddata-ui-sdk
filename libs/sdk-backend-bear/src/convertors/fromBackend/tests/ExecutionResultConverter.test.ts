// (C) 2020 GoodData Corporation

import { convertDimensions } from "../ExecutionResultConverter";
import { dimensions } from "./ExecutionResultConverter.fixtures";

describe("convertDimensions", () => {
    it("should add ref properties as uriRefs", () => {
        expect(convertDimensions(dimensions)).toMatchSnapshot();
    });
});
