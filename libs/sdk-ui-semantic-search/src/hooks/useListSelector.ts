// (C) 2024 GoodData Corporation

import * as React from "react";

/**
 * This hook provides keyboard navigation for a list of items. It listens to ArrowUp, ArrowDown and Enter keys and
 * calls the onSelect callback when Enter is pressed.
 * @internal
 */
export const useListSelector = <T>(items: Array<T>, onSelect: (item: T) => void) => {
    const [selected, setSelected] = React.useState<number>(0);
    React.useEffect(() => {
        setSelected(0);
    }, [items]);
    const doSetSelected = React.useCallback(
        (newValue: number) => {
            setSelected(Math.max(Math.min(newValue, items.length - 1), 0));
        },
        [items.length],
    );

    React.useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if (["ArrowDown", "ArrowUp", "Enter"].indexOf(event.key) === -1) return;

            event.preventDefault();
            event.stopImmediatePropagation();

            switch (event.key) {
                case "ArrowDown":
                    doSetSelected(selected + 1);
                    break;
                case "ArrowUp":
                    doSetSelected(selected - 1);
                    break;
                case "Enter":
                    onSelect(items[selected]);
            }
        };

        // Listen to keyboard events while the component is mounted
        document.addEventListener("keydown", listener);

        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, [items, onSelect, selected, doSetSelected]);

    return [selected, doSetSelected] as [number, (index: number) => void];
};
