// (C) 2021 GoodData Corporation
import { getTitleWithBreadcrumbs } from "../getTitleWithBreadcrumbs.js";
import { describe, it, expect } from "vitest";

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
