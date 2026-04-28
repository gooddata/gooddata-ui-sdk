// (C) 2026 GoodData Corporation

import { act, renderHook, waitFor } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import type { AsyncStatus } from "../../async/types.js";
import {
    type IPaginatorEndpoint,
    type IPaginatorPage,
    useEndpointPaginator,
} from "../useEndpointPaginator.js";

type Entity = { id: string };

type FakePage = IPaginatorPage<Entity> & { next: Mock };

function chainPages(pages: Array<{ items: Entity[]; offset: number; totalCount: number }>): FakePage {
    const at = (idx: number): FakePage => {
        const spec = pages[idx];
        if (!spec) {
            throw new Error("next() called beyond the configured page chain");
        }
        return {
            items: spec.items,
            offset: spec.offset,
            totalCount: spec.totalCount,
            next: vi.fn(async () => at(idx + 1)),
        };
    };
    return at(0);
}

function endpointFromPages(pages: Array<{ items: Entity[]; offset: number; totalCount: number }>): {
    endpoint: IPaginatorEndpoint<Entity>;
    query: Mock;
} {
    const query = vi.fn(async () => chainPages(pages));
    return { endpoint: { query }, query };
}

const identity = (e: Entity) => e;

async function waitForStatus(result: { current: { status: AsyncStatus } }, expected: AsyncStatus) {
    await waitFor(() => {
        expect(result.current.status).toBe(expected);
    });
}

beforeEach(() => {
    vi.clearAllMocks();
});

function renderPaginator<TItem>(endpoints: IPaginatorEndpoint<Entity>[], convert: (e: Entity) => TItem) {
    return renderHook(() => useEndpointPaginator(endpoints, convert));
}

describe("useEndpointPaginator – initial load", () => {
    it("queries first pages of all endpoints in parallel and ends in success", async () => {
        const a = endpointFromPages([{ items: [{ id: "a1" }], offset: 0, totalCount: 1 }]);
        const b = endpointFromPages([{ items: [{ id: "b1" }, { id: "b2" }], offset: 0, totalCount: 2 }]);

        const { result } = renderPaginator([a.endpoint, b.endpoint], identity);
        await waitForStatus(result, "success");

        expect(a.query).toHaveBeenCalledTimes(1);
        expect(b.query).toHaveBeenCalledTimes(1);
        expect(result.current.items.map((i) => i.id)).toEqual(["a1", "b1", "b2"]);
        expect(result.current.totalCount).toBe(3);
        expect(result.current.totalCounts).toEqual([1, 2]);
        expect(result.current.hasNext).toBe(false);
    });

    it("stops the visible cursor at the first endpoint that still has more pages", async () => {
        const a = endpointFromPages([{ items: [{ id: "a1" }, { id: "a2" }], offset: 0, totalCount: 2 }]);
        const b = endpointFromPages([
            { items: [{ id: "b1" }], offset: 0, totalCount: 3 },
            { items: [{ id: "b2" }, { id: "b3" }], offset: 1, totalCount: 3 },
        ]);
        const c = endpointFromPages([{ items: [{ id: "c1" }], offset: 0, totalCount: 5 }]);

        const { result } = renderPaginator([a.endpoint, b.endpoint, c.endpoint], identity);
        await waitForStatus(result, "success");

        expect(result.current.items.map((i) => i.id)).toEqual(["a1", "a2", "b1"]);
        expect(result.current.hasNext).toBe(true);
    });

    it("converts entities through the supplied convert callback", async () => {
        const a = endpointFromPages([{ items: [{ id: "x" }], offset: 0, totalCount: 1 }]);
        const convert = vi.fn((e: Entity) => ({ wrapped: e.id }));

        const { result } = renderPaginator([a.endpoint], convert);
        await waitForStatus(result, "success");

        expect(convert).toHaveBeenCalledWith({ id: "x" });
        expect(result.current.items).toEqual([{ wrapped: "x" }]);
    });

    it("renders status=error and empty items when an endpoint query rejects", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const failing: IPaginatorEndpoint<Entity> = {
            query: vi.fn(async () => Promise.reject(new Error("boom"))),
        };

        const { result } = renderPaginator([failing], identity);
        await waitForStatus(result, "error");

        expect(result.current.items).toEqual([]);
        expect(result.current.error?.message).toBe("boom");
        consoleSpy.mockRestore();
    });
});

