// (C) 2023 GoodData Corporation
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { IInsightDefinition, newMeasure } from "@gooddata/sdk-model";
import { BucketNames, DefaultLocale } from "@gooddata/sdk-ui";

import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import HeadlineConfigurationPanel from "../HeadlineConfigurationPanel.js";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent.js";
import * as ComparisonSection from "../../configurationControls/comparison/ComparisonSection.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { HeadlineControlProperties } from "../../../interfaces/ControlProperties.js";
import { createTestProperties, newInsight } from "../../../tests/testDataProvider.js";

describe("HeadlineComparisonPanel", () => {
    const mockPushData = vi.fn();

    const mockComparisonSection = () => vi.spyOn(ComparisonSection, "default");

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
            expect.anything(),
        );
    });

    it("should disabled comparison section when control is disabled", () => {
        const MockComparisonSection = mockComparisonSection();
        renderHeadlineComparisonPanel({ insight: newInsight([]) });
        expect(MockComparisonSection).toHaveBeenCalledWith(
            expect.objectContaining({
                controlDisabled: true,
            }),
            expect.anything(),
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
            expect.anything(),
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
            expect.anything(),
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
            expect.anything(),
        );
    });
});
