// (C) 2026 GoodData Corporation

import { useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IntlWrapper } from "@gooddata/sdk-ui";

import { type IGrantedWorkspace, type WorkspacePermissions } from "../../types.js";

import { GranularPermissions } from "./GranularPermissions.js";
import { removeRedundantPermissions } from "./granularPermissionUtils.js";

let latest: IGrantedWorkspace | undefined;

function Harness({
    permissions,
    areVisualizationPermissionsEnabled = true,
}: {
    permissions: WorkspacePermissions;
    areVisualizationPermissionsEnabled?: boolean;
}) {
    const [workspace, setWorkspace] = useState<IGrantedWorkspace>({
        id: "ws",
        title: "Workspace",
        permissions,
        isHierarchical: false,
    });
    latest = workspace;
    return (
        <IntlWrapper>
            <GranularPermissions
                workspace={workspace}
                onChange={setWorkspace}
                showRedundancyWarningMessage={false}
                isCreateVisualizationWorkspacePermissionEnabled
                areVisualizationPermissionsEnabled={areVisualizationPermissionsEnabled}
            />
        </IntlWrapper>
    );
}

const saved = () => removeRedundantPermissions(latest?.permissions ?? []);
const manageVisualizations = () => screen.getByLabelText<HTMLInputElement>("Manage all visualizations");
const createVisualizations = () => screen.getByLabelText<HTMLInputElement>("Visualizations");
const level = (name: "Manage" | "Analyze" | "View") => screen.getByLabelText(name);

describe("GranularPermissions with MANAGE_VISUALIZATIONS", () => {
    it("hides the permission while visualization permissions are off", () => {
        render(<Harness permissions={["VIEW"]} areVisualizationPermissionsEnabled={false} />);

        expect(screen.queryByLabelText("Manage all visualizations")).toBeNull();
    });

    it("keeps a stored permission it hides while visualization permissions are off", () => {
        render(
            <Harness
                permissions={["VIEW", "MANAGE_VISUALIZATIONS"]}
                areVisualizationPermissionsEnabled={false}
            />,
        );

        expect(screen.queryByLabelText("Manage all visualizations")).toBeNull();
        fireEvent.click(screen.getByLabelText("AI Assistant"));
        expect(saved()).toEqual(["VIEW", "MANAGE_VISUALIZATIONS", "USE_AI_ASSISTANT"]);
    });

    it("keeps an explicitly stored Create visualizations when the permission is unchecked", () => {
        render(<Harness permissions={["VIEW", "CREATE_VISUALIZATION", "MANAGE_VISUALIZATIONS"]} />);

        fireEvent.click(manageVisualizations());

        expect(saved()).toEqual(["VIEW", "CREATE_VISUALIZATION"]);
        expect(createVisualizations().checked).toBe(true);
    });

    it("stores only the permission and shows creating visualizations as included", () => {
        render(<Harness permissions={["VIEW"]} />);

        fireEvent.click(manageVisualizations());

        expect(saved()).toEqual(["VIEW", "MANAGE_VISUALIZATIONS"]);
        expect(createVisualizations().checked).toBe(true);
        expect(createVisualizations().disabled).toBe(true);
    });

    it("brings back an explicit Create visualizations when the permission is unchecked", () => {
        render(<Harness permissions={["VIEW", "CREATE_VISUALIZATION"]} />);

        fireEvent.click(manageVisualizations());
        expect(saved()).toEqual(["VIEW", "MANAGE_VISUALIZATIONS"]);

        fireEvent.click(manageVisualizations());
        expect(saved()).toEqual(["VIEW", "CREATE_VISUALIZATION"]);
        expect(createVisualizations().checked).toBe(true);
        expect(createVisualizations().disabled).toBe(false);
    });

    it("leaves Create visualizations unchecked when it was not chosen before", () => {
        render(<Harness permissions={["VIEW"]} />);

        fireEvent.click(manageVisualizations());
        fireEvent.click(manageVisualizations());

        expect(saved()).toEqual(["VIEW"]);
        expect(createVisualizations().checked).toBe(false);
    });

    it("stays editable and stored alongside Analyze", () => {
        render(<Harness permissions={["ANALYZE", "MANAGE_VISUALIZATIONS"]} />);

        expect(manageVisualizations().checked).toBe(true);
        expect(manageVisualizations().disabled).toBe(false);

        fireEvent.click(manageVisualizations());
        expect(saved()).toEqual(["ANALYZE"]);
    });

    it("is kept when the access level moves between Analyze and View", () => {
        render(<Harness permissions={["ANALYZE", "MANAGE_VISUALIZATIONS"]} />);

        fireEvent.click(level("View"));
        expect(saved()).toEqual(["VIEW", "MANAGE_VISUALIZATIONS"]);

        fireEvent.click(level("Analyze"));
        expect(saved()).toEqual(["ANALYZE", "MANAGE_VISUALIZATIONS"]);
    });

    it("shows as included under Manage and comes back when leaving Manage", () => {
        render(<Harness permissions={["ANALYZE", "MANAGE_VISUALIZATIONS"]} />);

        fireEvent.click(level("Manage"));
        expect(saved()).toEqual(["MANAGE"]);
        expect(manageVisualizations().checked).toBe(true);
        expect(manageVisualizations().disabled).toBe(true);

        fireEvent.click(level("Analyze"));
        expect(saved()).toEqual(["ANALYZE", "MANAGE_VISUALIZATIONS"]);
    });

    it("does not appear after leaving Manage when it was not held before", () => {
        render(<Harness permissions={["ANALYZE"]} />);

        fireEvent.click(level("Manage"));
        fireEvent.click(level("View"));

        expect(saved()).toEqual(["VIEW"]);
        expect(manageVisualizations().checked).toBe(false);
    });
});

