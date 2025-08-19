// (C) 2007-2025 GoodData Corporation
import { beforeEach, describe, expect, it } from "vitest";

import { ScenarioTag, ScenarioTestInput, ScenarioTestMembers, UnboundVisProps } from "../scenario.js";
import { CustomizedScenario, ScenarioGroup } from "../scenarioGroup.js";

function TestComponent() {
    return null;
}

function firstScenario(fromGroup: ScenarioGroup<any>): ScenarioTestInput<any> {
    const inputs = fromGroup.asTestInput();

    expect(inputs.length).toBeGreaterThanOrEqual(1);

    return inputs[0];
}

describe("ScenarioGroup", () => {
    const DefaultTags = ["tag1", "tag2"];
    const CustomTags = ["custom"];
    let GroupWithDefaultTags: ScenarioGroup<any>;

    beforeEach(() => {
        GroupWithDefaultTags = new ScenarioGroup<any>("test", TestComponent).withDefaultTags(...DefaultTags);
    });

    describe("addScenario", () => {
        it("should inherit default tags", () => {
            GroupWithDefaultTags.addScenario("scenario1", {});

            const scenario = firstScenario(GroupWithDefaultTags);

            expect(scenario[ScenarioTestMembers.Tags]).toEqual(DefaultTags);
        });

        it("should override default tags", () => {
            GroupWithDefaultTags.addScenario("scenario1", {}, (b) => b.withTags(...CustomTags));

            const scenario = firstScenario(GroupWithDefaultTags);

            expect(scenario[ScenarioTestMembers.Tags]).toEqual(CustomTags);
        });

        it("should clear default tags", () => {
            GroupWithDefaultTags.addScenario("scenario1", {}, (b) => b.withTags());

            const scenario = firstScenario(GroupWithDefaultTags);

            expect(scenario[ScenarioTestMembers.Tags]).toEqual([]);
        });
    });

    describe("addScenarios", () => {
        function customizer(
            baseName: string,
            baseProps: UnboundVisProps<any>,
            _baseTags: ScenarioTag[],
        ): Array<CustomizedScenario<any>> {
            return [
                [`${baseName} t1`, { ...baseProps, t1: true }],
                [`${baseName} t2`, { ...baseProps, t2: true }, undefined],
                [`${baseName} t3`, { ...baseProps, t3: true }, []],
                [`${baseName} t4`, { ...baseProps, t5: true }, CustomTags],
            ];
        }

        it("should inherit default tags", () => {
            GroupWithDefaultTags.addScenarios("base", { baseProp: true }, customizer);

            const inputs = GroupWithDefaultTags.asTestInput();

            expect(inputs[0][ScenarioTestMembers.Tags]).toEqual(DefaultTags);
            expect(inputs[1][ScenarioTestMembers.Tags]).toEqual(DefaultTags);
        });

        it("should clear default tags", () => {
            GroupWithDefaultTags.addScenarios("base", { baseProp: true }, customizer);

            const inputs = GroupWithDefaultTags.asTestInput();

            expect(inputs[2][ScenarioTestMembers.Tags]).toEqual([]);
        });

        it("should set custom tags", () => {
            GroupWithDefaultTags.addScenarios("base", { baseProp: true }, customizer);

            const inputs = GroupWithDefaultTags.asTestInput();

            expect(inputs[3][ScenarioTestMembers.Tags]).toEqual(CustomTags);
        });

        it("should apply bulk modifications last", () => {
            GroupWithDefaultTags.addScenarios("base", { baseProp: true }, customizer, (b) =>
                b.withTags(...CustomTags),
            );

            const inputs = GroupWithDefaultTags.asTestInput();

            expect(inputs[0][ScenarioTestMembers.Tags]).toEqual(CustomTags);
            expect(inputs[1][ScenarioTestMembers.Tags]).toEqual(CustomTags);
            expect(inputs[2][ScenarioTestMembers.Tags]).toEqual(CustomTags);
            expect(inputs[3][ScenarioTestMembers.Tags]).toEqual(CustomTags);
        });
    });
});
