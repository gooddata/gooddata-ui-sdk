// (C) 2020 GoodData Corporation

import { newAttributeSort, newPositiveAttributeFilter } from "../..";
import { Department, Won } from "../../../__mocks__/model";
import { newBucket } from "../../execution/buckets";
import { newInsightDefinition } from "../factory";

describe("insight factory", () => {
    it("should create new empty insight", () => {
        expect(newInsightDefinition("local:bar")).toMatchSnapshot();
    });

    it("should create new empty insight with custom title", () => {
        expect(newInsightDefinition("local:bar", (b) => b.title("My Insight"))).toMatchSnapshot();
    });

    it("should create new empty insight with buckets, filters and sorts", () => {
        expect(
            newInsightDefinition("local:bar", (b) => {
                return b
                    .buckets([newBucket("test", Won)])
                    .filters([newPositiveAttributeFilter(Department, ["Inside Sales"])])
                    .sorts([newAttributeSort(Department)]);
            }),
        ).toMatchSnapshot();
    });

    it("should create new empty insight with custom properties", () => {
        expect(
            newInsightDefinition("local:bar", (b) => b.properties({ controls: { grid: true } })),
        ).toMatchSnapshot();
    });
});
