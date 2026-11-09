// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { render } from "../../../../test/render.js";
import { insightWithTwoMeasuresAndViewBy } from "../../tests/testMocks.test.helpers.js";

import { LineChartBasedConfigurationPanel } from "./LineChartBasedConfigurationPanel.js";

describe("LineChartBasedConfigurationPanel", () => {
    it("should disable continuous line control when the visualization disables it", async () => {
        const { user } = render(
            <LineChartBasedConfigurationPanel
                insight={insightWithTwoMeasuresAndViewBy}
                panelConfig={{ isContinuousLineControlDisabled: true }}
            />,
        );

        await user.click(screen.getByText("Canvas"));

        expect(screen.getByRole("checkbox", { name: "Continuous line" })).toBeDisabled();
    });
});
