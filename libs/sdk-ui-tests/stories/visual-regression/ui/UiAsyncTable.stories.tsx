// (C) 2025 GoodData Corporation

import {
    UiAsyncTable,
    UiAsyncTableColumn,
    UiAsyncTableFilterOption,
    UiBadge,
    UiIcon,
} from "@gooddata/sdk-ui-kit";
import React, { useCallback, useMemo, useState } from "react";
import { wrapWithTheme } from "../themeWrapper.js";
import { SortDirection } from "@gooddata/sdk-model";

export default {
    title: "15 Ui/UiAsyncTable",
};

interface ScheduleItem {
    id: string;
    title: string;
    state: string;
    workspace: string;
    dashboard: string;
    recipient: string;
}

// Generate 50 mock schedule items
const generateMockScheduleItems = (): ScheduleItem[] => {
    const states = ["active", "inactive", "draft", "paused"];
    const workspaces = ["Sales", "Marketing", "Finance", "HR", "Engineering"];
    const dashboards = [
        "Sales Dashboard",
        "Marketing Overview",
        "Financial Reports",
        "HR Analytics",
        "Engineering Metrics",
    ];
    const recipients = [
        "john.doe@company.com",
        "jane.smith@company.com",
        "finance@company.com",
        "hr@company.com",
        "engineering@company.com",
    ];

    return Array.from({ length: 50 }, (_, index) => ({
        id: `schedule-${index + 1}`,
        title: `Schedule ${index + 10}`,
        state: states[index % states.length],
        workspace: workspaces[index % workspaces.length],
        dashboard: dashboards[index % dashboards.length],
        recipient: recipients[index % recipients.length],
    }));
};

const mockFilterOptions = {
    workspace: [
        { value: "all", label: "All Workspaces" },
        { value: "Sales", label: "Sales" },
        { value: "Marketing", label: "Marketing" },
        { value: "Finance", label: "Finance" },
        { value: "HR", label: "HR" },
        { value: "Engineering", label: "Engineering" },
    ] as UiAsyncTableFilterOption[],
};

const UiAsyncTableExample: React.FC<{ showCode?: boolean }> = () => {
    const items = useMemo(() => generateMockScheduleItems(), []);

    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<keyof ScheduleItem>("title");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [search, setSearch] = useState("");
    const [workspaceFilter, setWorkspaceFilter] = useState("all");

    const filteredAndSortedItems = useMemo(() => {
        let filtered = items.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.dashboard.toLowerCase().includes(search.toLowerCase());
            const matchesWorkspace = workspaceFilter === "all" || item.workspace === workspaceFilter;

            return matchesSearch && matchesWorkspace;
        });

        filtered.sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];

            if (typeof aValue === "string" && typeof bValue === "string") {
                const comparison = aValue.localeCompare(bValue);
                return sortDirection === "asc" ? comparison : -comparison;
            }

            return 0;
        });

        return filtered;
    }, [items, search, sortBy, sortDirection, workspaceFilter]);

    // Column definitions
    const columns: UiAsyncTableColumn<ScheduleItem>[] = useMemo(
        () => [
            {
                key: "title",
                label: "Title",
                width: 300,
                sortable: true,
                renderRoleIcon: () => (
                    <UiIcon
                        type="alert"
                        size={14}
                        color="complementary-6"
                        backgroundSize={27}
                        backgroundColor="complementary-2"
                    />
                ),
                getMultiLineTextContent: (item) => [item.title, item.state],
                getTextTitle: (item) => `${item.title} - ${item.state}`,
            },
            {
                key: "workspace",
                label: "Workspace",
                width: 200,
                sortable: true,
                renderSuffixIcon: () => (
                    <UiIcon
                        type="cross"
                        size={13}
                        color="complementary-6"
                        backgroundSize={14}
                        backgroundColor="complementary-6"
                        backgroundType="border"
                    />
                ),
                getTextContent: (item) => item.workspace,
                getTextTitle: (item) => item.workspace,
            },
            {
                key: "dashboard",
                label: "Dashboard",
                width: 250,
                sortable: true,
                getTextContent: (item) => item.dashboard,
                getTextTitle: (item) => item.dashboard,
                renderBadge: () => <UiBadge label="Active" />,
            },
            {
                key: "recipient",
                label: "Recipient",
                width: 250,
                sortable: true,
                getTextContent: (item) => item.recipient,
                getTextTitle: (item) => item.recipient,
            },
        ],
        [],
    );

    // Filter definitions
    const filters = useMemo(
        () => [
            {
                label: "Workspace",
                options: mockFilterOptions.workspace,
                selected: mockFilterOptions.workspace.find((opt) => opt.value === workspaceFilter),
                onItemClick: (option: UiAsyncTableFilterOption) => setWorkspaceFilter(option.value),
            },
        ],
        [workspaceFilter],
    );

    // Bulk actions
    const bulkActions = useMemo(
        () => [
            {
                label: "Pause Selected",
                onClick: () => {},
            },
            {
                label: "Delete Selected",
                onClick: () => {},
            },
        ],
        [selectedItemIds],
    );

    const handleSort = useCallback(
        (key: keyof ScheduleItem) => {
            if (sortBy === key) {
                setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
            } else {
                setSortBy(key);
                setSortDirection("asc");
            }
        },
        [sortBy],
    );

    return (
        <div style={{ padding: "20px", maxWidth: "1200px" }} className="screenshot-target">
            <h1 style={{ marginBottom: "20px" }} className={"gd-typography gd-typography--h1"}>
                Schedule Table
            </h1>
            <UiAsyncTable<ScheduleItem>
                items={filteredAndSortedItems}
                totalItemsCount={filteredAndSortedItems.length}
                columns={columns}
                filters={filters}
                bulkActions={bulkActions}
                selectedItemIds={selectedItemIds}
                setSelectedItemIds={setSelectedItemIds}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                onSearch={setSearch}
                maxHeight={400}
            />
        </div>
    );
};

export const Default = () => <UiAsyncTableExample />;
Default.parameters = { kind: "default", screenshot: true };

export const Themed = () => wrapWithTheme(<UiAsyncTableExample />);
Themed.parameters = { kind: "themed", screenshot: true };
