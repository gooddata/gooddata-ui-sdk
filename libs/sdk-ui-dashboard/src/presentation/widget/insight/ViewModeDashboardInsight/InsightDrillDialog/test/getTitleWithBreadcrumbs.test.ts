// (C) 2021-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { getTitleWithBreadcrumbs } from "../getTitleWithBreadcrumbs.js";

describe("getTitleWithBreadcrumbs", () => {
    it("should return just title with empty breadcrumbs", () => {
        const insightTitle = "foo";
        const breadcrumbs: string[] = [];

        expect(getTitleWithBreadcrumbs(insightTitle, breadcrumbs)).toEqual("foo");
    });

    it("should return title joined with breadcrumbs if they are not empty", () => {
        const insightTitle = "foo";
        const breadcrumbs = ["bar", "baz"];

        expect(getTitleWithBreadcrumbs(insightTitle, breadcrumbs)).toEqual("foo \u203A bar \u203A baz");
    });

    it("should skip empty breadcrumb parts", () => {
        const insightTitle = "foo";
        const breadcrumbs = ["bar", "", "baz", ""];

        expect(getTitleWithBreadcrumbs(insightTitle, breadcrumbs)).toEqual("foo \u203A bar \u203A baz");
    });
});
