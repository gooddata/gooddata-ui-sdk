// (C) 2007-2020 GoodData Corporation

import React from "react";
import invariant from "ts-invariant";
import {
    IScenario,
    ScenarioBuilder,
    ScenarioModification,
    ScenarioTag,
    TestTypes,
    UnboundVisProps,
    VisProps,
    ScenarioTestInput,
    WorkspaceType,
    ScenarioAndDescription,
} from "./scenario";
import intersection from "lodash/intersection";
import identity from "lodash/identity";
import cloneDeep from "lodash/cloneDeep";
import { ISettings } from "@gooddata/sdk-backend-spi";

//
// Scenario groups
//

export interface IScenarioGroup<T extends VisProps> {
    /**
     * Human readable name of the visualization for which there are scenarios.
     */
    readonly vis: string;

    /**
     * Human readable name of this group of scenarios. The name may be composite and consist of multiple
     * parts. Look at each part as a node in hierarchy.
     */
    readonly groupNames: string[];

    /**
     * React component that realizes the visualization.
     */
    readonly component: React.ComponentType<T>;

    /**
     * List of available test scenarios
     */
    readonly scenarioList: ReadonlyArray<IScenario<T>>;

    /**
     * Test configuration specifics / overrides.
     */
    readonly testConfig: TestConfiguration;
}

/**
 * This class supports concept of grouping multiple related test scenarios. To that end it provides functions
 * to add one scenario, add scenarios in bulk & accessing the scenarios either in their normal shape or as
 * input to jest parameterized tests.
 */
export class ScenarioGroup<T extends VisProps> implements IScenarioGroup<T> {
    public groupNames: string[] = [];
    public scenarioList: Array<IScenario<T>> = [];
    public testConfig: TestConfiguration = { visual: {} };
    private scenarioIndex: ScenarioSet<T> = {};
    private defaultTags: ScenarioTag[] = [];
    private defaultTestTypes: TestTypes[] = ["api", "visual"];
    private defaultWorkspaceType: WorkspaceType = "reference-workspace";
    private defaultBackendSettings: ISettings = {};

    constructor(public readonly vis: string, public readonly component: React.ComponentType<T>) {}

    /**
     * Sets this scenario group's name. The name may be composite and consist of multiple
     * parts. Look at each part as a node in hierarchy.
     *
     * @param groupNames - group name(s)
     */
    public withGroupNames(...groupNames: string[]): ScenarioGroup<T> {
        this.groupNames = groupNames;

        return this;
    }

    /**
     * Configures the scenario group to assign the provided tags to all new scenarios added
     * after this call.
     *
     * @param tags - tags to assign
     */
    public withDefaultTags(...tags: ScenarioTag[]): ScenarioGroup<T> {
        this.defaultTags = tags;

        return this;
    }

    /**
     * Configures the scenario group to be tested using the specified types of tests. By default both API and visual
     * regression will be done. Use this to override.
     *
     * @param testTypes - test types
     */
    public withDefaultTestTypes(...testTypes: TestTypes[]): ScenarioGroup<T> {
        this.defaultTestTypes = testTypes;

        return this;
    }

    public withDefaultWorkspaceType(workspaceType: WorkspaceType): ScenarioGroup<T> {
        this.defaultWorkspaceType = workspaceType;

        return this;
    }

    public withDefaultBackendSettings(settings: ISettings): ScenarioGroup<T> {
        this.defaultBackendSettings = settings;

        return this;
    }

