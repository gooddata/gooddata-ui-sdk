// (C) 2019-2024 GoodData Corporation

/**
 * Tiger actions utility functions
 *
 * @internal
 */
export class ActionsUtilities {
    /**
     * Loads all items of the paginated endpoint.
     *
     * @param promiseFactory - promise factory
     * @param options - change defaults eg size
     * @returns
     */
    public static loadAllPages = async <T>(
        promiseFactory: (params: { page: number; size: number }) => Promise<T[]>,
        options: { size: number } = { size: 1000 },
    ): Promise<T[]> => {
        const results: T[] = [];
        const size = options.size;
        let page = 0;
        let lastPageSize = size;
        while (lastPageSize === size) {
            const result = await promiseFactory({
                page,
                size,
            });
            results.push(...result);
            lastPageSize = result.length;
            page++;
        }

        return results;
    };
}
