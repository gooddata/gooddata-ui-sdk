// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";

import { type IAddableParameter, useParameterDropdownItems } from "./useParameterDropdownItems.js";

function parameter(
    id: string,
    title: string,
    isFromDashboard: boolean,
    tags: string[] = [],
): IAddableParameter {
    return { ref: idRef(id, "parameter"), title, isFromDashboard, tags };
}

function render(parameters: IAddableParameter[], searchQuery = "") {
    return renderHook(() => useParameterDropdownItems({ parameters, searchQuery }), { wrapper: IntlWrapper })
        .result.current;
}

function shape(items: ReturnType<typeof render>) {
    return items.map((item) => {
        if (item.type === "parameter") {
            return item.ref.identifier;
        }
        return item.type === "header" ? `# ${item.title}` : "---";
    });
}

const dealSize = parameter("dealSize", "Minimum Deal Size", true, ["sales"]);
const churn = parameter("churn", "Churn Risk", false, ["retention", "kpi"]);
const window = parameter("window", "Attribution Window", false);

describe("useParameterDropdownItems", () => {
    it("lists dashboard parameters first, then tag groups with ungrouped last", () => {
        expect(shape(render([window, churn, dealSize]))).toEqual([
            "# From dashboard",
            "dealSize",
            "---",
            "# kpi",
            "churn",
            "# retention",
            "churn",
            "# sales",
            "dealSize",
            "# Ungrouped",
            "window",
        ]);
    });

    it("omits the dashboard section and separator when no parameter is from the dashboard", () => {
        expect(shape(render([churn, window]))).toEqual([
            "# kpi",
            "churn",
            "# retention",
            "churn",
            "# Ungrouped",
            "window",
        ]);
    });

    it("sorts dashboard parameters by title", () => {
        const second = parameter("second", "Beta", true);
        const first = parameter("first", "Alpha", true);

        expect(shape(render([second, first])).slice(0, 3)).toEqual(["# From dashboard", "first", "second"]);
    });

    it("filters by title before grouping, dropping groups that empty", () => {
        expect(shape(render([window, churn, dealSize], "win"))).toEqual(["# Ungrouped", "window"]);
    });

    it("keeps the dashboard section and the tag group when only a dashboard parameter matches", () => {
        expect(shape(render([window, churn, dealSize], "DEAL"))).toEqual([
            "# From dashboard",
            "dealSize",
            "---",
            "# sales",
            "dealSize",
        ]);
    });

    it("returns nothing when no parameter matches", () => {
        expect(render([window, churn, dealSize], "zzz")).toEqual([]);
    });
});
