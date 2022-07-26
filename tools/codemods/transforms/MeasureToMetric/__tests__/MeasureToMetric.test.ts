// (C) 2022 GoodData Corporation
import { applyTransformToFixture } from "../../../testUtils/applyTransformToFixture";
import * as path from "node:path";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const transform = require("../MeasureToMetric");

jest.autoMockOff();

describe("MeasureToMetric", () => {
    it.each([
        "factories",
        "getters",
        "manipulators",
        "types",
        "chartConfig",
        "notGooddata",
        "typeguards",
        "importAlias",
    ])("should convert %s", (name) => {
        const actual = applyTransformToFixture(
            transform,
            path.resolve(__dirname, `./__fixtures__/${name}.fixture.ts`),
        );
        expect(actual).toMatchSnapshot();
    });

    it("should convert props", () => {
        const actual = applyTransformToFixture(
            transform,
            path.resolve(__dirname, "./__fixtures__/props.fixture.tsx"),
        );
        expect(actual).toMatchSnapshot();
    });
});
