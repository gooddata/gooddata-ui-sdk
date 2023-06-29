// (C) 2022 GoodData Corporation

import { parseUrl } from "../parseUrl.js";
import { describe, expect, it } from "vitest";

describe("parseUrl", () => {
    it("should parse workspaceId from the URL", () => {
        const { workspaceId } = parseUrl("https://somehost.com/components/workspace-id.js");

        expect(workspaceId).toEqual("workspace-id");
    });

    it("should parse workspaceId from the URL query", () => {
        const { workspaceId } = parseUrl(
            "https://somehost.com/components/workspace-id.js?workspace=override",
        );

        expect(workspaceId).toEqual("override");
    });

    it("should parse workspaceId in case it includes dot", () => {
        const { workspaceId } = parseUrl("https://somehost.com/components/work.space.id.js");

        expect(workspaceId).toEqual("work.space.id");
    });

    it("should return undefined for the workspaceId in case it can't be parsed", () => {
        const { workspaceId } = parseUrl("https://somehost.com/some/other/url.js");

        expect(workspaceId).toBeUndefined();
    });

    it.each(["sso", "bearSso", "bear"])("should parse '%s' authType from the URL", (auth) => {
        const { authType } = parseUrl(`https://somehost.com/components/workspace-id.js?auth=${auth}`);

        expect(authType).toEqual(auth);
    });

    it("should set authType to 'none' if query parameter is omitted", () => {
        const { authType } = parseUrl("https://somehost.com/components/workspace-id.js");

        expect(authType).toEqual("none");
    });

    it("should set authType to 'none' if query parameter is set to unknown value", () => {
        const { authType } = parseUrl("https://somehost.com/components/workspace-id.js?auth=unknown");

        expect(authType).toEqual("none");
    });

    it("should return an undefined hostname and workspaceId in case an invalid URL is provided", () => {
        const { workspaceId, hostname } = parseUrl("I am not a URL");

        expect(workspaceId).toBeUndefined();
        expect(hostname).toBeUndefined();
    });

    it("should detect HTTP hostname", () => {
        const { hostname } = parseUrl("http://localhost/components/workspace-id.js");

        expect(hostname).toBe("http://localhost");
    });

    it("should detect HTTPS protocol", () => {
        const { hostname } = parseUrl("https://localhost/components/workspace-id.js");

        expect(hostname).toBe("https://localhost");
    });
});
