// (C) 2022-2025 GoodData Corporation
import React from "react";

import { AttributeFilterDropdownButton } from "./DropdownButton/AttributeFilterDropdownButton.js";

/**
 * Component that displays a loading indicator.
 *
 * @remarks
 * It will be rendered during the initialization instead of the component that implements {@link IAttributeFilterDropdownButtonProps}.
 * @beta
 */
export interface IAttributeFilterLoadingProps {
    /**
     * Callback to open or close AttributeFilter dropdown.
     *
     * @beta
     */
    onClick?: () => void;

    /**
     * If true, the AttributeFilter dropdown is open.
     *
     * @beta
     */
    isOpen?: boolean;
}

/**
 * AttributeFilter component that displays a loading indicator.
 *
 * @beta
 */
export function AttributeFilterLoading({ onClick }: IAttributeFilterLoadingProps) {
    return <AttributeFilterDropdownButton isLoading onClick={onClick} />;
}
