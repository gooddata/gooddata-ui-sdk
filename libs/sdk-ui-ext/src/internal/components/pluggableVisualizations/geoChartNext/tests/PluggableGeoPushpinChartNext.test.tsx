// (C) 2025 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    IInsightDefinition,
    newAttribute,
    newBucket,
    newInsightDefinition,
    newMeasure,
} from "@gooddata/sdk-model";
import { BucketNames, GeoLocationMissingSdkError } from "@gooddata/sdk-ui";

import { IVisConstruct } from "../../../../interfaces/Visualization.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import { PluggableGeoPushpinChartNext } from "../PluggableGeoPushpinChartNext.js";

const PROJECT_ID = "PROJECTID";
const visualizationUrl = "local:pushpin";

describe("PluggableGeoPushpinChartNext", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();

    const backend = dummyBackend();
    const executionFactory = backend.workspace(PROJECT_ID).execution();

    function createComponent(onError = vi.fn()) {
        const props: IVisConstruct = {
            projectId: PROJECT_ID,
            element: () => mockElement,
            configPanelElement: () => mockConfigElement,
            callbacks: {
                afterRender: () => {},
                pushData: () => {},
                onError,
            },
            backend,
            visualizationProperties: {},
            renderFun: mockRenderFun,
            messages,
        } as unknown as IVisConstruct;

        return { visualization: new PluggableGeoPushpinChartNext(props), onError };
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    const insightWithoutLocation: IInsightDefinition = newInsightDefinition(visualizationUrl, (builder) =>
        builder.title("no location").buckets([newBucket(BucketNames.SIZE, newMeasure("m1"))]),
    );

    const insightWithLocation: IInsightDefinition = newInsightDefinition(visualizationUrl, (builder) =>
        builder.title("with location").buckets([
            newBucket(
                BucketNames.LOCATION,
                newAttribute("attr.region", (attribute) => attribute.localId("a1")),
            ),
            newBucket(BucketNames.SIZE, newMeasure("m1")),
        ]),
    );

    it("should surface GeoLocationMissingSdkError when location bucket is empty", () => {
        const onError = vi.fn();
        const { visualization } = createComponent(onError);

        visualization.update({ messages }, insightWithoutLocation, {}, executionFactory);

        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(expect.any(GeoLocationMissingSdkError));
    });

    it("should proceed without errors when location bucket is present", () => {
        const onError = vi.fn();
        const { visualization } = createComponent(onError);

        expect(() =>
            visualization.update({ messages }, insightWithLocation, {}, executionFactory),
        ).not.toThrow();

        expect(onError).not.toHaveBeenCalled();
    });
});
