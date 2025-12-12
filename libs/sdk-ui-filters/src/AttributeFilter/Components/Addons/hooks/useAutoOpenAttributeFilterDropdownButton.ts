// (C) 2021-2025 GoodData Corporation

import { useEffect } from "react";

import { usePrevious } from "@gooddata/sdk-ui";

import { type IAttributeFilterDropdownButtonProps } from "../../DropdownButton/AttributeFilterDropdownButton.js";

/**
 * This hook is useful to inject custom isAutoOpen prop to AttributeFilterDropdownButton
 * @internal
 */
export const useAutoOpenAttributeFilterDropdownButton = (
    props: IAttributeFilterDropdownButtonProps,
    isAutoOpen: boolean,
) => {
    const { onClick } = props;
    const { isOpen: isOpenPrevious } = usePrevious(props);

    //This effect is handling autoOpen filter by simulating button click to open dropdown
    useEffect(() => {
        if (isAutoOpen && !isOpenPrevious) {
            onClick?.();
        }
    }, [onClick, isAutoOpen, isOpenPrevious]);
};
