// (C) 2026 GoodData Corporation

import { useState } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { type IAnalyticalBackend, type IFilterBaseOptions } from "@gooddata/sdk-backend-spi";
import { type IInsight, uriRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { InsightPicker } from "./InsightPicker.js";
import { useInsightPickerState } from "./useInsightPickerState.js";

const AUTHOR = "author-login";
const OTHER_AUTHOR = "other-login";
const UNUSED_TAG = "tag-nobody-used";
const TOTAL_INSIGHTS = 60;

function insight(index: number): IInsight {
    return {
        insight: {
            identifier: `insight-${index}`,
            uri: `/insight/${index}`,
            ref: uriRef(`/insight/${index}`),
            title: `Insight ${index}`,
            visualizationUrl: "local:table",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
        },
    } as IInsight;
}

const allInsights = Array.from({ length: TOTAL_INSIGHTS }, (_, index) => insight(index));

interface IInsightsQueryStub {
    withSize: () => IInsightsQueryStub;
    withPage: (page: number) => IInsightsQueryStub;
    withSorting: () => IInsightsQueryStub;
    withInclude: () => IInsightsQueryStub;
    withFilter: (filter: IFilterBaseOptions) => IInsightsQueryStub;
    query: () => Promise<{ items: IInsight[]; totalCount: number }>;
}

function createBackend({ insightsAuthor }: { insightsAuthor: string }) {
    const createdByFilters: (string[] | undefined)[] = [];
    const queries: { createdBy: string[] | undefined; tags: string[] | undefined }[] = [];

    const getInsightsQuery = (): IInsightsQueryStub => {
        let page = 0;
        let filter: IFilterBaseOptions | undefined;

        const query: IInsightsQueryStub = {
            withSize: () => query,
            withPage: (nextPage: number) => {
                page = nextPage;
                return query;
            },
            withSorting: () => query,
            withInclude: () => query,
            withFilter: (nextFilter: IFilterBaseOptions) => {
                filter = nextFilter;
                return query;
            },
            query: () => {
                const createdBy = filter?.createdBy;
                const tags = filter?.tags;
                createdByFilters.push(createdBy);
                queries.push({ createdBy, tags });

                if (createdBy?.length && !createdBy.includes(insightsAuthor)) {
                    return Promise.resolve({ items: [], totalCount: 0 });
                }
                if (tags?.includes(UNUSED_TAG)) {
                    return Promise.resolve({ items: [], totalCount: 0 });
                }
                return Promise.resolve({
                    items: allInsights.slice(page * 50, (page + 1) * 50),
                    totalCount: TOTAL_INSIGHTS,
                });
            },
        };

        return query;
    };

    const backend = {
        capabilities: {},
        workspace: () => ({
            insights: () => ({ getInsightsQuery }),
            genAI: () => ({
                getAnalyticsCatalog: () => ({
                    getCreatedBy: () => Promise.resolve({ users: [] }),
                    getTags: () => Promise.resolve({ tags: [] }),
                }),
            }),
        }),
    } as unknown as IAnalyticalBackend;

    return { backend, createdByFilters, queries };
}

/** Mirrors the consumers: the picker body is mounted only while open, its state is not. */
function TestPicker({ backend }: { backend: IAnalyticalBackend }) {
    const pickerState = useInsightPickerState(AUTHOR);
    const [isOpen, setIsOpen] = useState(true);

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="workspace">
                <button onClick={() => pickerState.onAuthorFilterChange([AUTHOR])}>filter by me</button>
                <button onClick={() => setIsOpen((open) => !open)}>toggle picker</button>
                <button onClick={() => pickerState.onTagFilterChange([UNUSED_TAG])}>filter by tag</button>
                <button onClick={() => pickerState.onTagFilterChange([])}>clear tag</button>
                <span data-testid="author-filter">{pickerState.authorFilter.join(",")}</span>
                {isOpen ? (
                    <InsightPicker
                        {...pickerState}
                        author={AUTHOR}
                        enableSemanticSearch={false}
                        onSelect={() => {}}
                    />
                ) : null}
            </WorkspaceProvider>
        </BackendProvider>
    );
}

