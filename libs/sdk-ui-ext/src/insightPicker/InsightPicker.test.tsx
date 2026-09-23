// (C) 2026 GoodData Corporation

import { useState } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { type IAnalyticalBackend, type IFilterBaseOptions } from "@gooddata/sdk-backend-spi";
import { type IInsight, type ISemanticSearchResultItem, uriRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { InsightPicker } from "./InsightPicker.js";
import { useInsightPickerState } from "./useInsightPickerState.js";

const AUTHOR = "author-login";
const OTHER_AUTHOR = "other-login";
const UNUSED_TAG = "tag-nobody-used";
const TOTAL_INSIGHTS = 60;
const PAGE_SIZE = 50;
/** Sits past the first page, so the picker cannot have it from its own first query. */
const LATE_INSIGHT_INDEX = 55;
const LATE_INSIGHT_TITLE = "Eventing overview";
/** Matched by the backend through a field the picker's own matcher does not read. */
const TAGGED_INSIGHT_INDEX = 57;
const TAGGED_INSIGHT_TAG = "quarterly";

function insight(index: number): IInsight {
    return {
        insight: {
            identifier: `insight-${index}`,
            uri: `/insight/${index}`,
            ref: uriRef(`/insight/${index}`),
            title: index === LATE_INSIGHT_INDEX ? LATE_INSIGHT_TITLE : `Insight ${index}`,
            tags: index === TAGGED_INSIGHT_INDEX ? [TAGGED_INSIGHT_TAG] : [],
            visualizationUrl: "local:table",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
        },
    } as IInsight;
}

const allInsights = Array.from({ length: TOTAL_INSIGHTS }, (_, index) => insight(index));

/** Held by no insight the backend can match, so only the AI endpoint can put it in the list. */
const SUGGESTION_TITLE = "Quarterly revenue";
const suggestion = {
    id: "quarterly-revenue",
    type: "visualization",
    title: SUGGESTION_TITLE,
    description: "",
    visualizationUrl: "local:table",
} as unknown as ISemanticSearchResultItem;

interface IInsightsQueryStub {
    withSize: () => IInsightsQueryStub;
    withPage: (page: number) => IInsightsQueryStub;
    withSorting: () => IInsightsQueryStub;
    withInclude: () => IInsightsQueryStub;
    withFilter: (filter: IFilterBaseOptions) => IInsightsQueryStub;
    query: () => Promise<{ items: IInsight[]; totalCount: number }>;
}

function createBackend({
    insightsAuthor,
    semanticResults = [],
}: {
    insightsAuthor: string;
    semanticResults?: ISemanticSearchResultItem[];
}) {
    const createdByFilters: (string[] | undefined)[] = [];
    const queries: { createdBy: string[] | undefined; tags: string[] | undefined }[] = [];
    const searchFilters: (string | undefined)[] = [];
    const semanticQuestions: string[] = [];

    const getSemanticSearchQuery = () => {
        const query = {
            withQuestion: (question: string) => {
                semanticQuestions.push(question);
                return query;
            },
            withDeepSearch: () => query,
            withObjectTypes: () => query,
            withLimit: () => query,
            withAllowedRelationshipTypes: () => query,
            withIncludeTags: () => query,
            withExcludeTags: () => query,
            query: () => Promise.resolve({ results: semanticResults, relationships: [] }),
        };

        return query;
    };

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
                const search = filter?.search;
                createdByFilters.push(createdBy);
                queries.push({ createdBy, tags });
                searchFilters.push(search);

                if (createdBy?.length && !createdBy.includes(insightsAuthor)) {
                    return Promise.resolve({ items: [], totalCount: 0 });
                }
                if (tags?.includes(UNUSED_TAG)) {
                    return Promise.resolve({ items: [], totalCount: 0 });
                }
                // Mirrors the backend's multi-field `=containsic=` search filter.
                const matching = search
                    ? allInsights.filter((item) =>
                          [item.insight.title, item.insight.identifier, ...item.insight.tags!].some((value) =>
                              value.toLowerCase().includes(search.toLowerCase()),
                          ),
                      )
                    : allInsights;
                return Promise.resolve({
                    items: matching.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
                    totalCount: matching.length,
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
                getSemanticSearchQuery,
            }),
        }),
    } as unknown as IAnalyticalBackend;

    return { backend, createdByFilters, queries, searchFilters, semanticQuestions };
}

/** Mirrors the consumers: the picker body is mounted only while open, its state is not. */
function TestPicker({
    backend,
    enableSemanticSearch = false,
}: {
    backend: IAnalyticalBackend;
    enableSemanticSearch?: boolean;
}) {
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
                        enableSemanticSearch={enableSemanticSearch}
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

/** A caller that starts out saying nothing about semantic search, then allows it. */
function DefaultPicker({ backend }: { backend: IAnalyticalBackend }) {
    const pickerState = useInsightPickerState(AUTHOR);
    const [enableSemanticSearch, setEnableSemanticSearch] = useState<boolean | undefined>(undefined);

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="workspace">
                <button onClick={() => setEnableSemanticSearch(true)}>allow AI search</button>
                <InsightPicker
                    {...pickerState}
                    author={AUTHOR}
                    enableSemanticSearch={enableSemanticSearch}
                    onSelect={() => {}}
                />
            </WorkspaceProvider>
        </BackendProvider>
    );
}

