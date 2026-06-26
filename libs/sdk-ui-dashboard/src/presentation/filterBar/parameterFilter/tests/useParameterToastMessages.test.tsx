// (C) 2026 GoodData Corporation

import { render, renderHook } from "@testing-library/react";
import { type MessageDescriptor } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";
import { type MessageParameters } from "@gooddata/sdk-ui-kit";

import { selectIsInExportMode } from "../../../../model/store/renderMode/renderModeSelectors.js";
import { type IParameterReconciliationEntry } from "../../../../model/store/tabs/parameters/parametersHelpers.js";
import { createInternalIntl } from "../../../localization/createInternalIntl.js";
import { useParameterToastMessages } from "../useParameterToastMessages.js";

let mockReconciliations: IParameterReconciliationEntry[];
let mockIsExportMode: boolean;
const mockUseDashboardSelector = vi.fn();

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
}));

const addWarning = vi.fn();

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>;
    return { ...actual, useToastMessage: () => ({ addWarning }) };
});

function entry(
    identifier: string,
    name: string,
    kind: IParameterReconciliationEntry["kind"],
): IParameterReconciliationEntry {
    return { ref: idRef(identifier, "parameter"), name, kind };
}

function warningCall(index: number): { id: string; name: unknown } {
    const [descriptor, parameters] = addWarning.mock.calls[index] as [
        MessageDescriptor,
        { values: { name: unknown } },
    ];
    return { id: descriptor.id as string, name: parameters.values.name };
}

beforeEach(() => {
    addWarning.mockClear();
    mockReconciliations = [];
    mockIsExportMode = false;
    mockUseDashboardSelector.mockImplementation((selector: unknown) =>
        selector === selectIsInExportMode ? mockIsExportMode : mockReconciliations,
    );
});

describe("useParameterToastMessages", () => {
    it("toasts one warning for a reset entry, message by kind with the name interpolated", () => {
        mockReconciliations = [entry("topN", "Top N", "reset")];

        renderHook(() => useParameterToastMessages());

        expect(addWarning).toHaveBeenCalledTimes(1);
        expect(warningCall(0)).toEqual({ id: "parameter.toast.reset", name: "Top N" });
    });

    it("selects the message by kind for reset, removed and incompatible entries", () => {
        mockReconciliations = [
            entry("topN", "Top N", "reset"),
            entry("region", "Region", "removed"),
            entry("label", "Label", "incompatible"),
        ];

        renderHook(() => useParameterToastMessages());

        expect(addWarning).toHaveBeenCalledTimes(3);
        expect(warningCall(0)).toEqual({ id: "parameter.toast.reset", name: "Top N" });
        expect(warningCall(1)).toEqual({ id: "parameter.toast.removed", name: "Region" });
        expect(warningCall(2)).toEqual({ id: "parameter.toast.incompatible", name: "Label" });
    });

    it("toasts each ref at most once, even when the list is recomputed into a new array", () => {
        mockReconciliations = [entry("topN", "Top N", "reset")];

        const { rerender } = renderHook(() => useParameterToastMessages());
        expect(addWarning).toHaveBeenCalledTimes(1);

        mockReconciliations = [entry("topN", "Top N", "reset")];
        rerender();

        expect(addWarning).toHaveBeenCalledTimes(1);
    });

    it("does not toast while the dashboard is rendered for export", () => {
        mockReconciliations = [entry("topN", "Top N", "reset")];
        mockIsExportMode = true;

        renderHook(() => useParameterToastMessages());

        expect(addWarning).not.toHaveBeenCalled();
    });

    it("does not toast when there are no reconciliations", () => {
        mockReconciliations = [];

        renderHook(() => useParameterToastMessages());

        expect(addWarning).not.toHaveBeenCalled();
    });

    it("toasts a ref that first appears on a later render exactly once", () => {
        mockReconciliations = [];

        const { rerender } = renderHook(() => useParameterToastMessages());
        expect(addWarning).not.toHaveBeenCalled();

        mockReconciliations = [entry("topN", "Top N", "reset"), entry("region", "Region", "removed")];
        rerender();
        expect(addWarning).toHaveBeenCalledTimes(2);

        mockReconciliations = [entry("topN", "Top N", "reset"), entry("region", "Region", "removed")];
        rerender();
        expect(addWarning).toHaveBeenCalledTimes(2);
    });

    it('renders the toast with a bold "Warning:" label and the interpolated name', () => {
        mockReconciliations = [entry("topN", "Top N", "reset")];

        renderHook(() => useParameterToastMessages());

        const [descriptor, parameters] = addWarning.mock.calls[0] as [MessageDescriptor, MessageParameters];
        const intl = createInternalIntl();
        const { container } = render(<div>{intl.formatMessage(descriptor, parameters.values)}</div>);

        expect(container.querySelector("strong")?.textContent).toBe("Warning:");
        expect(container.textContent).toContain('Parameter "Top N" is out of range');
    });

    it("keeps the toast visible longer than the auto-dismiss default", () => {
        mockReconciliations = [entry("topN", "Top N", "reset")];

        renderHook(() => useParameterToastMessages());

        const [, parameters] = addWarning.mock.calls[0] as [MessageDescriptor, MessageParameters];
        expect(parameters.duration).toBe(8000);
    });
});
