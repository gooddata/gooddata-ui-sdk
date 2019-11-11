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

export type PropsFactory<T extends VisProps> = (backend: IAnalyticalBackend, workspace: string) => T;

//
// Single use case
//

/**
 *
 */
export type TestTypes = "api" | "visual";

export type SignificantTags = "customConfig";
export type UseCaseTags = SignificantTags | string;

export interface IScenario<T extends VisProps> {
    name: string;
    props: UnboundVisProps<T>;
    tags: UseCaseTags[];
    tests: TestTypes[];

    propsFactory: PropsFactory<T>;
}

export type ScenarioModification<T extends IBucketChartProps> = (m: ScenarioBuilder<T>) => ScenarioBuilder<T>;

export class ScenarioBuilder<T extends VisProps> {
    private tags: UseCaseTags[] = [];
    private tests: TestTypes[] = ["api", "visual"];

    constructor(private readonly name: string, private readonly props: UnboundVisProps<T>) {}

    public withTags(...tags: UseCaseTags[]): ScenarioBuilder<T> {
        if (!isEmpty(tags)) {
            this.tags = tags;
        }

        return this;
    }

    public withTests(...tests: TestTypes[]): ScenarioBuilder<T> {
        if (!isEmpty(tests)) {
            this.tests = tests;
        }

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
// Use cases for visualization
//

export type ScenarioSet<T extends VisProps> = { [name: string]: IScenario<T> };

export interface IScenariosForComponent<T extends VisProps> {
    readonly vis: string;
    readonly component: React.ComponentType<T>;
    readonly scenarioList: ReadonlyArray<IScenario<T>>;
}

export class ScenariosForComponent<T extends VisProps> implements IScenariosForComponent<T> {
    public scenarioList: Array<IScenario<T>> = [];
    private scenarioIndex: ScenarioSet<T> = {};

    constructor(public readonly vis: string, public readonly component: React.ComponentType<T>) {}

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
    ): ScenariosForComponent<T> {
        const exists = this.scenarioIndex[name];

        invariant(!exists, `contract "${name}" for ${this.vis} already exists`);

        const builder = new ScenarioBuilder<T>(name, props);

        this.insertScenario(m(builder).build());

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
    public forTestTypes = (...testTypes: TestTypes[]): ScenariosForComponent<T> => {
        const filtered = new ScenariosForComponent(this.vis, this.component);

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
    public asTestInput = (): Array<[string, React.ComponentType<T>, PropsFactory<T>]> => {
        return this.scenarioList.map(u => {
            return [u.name, this.component, u.propsFactory];
        });
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
): ScenariosForComponent<T> {
    return new ScenariosForComponent(chart, component);
}