function searchInput() {
    return screen.getByPlaceholderText(/Search all visualizations/);
}

/** One slot of the virtualized list, and so one stop for keyboard navigation. */
const LIST_ITEM_SELECTOR = ".gd-ui-kit-paged-virtual-list__item";

// A call that was never made and one that is merely still pending look alike until every debounce
// the query passes through has run out.
const DEBOUNCE_WINDOW_MS = 800;

function afterTheDebounceWindow() {
    return new Promise((resolve) => setTimeout(resolve, DEBOUNCE_WINDOW_MS));
}

describe("InsightPicker", () => {
    // The endpoint is gated on a feature flag only the caller can read, so a picker that was never
    // told about it must not reach for the AI.
    it("leaves the AI search endpoint alone until the caller allows it", async () => {
        const { backend, semanticQuestions } = createBackend({
            insightsAuthor: AUTHOR,
            semanticResults: [suggestion],
        });

        render(<DefaultPicker backend={backend} />);
        expect(await screen.findByText("Insight 0")).toBeTruthy();
        await userEvent.type(searchInput(), "eventing");
        await afterTheDebounceWindow();

        expect(semanticQuestions).toEqual([]);
        expect(screen.queryByText(SUGGESTION_TITLE)).toBeNull();

        // The same query over the same stub does reach the endpoint once the caller allows it, so
        // the silence above is the gate rather than a picker that could never have searched.
        await userEvent.click(screen.getByText("allow AI search"));

        expect(await screen.findByText(SUGGESTION_TITLE)).toBeTruthy();
        expect(semanticQuestions).toEqual(["eventing"]);
    });

    it("heads the AI suggestions with their own group label", async () => {
        const { backend } = createBackend({ insightsAuthor: AUTHOR, semanticResults: [suggestion] });

        render(<TestPicker backend={backend} enableSemanticSearch />);
        expect(await screen.findByText("Insight 0")).toBeTruthy();

        await userEvent.type(searchInput(), "eventing");

        const suggested = await screen.findByText(SUGGESTION_TITLE);
        const rows = screen.getAllByText(new RegExp(`${LATE_INSIGHT_TITLE}|Similar|${SUGGESTION_TITLE}`));
        expect(rows.map((row) => row.textContent)).toEqual([LATE_INSIGHT_TITLE, "Similar", SUGGESTION_TITLE]);
        // The label rides on the suggestion's own row. A row of its own would take a keyboard stop
        // on a line there is nothing to select.
        expect(screen.getByText("Similar").closest(LIST_ITEM_SELECTOR)).toBe(
            suggested.closest(LIST_ITEM_SELECTOR),
        );
    });

    it("matches a visualization the title does not, so a description or id still finds it", async () => {
        const { backend } = createBackend({ insightsAuthor: AUTHOR });

        render(<TestPicker backend={backend} />);
        expect(await screen.findByText("Insight 0")).toBeTruthy();

        await userEvent.type(searchInput(), `insight-${LATE_INSIGHT_INDEX}`);

        expect(await screen.findByText(LATE_INSIGHT_TITLE)).toBeTruthy();
    });

    it("shows a visualization the backend matched on a field the picker cannot read", async () => {
        const { backend } = createBackend({ insightsAuthor: AUTHOR });

        render(<TestPicker backend={backend} />);
        expect(await screen.findByText("Insight 0")).toBeTruthy();

        await userEvent.type(searchInput(), TAGGED_INSIGHT_TAG);

        expect(await screen.findByText(`Insight ${TAGGED_INSIGHT_INDEX}`)).toBeTruthy();
    });

    it("searches every visualization through the backend, not only the loaded pages", async () => {
        const { backend, searchFilters } = createBackend({ insightsAuthor: AUTHOR });

        render(<TestPicker backend={backend} />);
        expect(await screen.findByText("Insight 0")).toBeTruthy();

        await userEvent.type(searchInput(), "eventing");

        await waitFor(() => expect(searchFilters).toContain("eventing"));
        expect(await screen.findByText(LATE_INSIGHT_TITLE)).toBeTruthy();
        expect(screen.queryByText("Insight 0")).toBeNull();
    });

    it("tells a search that matched nothing apart from an empty workspace", async () => {
        const { backend } = createBackend({ insightsAuthor: AUTHOR });

        render(<TestPicker backend={backend} />);
        expect(await screen.findByText("Insight 0")).toBeTruthy();

        await userEvent.type(searchInput(), "nothing matches this");

        expect(await screen.findByText("No visualizations found")).toBeTruthy();
    });

    it("keeps the author default when a search is what matched nothing", async () => {
        const { backend } = createBackend({ insightsAuthor: AUTHOR });

        render(<TestPicker backend={backend} />);
        expect(await screen.findByText("Insight 0")).toBeTruthy();

        await userEvent.type(searchInput(), "nothing matches this");
        expect(await screen.findByText("No visualizations found")).toBeTruthy();

        expect(screen.getByTestId("author-filter").textContent).toBe(AUTHOR);
    });

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
