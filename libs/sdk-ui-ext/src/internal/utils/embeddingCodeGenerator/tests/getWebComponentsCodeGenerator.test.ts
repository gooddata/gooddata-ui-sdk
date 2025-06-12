// (C) 2022-2023 GoodData Corporation
import { IInsight, newInsightDefinition } from "@gooddata/sdk-model";
import { IWebComponentsOptions, getHeightWithUnitsForEmbedCode } from "@gooddata/sdk-ui-kit";
import { getWebComponentsCodeGenerator } from "../getWebComponentsCodeGenerator.js";
import { describe, it, expect, beforeAll } from "vitest";

describe("getWebComponentsCodeGenerator", () => {
    const generateWebComponentSnippet = (config: IWebComponentsOptions) => {
        const mockInsightDefinition = newInsightDefinition("foo");
        const mockInsight: IInsight = {
            insight: {
                identifier: "insightId",
                ref: { uri: "/gdc/insight/uri" },
                uri: "/gdc/insight/uri",
                ...mockInsightDefinition.insight,
                title: "Insight title",
            },
        };
        const height = getHeightWithUnitsForEmbedCode(config) as string;
        return getWebComponentsCodeGenerator("workspaceId", mockInsight, {
            ...config,
            height,
        } as IWebComponentsOptions);
    };

    beforeAll(() => {
        Object.defineProperty(window, "location", {
            value: new URL("https://localhost"),
        });
    });

    it("without any configuration", () => {
        const code = generateWebComponentSnippet({
            type: "webComponents",
            allowLocale: false,
            customHeight: false,
            customTitle: false,
            displayTitle: false,
        });

        expect(code).toMatchSnapshot();
    });

    it("display the insight title", () => {
        const code = generateWebComponentSnippet({
            type: "webComponents",
            allowLocale: false,
            customHeight: false,
            customTitle: false,
            displayTitle: true,
        });

        expect(code).toMatchSnapshot();
    });

    it("display the custom insight title", () => {
        const code = generateWebComponentSnippet({
            type: "webComponents",
            allowLocale: false,
            customHeight: false,
            customTitle: true,
            displayTitle: true,
        });

        expect(code).toMatchSnapshot();
    });

    it("with the locale", () => {
        const code = generateWebComponentSnippet({
            type: "webComponents",
            allowLocale: true,
            locale: "en-US",
            customHeight: false,
            customTitle: true,
            displayTitle: true,
        });

        expect(code).toMatchSnapshot();
    });

    it("with the custom height", () => {
        const code = generateWebComponentSnippet({
            type: "webComponents",
            allowLocale: true,
            locale: "en-US",
            customHeight: true,
            height: "600",
            unit: "px",
            customTitle: true,
            displayTitle: true,
        });

        expect(code).toMatchSnapshot();
    });
});
