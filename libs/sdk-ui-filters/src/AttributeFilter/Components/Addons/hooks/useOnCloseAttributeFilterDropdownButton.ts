// (C) 2021-2022 GoodData Corporation

import { useEffect } from "react";
import { usePrevious } from "@gooddata/sdk-ui";
import { IAttributeFilterDropdownButtonProps } from "../../DropdownButton/AttributeFilterDropdownButton.js";

/**
 * This hook is useful to inject custom onClose to AttributeFilterDropdownButton
 * @internal
 */
export const useOnCloseAttributeFilterDropdownButton = (
    props: IAttributeFilterDropdownButtonProps,
    onClose: () => void,
) => {
    const { isOpen } = props;
    const { isOpen: isOpenPrevious } = usePrevious(props);

    //This effect is handling onClose callback by checking previous and current open state
    useEffect(() => {
        if (onClose && isOpenPrevious && !isOpen) {
            onClose();
        }
    }, [onClose, isOpen, isOpenPrevious]);
};