describe("useEndpointPaginator – next()", () => {
    it("loads the next page within a single endpoint and appends in offset order", async () => {
        const a = endpointFromPages([
            { items: [{ id: "a1" }, { id: "a2" }], offset: 0, totalCount: 4 },
            { items: [{ id: "a3" }, { id: "a4" }], offset: 2, totalCount: 4 },
        ]);

        const { result } = renderPaginator([a.endpoint], identity);
        await waitForStatus(result, "success");
        expect(result.current.items.map((i) => i.id)).toEqual(["a1", "a2"]);

        await act(async () => {
            await result.current.next();
        });

        expect(result.current.items.map((i) => i.id)).toEqual(["a1", "a2", "a3", "a4"]);
        expect(result.current.hasNext).toBe(false);
    });

    it("advances across endpoint boundaries when current endpoint is exhausted", async () => {
        const a = endpointFromPages([{ items: [{ id: "a1" }, { id: "a2" }], offset: 0, totalCount: 2 }]);
        const b = endpointFromPages([
            { items: [{ id: "b1" }], offset: 0, totalCount: 2 },
            { items: [{ id: "b2" }], offset: 1, totalCount: 2 },
        ]);
        const c = endpointFromPages([
            { items: [{ id: "c1" }], offset: 0, totalCount: 2 },
            { items: [{ id: "c2" }], offset: 1, totalCount: 2 },
        ]);

        const { result } = renderPaginator([a.endpoint, b.endpoint, c.endpoint], identity);
        await waitForStatus(result, "success");
        expect(result.current.items.map((i) => i.id)).toEqual(["a1", "a2", "b1"]);

        await act(async () => {
            await result.current.next();
        });
        expect(result.current.items.map((i) => i.id)).toEqual(["a1", "a2", "b1", "b2"]);

        // Crossing into c: c's first page is already cached from initial load,
        // so a single next() walks past b (exhausted) and loads c's next page.
        await act(async () => {
            await result.current.next();
        });
        expect(result.current.items.map((i) => i.id)).toEqual(["a1", "a2", "b1", "b2", "c1", "c2"]);
        expect(result.current.hasNext).toBe(false);
    });

    it("status=error when next() rejects, leaving previously loaded items intact", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const firstPage: FakePage = {
            items: [{ id: "a1" }],
            offset: 0,
            totalCount: 2,
            next: vi.fn(async () => {
                throw new Error("next-boom");
            }),
        };
        const endpoint: IPaginatorEndpoint<Entity> = { query: vi.fn(async () => firstPage) };

        const { result } = renderPaginator([endpoint], identity);
        await waitForStatus(result, "success");

        await act(async () => {
            await result.current.next();
        });

        expect(result.current.status).toBe("error");
        expect(result.current.error?.message).toBe("next-boom");
        expect(result.current.items.map((i) => i.id)).toEqual(["a1"]);
        consoleSpy.mockRestore();
    });
});

describe("useEndpointPaginator – reset on endpoint change", () => {
    it("clears items and resets status to loading synchronously when endpoints array changes", async () => {
        const a = endpointFromPages([{ items: [{ id: "a1" }], offset: 0, totalCount: 1 }]);
        const b = endpointFromPages([{ items: [{ id: "b1" }], offset: 0, totalCount: 1 }]);

        const { result, rerender } = renderHook(
            ({ endpoints }: { endpoints: IPaginatorEndpoint<Entity>[] }) =>
                useEndpointPaginator(endpoints, identity),
            { initialProps: { endpoints: [a.endpoint] } },
        );

        await waitForStatus(result, "success");
        expect(result.current.items.map((i) => i.id)).toEqual(["a1"]);

        // Swap endpoint array; the layout-effect reset must clear before the
        // useEffect-based first-load resolves.
        act(() => {
            rerender({ endpoints: [b.endpoint] });
        });

        expect(result.current.status).toBe("loading");
        expect(result.current.items).toEqual([]);

        await waitForStatus(result, "success");
        expect(result.current.items.map((i) => i.id)).toEqual(["b1"]);
    });
});

