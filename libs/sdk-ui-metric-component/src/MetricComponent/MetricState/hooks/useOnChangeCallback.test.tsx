// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IObjectShareDraft } from "@gooddata/sdk-ui-ext";

import { type ITab } from "../../../shared/Tabs/Tab.js";
import { emptyMetric } from "../../metric/emptyMetric.js";
import { type IMetricInfo, MetricInfoKind } from "../metricState.data.js";

import { useOnChangeCallback } from "./useOnChangeCallback.js";

const DRAFT = {
    granteeEdits: { "user:u1": { kind: "added", pending: false } },
    ruleEdit: undefined,
} as unknown as IObjectShareDraft;

function makeTab(data: Partial<IMetricInfo> = {}): ITab<IMetricInfo> {
    return {
        id: "new-metric/0",
        title: "",
        data: {
            initial: emptyMetric,
            current: emptyMetric,
            identifier: "new-metric/0",
            kind: MetricInfoKind.Create,
            ...data,
        } as IMetricInfo,
    };
}

function render(tab: ITab<IMetricInfo>) {
    const updateTab = vi.fn();
    const updateData = vi.fn();
    const { result } = renderHook(() => useOnChangeCallback({ tab, updateTab, updateData }));
    return { result, updateTab, updateData };
}

describe("useOnChangeCallback / onChangeDraftAccess", () => {
    it("persists through state, so a reopened dialog is handed the latest draft", () => {
        const tab = makeTab();
        const { result, updateTab, updateData } = render(tab);

        result.current.onChangeDraftAccess(DRAFT);

        expect(updateData).not.toHaveBeenCalled();
        expect(updateTab).toHaveBeenCalledWith(
            tab,
            expect.objectContaining({ data: expect.objectContaining({ draftAccess: DRAFT }) }),
        );
    });

    it("clears it once applied, so a later save cannot send it again", () => {
        const tab = makeTab({ draftAccess: DRAFT });
        const { result, updateTab } = render(tab);

        result.current.onChangeDraftAccess(undefined);

        expect(updateTab).toHaveBeenCalledWith(
            tab,
            expect.objectContaining({ data: expect.objectContaining({ draftAccess: undefined }) }),
        );
    });

    it("leaves the rest of the tab alone", () => {
        const tab = makeTab({ sqlOpen: true });
        const { result, updateTab } = render(tab);

        result.current.onChangeDraftAccess(DRAFT);

        expect(updateTab.mock.calls[0][1].data).toMatchObject({
            sqlOpen: true,
            identifier: "new-metric/0",
        });
        expect(Object.keys(updateTab.mock.calls[0][1])).toEqual(["data"]);
    });
});
