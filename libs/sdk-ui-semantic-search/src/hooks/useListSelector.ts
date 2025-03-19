// (C) 2024 GoodData Corporation

import * as React from "react";

/**
 * This hook provides keyboard navigation for a list of items. It listens to ArrowUp, ArrowDown and Enter keys and
 * calls the onSelect callback when Enter is pressed.
 * @internal
 */
export const useListSelector = <T>(
    items: Array<T>,
    onSelect: (item: T, e: MouseEvent | KeyboardEvent) => void,
) => {
    const [selected, setSelected] = React.useState<number>(0);
    React.useEffect(() => {
        setSelected(0);
    }, [items]);
    const setSelectedItem = React.useCallback(
        (item: T) => {
            setSelected(Math.max(Math.min(items.indexOf(item), items.length - 1), 0));
        },
        [items],
    );

    React.useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if (["ArrowDown", "ArrowUp", "Enter"].indexOf(event.key) === -1) return;

            const setIndex = (index: number) => setSelected(Math.max(Math.min(index, items.length - 1), 0));

            switch (event.key) {
                case "ArrowDown":
                    setIndex(selected + 1);
                    break;
                case "ArrowUp":
                    setIndex(selected - 1);
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

    return [items[selected], setSelectedItem] as [T, (item: T) => void];
};
