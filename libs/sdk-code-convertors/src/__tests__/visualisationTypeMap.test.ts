// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    visualizationUrlToYamlVisType,
    yamlVisTypeToVisualizationUrl,
} from "../utils/visualisationTypeMap.js";

describe("visualisationTypeMap", () => {
    it("maps chart types to visualization urls bijectively", () => {
        // A duplicated url would make the inverted Map silently drop the earlier chart type.
        expect(visualizationUrlToYamlVisType.size).toBe(Object.keys(yamlVisTypeToVisualizationUrl).length);
    });
});
