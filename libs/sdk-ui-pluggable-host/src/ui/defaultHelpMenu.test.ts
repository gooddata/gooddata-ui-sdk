// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { DEFAULT_LANGUAGE } from "@gooddata/sdk-ui";
import { generateHeaderCommonHelpMenuItems, generateHeaderStaticHelpMenuItems } from "@gooddata/sdk-ui-kit";

import { DEFAULT_MESSAGES } from "../components/lib/translations.js";

describe("default help menu", () => {
    // The host pushes these items without a `label`, so the header resolves each `key` through the
    // host intl. A key no bundle in that chain carries would render as the raw message id.
    it.each([
        ["common", generateHeaderCommonHelpMenuItems()],
        ["static", generateHeaderStaticHelpMenuItems()],
    ])("resolves every %s item from the host messages", (_name, items) => {
        const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];
        expect(items.map((item) => item.key).filter((key) => !(key in messages))).toEqual([]);
    });
});
