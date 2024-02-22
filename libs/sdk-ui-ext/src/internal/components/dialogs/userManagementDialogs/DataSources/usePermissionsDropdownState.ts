// (C) 2023-2024 GoodData Corporation

import { useCallback, useState } from "react";

export const usePermissionsDropdownState = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const toggleOpen = useCallback(() => setIsOpen(!isOpen), [isOpen]);

    return { isDropdownOpen: isOpen, toggleDropdown: toggleOpen };
};
