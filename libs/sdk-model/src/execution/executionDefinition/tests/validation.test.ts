// (C) 2021 GoodData Corporation

import { IExecutionDefinition } from "../index";
import { ActivityType, Department, Won, WinRate } from "../../../../__mocks__/model";
import { modifyAttribute } from "../../attribute/factory";
import { modifyMeasure } from "../../measure/factory";
import { IAttribute } from "../../attribute";
import { IMeasure } from "../../measure";
import { emptyDef } from "../factory";
import { defValidate } from "../validation";

describe("defValidate", () => {
    const Workspace = "testWorkspace";

    it("should NOT throw for valid execution definition", () => {
        const def: IExecutionDefinition = {
            ...emptyDef(Workspace),
            attributes: [ActivityType, Department],
            measures: [WinRate, Won],
        };
        expect(() => defValidate(def)).not.toThrow();
    });

    const InvalidScenarios: Array<[string, IMeasure[], IAttribute[]]> = [
        [
            "two measures with the same localId",
            [modifyMeasure(Won, (m) => m.localId("foo")), modifyMeasure(WinRate, (m) => m.localId("foo"))],
            [],
        ],
        [
            "two attributes with the same localId",
            [],
            [
                modifyAttribute(ActivityType, (a) => a.localId("foo")),
                modifyAttribute(Department, (a) => a.localId("foo")),
            ],
        ],
        [
            "measure and an attribute with the same localId",
            [modifyMeasure(Won, (m) => m.localId("foo"))],
            [modifyAttribute(Department, (a) => a.localId("foo"))],
        ],
    ];

    it.each(InvalidScenarios)("should throw for execution definition with %s", (_, measures, attributes) => {
        const def: IExecutionDefinition = { ...emptyDef(Workspace), attributes, measures };
        expect(() => defValidate(def)).toThrowErrorMatchingSnapshot();
    });
});
