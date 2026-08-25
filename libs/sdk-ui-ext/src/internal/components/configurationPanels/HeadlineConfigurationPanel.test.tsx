// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { type IInsightDefinition, newMeasure } from "@gooddata/sdk-model";
import { BucketNames, DefaultLocale } from "@gooddata/sdk-ui";

import { type HeadlineControlProperties } from "../../interfaces/ControlProperties.js";
import { type IVisualizationProperties } from "../../interfaces/Visualization.js";
import { createTestProperties, newInsight } from "../../testDataProvider.js";
import { InternalIntlWrapper } from "../../utils/internalIntlProvider.js";
import type * as ComparisonSectionModule from "../configurationControls/comparison/ComparisonSection.js";

import { type IConfigurationPanelContentProps } from "./ConfigurationPanelContent.js";
import type * as HeadlineConfigurationPanelModule from "./HeadlineConfigurationPanel.js";

vi.mock("../configurationControls/comparison/ComparisonSection.js", async (importOriginal) => {
    const actual =
        // oxlint-disable-next-line @typescript-eslint/consistent-type-imports
        await importOriginal<typeof import("../configurationControls/comparison/ComparisonSection.js")>();
    return {
        ...actual,
        ComparisonSection: vi.fn(actual.ComparisonSection),
    };
});

/*
 * Test isolation is disabled for this package, so the module cache is shared between test files:
 * HeadlineConfigurationPanel.js may already have been evaluated - bound to the real ComparisonSection - by
 * another test file, and the mocked graph this file builds must not outlive it. Re-import both modules up
 * front so this file always observes the mocked one, and drop the mocked graph again on the way out.
 */
let ComparisonSection: typeof ComparisonSectionModule.ComparisonSection;
let HeadlineConfigurationPanel: typeof HeadlineConfigurationPanelModule.HeadlineConfigurationPanel;

beforeAll(async () => {
    vi.resetModules();
    ({ ComparisonSection } = await import("../configurationControls/comparison/ComparisonSection.js"));
    ({ HeadlineConfigurationPanel } = await import("./HeadlineConfigurationPanel.js"));
});

afterAll(() => {
    vi.resetModules();
});

describe("HeadlineComparisonPanel", () => {
    const mockPushData = vi.fn();

    const mockComparisonSection = () => vi.mocked(ComparisonSection);

    const DEFAULT_PROPERTIES = createTestProperties<HeadlineControlProperties>({
        comparison: { enabled: true },
    });

    const DEFAULT_PROPS: IConfigurationPanelContentProps = {
        isError: false,
        isLoading: false,
        locale: DefaultLocale,
        pushData: mockPushData,
        properties: DEFAULT_PROPERTIES,
        propertiesMeta: {},
        insight: newInsight(
            [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [newMeasure("measure-1")],
                },
            ],
            { properties: DEFAULT_PROPERTIES },
        ),
    };

    const renderHeadlineComparisonPanel = (params?: {
        insight?: IInsightDefinition;
        properties?: IVisualizationProperties<HeadlineControlProperties>;
    }) => {
        const props = {
            ...DEFAULT_PROPS,
            properties: createTestProperties<HeadlineControlProperties>({ comparison: { enabled: true } }),
            ...params,
        };

        return render(
            <InternalIntlWrapper>
                <HeadlineConfigurationPanel {...props} />
            </InternalIntlWrapper>,
        );
    };

    it("should render comparison section", () => {
        const MockComparisonSection = mockComparisonSection();
        renderHeadlineComparisonPanel();

        expect(MockComparisonSection).toHaveBeenCalledWith(
            expect.objectContaining({
                properties: DEFAULT_PROPERTIES,
                pushData: mockPushData,
            }),
            undefined,
        );
    });

    it("should disabled comparison section when control is disabled", () => {
        const MockComparisonSection = mockComparisonSection();
        renderHeadlineComparisonPanel({ insight: newInsight([]) });
        expect(MockComparisonSection).toHaveBeenCalledWith(
            expect.objectContaining({
                controlDisabled: true,
            }),
            undefined,
        );
    });

    it("should disabled comparison section when bucket have 1 primary measure", () => {
        const MockComparisonSection = mockComparisonSection();

        renderHeadlineComparisonPanel();
        expect(MockComparisonSection).toHaveBeenCalledWith(
            expect.objectContaining({
                controlDisabled: false,
                disabledByVisualization: true,
            }),
            undefined,
        );
    });

    it("should disabled comparison section when bucket have 1 primary measure and 2 secondary measures", () => {
        const MockComparisonSection = mockComparisonSection();

        const buckets = [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [newMeasure("measure-1")],
            },
            {
                localIdentifier: BucketNames.SECONDARY_MEASURES,
                items: [newMeasure("measure-2"), newMeasure("measure-3")],
            },
        ];

        renderHeadlineComparisonPanel({ insight: newInsight(buckets) });
        expect(MockComparisonSection).toHaveBeenCalledWith(
            expect.objectContaining({
                controlDisabled: false,
                disabledByVisualization: true,
            }),
            undefined,
        );
    });

    it("should enabled comparison section when bucket have 1 primary measure and 1 secondary measure", () => {
        const MockComparisonSection = mockComparisonSection();

        const buckets = [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [newMeasure("measure-1")],
            },
            {
                localIdentifier: BucketNames.SECONDARY_MEASURES,
                items: [newMeasure("measure-2")],
            },
        ];

        renderHeadlineComparisonPanel({ insight: newInsight(buckets) });
        expect(MockComparisonSection).toHaveBeenCalledWith(
            expect.objectContaining({
                controlDisabled: false,
                disabledByVisualization: false,
            }),
            undefined,
        );
    });
});