/** A caller holding the picker's controlled state itself, rather than through the state hook. */
function PlainControlledPicker({
    backend,
    isAuthorFilterModified,
}: {
    backend: IAnalyticalBackend;
    isAuthorFilterModified: boolean;
}) {
    const [authorFilter, setAuthorFilter] = useState<string[]>([AUTHOR]);

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="workspace">
                <span data-testid="author-filter">{authorFilter.join(",")}</span>
                <InsightPicker
                    backend={backend}
                    workspace="workspace"
                    author={AUTHOR}
                    enableSemanticSearch={false}
                    searchQuery=""
                    onSearchChange={() => {}}
                    sortBy="lastModified"
                    sortDirection="desc"
                    onSortChange={() => {}}
                    authorFilter={authorFilter}
                    onAuthorFilterChange={setAuthorFilter}
                    isAuthorFilterModified={isAuthorFilterModified}
                    tagFilter={[]}
                    onTagFilterChange={() => {}}
                    onSelect={() => {}}
                />
            </WorkspaceProvider>
        </BackendProvider>
    );
}

describe("InsightPicker", () => {
    it("drops the author default when the author has no visualizations", async () => {
        const { backend, createdByFilters } = createBackend({ insightsAuthor: OTHER_AUTHOR });

        render(<TestPicker backend={backend} />);

        expect(await screen.findByText("Insight 0")).toBeTruthy();
        await waitFor(() => expect(createdByFilters).toEqual([[AUTHOR], undefined]));
    });

    it("keeps an author the user picks back, even when it matches nothing", async () => {
        const { backend, createdByFilters } = createBackend({ insightsAuthor: OTHER_AUTHOR });

        render(<TestPicker backend={backend} />);
        expect(await screen.findByText("Insight 0")).toBeTruthy();

        await userEvent.click(screen.getByText("filter by me"));

        await waitFor(() => expect(createdByFilters).toEqual([[AUTHOR], undefined, [AUTHOR]]));
        expect(screen.getByTestId("author-filter").textContent).toBe(AUTHOR);
    });

    it("honours a plain controlled caller's modification latch", async () => {
        const { backend, createdByFilters } = createBackend({ insightsAuthor: OTHER_AUTHOR });

        render(<PlainControlledPicker backend={backend} isAuthorFilterModified />);

        await waitFor(() => expect(createdByFilters).toEqual([[AUTHOR]]));
        expect(screen.getByTestId("author-filter").textContent).toBe(AUTHOR);
    });

    it("keeps the author default when a tag the user selected is what matched nothing", async () => {
        const { backend, queries } = createBackend({ insightsAuthor: AUTHOR });

        render(<TestPicker backend={backend} />);
        expect(await screen.findByText("Insight 0")).toBeTruthy();

        await userEvent.click(screen.getByText("filter by tag"));

        await waitFor(() =>
            expect(queries).toEqual([
                { createdBy: [AUTHOR], tags: undefined },
                { createdBy: [AUTHOR], tags: [UNUSED_TAG] },
            ]),
        );
        expect(screen.getByTestId("author-filter").textContent).toBe(AUTHOR);
    });

    it("keeps the author default when clearing that tag again", async () => {
        const { backend, queries } = createBackend({ insightsAuthor: AUTHOR });

        render(<TestPicker backend={backend} />);
        expect(await screen.findByText("Insight 0")).toBeTruthy();
        await userEvent.click(screen.getByText("filter by tag"));
        await waitFor(() => expect(queries).toHaveLength(2));

        await userEvent.click(screen.getByText("clear tag"));

        await waitFor(() =>
            expect(queries).toEqual([
                { createdBy: [AUTHOR], tags: undefined },
                { createdBy: [AUTHOR], tags: [UNUSED_TAG] },
                { createdBy: [AUTHOR], tags: undefined },
            ]),
        );
        expect(screen.getByTestId("author-filter").textContent).toBe(AUTHOR);
    });

    it("keeps that author when the picker is closed and reopened", async () => {
        const { backend, createdByFilters } = createBackend({ insightsAuthor: OTHER_AUTHOR });

        render(<TestPicker backend={backend} />);
        expect(await screen.findByText("Insight 0")).toBeTruthy();
        await userEvent.click(screen.getByText("filter by me"));
        await waitFor(() => expect(createdByFilters).toHaveLength(3));

        await userEvent.click(screen.getByText("toggle picker"));
        await userEvent.click(screen.getByText("toggle picker"));

        await waitFor(() => expect(createdByFilters).toEqual([[AUTHOR], undefined, [AUTHOR], [AUTHOR]]));
        expect(screen.getByTestId("author-filter").textContent).toBe(AUTHOR);
    });
});
