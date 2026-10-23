// (C) 2022-2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback } from "react";

import { useProp } from "../../hooks/useProp.js";
import { type ITab } from "../Tab.js";
import { type ITabsProps } from "../Tabs.data.js";

const nextFn = nextInvoke();

export interface IUseTabsProps<T = undefined> {
    tabs: Array<ITab<T>>;
    active: number;
    creatable?: ITabsProps<T>["creatable"];
    onTabClose?: ITabsProps<T>["onTabClose"];
    onBeforeTabClose?: (tab: ITab<T>, next: () => void) => void;
    onTabActivate?: ITabsProps<T>["onTabActivate"];
    onBeforeTabActivate?: (tab: ITab<T>, next: () => void) => void;
    onTabAdd?: (tab: ITab<T>) => void;
    onBeforeTabAdd?: (tab: ITab<T>, next: () => void) => void;
    onTabUpdate?: (oldTab: ITab<T>, newTab: ITab<T>) => void;
}

export interface IUseTabsReturn<T> {
    addTab: (tab: ITab<T>, index?: number) => void;
    activateTab: (tab: ITab<T>) => void;
    updateTab: (tab: ITab<T>, props: Partial<ITab<T>>) => void;
    updateData: (tab: ITab<T>, data: T) => void;
    closeTab: (tab: ITab<T>) => void;
    tabsProps: IUseTabsProps<T>;
}

export function useTabs<T>(props: IUseTabsProps<T>): IUseTabsReturn<T> {
    const [tabs, setTabs] = useProp(props.tabs);
    const [active, setActive] = useProp(Math.min(props.active, props.tabs.length - 1));
    const { onTabActivate, onTabClose, onTabAdd, onTabUpdate } = props;
    const { creatable = true } = props;
    const { onBeforeTabClose = nextFn, onBeforeTabActivate = nextFn, onBeforeTabAdd = nextFn } = props;

    const activateTab = useCallback(
        (tab: ITab<T>) => activateTabHandler(tab, setActive, setTabs, onBeforeTabActivate, onTabActivate),
        [onBeforeTabActivate, onTabActivate, setActive, setTabs],
    );
    const addTab = useCallback(
        (tab: ITab<T>, index = Number.MAX_SAFE_INTEGER) =>
            addTabHandler(tab, index, creatable, setActive, setTabs, onBeforeTabAdd, onTabAdd),
        [creatable, onBeforeTabAdd, onTabAdd, setActive, setTabs],
    );
    const closeTab = useCallback(
        (tab: ITab<T>) => removeTabHandler(tab, setActive, setTabs, onBeforeTabClose, onTabClose),
        [onBeforeTabClose, onTabClose, setActive, setTabs],
    );
    const updateTab = useCallback(
        (tab: ITab<T>, newProps: Partial<ITab<T>>) => updateTabHandler(tab, newProps, setTabs, onTabUpdate),
        [onTabUpdate, setTabs],
    );
    const updateData = useCallback(
        (tab: ITab<T>, data: T) => updateDataHandler(data, tab, setTabs, onTabUpdate),
        [onTabUpdate, setTabs],
    );

    return {
        activateTab,
        addTab,
        closeTab,
        updateTab,
        updateData,
        tabsProps: {
            tabs,
            active,
            creatable,
            onTabClose: closeTab,
            onTabActivate: activateTab,
        },
    };
}

function addTabHandler<T>(
    tab: ITab<T>,
    index: number,
    creatable: ITabsProps<T>["creatable"],
    setActive: Dispatch<SetStateAction<number>>,
    setTabs: Dispatch<SetStateAction<Array<ITab<T>>>>,
    onBeforeTabAdd: Required<IUseTabsProps<T>>["onBeforeTabAdd"],
    onTabAdd?: (tab: ITab<T>) => void,
) {
    if (!creatable) {
        return;
    }

    onBeforeTabAdd(tab, () =>
        setTabs((oldTabs) => {
            const newTabs = oldTabs.slice();
            newTabs.splice(index, 0, tab);
            setActive(newTabs.indexOf(tab));
            if (onTabAdd) {
                onTabAdd(tab);
            }
            return newTabs;
        }),
    );
}