describe("GranularPermissions existing behavior", () => {
    const checkbox = (name: string) => screen.getByLabelText<HTMLInputElement>(name);

    it("includes both export formats under Exports and drops them again with it", () => {
        render(<Harness permissions={["VIEW"]} />);

        fireEvent.click(checkbox("Exports"));
        expect(saved()).toEqual(["VIEW", "EXPORT"]);
        expect(checkbox("Export PDF").checked).toBe(true);
        expect(checkbox("Export PDF").disabled).toBe(true);

        fireEvent.click(checkbox("Exports"));
        expect(saved()).toEqual(["VIEW"]);
        expect(checkbox("Export PDF").checked).toBe(false);
    });

    it("turns both export formats into Exports", () => {
        render(<Harness permissions={["VIEW"]} />);

        fireEvent.click(checkbox("Export PDF"));
        fireEvent.click(checkbox("Export XLSX and CSV"));

        expect(saved()).toEqual(["VIEW", "EXPORT"]);
    });

    it("keeps additional permissions across access level changes", () => {
        render(<Harness permissions={["VIEW", "EXPORT", "USE_AI_ASSISTANT"]} />);

        fireEvent.click(level("Analyze"));
        expect(saved()).toEqual(["ANALYZE", "EXPORT", "USE_AI_ASSISTANT"]);

        fireEvent.click(level("View"));
        expect(saved()).toEqual(["VIEW", "EXPORT", "USE_AI_ASSISTANT"]);
        expect(checkbox("Exports").checked).toBe(true);
    });

    it("saves only what Manage does not include, and restores the choices when leaving it", () => {
        render(<Harness permissions={["VIEW", "EXPORT", "USE_AI_ASSISTANT"]} />);

        fireEvent.click(level("Manage"));
        expect(saved()).toEqual(["MANAGE", "USE_AI_ASSISTANT"]);

        fireEvent.click(level("View"));
        expect(saved()).toEqual(["VIEW", "EXPORT", "USE_AI_ASSISTANT"]);
    });
});
