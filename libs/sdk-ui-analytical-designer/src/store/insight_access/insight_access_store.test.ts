// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IObjectShareDraft } from "@gooddata/sdk-ui-ext";

import {
    insightAccessDraftApplied,
    insightAccessDraftChanged,
} from "../../actions/insight_access_actions.js";
import { openReportStarted } from "../../actions/open_actions.js";

import { insightAccessSliceReducer } from "./insight_access_slice.js";

const draft: IObjectShareDraft = {
    granteeEdits: {},
    ruleEdit: { generalAccess: "WORKSPACE", level: "VIEW", pending: false },
};

describe("insightAccess slice", () => {
    it("starts with no draft", () => {
        expect(insightAccessSliceReducer(undefined, { type: "@@init" })).toBeNull();
    });

    it("keeps the drafted access until it is applied", () => {
        const drafted = insightAccessSliceReducer(null, insightAccessDraftChanged(draft));
        expect(drafted).toBe(draft);
        expect(insightAccessSliceReducer(drafted, insightAccessDraftApplied())).toBeNull();
    });

    it("drops the draft when another visualization is opened", () => {
        expect(insightAccessSliceReducer(draft, openReportStarted("ws", "bars"))).toBeNull();
    });
});
