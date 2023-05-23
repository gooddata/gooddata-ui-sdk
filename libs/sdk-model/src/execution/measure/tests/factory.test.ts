// (C) 2019-2022 GoodData Corporation
import { Velocity, Won } from "../../../../__mocks__/model.js";
import { newPositiveAttributeFilter } from "../../filter/factory.js";
import {
    modifyMeasure,
    modifyPopMeasure,
    modifyPreviousPeriodMeasure,
    modifySimpleMeasure,
    newArithmeticMeasure,
    newMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
    newInlineMeasure,
    modifyInlineMeasure,
} from "../factory.js";
import { measureLocalId } from "../index.js";
import { idRef, uriRef } from "../../../objRef/factory.js";

describe("measure factories", () => {
    describe("newMeasure", () => {
        it("should return a simple measure", () => {
            expect(newMeasure("foo")).toMatchSnapshot();
        });
        it("should return a simple measure with different aggregation", () => {
            expect(newMeasure("foo", (m) => m.aggregation("sum"))).toMatchSnapshot();
        });
        it("should honor custom-set localId for simple measures with aggregation", () => {
            expect(newMeasure("foo", (m) => m.localId("bar").aggregation("sum"))).toMatchSnapshot();
        });
        it("should return a measure with alias", () => {
            expect(newMeasure("foo", (m) => m.alias("bar"))).toMatchSnapshot();
        });
        it("should return a measure with custom localIdentifier", () => {
            expect(newMeasure("foo", (m) => m.localId("custom"))).toMatchSnapshot();
        });
        it("should return a measure with format", () => {
            expect(newMeasure("foo", (m) => m.format("bar"))).toMatchSnapshot();
        });
        it("should return a measure with title", () => {
            expect(newMeasure("foo", (m) => m.title("bar"))).toMatchSnapshot();
        });
        it("should return a measure with a filter", () => {
            expect(
                newMeasure("foo", (m) => m.filters(newPositiveAttributeFilter("filter", { uris: ["baz"] }))),
            ).toMatchSnapshot();
        });
        it("should sanitize automatically generated localId", () => {
            expect(newMeasure("id:with:colons")).toMatchSnapshot();
        });
    });

    describe("modifyMeasure", () => {
        const ExistingMeasure = newMeasure("measure1", (m) => m.localId("measure1"));

        it("should not modify input measure", () => {
            modifyMeasure(ExistingMeasure, (m) => m.localId("measure2"));

            expect(measureLocalId(ExistingMeasure)).toEqual("measure1");
        });

        it("should keep local id from the existing measure if new localid not provided", () => {
            const newMeasure = modifyMeasure(ExistingMeasure);

            expect(measureLocalId(ExistingMeasure)).toEqual(measureLocalId(newMeasure));
        });

        it("should create new measure with modified local id", () => {
            expect(modifyMeasure(ExistingMeasure, (m) => m.localId("measure2"))).toMatchSnapshot();
        });
    });

    describe("modifySimpleMeasure", () => {
        const ExistingMeasure = newMeasure("measure1", (m) => m.localId("measure1"));
        const ExistingMeasureWithCustomizations = newMeasure("measure1", (m) =>
            m.localId("measure1").alias("alias").format("format").title("title"),
        );

        it("should create new measure with modified aggregation and same localId", () => {
            expect(modifySimpleMeasure(ExistingMeasure, (m) => m.aggregation("min"))).toMatchSnapshot();
        });

        it("should create new measure with modified aggregation and custom local id", () => {
            expect(
                modifySimpleMeasure(ExistingMeasure, (m) => m.aggregation("min").localId("customLocalId")),
            ).toMatchSnapshot();
        });

        it("should create new measure with cleaned up customizations and same localId", () => {
            const result = modifySimpleMeasure(ExistingMeasureWithCustomizations, (m) =>
                m.defaultFormat().noAlias().noTitle(),
            );

            expect(result).toMatchSnapshot();
        });
    });

    describe("newArithmeticMeasure", () => {
        it("should return a simple arithmetic measure", () => {
            expect(newArithmeticMeasure(["foo", "bar"], "sum")).toMatchSnapshot();
        });

        it("should return a simple arithmetic measure from two measure objects", () => {
            expect(newArithmeticMeasure([Won, Velocity.Min], "sum")).toMatchSnapshot();
        });
    });

    describe("newPopMeasure", () => {
        it("should return a simple PoP measure from shorthand attribute identifier", () => {
            expect(newPopMeasure("foo", "attr")).toMatchSnapshot();
        });

        it("should return a simple PoP measure from attribute ref", () => {
            expect(newPopMeasure("foo", idRef("attr"))).toMatchSnapshot();
        });

        it("should return a simple PoP measure from other measure object", () => {
            expect(newPopMeasure(Won, "attr")).toMatchSnapshot();
        });
    });

    describe("modifyPopMeasure", () => {
        const ExistingMeasure = newPopMeasure("masterMeasure1", "attrId1", (m) => m.localId("measure1"));

        it("should not modify input measure", () => {
            modifyPopMeasure(ExistingMeasure, (m) => m.localId("measure2"));

            expect(measureLocalId(ExistingMeasure)).toEqual("measure1");
        });

        it("should keep local id from the existing measure if new localid not provided", () => {
            const newMeasure = modifyPopMeasure(ExistingMeasure);

            expect(measureLocalId(ExistingMeasure)).toEqual(measureLocalId(newMeasure));
        });

        it("should change master measure and pop attribute", () => {
            expect(
                modifyPopMeasure(ExistingMeasure, (m) =>
                    m.masterMeasure("otherMaster").popAttribute("attrId2"),
                ),
            ).toMatchSnapshot();
        });
    });

    describe("newPreviousPeriodMeasure", () => {
        it("should return a simple PP measure when supplied with strings", () => {
            expect(newPreviousPeriodMeasure("foo", [{ dataSet: "bar", periodsAgo: 3 }])).toMatchSnapshot();
        });

        it("should return a simple PP measure when supplied with objects", () => {
            expect(newPreviousPeriodMeasure(Won, [{ dataSet: "bar", periodsAgo: 3 }])).toMatchSnapshot();
        });

        it("should return a simple PP measure when supplied with ObjRef datasets", () => {
            expect(
                newPreviousPeriodMeasure("foo", [{ dataSet: uriRef("/some/uri"), periodsAgo: 3 }]),
            ).toMatchSnapshot();
        });
    });

    describe("modifyPreviousPeriodMeasure", () => {
        const ExistingMeasure = newPreviousPeriodMeasure(
            "masterMeasure1",
            [{ dataSet: "dataset", periodsAgo: 1 }],
            (m) => m.localId("measure1"),
        );

        it("should not modify input measure", () => {
            modifyPreviousPeriodMeasure(ExistingMeasure, (m) => m.localId("measure2"));

            expect(measureLocalId(ExistingMeasure)).toEqual("measure1");
        });

        it("should keep local id from the existing measure if new localid not provided", () => {
            const newMeasure = modifyPreviousPeriodMeasure(ExistingMeasure);

            expect(measureLocalId(ExistingMeasure)).toEqual(measureLocalId(newMeasure));
        });

        it("should change master measure and pop attribute", () => {
            expect(
                modifyPreviousPeriodMeasure(ExistingMeasure, (m) =>
                    m.masterMeasure("otherMaster").dateDataSets([{ dataSet: "dataset2", periodsAgo: -1 }]),
                ),
            ).toMatchSnapshot();
        });
    });

    describe("newInlineMeasure", () => {
        it("should return a inline measure", () => {
            expect(newInlineMeasure("SELECT 1")).toMatchSnapshot();
        });
    });

    describe("modifyInlineMeasure", () => {
        const existing = newInlineMeasure("SELECT 1");

        it("should return a modified inline measure", () => {
            expect(modifyInlineMeasure(existing, (m) => m.maql("SELECT 2;"))).toMatchSnapshot();
        });
    });
});
