// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type DataSourceAccessSource,
    DataSourceAccessSourceValue,
    type IDataSourcePermissionAssignment,
    type IOrganizationAssignee,
    type IWorkspacePermissionAssignment,
    type WorkspaceAccessSource,
    WorkspaceAccessSourceValue,
} from "@gooddata/sdk-model";

import { type IGrantedDataSource, type IGrantedWorkspace } from "../types.js";
import {
    dataSourcePermissionsAssignmentToGrantedDataSource,
    dedupeGrantedDataSources,
    dedupeGrantedWorkspaces,
    workspacePermissionsAssignmentToGrantedWorkspace,
} from "../utils.js";

const assignee: IOrganizationAssignee = { id: "subject-1", type: "user" };

const workspaceAssignment = (
    overrides: Partial<IWorkspacePermissionAssignment> = {},
): IWorkspacePermissionAssignment => ({
    assigneeIdentifier: assignee,
    workspace: { id: "ws-1", name: "Workspace 1" },
    permissions: ["VIEW"],
    hierarchyPermissions: [],
    ...overrides,
});

const dataSourceAssignment = (
    overrides: Partial<IDataSourcePermissionAssignment> = {},
): IDataSourcePermissionAssignment => ({
    assigneeIdentifier: assignee,
    dataSource: { id: "ds-1", name: "Data source 1" },
    permissions: ["USE"],
    ...overrides,
});

const grantedWorkspace = (id: string, accessSource?: WorkspaceAccessSource): IGrantedWorkspace => ({
    id,
    title: id,
    permissions: ["VIEW"],
    isHierarchical: false,
    accessSource,
    isInherited: !!accessSource && accessSource !== WorkspaceAccessSourceValue.DIRECT,
});

const grantedDataSource = (id: string, accessSource?: DataSourceAccessSource): IGrantedDataSource => ({
    id,
    title: id,
    permission: "USE",
    accessSource,
    isInherited: !!accessSource && accessSource !== DataSourceAccessSourceValue.DIRECT,
});

describe("workspacePermissionsAssignmentToGrantedWorkspace", () => {
    it("marks a directly-assigned workspace as not inherited", () => {
        const result = workspacePermissionsAssignmentToGrantedWorkspace(
            workspaceAssignment({ accessSource: WorkspaceAccessSourceValue.DIRECT }),
        );
        expect(result.isInherited).toBe(false);
        expect(result.accessSource).toBe(WorkspaceAccessSourceValue.DIRECT);
    });

    it.each([WorkspaceAccessSourceValue.GROUP, WorkspaceAccessSourceValue.HIERARCHY])(
        "marks a workspace reached via %s as inherited",
        (accessSource) => {
            const result = workspacePermissionsAssignmentToGrantedWorkspace(
                workspaceAssignment({ accessSource }),
            );
            expect(result.isInherited).toBe(true);
        },
    );

    it("treats a missing access source as not inherited", () => {
        const result = workspacePermissionsAssignmentToGrantedWorkspace(
            workspaceAssignment({ accessSource: undefined }),
        );
        expect(result.isInherited).toBe(false);
    });

    it("is hierarchical and exposes hierarchy permissions when hierarchy permissions are present", () => {
        const result = workspacePermissionsAssignmentToGrantedWorkspace(
            workspaceAssignment({ permissions: ["VIEW"], hierarchyPermissions: ["MANAGE"] }),
        );
        expect(result.isHierarchical).toBe(true);
        expect(result.permissions).toEqual(["MANAGE"]);
    });

    it("is not hierarchical and exposes direct permissions when no hierarchy permissions are present", () => {
        const result = workspacePermissionsAssignmentToGrantedWorkspace(
            workspaceAssignment({ permissions: ["VIEW"], hierarchyPermissions: [] }),
        );
        expect(result.isHierarchical).toBe(false);
        expect(result.permissions).toEqual(["VIEW"]);
    });

    it("falls back to an empty title when the workspace has no name", () => {
        const result = workspacePermissionsAssignmentToGrantedWorkspace(
            workspaceAssignment({ workspace: { id: "ws-1" } }),
        );
        expect(result.title).toBe("");
    });
});

