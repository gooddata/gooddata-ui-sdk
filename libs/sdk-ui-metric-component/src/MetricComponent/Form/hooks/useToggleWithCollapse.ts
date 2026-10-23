// (C) 2021-2026 GoodData Corporation

import { useEffect, useState } from "react";

type IUseToggleWithCollapse = [boolean, () => void];

export function useToggleWithCollapse(itemLength: number): IUseToggleWithCollapse {
    const [opened, setOpened] = useState(true);
    const [toggled, setToggled] = useState(false);

    const toggleOpened = () => {
        setOpened((state) => !state);
        setToggled(true);
    };

    useEffect(() => {
        if (!toggled && itemLength > 7) {
            setOpened(false);
        }
    }, [setOpened, itemLength, toggled]);

    return [opened, toggleOpened];
}
