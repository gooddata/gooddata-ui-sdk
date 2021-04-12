// (C) 2007-2019 GoodData Corporation
import identity from "lodash/identity";
import isEmpty from "lodash/isEmpty";
import React from "react";
import SparkMD5 from "spark-md5";
import { IAnalyticalBackend, ISettings } from "@gooddata/sdk-backend-spi";
import { IBucketChartProps } from "@gooddata/sdk-ui-charts";
import { IPivotTableProps } from "@gooddata/sdk-ui-pivot";
import { IInsight } from "@gooddata/sdk-model";
import { IExecuteProps } from "@gooddata/sdk-ui";
import { IGeoPushpinChartProps } from "@gooddata/sdk-ui-geo";
import { DataViewRequests } from "@gooddata/mock-handling";

export type VisProps = IPivotTableProps | IBucketChartProps | IExecuteProps | IGeoPushpinChartProps;
export type UnboundVisProps<T extends VisProps> = Omit<T, "backend" | "workspace">;
export type PropsFactory<T extends VisProps> = (backend: IAnalyticalBackend, workspace: string) => T;
export type InsightConverter = (defaultInsight: IInsight) => IInsight;

/**
 * Supported test types.
 *
 * -  API tests - headless tests which verify that public API of the component leads to consistent calls
 *   to backend & consistent renders of the chart
 *
 * -  Visual regression tests - test scenario is fully rendered and is compared on screenshot level against reference
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
 *
 * - "no-plug-viz-tests" - this tag will skip generate stories for Pluggable visualization (04 Stories For Pluggable Vis section)
 */
export type SignificantTags =
    | "vis-config-only"
    | "mock-no-scenario-meta"
    | "mock-no-insight"
    | "no-plug-viz-tests";
export type ScenarioTag = SignificantTags | string;

export type WorkspaceType = "reference-workspace" | "live-examples-workspace" | "experimental-workspace";

/**
 * Fully describes a test scenario for particular visualization.
 */
export interface IScenario<T extends VisProps> {
    /**
     * Visualization name
     */
    readonly vis: string;

    /**
     * Test scenario name. Note that this is just a display name and as such should not be used
     * where for instance name uniqueness in necessary.
     */
    readonly name: string;

    /**
     * Scenario group name.
     */
    readonly groupName: string[];

    /**
     * Fully qualified test scenario name. This is the unique scenario name.
     */
    readonly fullyQualifiedName: string;

    /**
     * Props not yet bound to any backend or workspace (not known at test scenario creation time)
     */
    readonly props: UnboundVisProps<T>;

    /**
     * Tags to categorize scenarios; empty if none
     */
    readonly tags: ScenarioTag[];

    /**
     * Tests to apply on the scenario.
     */
    readonly tests: TestTypes[];

    /**
     * React component realizing the scenario
     */
    readonly component: React.ComponentType<T>;

    /**
     * Backend settings to use when testing this scenario.
     */
    readonly backendSettings: ISettings;

    /**
     * Type of test workspace that supplies test data for this scenario.
     */
    readonly workspaceType: WorkspaceType;

    /**
     * Customization of data capture for this scenario. While the data to capture is identified
     * automatically in some rare cases the auto-magic fails:
     *
     * - Table where tests needs more than just the first page. That's because the auto-magic cannot go further than
     * the first request at the moment.
     *
     * Apart from overcoming this limitation, this customization is also useful for capture of custom data for
     * purposes of storing it in reference-workspace and using it in other projects for other types of tests.
     */
    readonly customDataCapture: ScenarioDataCapture;

    /**
     * Props factory which transforms unbound props + backend + workspace => real component props
     */
    readonly propsFactory: PropsFactory<T>;

    /**
     * Identifier that should be used for insight representing this test scenario.
     */
    readonly insightId: string;

    /**
     * Insight conversion hook. The infrastructure is able to create the insight definition automatically; however
     * in rare cases this automatically created definition is not 100% valid. This converter is a place where
     * any custom logic to correct the insight can be placed.
     */
    readonly insightConverter: InsightConverter;

    /**
     * Returns this scenario in an array shape that is suitable as input to parameterized jest tests.
     */
    readonly asTestInput: () => ScenarioTestInput<T>;
}