    /**
     * Adds a new test scenarios for a component. The scenario specifies name and visualization props (sans backend
     * and workspace .. these will be injected by framework).
     *
     * @param name - name of the scenario, SHOULD NOT contain name of the visualization, just focus on well formed scenario name
     * @param props - props for the visualization that exercise the scenario
     * @param m - optionally specify function to modify the scenario being defined, this allows specifying extra tags or types of tests to run
     */
    public addScenario(
        name: string,
        props: UnboundVisProps<T>,
        m: ScenarioModification<T> = identity,
    ): ScenarioGroup<T> {
        const exists = this.scenarioIndex[name];

        invariant(!exists, `contract "${name}" for ${this.vis} already exists`);

        const builder = new ScenarioBuilder<T>(this.vis, this.component, name, props, this.groupNames);
        builder.withTags(...this.defaultTags);
        builder.withTests(...this.defaultTestTypes);
        builder.withWorkspaceType(this.defaultWorkspaceType);
        builder.withBackendSettings(this.defaultBackendSettings);
        this.insertScenario(m(builder).build());

        return this;
    }

    /**
     * Adds multiple test scenarios; given base name & props of the scenario this method will use the
     * provided customizer function to expand base into multiple concrete scenarios. It then adds those
     * one-by-one using the {@link addScenario} method.
     *
     * When adding scenarios in bulk fashion, the scenario tagging works as follows:
     *
     * -  scenario inherits any default tags already set for the scenario group
     * -  IF customizer returns tags for the customizer scenario, they will be used as is, replacing anything
     *    set so far
     * -  IF the modifications use builder's withTags() call, then tags provided on that call will be used as is,
     *    replacing anything set so far
     *
     * @param baseName - base name for the scenario variants
     * @param baseProps - base props for the scenario variants
     * @param customizer - function to expand base name & props into multiple variants
     * @param m - modifications to apply on each scenario
     */
    public addScenarios(
        baseName: string,
        baseProps: UnboundVisProps<T>,
        customizer: ScenarioCustomizer<T>,
        m: ScenarioModification<T> = identity,
    ): ScenarioGroup<T> {
        const variants = customizer(baseName, baseProps, this.defaultTags);

        variants.forEach(([name, props, tags]) => {
            this.addScenario(name, props, (builder) => {
                /*
                 * Customizer MAY specify that particular scenarios should have certain tags.
                 *
                 * If customizer returns non-null, non-undefined tags, they are applied as-is.
                 */
                if (tags) {
                    builder.withTags(...tags);
                }

                return m(builder);
            });
        });

        return this;
    }

    /**
     * Configures how to do visual regression tests for scenarios in this group.
     *
     * @param config - instance of config, will be used as is, will replace any existing config.
     */
    public withVisualTestConfig(config: VisualTestConfiguration): ScenarioGroup<T> {
        this.testConfig.visual = config;

        return this;
    }

    /**
     * Given another scenario group, this method will take all the scenarios from the other group and add
     * them into this group. The scenario customizer & scenario modifications will be applied for each scenario.
     *
     * This can be used to copy & modify scenarios, or to multiply scenarios for different variants. All depends
     * on the implementation of the customizer function.
     */
    public addCustomizedScenarios(
        fromGroup: ScenarioGroup<T>,
        customizer: ScenarioCustomizer<T> = copyCustomizer,
        m: ScenarioModification<T> = identity,
    ): ScenarioGroup<T> {
        fromGroup.scenarioList.forEach((scenario) => {
            this.addScenarios(scenario.name, scenario.props, customizer, m);
        });

        return this;
    }

    /**
     * Filters scenarios by types of tests that should be run on top of them. This is immutable, the original
     * instance is left unfiltered and a copy of filtered scenarios is returned.
     *
     * @param testTypes - test types to filter scenarios by, only those test cases that specify to be tested by one
     *   of these test types will be returned
     * @returns always new instance, may contain no scenarios
     */
    public forTestTypes = (...testTypes: TestTypes[]): ScenarioGroup<T> => {
        const filtered = new ScenarioGroup(this.vis, this.component);

        this.scenarioList.forEach((u) => {
            if (intersection(u.tests, testTypes).length > 0) {
                filtered.insertScenario(u);
            }
        });

        return filtered;
    };

    /**
     * Transform scenarios for this component to an inputs for parameterized Jest tests.
     */
    public asTestInput = (): Array<ScenarioTestInput<T>> => {
        return this.scenarioList.map((scenario) => scenario.asTestInput());
    };

