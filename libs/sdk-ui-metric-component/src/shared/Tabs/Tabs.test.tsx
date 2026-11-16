// (C) 2007-2026 GoodData Corporation

import { useState } from "react";

import { act, fireEvent, render, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { _omit, suppressConsole } from "@gooddata/util";

import { FocusHandoffContext, type IFocusHandoff, createFocusHandoff } from "../focusHandoff.js";

import { useTabs } from "./hooks/useTabs.js";
import { type ITab, TabSpace, TabState } from "./Tab.js";
import { TabsClasses } from "./Tabs.classes.js";
import { type ITabContentProps } from "./Tabs.data.js";
import { ButtonDivider, Tabs } from "./Tabs.js";

describe("Tabs", () => {
    const tab: Omit<ITab, "id"> = {
        title: "Tab",
        data: undefined,
    };
    const tabChanged: Omit<ITab, "id"> = {
        title: "Changed tab",
        states: { [TabState.Dirty]: true },
        data: undefined,
    };
    const tabInvalid: Omit<ITab, "id"> = {
        title: "Invalid tab",
        states: { [TabState.Invalid]: true },
        data: undefined,
    };
    const tabChangedInvalid: Omit<ITab, "id"> = {
        title: "Changed and invalid tab",
        states: { [TabState.Invalid]: true, [TabState.Dirty]: true },
        data: undefined,
    };
    const tabCloseable: Omit<ITab, "id"> = {
        title: "Closeable tab",
        options: { closeable: true },
        data: undefined,
    };
    const tabFullFeatured: Omit<ITab, "id"> = {
        title: "Full featured tab",
        options: { closeable: true },
        states: { [TabState.Invalid]: true, [TabState.Dirty]: true },
        data: undefined,
    };

    function withIds(tabs: Array<Omit<ITab, "id">>): Array<ITab> {
        return tabs.map((tab, i) => {
            return { ...tab, id: `id-${i + 1}` };
        });
    }

    describe("rendering", () => {
        it("should render right count of tabs and spaces, all disabled", async () => {
            const wrapper = render(<Tabs active={0} tabs={withIds([tab, tab, tab])} />);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.TabInvalid}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.TabDirty}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabSpace}`)).toHaveLength(4);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.Tab}`)).toHaveLength(3);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTab}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTabs}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonMinimize}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonNewTab}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonRight}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonLeft}`)).toHaveLength(0);
        });

        it("should render with closable tab", async () => {
            const wrapper = render(
                <Tabs active={0} tabs={withIds([tabCloseable, tabCloseable, tabCloseable])} />,
            );
            expect(wrapper.container.querySelectorAll(`.${TabSpace}`)).toHaveLength(4);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.TabInvalid}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.TabDirty}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.Tab}`)).toHaveLength(3);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTab}`)).toHaveLength(3);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTabs}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonMinimize}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonNewTab}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonRight}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonLeft}`)).toHaveLength(0);
        });

        it("should render with valid, invalid and combined tabs", async () => {
            const wrapper = render(
                <Tabs active={0} tabs={withIds([tabChanged, tabInvalid, tabChangedInvalid])} />,
            );
            expect(wrapper.container.querySelectorAll(`.${TabSpace}`)).toHaveLength(4);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.Tab}`)).toHaveLength(3);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.TabInvalid}`)).toHaveLength(2);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.TabDirty}`)).toHaveLength(2);
            expect(
                wrapper.container.querySelectorAll(`.${TabsClasses.TabDirty}.${TabsClasses.TabInvalid}`),
            ).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTab}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTabs}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonMinimize}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonNewTab}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonRight}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonLeft}`)).toHaveLength(0);
        });

        it("should render with one full featured tab", async () => {
            const wrapper = render(<Tabs active={0} tabs={withIds([tabFullFeatured])} />);
            expect(wrapper.container.querySelectorAll(`.${TabSpace}`)).toHaveLength(2);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.Tab}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.TabInvalid}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.TabDirty}`)).toHaveLength(1);
            expect(
                wrapper.container.querySelectorAll(`.${TabsClasses.TabDirty}.${TabsClasses.TabInvalid}`),
            ).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTab}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTabs}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonMinimize}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonNewTab}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonRight}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonLeft}`)).toHaveLength(0);
        });

        it("should render with one tab, closable", async () => {
            const wrapper = render(<Tabs active={0} tabs={withIds([tabFullFeatured])} closeable />);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTab}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTabs}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonMinimize}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonNewTab}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${ButtonDivider}`)).toHaveLength(0);
        });

        it("should render with one tab, minimizable", async () => {
            const wrapper = render(<Tabs active={0} tabs={withIds([tabFullFeatured])} minimizable />);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTab}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTabs}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonMinimize}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonNewTab}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${ButtonDivider}`)).toHaveLength(0);
        });

        it("should render with one tab, minimizable and closable", async () => {
            const wrapper = render(
                <Tabs active={0} tabs={withIds([tabFullFeatured])} minimizable closeable />,
            );
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTab}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTabs}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonMinimize}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonNewTab}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${ButtonDivider}`)).toHaveLength(1);
        });

        it("should render with one tab, creatable, minimizable and closable", async () => {
            const wrapper = render(
                <Tabs active={0} tabs={withIds([tabFullFeatured])} minimizable closeable creatable />,
            );
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTab}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTabs}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonMinimize}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`button.${TabsClasses.ButtonNewTab}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${ButtonDivider}`)).toHaveLength(1);
        });

        it("should render with zero tabs", async () => {
            const wrapper = render(<Tabs active={0} tabs={withIds([])} minimizable closeable creatable />);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTab}`)).toHaveLength(0);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTabs}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonMinimize}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`button.${TabsClasses.ButtonNewTab}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${ButtonDivider}`)).toHaveLength(1);
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.Tab}`)).toHaveLength(0);
        });

        it("test call of onTabActivate", async () => {
            const fn = vi.fn();
            const tabs = withIds([tabCloseable, tabCloseable, tabCloseable]);

            const wrapper = render(
                <Tabs active={0} tabs={tabs} closeable creatable minimizable onTabActivate={fn} />,
            );
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.Tab}`).length).toBe(3);

            await act(async () => {
                fireEvent.click(wrapper.container.querySelectorAll(`.${TabsClasses.Tab}`)[2]);
            });
            expect(fn).toHaveBeenCalledWith(tabs[2]);
        });

        it("test call of onTabsMinimize", async () => {
            const fn = vi.fn();
            const tabs = withIds([tabCloseable, tabCloseable, tabCloseable]);

            const wrapper = render(
                <Tabs active={0} tabs={tabs} closeable creatable minimizable onTabsMinimize={fn} />,
            );
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonMinimize}`).length).toBe(1);

            await act(async () => {
                fireEvent.click(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonMinimize}`)[0]);
            });
            expect(fn).toHaveBeenCalledWith();
        });

        it("test call of onTabsClose", async () => {
            const fn = vi.fn();
            const tabs = withIds([tabCloseable, tabCloseable, tabCloseable]);

            const wrapper = render(
                <Tabs active={0} tabs={tabs} closeable creatable minimizable onTabsClose={fn} />,
            );
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTabs}`).length).toBe(1);

            await act(async () => {
                fireEvent.click(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTabs}`)[0]);
            });
            expect(fn).toHaveBeenCalledWith();
        });

        it("test call of onTabCreate", async () => {
            const fn = vi.fn();
            const tabs = withIds([tabCloseable, tabCloseable, tabCloseable]);

            const wrapper = render(
                <Tabs active={0} tabs={tabs} closeable creatable minimizable onTabCreate={fn} />,
            );
            expect(wrapper.container.querySelectorAll(`button.${TabsClasses.ButtonNewTab}`).length).toBe(1);

            await act(async () => {
                fireEvent.click(wrapper.container.querySelectorAll(`button.${TabsClasses.ButtonNewTab}`)[0]);
            });
            expect(fn).toHaveBeenCalledWith();
        });

        it("test call of onTabClose", async () => {
            const fn = vi.fn();
            const tabs = withIds([tabCloseable, tabCloseable, tabCloseable]);

            const wrapper = render(
                <Tabs active={0} tabs={tabs} closeable creatable minimizable onTabClose={fn} />,
            );
            expect(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTab}`).length).toBe(3);

            await act(async () => {
                fireEvent.click(wrapper.container.querySelectorAll(`.${TabsClasses.ButtonCloseTab}`)[2]);
            });
            expect(fn).toHaveBeenCalledWith(tabs[2]);
        });

        it("content rendering based on tab with content", async () => {
            function Content(tab: ITabContentProps<unknown>) {
                return (
                    <label>
                        {tab.tab.title} - {tab.tab.id}
                    </label>
                );
            }

            const tabs = withIds([tab, tabCloseable, tabInvalid]);
            const { container, rerender } = render(
                <Tabs active={0} tabs={tabs} minimizable closeable creatable content={Content} />,
            );

            const label = container.querySelector("label");
            expect(label).not.toBeNull();
            expect(label?.textContent).toBe(`Tab - id-1`);

            // Re-render with active=2
            rerender(<Tabs active={2} tabs={tabs} minimizable closeable creatable content={Content} />);

            const updatedLabel = container.querySelector("label");
            expect(updatedLabel).not.toBeNull();
            expect(updatedLabel?.textContent).toBe(`Invalid tab - id-3`);
        });

        it("content rendering based on tab with render", async () => {
            function Content({ title, id }: { title: string; id: string }) {
                return (
                    <label>
                        {title} - {id} render
                    </label>
                );
            }

            const tabs = withIds([tab, tabCloseable, tabInvalid]);
            const { container, rerender } = render(
                <Tabs
                    active={0}
                    tabs={tabs}
                    minimizable
                    closeable
                    creatable
                    render={({ tab }) => <Content title={tab.title} id={tab.id} />}
                />,
            );

            const label = container.querySelector("label");
            expect(label).not.toBeNull();
            expect(label?.textContent).toBe(`Tab - id-1 render`);

            // Re-render with active=2
            rerender(
                <Tabs
                    active={2}
                    tabs={tabs}
                    minimizable
                    closeable
                    creatable
                    render={({ tab }) => <Content title={tab.title} id={tab.id} />}
                />,
            );

            const updatedLabel = container.querySelector("label");
            expect(updatedLabel).not.toBeNull();
            expect(updatedLabel?.textContent).toBe(`Invalid tab - id-3 render`);
        });

        it("content rendering based on tab with render and content fails", async () => {
            function Content(tab: ITabContentProps<unknown>) {
                return (
                    <label>
                        {tab.tab.title} - {tab.tab.id}
                    </label>
                );
            }

            suppressConsole(
                () =>
                    expect(() => {
                        render(
                            <Tabs
                                active={0}
                                tabs={withIds([tab, tabCloseable, tabInvalid])}
                                render={({ tab }) => <Content tab={tab} />}
                                content={Content}
                            />,
                        );
                    }).toThrowError(`Only one property "render" or "content" can be set.`),
                "error",
                [
                    {
                        type: "includes",
                        value: 'Error: Only one property "render" or "content" can be set.',
                    },
                    {
                        type: "startsWith",
                        value: "The above error occurred in the",
                    },
                ],
            );
        });
    });

    describe("tabs hook", () => {
        it("simple test hook", () => {
            const tabs = withIds([tab, tab, tab, tab]);

            const { result } = renderHook(() =>
                useTabs({
                    tabs,
                    active: 1,
                }),
            );

            const resultTabsProps = _omit(result.current.tabsProps, ["onTabActivate", "onTabClose"]);
            expect(resultTabsProps).toEqual({
                tabs,
                active: 1,
                creatable: true,
            });
        });

        it("change active tab hook", async () => {
            const tabs = withIds([tab, tab, tab, tab]);
            const onTabActivate = vi.fn();

            const { result } = renderHook(() =>
                useTabs({
                    tabs,
                    active: 1,
                    onTabActivate,
                }),
            );

            expect(result.current.tabsProps.active).toEqual(1);

            await act(async () => {
                result.current.activateTab(tabs[3]);
            });
            expect(result.current.tabsProps.active).toEqual(3);
            expect(onTabActivate).toHaveBeenCalledWith(tabs[3]);

            await act(async () => {
                result.current.activateTab(tabs[0]);
            });
            expect(result.current.tabsProps.active).toEqual(0);
            expect(onTabActivate).toHaveBeenCalledWith(tabs[0]);
        });

        describe("tab closes hook", () => {
            it("close tab after active", async () => {
                const tabs = withIds([tabCloseable, tabCloseable, tabCloseable, tabCloseable]);
                const onTabClose = vi.fn();

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 1,
                        onTabClose,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(1);
                expect(result.result.current.tabsProps.tabs.length).toEqual(4);

                await act(async () => {
                    result.result.current.closeTab(tabs[3]);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(1);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(3);
                    expect(onTabClose).toHaveBeenCalledWith(tabs[3]);
                });
            });

            it("close tab before active", async () => {
                const tabs = withIds([tabCloseable, tabCloseable, tabCloseable, tabCloseable]);
                const onTabClose = vi.fn();

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 2,
                        onTabClose,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(2);
                expect(result.result.current.tabsProps.tabs.length).toEqual(4);

                await act(async () => {
                    result.result.current.closeTab(tabs[0]);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(1);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(3);
                    expect(onTabClose).toHaveBeenCalledWith(tabs[0]);
                });
            });

            it("close tab that is active", async () => {
                const tabs = withIds([tabCloseable, tabCloseable, tabCloseable, tabCloseable]);
                const onTabClose = vi.fn();

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 2,
                        onTabClose,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(2);
                expect(result.result.current.tabsProps.tabs.length).toEqual(4);

                await act(async () => {
                    result.result.current.closeTab(tabs[2]);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(1);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(3);
                    expect(onTabClose).toHaveBeenCalledWith(tabs[2]);
                });
            });

            it("do not close tab that is not allowed", async () => {
                const tabs = withIds([tab, tab, tab, tab]);
                const onTabClose = vi.fn();

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 2,
                        onTabClose,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(2);
                expect(result.result.current.tabsProps.tabs.length).toEqual(4);

                await act(async () => {
                    result.result.current.closeTab(tabs[2]);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(2);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(4);
                    expect(onTabClose).not.toHaveBeenCalled();
                });
            });
        });

        describe("add new tab", () => {
            it("on end of tabs", async () => {
                const tabs = withIds([tab, tab, tab, tab]);
                const onTabAdd = vi.fn();

                const { result } = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 1,
                        onTabAdd,
                    }),
                );

                expect(result.current.tabsProps.active).toEqual(1);
                expect(result.current.tabsProps.tabs.length).toEqual(4);

                const addedTab = withIds([tabFullFeatured])[0];
                await act(async () => {
                    result.current.addTab(addedTab);
                });

                await waitFor(() => {
                    expect(result.current.tabsProps.active).toEqual(4);
                    expect(result.current.tabsProps.tabs.length).toEqual(5);
                    expect(onTabAdd).toHaveBeenCalledWith(addedTab);
                });
            });

            it("on start of tabs", async () => {
                const tabs = withIds([tab, tab, tab, tab]);
                const onTabAdd = vi.fn();

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 1,
                        onTabAdd,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(1);
                expect(result.result.current.tabsProps.tabs.length).toEqual(4);

                const addedTab = withIds([tabFullFeatured])[0];
                await act(async () => {
                    result.result.current.addTab(addedTab, 0);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(0);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(5);
                    expect(onTabAdd).toHaveBeenCalledWith(addedTab);
                });
            });

            it("add more tabs at once", async () => {
                const tabs = withIds([tab, tab, tab, tab]);

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 1,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(1);
                expect(result.result.current.tabsProps.tabs).toEqual(tabs);

                const addedTabs = withIds([tabFullFeatured, tabChanged]);
                await act(async () => {
                    result.result.current.addTab(addedTabs[0], 0);
                    result.result.current.addTab(addedTabs[1], 2);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(2);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(6);
                    expect(result.result.current.tabsProps.tabs).toEqual([
                        addedTabs[0],
                        tabs[0],
                        addedTabs[1],
                        tabs[1],
                        tabs[2],
                        tabs[3],
                    ]);
                });
            });

            it("do not add tab if is not allowed", async () => {
                const tabs = withIds([tab, tab, tab, tab]);

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 1,
                        creatable: false,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(1);
                expect(result.result.current.tabsProps.tabs).toEqual(tabs);

                const addedTabs = withIds([tabFullFeatured, tabChanged]);
                await act(async () => {
                    result.result.current.addTab(addedTabs[0], 0);
                    result.result.current.addTab(addedTabs[1], 2);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(1);
                    expect(result.result.current.tabsProps.tabs).toEqual(tabs);
                });
            });
        });

        describe("update tab", () => {
            it("update one tab only", async () => {
                const tabs = withIds([tab, tab, tab, tab]);
                const onTabUpdate = vi.fn();

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 1,
                        onTabUpdate,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(1);
                expect(result.result.current.tabsProps.tabs.length).toEqual(4);

                await act(async () => {
                    result.result.current.updateTab(tabs[1], {
                        states: { [TabState.Dirty]: true, [TabState.Invalid]: true },
                    });
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(1);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(4);
                    expect(result.result.current.tabsProps.tabs[1].states).toEqual({
                        [TabState.Dirty]: true,
                        [TabState.Invalid]: true,
                    });
                    expect(onTabUpdate).toHaveBeenCalledWith(tabs[1], {
                        states: { [TabState.Dirty]: true, [TabState.Invalid]: true },
                    });
                });
            });

            it("update more tabs at once", async () => {
                const tabs = withIds([tab, tab, tab, tab]);

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 1,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(1);
                expect(result.result.current.tabsProps.tabs).toEqual(tabs);

                await act(async () => {
                    result.result.current.updateTab(tabs[0], {
                        states: { [TabState.Dirty]: true, [TabState.Invalid]: true },
                        options: { closeable: true },
                        title: "Renamed 1",
                    });
                    result.result.current.updateTab(tabs[2], {
                        states: { [TabState.Dirty]: true, [TabState.Invalid]: true },
                        options: { closeable: true },
                        title: "Renamed 2",
                    });
                    result.result.current.updateTab(tabs[3], {
                        states: { [TabState.Dirty]: true, [TabState.Invalid]: true },
                        options: { closeable: true },
                        title: "Renamed 3",
                    });
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(1);
                    expect(result.result.current.tabsProps.tabs).toEqual([
                        {
                            id: "id-1",
                            title: "Renamed 1",
                            options: { closeable: true },
                            states: {
                                [TabState.Dirty]: true,
                                [TabState.Invalid]: true,
                            },
                        },
                        tabs[1],
                        {
                            id: "id-3",
                            title: "Renamed 2",
                            options: { closeable: true },
                            states: {
                                [TabState.Dirty]: true,
                                [TabState.Invalid]: true,
                            },
                        },
                        {
                            id: "id-4",
                            title: "Renamed 3",
                            options: { closeable: true },
                            states: {
                                [TabState.Dirty]: true,
                                [TabState.Invalid]: true,
                            },
                        },
                    ]);
                });
            });
        });

        describe("update tab data", () => {
            it("update one tab only", async () => {
                const tabsWithData = withIds([tab, tab, tab, tab]) as unknown as Array<
                    ITab<{ cool?: boolean }>
                >;
                const onTabUpdate = vi.fn();

                const result = renderHook(() =>
                    useTabs<{ cool?: boolean }>({
                        tabs: tabsWithData,
                        active: 1,
                        onTabUpdate,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(1);
                expect(result.result.current.tabsProps.tabs.length).toEqual(4);

                await act(async () => {
                    result.result.current.updateData(tabsWithData[1], { cool: true });
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(1);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(4);
                    expect(result.result.current.tabsProps.tabs[1].data).toEqual({ cool: true });
                    expect(onTabUpdate).toHaveBeenCalledWith(tabsWithData[1], { data: { cool: true } });
                });
            });
        });

        describe("activate tab", () => {
            it("activate another tab", async () => {
                const tabs = withIds([tab, tab, tab, tab]);
                const onTabActivate = vi.fn();

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 1,
                        onTabActivate,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(1);
                expect(result.result.current.tabsProps.tabs.length).toEqual(4);

                await act(async () => {
                    result.result.current.activateTab(tabs[3]);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(3);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(4);

                    expect(onTabActivate).toHaveBeenCalledWith({
                        id: "id-4",
                        title: "Tab",
                    });
                });
            });
        });

        describe("on before action callbacks", () => {
            it("close tab", async () => {
                const tabs = withIds([tabCloseable, tabCloseable, tabCloseable, tabCloseable]);
                const onTabClose = vi.fn();
                const onBeforeTabClose = vi.fn();

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 1,
                        onTabClose,
                        onBeforeTabClose,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(1);
                expect(result.result.current.tabsProps.tabs.length).toEqual(4);

                await act(async () => {
                    result.result.current.closeTab(tabs[0]);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(1);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(4);
                    expect(onTabClose).not.toHaveBeenCalled();

                    onBeforeTabClose.mockImplementation((_, next) => next());
                });

                await act(async () => {
                    result.result.current.closeTab(tabs[0]);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(0);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(3);
                    expect(onTabClose).toHaveBeenCalled();
                });
            });

            it("activate tab", async () => {
                const tabs = withIds([tab, tab, tab, tab]);
                const onTabActivate = vi.fn();
                const onBeforeTabActivate = vi.fn();

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 1,
                        onTabActivate,
                        onBeforeTabActivate,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(1);
                expect(result.result.current.tabsProps.tabs.length).toEqual(4);

                await act(async () => {
                    result.result.current.activateTab(tabs[3]);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(1);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(4);
                    expect(onTabActivate).not.toHaveBeenCalled();
                });

                onBeforeTabActivate.mockImplementation((_, next) => next());

                await act(async () => {
                    result.result.current.activateTab(tabs[3]);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(3);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(4);
                    expect(onTabActivate).toHaveBeenCalled();
                });
            });

            it("add tab", async () => {
                const tabs = withIds([tab, tab, tab, tab]);
                const onTabAdd = vi.fn();
                const onBeforeTabAdd = vi.fn();

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 1,
                        onTabAdd,
                        onBeforeTabAdd,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(1);
                expect(result.result.current.tabsProps.tabs.length).toEqual(4);

                const addedTab = withIds([tabFullFeatured])[0];
                await act(async () => {
                    result.result.current.addTab(addedTab);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(1);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(4);
                    expect(onTabAdd).not.toHaveBeenCalled();
                });

                onBeforeTabAdd.mockImplementation((_, next) => next());

                await act(async () => {
                    result.result.current.addTab(addedTab);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(4);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(5);
                    expect(onTabAdd).toHaveBeenCalled();
                });
            });
        });

        describe("more complex usage", () => {
            it("add tab and update tab at once", async () => {
                const tabs = withIds([tab, tab, tab, tab]);

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 1,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(1);
                expect(result.result.current.tabsProps.tabs).toEqual(tabs);

                const addedTab = withIds([tabFullFeatured])[0];
                await act(async () => {
                    result.result.current.updateTab(tabs[0], {
                        states: {
                            [TabState.Dirty]: true,
                            [TabState.Invalid]: true,
                        },
                        options: {
                            closeable: true,
                        },
                        title: "Renamed!",
                    });
                    result.result.current.addTab(addedTab);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(4);
                    expect(result.result.current.tabsProps.tabs.length).toEqual(5);

                    expect(result.result.current.tabsProps.tabs[0]).toEqual({
                        id: "id-1",
                        title: "Renamed!",
                        states: {
                            [TabState.Dirty]: true,
                            [TabState.Invalid]: true,
                        },
                        options: {
                            closeable: true,
                        },
                    });

                    expect(result.result.current.tabsProps.tabs[4]).toEqual(addedTab);
                });
            });

            it("add tab, remove 2 tabs and active tab", async () => {
                const tabs = withIds([tabCloseable, tabCloseable, tabCloseable, tabCloseable]);

                const result = renderHook(() =>
                    useTabs({
                        tabs,
                        active: 1,
                    }),
                );

                expect(result.result.current.tabsProps.active).toEqual(1);
                expect(result.result.current.tabsProps.tabs).toEqual(tabs);

                const addedTab = withIds([tabFullFeatured])[0];
                await act(async () => {
                    result.result.current.addTab(addedTab, 0);
                    result.result.current.closeTab(tabs[3]);
                    result.result.current.closeTab(tabs[1]);
                    result.result.current.activateTab(tabs[2]);
                });

                await waitFor(() => {
                    expect(result.result.current.tabsProps.active).toEqual(2);
                    expect(result.result.current.tabsProps.tabs).toEqual([
                        {
                            id: "id-1",
                            options: { closeable: true },
                            states: { dirty: true, invalid: true },
                            title: "Full featured tab",
                        },
                        tabs[0],
                        tabs[2],
                    ]);
                });
            });
        });
    });
});

describe("Tabs keyboard focus", () => {
    const tabs: ITab[] = [1, 2].map((i) => ({ id: `id-${i}`, title: `Tab ${i}`, data: undefined }));
    const tabElements = (container: HTMLElement) => container.querySelectorAll<HTMLElement>('[role="tab"]');

    it("follows a key's activation to the new active tab", () => {
        // the caller activates the tab (a later render with the new active index)
        const { container, rerender } = render(<Tabs active={0} tabs={tabs} />);

        tabElements(container)[0].focus();
        fireEvent.keyDown(tabElements(container)[0], { key: "ArrowRight" });
        rerender(<Tabs active={1} tabs={tabs} />);

        expect(document.activeElement).toBe(tabElements(container)[1]);
    });

    it("does not pull the focus back from a field when a held-back activation completes later", () => {
        // the caller holds the activation back (does not change the active tab on the key)
        const { container, rerender } = render(<Tabs active={0} tabs={tabs} onTabActivate={() => {}} />);
        const field = document.createElement("input");
        document.body.appendChild(field);

        tabElements(container)[0].focus();
        fireEvent.keyDown(tabElements(container)[0], { key: "ArrowRight" });
        field.focus();
        rerender(<Tabs active={1} tabs={tabs} onTabActivate={() => {}} />);

        expect(document.activeElement).toBe(field);
        field.remove();
    });
});

describe("Tabs accessible names", () => {
    const tabs: ITab[] = [{ id: "id-1", title: "Revenue", options: { closeable: true }, data: undefined }];

    it("names every control with the default messages when no locales are given", () => {
        // no IntlProvider and no locales: a bare render still names every control
        const { container } = render(
            <Tabs active={0} tabs={tabs} creatable minimizable maximizable closeable />,
        );

        expect(container.querySelector('[role="tablist"]')).toHaveAttribute("aria-label", "Open metrics");
        expect(container.querySelector(`.${TabsClasses.ButtonMinimize}`)).toHaveAttribute(
            "aria-label",
            "Minimize editor",
        );
        expect(container.querySelector(`.${TabsClasses.ButtonCloseTabs}`)).toHaveAttribute(
            "aria-label",
            "Close editor",
        );
        expect(container.querySelector(`.${TabsClasses.ButtonCloseTab}`)).toHaveAttribute(
            "aria-label",
            "Close Revenue",
        );
        container.querySelectorAll("button").forEach((button) => {
            expect(button.getAttribute("aria-label")).toBeTruthy();
        });
    });

    it("names the full-screen toggle by its state", () => {
        const { container, rerender } = render(<Tabs active={0} tabs={tabs} maximizable />);
        const toggle = () => container.querySelector(`.${TabsClasses.ButtonMaximize}`);

        expect(toggle()).toHaveAttribute("aria-label", "Full screen");

        rerender(<Tabs active={0} tabs={tabs} maximizable maximized />);

        expect(toggle()).toHaveAttribute("aria-label", "Exit full screen");
    });

    it("lets locales override a default name", () => {
        const { container } = render(
            <Tabs active={0} tabs={tabs} minimizable locales={{ minimize: "Collapse" }} />,
        );

        expect(container.querySelector(`.${TabsClasses.ButtonMinimize}`)).toHaveAttribute(
            "aria-label",
            "Collapse",
        );
    });
});

describe("Tabs scroll buttons", () => {
    const tabs: ITab[] = [1, 2, 3].map((i) => ({ id: `id-${i}`, title: `Tab ${i}`, data: undefined }));

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // The buttons show only when the tab strip overflows, which needs layout the test DOM lacks.
    async function renderOverflowingTabs() {
        vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(100);
        vi.spyOn(Element.prototype, "scrollWidth", "get").mockReturnValue(1000);

        const { container } = render(<Tabs active={0} tabs={tabs} />);
        const rightButton = await waitFor(() => {
            const button = container.querySelector<HTMLButtonElement>(`.${TabsClasses.ButtonRight}`);
            expect(button).not.toBeNull();
            return button!;
        });
        const scrollBy = vi.fn();
        container.querySelector<HTMLElement>('[role="tablist"]')!.scrollBy = scrollBy;

        return { rightButton, scrollBy };
    }

    it("scrolls one step on a click with no pointer behind it (keyboard, assistive technology)", async () => {
        const { rightButton, scrollBy } = await renderOverflowingTabs();

        fireEvent.click(rightButton, { detail: 0 });

        expect(scrollBy).toHaveBeenCalledTimes(1);
        expect(scrollBy).toHaveBeenCalledWith({ left: 100, behavior: "smooth" });
    });

    it("scrolls once for a mouse click, not again for its click event", async () => {
        const { rightButton, scrollBy } = await renderOverflowingTabs();

        fireEvent.mouseDown(rightButton);
        fireEvent.click(rightButton, { detail: 1 });
        fireEvent.mouseUp(document);

        expect(scrollBy).toHaveBeenCalledTimes(1);
    });
});

// The handoff expires in a timeout. Only timeouts are faked: Tabs polls its size in an endless
// requestAnimationFrame loop, which faked timers would run until they give up.
const fakeTimeoutsOnly = () => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

describe("Tabs minimize focus handoff", () => {
    const tabs: ITab[] = [{ id: "id-1", title: "Tab", data: undefined }];

    afterEach(() => {
        vi.useRealTimers();
    });

    function renderInEditor(handoff: IFocusHandoff, onTabsMinimize?: () => void) {
        return render(
            <FocusHandoffContext.Provider value={handoff}>
                <Tabs active={0} tabs={tabs} minimizable onTabsMinimize={onTabsMinimize} />
            </FocusHandoffContext.Provider>,
        );
    }

    const minimizeButton = (container: HTMLElement) =>
        container.querySelector<HTMLButtonElement>(`.${TabsClasses.ButtonMinimize}`)!;

    it("hands the focus off to the chip when the editor held it", () => {
        const handoff = createFocusHandoff();
        const { container } = renderInEditor(handoff);

        minimizeButton(container).focus();
        fireEvent.click(minimizeButton(container));

        expect(handoff.take("chip")).toBe(true);
    });

    it("does not hand the focus off when the editor did not hold it", () => {
        const handoff = createFocusHandoff();
        const { container } = renderInEditor(handoff);

        fireEvent.click(minimizeButton(container));

        expect(handoff.take("chip")).toBe(false);
    });

    it("cancels the handoff when minimizing leaves the editor mounted", () => {
        fakeTimeoutsOnly();
        const handoff = createFocusHandoff();
        // no onTabsMinimize: nothing unmounts the editor, and no chip comes to take the record
        const { container } = renderInEditor(handoff);

        minimizeButton(container).focus();
        fireEvent.click(minimizeButton(container));
        vi.runAllTimers();

        expect(handoff.take("chip")).toBe(false);
    });

    it("keeps the handoff when minimizing unmounts the editor", () => {
        fakeTimeoutsOnly();
        const handoff = createFocusHandoff();

        // minimizing hides the editor, as the apps do when they show the chip instead
        function MinimizableEditor() {
            const [isMinimized, setMinimized] = useState(false);

            return isMinimized ? null : (
                <FocusHandoffContext.Provider value={handoff}>
                    <Tabs active={0} tabs={tabs} minimizable onTabsMinimize={() => setMinimized(true)} />
                </FocusHandoffContext.Provider>
            );
        }

        const { container } = render(<MinimizableEditor />);

        minimizeButton(container).focus();
        fireEvent.click(minimizeButton(container));
        vi.runAllTimers();

        expect(minimizeButton(container)).toBeNull();
        expect(handoff.take("chip")).toBe(true);
    });

    it("focuses the minimize button on mount only after the chip handed the focus off", () => {
        const handoff = createFocusHandoff();
        handoff.handOff("editor");
        const restored = renderInEditor(handoff);

        expect(document.activeElement).toBe(minimizeButton(restored.container));
        restored.unmount();

        const opened = renderInEditor(handoff);

        expect(document.activeElement).not.toBe(minimizeButton(opened.container));
        opened.unmount();
    });

    it("ignores a handoff of another editor instance", () => {
        createFocusHandoff().handOff("editor");
        const { container, unmount } = renderInEditor(createFocusHandoff());

        expect(document.activeElement).not.toBe(minimizeButton(container));
        unmount();
    });
});
