// (C) 2022 GoodData Corporation

import { parseUrl } from "../parseUrl";

describe("parseUrl", () => {
    it("should parse workspaceId from the URL", () => {
        const { workspaceId } = parseUrl(new URL("https://somehost.com/components/workspace-id.js"));

        expect(workspaceId).toEqual("workspace-id");
    });

    it("should parse workspaceId from the URL even if the extension is not provided", () => {
        const { workspaceId } = parseUrl(new URL("https://somehost.com/components/workspace-id"));

        expect(workspaceId).toEqual("workspace-id");
    });

    it("should parse workspaceId in case it includes dot", () => {
        const { workspaceId } = parseUrl(new URL("https://somehost.com/components/work.space.id"));

        expect(workspaceId).toEqual("work.space.id");
    });

    it.each(["sso", "bearSso", "bear"])("should parse '%s' authType from the URL", (auth) => {
        const { authType } = parseUrl(
            new URL(`https://somehost.com/components/workspace-id.js?auth=${auth}`),
        );

        expect(authType).toEqual(auth);
    });

    it("should set authType to 'none' if query parameter is omitted", () => {
        const { authType } = parseUrl(new URL("https://somehost.com/components/workspace-id.js"));

        expect(authType).toEqual("none");
    });

    it("should set authType to 'none' if query parameter is set to unknown value", () => {
        const { authType } = parseUrl(
            new URL("https://somehost.com/components/workspace-id.js?auth=unknown"),
        );

        expect(authType).toEqual("none");
    });

    it("should throw if provided with a weird or incomplete URL", () => {
        // No "components" part
        expect(() => {
            parseUrl(new URL("https://somehost.com/workspace-id.js"));
        }).toThrow();

        // Unexpectedly long pathname
        expect(() => {
            parseUrl(new URL("https://somehost.com/components/workspace-id/some-unexpected-part"));
        }).toThrow();
    });

    it("should detect HTTP hostname", () => {
        const { hostname } = parseUrl(new URL("http://localhost/components/workspace-id.js"));

        expect(hostname).toBe("http://localhost");
    });

    it("should detect HTTPS protocol", () => {
        const { hostname } = parseUrl(new URL("https://localhost/components/workspace-id.js"));

        expect(hostname).toBe("https://localhost");
    });
});
