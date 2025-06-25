// (C) 2025 GoodData Corporation

import { useEffect } from "react";
import { useDebouncedState } from "../utils/debounce.js";

export const useAsyncTableSearch = (onSearch?: (search: string) => void) => {
    const [searchValue, setSearchValue, debouncedSearchValue] = useDebouncedState("", 300);

    useEffect(() => {
        onSearch?.(debouncedSearchValue);
    }, [debouncedSearchValue, onSearch]);

    return {
        searchValue,
        setSearchValue,
    };
};