function removeTabHandler<T>(
    tab: ITab<T>,
    setActive: Dispatch<SetStateAction<number>>,
    setTabs: Dispatch<SetStateAction<Array<ITab<T>>>>,
    onBeforeTabClose: Required<IUseTabsProps<T>>["onBeforeTabClose"],
    onTabClose?: ITabsProps<T>["onTabClose"],
) {
    if (!tab.options?.closeable) {
        return;
    }

    setTabs((oldTabs) => {
        const index = findIndex(tab, oldTabs);
        const found = oldTabs[index];

        if (!found) {
            return oldTabs;
        }

        let shouldProceed = false;
        onBeforeTabClose(found, () => {
            shouldProceed = true;
        });

        if (!shouldProceed) {
            return oldTabs;
        }

        setActive((oldActive) =>
            index <= oldActive ? Math.max(oldActive - 1, 0) : Math.min(oldActive, oldTabs.length - 2),
        );

        if (onTabClose) {
            onTabClose(found);
        }
        return oldTabs.filter((t) => t !== tab);
    });
}

function updateTabHandler<T>(
    tab: ITab<T>,
    newProps: Partial<ITab<T>>,
    setTabs: Dispatch<SetStateAction<Array<ITab<T>>>>,
    onTabUpdate?: (oldTab: ITab<T>, newTab: ITab<T>) => void,
) {
    setTabs((oldTabs) => {
        const index = findIndex(tab, oldTabs);
        if (index >= 0) {
            const currentTab = oldTabs[index];
            const newTab = { ...currentTab, ...newProps };

            const newTabs = oldTabs.slice();
            newTabs.splice(index, 1, newTab);
            if (onTabUpdate) {
                onTabUpdate(currentTab, newProps as ITab<T>);
            }
            return newTabs;
        }
        return oldTabs;
    });
}

function updateDataHandler<T>(
    data: T,
    tab: ITab<T>,
    setTabs: Dispatch<SetStateAction<Array<ITab<T>>>>,
    onTabUpdate?: (oldTab: ITab<T>, newTab: ITab<T>) => void,
) {
    setTabs((oldTabs) => {
        const index = findIndex(tab, oldTabs);
        if (index >= 0) {
            const oldTab = oldTabs[index];
            const newTab = { ...oldTab, data };

            const newTabs = oldTabs.slice();
            newTabs[index] = newTab;

            if (onTabUpdate) {
                onTabUpdate(oldTab, { data } as ITab<T>);
            }
            return newTabs;
        }
        return oldTabs;
    });
}

function activateTabHandler<T>(
    tab: ITab<T>,
    setActive: (p: number) => void,
    setTabs: Dispatch<SetStateAction<Array<ITab<T>>>>,
    onBeforeTabActivate: Required<IUseTabsProps<T>>["onBeforeTabActivate"],
    onTabActivate?: ITabsProps<T>["onTabActivate"],
) {
    setTabs((oldTabs) => {
        const index = findIndex(tab, oldTabs);
        const found = oldTabs[index];

        if (!found) {
            return oldTabs;
        }

        let shouldProceed = false;
        onBeforeTabActivate(found, () => {
            shouldProceed = true;
        });

        if (!shouldProceed) {
            return oldTabs;
        }

        setActive(index);
        if (onTabActivate) {
            onTabActivate(found);
        }

        return oldTabs;
    });
}

function findIndex<T>(tab: ITab<T>, tabs: Array<ITab<T>>) {
    const found = tabs
        .map((current, i) => (current.id === tab.id ? i : null))
        .filter((item) => item !== null);
    return found.length ? found[0] : -1;
}

function nextInvoke<T>(): (data: T, next: () => void) => void {
    return (_, next) => next();
}
