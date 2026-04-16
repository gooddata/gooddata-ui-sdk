// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "../../../../test/render.js";
import { UiTabs } from "../UiTabs.js";

const requiredProps = {
    tabs: [{ id: "1", label: "Tab 1" }],
    selectedTabId: "1",
    onTabSelect: () => {},
};

describe("UiTabs", () => {
    it("should support double-clicking on tabs", async () => {
        const onTabDoubleClick = vi.fn(() => {});
        const { user } = render(
            <UiTabs
                {...requiredProps}
                tabs={[
                    { id: "100", label: "Tab 1" },
                    { id: "200", label: "Tab 2" },
                ]}
                selectedTabId="100"
                onTabDoubleClick={onTabDoubleClick}
            />,
        );

        await user.dblClick(screen.getByRole("tab", { name: "Tab 2" }));

        expect(onTabDoubleClick).toHaveBeenCalledTimes(1);
        expect(onTabDoubleClick).toHaveBeenCalledWith({ id: "200", label: "Tab 2" });
    });
});
