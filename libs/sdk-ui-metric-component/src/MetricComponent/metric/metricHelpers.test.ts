// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { prepareMetricForSaveAs } from "./metricHelpers.js";

const unchangedProperties = {
    type: "measure",
    description: "description",
    format: "format",
    expression: "expression",
    tags: ["Tag"],
};

const metricCurrent = {
    id: "metric",
    title: "Metric",
    ...unchangedProperties,
} as IMeasureMetadataObject;

describe("prepareMetricForSaveAs", () => {
    it("should generate new title and id for unchanged metric", () => {
        const { metric, updatedFields } = prepareMetricForSaveAs(metricCurrent, metricCurrent, [
            metricCurrent,
        ]);
        expect(metric).toEqual({
            title: "Metric (2)",
            id: "metric_2",
            ...unchangedProperties,
        });

        expect(updatedFields).toEqual({
            title: true,
            id: true,
        });
    });

    it("should generate new title and preserve id when is changed", () => {
        const { metric, updatedFields } = prepareMetricForSaveAs(
            metricCurrent,
            { ...metricCurrent, id: "changed_id" },
            [metricCurrent],
        );

        expect(metric).toEqual({
            title: "Metric (2)",
            id: "changed_id",
            ...unchangedProperties,
        });

        expect(updatedFields).toEqual({
            title: true,
            id: false,
        });
    });

    it("should generate new id by changed title and preserve id when is changed", () => {
        const { metric, updatedFields } = prepareMetricForSaveAs(
            metricCurrent,
            {
                ...metricCurrent,
                title: "New title",
            },
            [metricCurrent],
        );

        expect(metric).toEqual({
            title: "New title",
            id: "new_title",
            ...unchangedProperties,
        });

        expect(updatedFields).toEqual({
            title: false,
            id: true,
        });
    });

    it("should preserve title and id when is changed", () => {
        const { metric, updatedFields } = prepareMetricForSaveAs(
            metricCurrent,
            {
                ...metricCurrent,
                title: "New title",
                id: "new_id",
            },
            [metricCurrent],
        );

        expect(metric).toEqual({
            title: "New title",
            id: "new_id",
            ...unchangedProperties,
        });

        expect(updatedFields).toEqual({
            title: false,
            id: false,
        });
    });

    it("with prefix, should generate new title and id for unchanged metric", () => {
        const { metric, updatedFields } = prepareMetricForSaveAs(
            metricCurrent,
            metricCurrent,
            [metricCurrent],
            "prefix.",
        );
        expect(metric).toEqual({
            title: "Metric (2)",
            id: "prefix.metric_2",
            ...unchangedProperties,
        });

        expect(updatedFields).toEqual({
            title: true,
            id: true,
        });
    });

    it("with prefix, should generate new title and preserve id when is changed", () => {
        const { metric, updatedFields } = prepareMetricForSaveAs(
            metricCurrent,
            { ...metricCurrent, id: "changed_id" },
            [metricCurrent],
            "prefix.",
        );

        expect(metric).toEqual({
            title: "Metric (2)",
            id: "prefix.changed_id",
            ...unchangedProperties,
        });

        expect(updatedFields).toEqual({
            title: true,
            id: false,
        });
    });

    it("with prefix, should generate new id by changed title and preserve id when is changed", () => {
        const { metric, updatedFields } = prepareMetricForSaveAs(
            metricCurrent,
            {
                ...metricCurrent,
                title: "New title",
            },
            [metricCurrent],
            "prefix.",
        );

        expect(metric).toEqual({
            title: "New title",
            id: "prefix.new_title",
            ...unchangedProperties,
        });

        expect(updatedFields).toEqual({
            title: false,
            id: true,
        });
    });

    it("with prefix, should preserve title and id when is changed", () => {
        const { metric, updatedFields } = prepareMetricForSaveAs(
            metricCurrent,
            {
                ...metricCurrent,
                title: "New title",
                id: "new_id",
            },
            [metricCurrent],
            "prefix.",
        );

        expect(metric).toEqual({
            title: "New title",
            id: "prefix.new_id",
            ...unchangedProperties,
        });

        expect(updatedFields).toEqual({
            title: false,
            id: false,
        });
    });

    it("with prefix, parents, should preserve title and id when is changed", () => {
        const { metric, updatedFields } = prepareMetricForSaveAs(
            {
                ...metricCurrent,
            },
            {
                ...metricCurrent,
                title: "Parent",
            },
            [
                {
                    ...metricCurrent,
                },
            ],
            "",
            ["parent"],
        );

        expect(metric).toEqual({
            title: "Parent",
            id: "1_parent",
            ...unchangedProperties,
        });

        expect(updatedFields).toEqual({
            title: false,
            id: true,
        });
    });

    it("with prefix, remove and add prefix", () => {
        const { metric, updatedFields } = prepareMetricForSaveAs(
            {
                ...metricCurrent,
                prefix: "custom",
            },
            {
                ...metricCurrent,
                id: "custommetric22",
            },
            [],
            "custom",
        );

        expect(metric).toEqual({
            title: "Metric",
            id: "custommetric22",
            ...unchangedProperties,
        });

        expect(updatedFields).toEqual({
            title: true,
            id: false,
        });
    });
});
