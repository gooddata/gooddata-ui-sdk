// (C) 2019-2020 GoodData Corporation
import range from "lodash/range";
import { InMemoryPaging } from "../paging";

describe("InMemoryPaging", () => {
    const Items = range(125);

    it("should return all items in single huge page", () => {
        const pager = new InMemoryPaging<number>(Items, 200, 0);

        expect(pager.items).toEqual(Items);
    });

    it("should return empty page once end of items is reached", async () => {
        const pager = new InMemoryPaging<number>(Items, 200, 0);
        const nextPage = await pager.next();

        // offset is _after_ the last item index (last item index is 124)
        expect(nextPage.offset).toBe(125);

        // limit is kept as-was-specified
        expect(nextPage.limit).toBe(200);

        // there are no items on the page
        expect(nextPage.items).toBeDefined();
        expect(nextPage.items.length).toBe(0);

        // total count stays the same
        expect(nextPage.totalCount).toBe(125);
    });

    it("should set limit, offset and total count per page", () => {
        const pager = new InMemoryPaging<number>(Items, 10, 10);

        expect(pager.offset).toEqual(10);
        expect(pager.limit).toEqual(10);
        expect(pager.totalCount).toEqual(125);
    });

    it("should provide correct window of items", () => {
        const pager = new InMemoryPaging<number>(Items, 99, 11);

        expect(pager.items).toEqual(range(11, 11 + 99));
    });

    it("should return empty page if offset is too far", () => {
        const pager = new InMemoryPaging<number>(Items, 10, 500);

        // offset falls back to _after_ the last item index
        expect(pager.offset).toEqual(125);
        // and there is no items
        expect(pager.items.length).toBe(0);
    });
});
