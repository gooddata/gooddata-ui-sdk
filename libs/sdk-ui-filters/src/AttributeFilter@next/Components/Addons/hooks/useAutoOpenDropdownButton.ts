// (C) 2021-2022 GoodData Corporation

import { useEffect } from "react";
import { usePrevious } from "@gooddata/sdk-ui";
import { IAttributeFilterDropdownButtonProps } from "../../types";

/**
 * This hook is useful to inject custom isAutoOpen prop to AttributeFilterDropdownButton
 * @internal
 */
export const useAutoOpenDropdownButton = (
    props: IAttributeFilterDropdownButtonProps,
    isAutoOpen: boolean,
) => {
    const { onClick } = props;
    const { isOpen: isOpenPrevious } = usePrevious(props);

    //This effect is handling autoOpen filter by simulating button click to open dropdown
    useEffect(() => {
        if (isAutoOpen && !isOpenPrevious) {
            onClick();
        }
    }, [onClick, isAutoOpen, isOpenPrevious]);
};