/**
 * Type from mock-handling that is used to customize what data (all, pages etc) to load.
 */
export type ScenarioDataCapture = DataViewRequests;

export class ScenarioBuilder<T extends VisProps> {
    private tags: ScenarioTag[] = [];
    private tests: TestTypes[] = ["api", "visual"];
    private insightConverter: InsightConverter = identity;
    private workspaceType: WorkspaceType = "reference-workspace";
    private customDataCapture: ScenarioDataCapture = {};
    private backendSettings: ISettings = {};

    constructor(
        private readonly vis: string,
        private readonly component: React.ComponentType<T>,
        private readonly name: string,
        private readonly props: UnboundVisProps<T>,
        private readonly groupName: string[],
    ) {}

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

    public withInsightConverter(converter: InsightConverter): ScenarioBuilder<T> {
        this.insightConverter = converter;

        return this;
    }

    public withBackendSettings(settings: ISettings): ScenarioBuilder<T> {
        this.backendSettings = settings;

        return this;
    }

    /**
     * Optionally customize workspace against which this scenario can run. See {@link WorkspaceType}.
     *
     * If not specified, defaults to reference-workspace.
     *
     * @param type - one of supported workspace types
     */
    public withWorkspaceType(type: WorkspaceType): ScenarioBuilder<T> {
        this.workspaceType = type;

        return this;
    }

    /**
     * Optionally customize data capture parameters for this scenario. Note that the essential data capture parameters
     * are automatically sniffed by the infrastructure. This customization can be used _on top_ of the captures
     * identified automatically.
     *
     * @param config - configuration, as understood by mock-handling
     */
    public withCustomDataCapture(config: ScenarioDataCapture): ScenarioBuilder<T> {
        this.customDataCapture = config;

        return this;
    }

    public build = (): IScenario<T> => {
        const props = this.props;
        const {
            vis,
            name,
            component,
            tags,
            tests,
            insightConverter,
            workspaceType,
            customDataCapture,
            groupName,
            backendSettings,
        } = this;
        const hasher = new SparkMD5();
        const fullyQualifiedName = `${vis} - ${groupName.join("/")} - ${name}`;
        const insightId = `${this.vis}.${hasher.append(fullyQualifiedName).end()}`;
        const propsFactory: PropsFactory<T> = (backend, workspace) => {
            // typescript won't let this fly without explicit casts; it is safe in this circumstance. see
            // UnboundChartProps.. whatever subtype, we always omit just backend and workspace that are
            // filled in during this factory call
            return ({
                ...props,
                backend,
                workspace,
            } as any) as T;
        };

        return {
            vis,
            name,
            props,
            tags,
            tests,
            component,
            workspaceType,
            propsFactory,
            insightId,
            insightConverter,
            customDataCapture,
            groupName,
            fullyQualifiedName,
            backendSettings,
            asTestInput: (): ScenarioTestInput<T> => {
                return [name, component, propsFactory, tags, insightId];
            },
        };
    };
}

export type ScenarioModification<T extends VisProps> = (m: ScenarioBuilder<T>) => ScenarioBuilder<T>;

/**
 * View on test scenario that can be used as input to parameterized tests.
 *
 * First element: name of the test scenario
 * Second element: react component type
 * Third element: factory to create props for the react component
 * Fourth element: scenario tags
 * Fifth element: identifier of the insight which persists this test scenario (buckets, properties and all)
 *
 * Having this as array is essential for parameterized jest tests in order for jest to correctly name the
 * test suite / test case.
 */
export type ScenarioTestInput<T extends VisProps> = [
    string,
    React.ComponentType<T>,
    PropsFactory<T>,
    ScenarioTag[],
    string,
];

/**
 * Enum with indexes into scenario test input array.
 */
export enum ScenarioTestMembers {
    ScenarioName = 0,
    Component = 1,
    PropsFactory = 2,
    Tags = 3,
    InsightId = 4,
}

/**
 * Tuple of scenario description and scenario. Useful when passing to parameterized tests.
 */
export type ScenarioAndDescription<T extends VisProps> = [string, IScenario<T>];
