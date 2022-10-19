// (C) 2022 GoodData Corporation
import { useEffect, useState, useCallback } from "react";

/**
 * UseAttributeFilterSearch hook properties
 * @beta
 */
export interface IUseAttributeFilterSearchProps {
    searchString: string;
    onSearch: (search: string) => void;
}

/**
 * Use this hook if you want to implement your custom attribute filter search bar component
 *
 * @beta
 */
export const useAttributeFilterSearch = (props: IUseAttributeFilterSearchProps) => {
    const { onSearch, searchString } = props;
    const [search, setSearch] = useState(searchString);

    useEffect(() => {
        setSearch(searchString);
    }, [searchString]);

    const onSearchCallback = useCallback(
        (search: string) => {
            setSearch(search);
            onSearch(search);
        },
        [onSearch],
    );

    return {
        onSearch: onSearchCallback,
        search,
    };
};