describe("useEndpointPaginator – updateWhere / removeWhere", () => {
    it("updateWhere replaces matches in the visible list and the endpoint cache", async () => {
        const a = endpointFromPages([{ items: [{ id: "a1" }, { id: "a2" }], offset: 0, totalCount: 2 }]);
        const b = endpointFromPages([{ items: [{ id: "b1" }], offset: 0, totalCount: 1 }]);

        const { result } = renderPaginator([a.endpoint, b.endpoint], identity);
        await waitForStatus(result, "success");

        act(() => {
            result.current.updateWhere((item) => item.id === "a1", { id: "a1*" });
        });

        expect(result.current.items.map((i) => i.id)).toEqual(["a1*", "a2", "b1"]);
    });

    it("updateWhere is a no-op when no item matches", async () => {
        const a = endpointFromPages([{ items: [{ id: "a1" }], offset: 0, totalCount: 1 }]);

        const { result } = renderPaginator([a.endpoint], identity);
        await waitForStatus(result, "success");
        const before = result.current.items;

        act(() => {
            result.current.updateWhere((item) => item.id === "nope", { id: "x" });
        });

        expect(result.current.items).toBe(before);
    });

    it("removeWhere drops matches across endpoints and decrements per-endpoint totalCounts", async () => {
        const a = endpointFromPages([{ items: [{ id: "a1" }, { id: "shared" }], offset: 0, totalCount: 2 }]);
        const b = endpointFromPages([{ items: [{ id: "b1" }, { id: "shared" }], offset: 0, totalCount: 2 }]);

        const { result } = renderPaginator([a.endpoint, b.endpoint], identity);
        await waitForStatus(result, "success");

        act(() => {
            result.current.removeWhere((item) => item.id === "shared");
        });

        expect(result.current.items.map((i) => i.id)).toEqual(["a1", "b1"]);
        expect(result.current.totalCounts).toEqual([1, 1]);
        expect(result.current.totalCount).toBe(2);
    });

    it("removeWhere leaves totalCounts untouched when nothing matches", async () => {
        const a = endpointFromPages([{ items: [{ id: "a1" }], offset: 0, totalCount: 1 }]);

        const { result } = renderPaginator([a.endpoint], identity);
        await waitForStatus(result, "success");
        const before = result.current.totalCounts;

        act(() => {
            result.current.removeWhere((item) => item.id === "nope");
        });

        expect(result.current.items.map((i) => i.id)).toEqual(["a1"]);
        expect(result.current.totalCounts).toBe(before);
    });
});

describe("useEndpointPaginator – refetch(index)", () => {
    it("reloads the targeted endpoint at least to the previously loaded depth", async () => {
        const initialPages = [
            { items: [{ id: "p1-a" }, { id: "p1-b" }], offset: 0, totalCount: 4 },
            { items: [{ id: "p2-a" }, { id: "p2-b" }], offset: 2, totalCount: 4 },
        ];
        let currentPages = initialPages;
        const endpoint: IPaginatorEndpoint<Entity> = {
            query: vi.fn(async () => chainPages(currentPages)),
        };

        const { result } = renderPaginator([endpoint], identity);
        await waitForStatus(result, "success");

        // Walk to depth 4.
        await act(async () => {
            await result.current.next();
        });
        expect(result.current.items).toHaveLength(4);

        // Swap data source; refetch should re-page up to the previously loaded depth.
        currentPages = [
            { items: [{ id: "fresh-1" }, { id: "fresh-2" }], offset: 0, totalCount: 4 },
            { items: [{ id: "fresh-3" }, { id: "fresh-4" }], offset: 2, totalCount: 4 },
        ];

        await act(async () => {
            await result.current.refetch(0);
        });

        expect(result.current.items.map((i) => i.id)).toEqual(["fresh-1", "fresh-2", "fresh-3", "fresh-4"]);
        expect(result.current.totalCounts[0]).toBe(4);
    });

    it("is a no-op for an out-of-range index and does not throw", async () => {
        const a = endpointFromPages([{ items: [{ id: "a1" }], offset: 0, totalCount: 1 }]);

        const { result } = renderPaginator([a.endpoint], identity);
        await waitForStatus(result, "success");

        await act(async () => {
            await result.current.refetch(7);
        });

        expect(result.current.items.map((i) => i.id)).toEqual(["a1"]);
    });

    it("logs but does not surface refetch errors via status", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        let failNext = false;
        const endpoint: IPaginatorEndpoint<Entity> = {
            query: vi.fn(async () => {
                if (failNext) {
                    throw new Error("refetch-boom");
                }
                return chainPages([{ items: [{ id: "a1" }], offset: 0, totalCount: 1 }]);
            }),
        };

        const { result } = renderPaginator([endpoint], identity);
        await waitForStatus(result, "success");

        failNext = true;
        await act(async () => {
            await result.current.refetch(0);
        });

        // status remains success (refetch failures are non-fatal); items stay intact.
        expect(result.current.status).toBe("success");
        expect(result.current.items.map((i) => i.id)).toEqual(["a1"]);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