describe("dataSourcePermissionsAssignmentToGrantedDataSource", () => {
    it("marks a directly-assigned data source as not inherited", () => {
        const result = dataSourcePermissionsAssignmentToGrantedDataSource(
            dataSourceAssignment({ accessSource: DataSourceAccessSourceValue.DIRECT }),
        );
        expect(result.isInherited).toBe(false);
    });

    it("marks a group-inherited data source as inherited", () => {
        const result = dataSourcePermissionsAssignmentToGrantedDataSource(
            dataSourceAssignment({ accessSource: DataSourceAccessSourceValue.GROUP }),
        );
        expect(result.isInherited).toBe(true);
    });

    it("treats a missing access source as not inherited", () => {
        const result = dataSourcePermissionsAssignmentToGrantedDataSource(
            dataSourceAssignment({ accessSource: undefined }),
        );
        expect(result.isInherited).toBe(false);
    });

    it("resolves MANAGE as the permission when present", () => {
        const result = dataSourcePermissionsAssignmentToGrantedDataSource(
            dataSourceAssignment({ permissions: ["MANAGE"] }),
        );
        expect(result.permission).toBe("MANAGE");
    });

    it("prefers MANAGE over USE when both are present", () => {
        const result = dataSourcePermissionsAssignmentToGrantedDataSource(
            dataSourceAssignment({ permissions: ["USE", "MANAGE"] }),
        );
        expect(result.permission).toBe("MANAGE");
    });

    it("falls back to USE when no permissions are present", () => {
        const result = dataSourcePermissionsAssignmentToGrantedDataSource(
            dataSourceAssignment({ permissions: [] }),
        );
        expect(result.permission).toBe("USE");
    });
});

