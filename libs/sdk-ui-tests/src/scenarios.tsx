// (C) 2007-2019 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IBucketChartProps, IPivotTableProps } from "@gooddata/sdk-ui";
import React from "react";
import invariant from "ts-invariant";
import identity = require("lodash/identity");
import intersection = require("lodash/intersection");
import isEmpty = require("lodash/isEmpty");

//
// Base types
//

export type VisProps = IPivotTableProps | IBucketChartProps;
export type UnboundVisProps<T extends VisProps> = Omit<T, "backend" | "workspace">;
export type UnboundVisPropsCustomizer<T extends VisProps> = (
    baseName: string,
    baseProps: UnboundVisProps<T>,
) => Array<[string, UnboundVisProps<T>]>;
export type ScenarioNameAndProps<T extends VisProps> = [string, UnboundVisProps<T>];
export type PropsFactory<T extends VisProps> = (backend: IAnalyticalBackend, workspace: string) => T;

//
// Single scenario
//

/**
 *
 */
export type TestTypes = "api" | "visual";

/**
 * Tags that are significant for the infrastructure.
 *
 * -  "vis-config-only" - indicates the purpose of the scenario is to exercise various visual configurations
 * -  "mock-no-scenario-meta' - indicates that the capture & mock handling tooling should not include the
 *    tagged scenario in the execution's scenario meta, thus ensuring that the scenario does not appear
 *    in the Scenarios mapping in recording index
 *
 * - "mock-no-insight" - indicates that the capture & mock handling tooling should not create insight for
 *   the tagged scenario.
 */
export type SignificantTags = "vis-config-only" | "mock-no-scenario-meta" | "mock-no-insight";

export type ScenarioTag = SignificantTags | string;

/**
 * View on test scenario that can be used as input to parameterized tests.
 *
 * First element: name of the test scenario
 * Second element: react component type
 * Third element: factory to create props for the react component
 * Fourth element: scenario tags
 *
 * Having this as array is essential for parameterized jest tests in order for jest to correctly name the
 * test suite / test case.
 */
export type ScenarioTestInput<T extends VisProps> = [
    string,
    React.ComponentType<T>,
    PropsFactory<T>,
    ScenarioTag[],
];

/**
 * Enum with indexes into scenario test input array.
 */
export enum ScenarioTestMembers {
    ScenarioName = 0,
    Component = 1,
    PropsFactory = 2,
    Tags = 3,
}

export interface IScenario<T extends VisProps> {
    name: string;
    props: UnboundVisProps<T>;
    tags: ScenarioTag[];
    tests: TestTypes[];

    propsFactory: PropsFactory<T>;
}

export type ScenarioModification<T extends IBucketChartProps> = (m: ScenarioBuilder<T>) => ScenarioBuilder<T>;

export class ScenarioBuilder<T extends VisProps> {
    private tags: ScenarioTag[] = [];
    private tests: TestTypes[] = ["api", "visual"];

    constructor(private readonly name: string, private readonly props: UnboundVisProps<T>) {}

    /**
     * Sets tags for this scenario. This will override any tags that may be specified on the scenario group
     * to which this scenario belongs. Passing no flags means the scenario will have none.
     *
     * @param tags - tags to assign, may be undefined or empty if no flags desired
     */
    public withTags(...tags: ScenarioTag[]): ScenarioBuilder<T> {
        this.tags = !isEmpty(tags) ? tags : [];

        return this;
    }

    public withTests(...tests: TestTypes[]): ScenarioBuilder<T> {
        this.tests = !isEmpty(tests) ? tests : [];

        return this;
    }

    public build = (): IScenario<T> => {
        const props = this.props;

        return {
            name: this.name,
            props,
            tags: this.tags,
            tests: this.tests,
            propsFactory: (backend, workspace) => {
                // typescript won't let this fly without explicit casts; it is safe in this circumstance. see
                // UnboundChartProps.. whatever subtype, we always omit just backend and workspace that are
                // filled in during this factory call
                return ({
                    ...props,
                    backend,
                    workspace,
                } as any) as T;
            },
        };
    };
}

//
// Scenario groups
//

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

type ScenarioSet<T extends VisProps> = { [name: string]: IScenario<T> };

export interface IScenarioGroup<T extends VisProps> {
    /**
     * Human readable name of the visualization for which there are scenarios
     */
    readonly vis: string;

    /**
     * React component that realizes the visualization.
     */
    readonly component: React.ComponentType<T>;

    readonly scenarioList: ReadonlyArray<IScenario<T>>;
    readonly testConfig: TestConfiguration;
}

export class ScenarioGroup<T extends VisProps> implements IScenarioGroup<T> {
    public scenarioList: Array<IScenario<T>> = [];
    public testConfig: TestConfiguration = { visual: {} };
    private scenarioIndex: ScenarioSet<T> = {};
    private defaultTags: ScenarioTag[] = [];

    constructor(public readonly vis: string, public readonly component: React.ComponentType<T>) {}

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

        const builder = new ScenarioBuilder<T>(name, props);
        builder.withTags(...this.defaultTags);
        this.insertScenario(m(builder).build());

        return this;
    }

    /**
     * Adds multiple test scenarios; given base name & props of the scenario this method will use the
     * provided customizer function to expand base into multiple contrete scenarios. It then adds those
     * one-by-one.
     *
     * @param baseName - base name for the scenario variants
     * @param baseProps - base props for the scenario variants
     * @param customizer - function to expand base name & props into multiple variants
     * @param m - modifications to apply on each scenario
     */
    public addScenarios(
        baseName: string,
        baseProps: UnboundVisProps<T>,
        customizer: UnboundVisPropsCustomizer<T>,
        m: ScenarioModification<T> = identity,
    ): ScenarioGroup<T> {
        const variants = customizer(baseName, baseProps);

        variants.forEach(([name, props]) => {
            this.addScenario(name, props, m);
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
     * Filters scenarios by types of tests that should be run on top of them. This is immutable, the original
     * instance is left unfiltered and a copy of filtered scenarios is returned.
     *
     * @param testTypes - test types to filter scenarios by, only those test cases that specify to be tested by one
     *   of these test types will be returned
     * @returns always new instance, may contain no scenarios
     */
    public forTestTypes = (...testTypes: TestTypes[]): ScenarioGroup<T> => {
        const filtered = new ScenarioGroup(this.vis, this.component);

        this.scenarioList.forEach(u => {
            if (intersection(u.tests, testTypes).length > 0) {
                filtered.insertScenario(u);
            }
        });

        return filtered;
    };

    /**
     * Transform scenarios for this component to an inputs for parameterized snapshot or visualization regression tests.
     * Each test scenario is represented by array of three elements:
     *
     * -  name that should be used in the test - derived from the scenario name
     * -  react component realizing the respective visualization
     * -  props factory for the react component
     *
     * It is then the responsibility of the test code to instantiate and use the component in the way it
     * sees fit.
     */
    public asTestInput = (): Array<ScenarioTestInput<T>> => {
        return this.scenarioList.map(u => {
            return [u.name, this.component, u.propsFactory, u.tags];
        });
    };

    public isEmpty = (): boolean => {
        return this.scenarioList.length === 0;
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
