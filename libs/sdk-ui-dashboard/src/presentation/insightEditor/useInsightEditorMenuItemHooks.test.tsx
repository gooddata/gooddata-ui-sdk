// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { renderHook } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IInsight,
    type IInsightWidget,
    type IWorkspacePermissions,
    idRef,
    newInsightDefinition,
} from "@gooddata/sdk-model";

import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import {
    selectEnableInsightEditing,
    selectEnableVisualizationPermissions,
} from "../../model/store/config/configSelectors.js";
import {
    selectCanCreateVisualization,
    selectPermissions,
} from "../../model/store/permissions/permissionsSelectors.js";
import { uiActions } from "../../model/store/ui/index.js";

import { useInsightEditorPermissions } from "./InsightEditorPermissionsContext.js";
import { useEditInsightMenuItem, useExploreInsightMenuItem } from "./useInsightEditorMenuItems.js";

vi.mock("../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardDispatch: vi.fn<() => unknown>(),
    useDashboardSelector: vi.fn<() => unknown>(),
}));
vi.mock("./InsightEditorPermissionsContext.js", () => ({
    useInsightEditorPermissions: vi.fn<() => unknown>(),
}));
let isMobile = false;
vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useMediaQuery: () => isMobile,
}));

const INSIGHT: IInsight = {
    insight: {
        ...newInsightDefinition("local:bar").insight,
        identifier: "insight",
        uri: "/insight",
        ref: idRef("insight", "insight"),
    },
};
const WIDGET = { ref: idRef("widget") } as IInsightWidget;
const OPEN_WIDGET = uiActions.openInsightEditor({ type: "widget", ref: WIDGET.ref });

interface IState {
    isEnabled: boolean;
    canCreateVisualization: boolean;
    workspacePermissions: Partial<IWorkspacePermissions>;
    visualizationPermissionsEnabled: boolean;
}

let state: IState;
let dispatch: Mock<(action: unknown) => unknown>;

function Wrapper({ children }: PropsWithChildren) {
    return (
        <IntlProvider locale="en-US" messages={{}} onError={() => {}}>
            {children}
        </IntlProvider>
    );
}

describe("insight editor menu item hooks", () => {
    beforeEach(() => {
        isMobile = false;
        state = {
            isEnabled: true,
            canCreateVisualization: true,
            workspacePermissions: { canAnalyzeWorkspace: true, canManageProject: false },
            visualizationPermissionsEnabled: false,
        };
        dispatch = vi.fn<(action: unknown) => unknown>();
        vi.mocked(useDashboardDispatch).mockReturnValue(
            dispatch as unknown as ReturnType<typeof useDashboardDispatch>,
        );
        vi.mocked(useInsightEditorPermissions).mockReturnValue(undefined);
        vi.mocked(useDashboardSelector).mockImplementation((selector: unknown) => {
            if (selector === selectEnableInsightEditing) return state.isEnabled;
            if (selector === selectCanCreateVisualization) return state.canCreateVisualization;
            if (selector === selectPermissions) return state.workspacePermissions;
            if (selector === selectEnableVisualizationPermissions)
                return state.visualizationPermissionsEnabled;
            throw new Error("unexpected selector");
        });
    });

    describe("useExploreInsightMenuItem", () => {
        const renderItem = (closeMenu = vi.fn<() => void>()) =>
            renderHook(() => useExploreInsightMenuItem(INSIGHT, WIDGET, closeMenu), { wrapper: Wrapper })
                .result.current;

        it("opens the widget in the editor and closes the menu", () => {
            const closeMenu = vi.fn<() => void>();
            const item = renderItem(closeMenu);

            item!.onClick!({} as never);

            expect(dispatch).toHaveBeenCalledWith(OPEN_WIDGET);
            expect(closeMenu).toHaveBeenCalledTimes(1);
        });

        it.each<[string, () => void]>([
            ["insight editing is off", () => (state.isEnabled = false)],
            ["the user cannot create visualizations", () => (state.canCreateVisualization = false)],
            ["the screen is a mobile one", () => (isMobile = true)],
        ])("is not offered when %s", (_, arrange) => {
            arrange();
            expect(renderItem()).toBeUndefined();
        });
    });

    describe("useEditInsightMenuItem", () => {
        const renderItem = () =>
            renderHook(() => useEditInsightMenuItem(INSIGHT, WIDGET), { wrapper: Wrapper }).result.current;

        it("opens the widget in the editor", () => {
            renderItem()!.onClick!({} as never);
            expect(dispatch).toHaveBeenCalledWith(OPEN_WIDGET);
        });

        it("is not offered when insight editing is off", () => {
            state.isEnabled = false;
            expect(renderItem()).toBeUndefined();
        });

        it("follows the edit permission of the visualization when visualization permissions are on", () => {
            state.visualizationPermissionsEnabled = true;
            expect(renderItem()).toBeUndefined();

            vi.mocked(useInsightEditorPermissions).mockReturnValue({ insight: ["VIEW", "EDIT"] } as never);
            expect(renderItem()).toBeDefined();
        });

        it("is not offered without the analyze permission of the workspace", () => {
            state.workspacePermissions = { canAnalyzeWorkspace: false };
            expect(renderItem()).toBeUndefined();
        });
    });
});