    /**
     * Transform scenarios in this group into a list of tuples where first member is scenario name and
     * the second is the entire scenario.
     */
    public asScenarioDescAndScenario = (): Array<ScenarioAndDescription<T>> => {
        return this.scenarioList.map((scenario) => [scenario.name, scenario]);
    };

    /**
     * @returns true if no scenarios in the group
     */
    public isEmpty = (): boolean => {
        return this.scenarioList.length === 0;
    };

    /**
     * @returns list of scenarios in the group; may be empty
     */
    public asScenarioList = (): Array<IScenario<T>> => {
        return [...this.scenarioList];
    };

    private insertScenario(scenario: IScenario<T>): void {
        this.scenarioIndex[scenario.name] = scenario;
        this.scenarioList.push(scenario);
    }
}

/**
 * Start defining scenarios for a component that is realized using the provided React component..
 *
 * @param chart - chart name
 * @param component - chart renderer, a function that transforms chart props to a JSX.Element
 */
export function scenariosFor<T extends VisProps>(
    chart: string,
    component: React.ComponentType<T>,
): ScenarioGroup<T> {
    return new ScenarioGroup(chart, component);
}

//
// Supporting types
//
type ScenarioSet<T extends VisProps> = { [name: string]: IScenario<T> };

/**
 * Configuration for visual tests in included in a scenario group
 */
export type VisualTestConfiguration = {
    /**
     * Specifies size of the screenshot to take for visual regression
     */
    screenshotSize?: {
        width: number;
        height: number;
    };

    /**
     * Specify that visual scenarios in the scenario group should be visually grouped into a single
     * story of this name. If this happens, then the scenario name will be used as caption above particular
     * screenshot.
     */
    groupUnder?: string;
};

/**
 * Configuration for tests in a scenario group. Only visual tests need configuration at the moment.
 */
export type TestConfiguration = {
    visual: VisualTestConfiguration;
};

/**
 * ScenarioCustomizers can be used in ScenarioGroup's addScenarios() method as a way to conveniently
 * create multiple variants from a single 'base' scenario. Given base name, props and tags the customizer
 * returns an array of 0 to N customized scenarios. Those are then added to the group.
 *
 * For each customized scenario, the function MUST return name and props. Optionally, it MAY also include
 * custom tags for the scenario. If the tags are not specified (null or undefined) then nothing is done
 * in regards to the tags and so scenario will inherit default tags from the scenario group. Otherwise the
 * array of tags is used as-is (with empty array effectively clearing up any inherited defaults).
 */
export type ScenarioCustomizer<T extends VisProps> = (
    baseName: string,
    baseProps: UnboundVisProps<T>,
    baseTags: ScenarioTag[],
) => Array<CustomizedScenario<T>>;
export type CustomizedScenario<T extends VisProps> = [string, UnboundVisProps<T>, ScenarioTag[]?];

/**
 * Scenario customer that only creates a new copy of the input scenario.
 *
 * @param baseName - input scenario base name, will be kept as is
 * @param baseProps - input scenario props, will be copied
 * @param baseTags - input scenario base tags, will be copied
 */
export function copyCustomizer<T extends VisProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
    baseTags: ScenarioTag[],
): Array<CustomizedScenario<T>> {
    return [[baseName, cloneDeep(baseProps), cloneDeep(baseTags)]];
}

/**
 * Creates scenario customizer, which will create 1-1 new scenario with same name and modified props
 *
 * @param modify - props modification function, this will receive deep copy of the original props, it is
 *  thus no problem to mutate the props if that is simpler
 */
export function copyWithModifiedProps<T extends VisProps>(
    modify: (props: UnboundVisProps<T>) => UnboundVisProps<T>,
): ScenarioCustomizer<T> {
    return (baseName: string, baseProps: UnboundVisProps<T>, baseTags: ScenarioTag[]) => {
        return [[baseName, modify(cloneDeep(baseProps)), cloneDeep(baseTags)]];
    };
}