describe("dedupeGrantedWorkspaces", () => {
    it("keeps distinct workspaces in their original order", () => {
        const input = [grantedWorkspace("ws-1"), grantedWorkspace("ws-2"), grantedWorkspace("ws-3")];
        expect(dedupeGrantedWorkspaces(input).map((w) => w.id)).toEqual(["ws-1", "ws-2", "ws-3"]);
    });

    it("returns an empty array for empty input", () => {
        expect(dedupeGrantedWorkspaces([])).toEqual([]);
    });

    it.each([
        [WorkspaceAccessSourceValue.GROUP, WorkspaceAccessSourceValue.DIRECT],
        [WorkspaceAccessSourceValue.DIRECT, WorkspaceAccessSourceValue.GROUP],
    ])("keeps the direct grant over a group grant for the same workspace (order %#)", (first, second) => {
        const result = dedupeGrantedWorkspaces([
            grantedWorkspace("ws-1", first),
            grantedWorkspace("ws-1", second),
        ]);
        expect(result).toHaveLength(1);
        expect(result[0].accessSource).toBe(WorkspaceAccessSourceValue.DIRECT);
    });

    it("keeps the group grant over a hierarchy grant for the same workspace", () => {
        const result = dedupeGrantedWorkspaces([
            grantedWorkspace("ws-1", WorkspaceAccessSourceValue.HIERARCHY),
            grantedWorkspace("ws-1", WorkspaceAccessSourceValue.GROUP),
        ]);
        expect(result).toHaveLength(1);
        expect(result[0].accessSource).toBe(WorkspaceAccessSourceValue.GROUP);
    });

    it.each([
        [
            WorkspaceAccessSourceValue.HIERARCHY,
            WorkspaceAccessSourceValue.GROUP,
            WorkspaceAccessSourceValue.DIRECT,
        ],
        [
            WorkspaceAccessSourceValue.DIRECT,
            WorkspaceAccessSourceValue.GROUP,
            WorkspaceAccessSourceValue.HIERARCHY,
        ],
    ])("keeps the direct grant when all three sources are present (order %#)", (first, second, third) => {
        const result = dedupeGrantedWorkspaces([
            grantedWorkspace("ws-1", first),
            grantedWorkspace("ws-1", second),
            grantedWorkspace("ws-1", third),
        ]);
        expect(result).toHaveLength(1);
        expect(result[0].accessSource).toBe(WorkspaceAccessSourceValue.DIRECT);
    });

    it("preserves the first-seen position of each surviving workspace when ids are interleaved", () => {
        const result = dedupeGrantedWorkspaces([
            grantedWorkspace("ws-1", WorkspaceAccessSourceValue.GROUP),
            grantedWorkspace("ws-2", WorkspaceAccessSourceValue.DIRECT),
            grantedWorkspace("ws-1", WorkspaceAccessSourceValue.DIRECT),
        ]);
        expect(result.map((w) => w.id)).toEqual(["ws-1", "ws-2"]);
        // ws-1's surviving entry is the more-editable direct grant, even though it appeared second.
        expect(result[0].accessSource).toBe(WorkspaceAccessSourceValue.DIRECT);
    });

    it("treats a missing access source as the most editable source", () => {
        const withoutSource = { ...grantedWorkspace("ws-1", undefined), title: "no-source" };
        const group = { ...grantedWorkspace("ws-1", WorkspaceAccessSourceValue.GROUP), title: "group" };
        expect(dedupeGrantedWorkspaces([group, withoutSource])[0].title).toBe("no-source");
        expect(dedupeGrantedWorkspaces([withoutSource, group])[0].title).toBe("no-source");
    });

    it("keeps the first-seen entry when sources tie", () => {
        const first = { ...grantedWorkspace("ws-1", WorkspaceAccessSourceValue.GROUP), title: "first" };
        const second = { ...grantedWorkspace("ws-1", WorkspaceAccessSourceValue.GROUP), title: "second" };
        expect(dedupeGrantedWorkspaces([first, second])[0].title).toBe("first");
    });
});

describe("dedupeGrantedDataSources", () => {
    it("keeps distinct data sources in their original order", () => {
        const input = [grantedDataSource("ds-1"), grantedDataSource("ds-2")];
        expect(dedupeGrantedDataSources(input).map((d) => d.id)).toEqual(["ds-1", "ds-2"]);
    });

    it("returns an empty array for empty input", () => {
        expect(dedupeGrantedDataSources([])).toEqual([]);
    });

    it.each([
        [DataSourceAccessSourceValue.GROUP, DataSourceAccessSourceValue.DIRECT],
        [DataSourceAccessSourceValue.DIRECT, DataSourceAccessSourceValue.GROUP],
    ])("keeps the direct grant over a group grant for the same data source (order %#)", (first, second) => {
        const result = dedupeGrantedDataSources([
            grantedDataSource("ds-1", first),
            grantedDataSource("ds-1", second),
        ]);
        expect(result).toHaveLength(1);
        expect(result[0].accessSource).toBe(DataSourceAccessSourceValue.DIRECT);
    });

    it("treats a missing access source as the most editable source", () => {
        const withoutSource = { ...grantedDataSource("ds-1", undefined), title: "no-source" };
        const group = { ...grantedDataSource("ds-1", DataSourceAccessSourceValue.GROUP), title: "group" };
        expect(dedupeGrantedDataSources([group, withoutSource])[0].title).toBe("no-source");
        expect(dedupeGrantedDataSources([withoutSource, group])[0].title).toBe("no-source");
    });

    it("keeps the first-seen entry when sources tie", () => {
        const first = { ...grantedDataSource("ds-1", DataSourceAccessSourceValue.GROUP), title: "first" };
        const second = { ...grantedDataSource("ds-1", DataSourceAccessSourceValue.GROUP), title: "second" };
        expect(dedupeGrantedDataSources([first, second])[0].title).toBe("first");
    });
});
