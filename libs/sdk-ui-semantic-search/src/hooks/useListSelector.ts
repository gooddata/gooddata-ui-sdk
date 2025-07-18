// (C) 2024-2025 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

/**
 * This hook provides keyboard navigation for a list of items. It listens to ArrowUp, ArrowDown and Enter keys and
 * calls the onSelect callback when Enter is pressed.
 * @internal
 */
export const useListSelector = <T>(
    items: Array<T>,
    onSelect: (item: T, e: MouseEvent | KeyboardEvent) => void,
) => {
    const [selected, setSelected] = useState<number>(0);
    const [direction, setDirection] = useState<-1 | 1 | 0>(0);

    useEffect(() => {
        setSelected(0);
        setDirection(0);
    }, [items]);
    const setSelectedItem = useCallback(
        (item: T) => {
            setDirection(0);
            setSelected(Math.max(Math.min(items.indexOf(item), items.length - 1), 0));
        },
        [items],
    );

    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if (["ArrowDown", "ArrowUp", "Enter"].indexOf(event.key) === -1) return;

            const setIndex = (index: number) => setSelected(Math.max(Math.min(index, items.length - 1), 0));

            switch (event.key) {
                case "ArrowDown":
                    setIndex(selected + 1);
                    setDirection(1);
                    break;
                case "ArrowUp":
                    setIndex(selected - 1);
                    setDirection(-1);
                    break;
                case "Enter":
                    onSelect(items[selected], event);
            }

            event.stopImmediatePropagation();
            event.preventDefault();
        };

        // Listen to keyboard events while the component is mounted
        document.addEventListener("keydown", listener);

        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, [items, onSelect, selected]);

    return [items[selected], setSelectedItem, direction] as [T, (item: T) => void, -1 | 0 | 1];
};
