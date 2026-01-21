// (C) 2025-2026 GoodData Corporation

import {
    type ChangeEventHandler,
    type KeyboardEventHandler,
    type ReactElement,
    useCallback,
    useMemo,
    useRef,
} from "react";

import { useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { usePropState } from "@gooddata/sdk-ui";
import {
    DefaultUiTabsTabValue,
    type IUiTab,
    type IUiTabComponentProps,
    SELECT_ITEM_ACTION,
    UiFocusManager,
    UiIcon,
    UiIconButton,
    UiTabs,
    UiTooltip,
    bemFactory,
    separatorStaticItem,
    useId,
    useScopedIdOptional,
} from "@gooddata/sdk-ui-kit";

import {
    DEFAULT_TAB_ID,
    type ITabState,
    cancelRenamingDashboardTab,
    convertDashboardTabFromDefault,
    createDashboardTab,
    deleteDashboardTab,
    renameDashboardTab,
    repositionDashboardTab,
    selectActiveTabLocalIdentifier,
    selectIsAddTabButtonHidden,
    selectIsInEditMode,
    selectTabs,
    startRenamingDashboardTab,
    switchDashboardTab,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";

const EMPTY_TABS: ITabState[] = [];

type IDashboardUiTab = IUiTab<{ isRenaming?: boolean }>;

interface ITabActionsParams {
    tab: ITabState;
    index: number;
    totalTabs: number;
    intl: ReturnType<typeof useIntl>;
    dispatch: ReturnType<typeof useDashboardDispatch>;
}

function createRenameAction(params: ITabActionsParams) {
    const { tab, intl, dispatch } = params;
    return {
        id: "rename",
        label: intl.formatMessage({ id: "dashboard.tabs.rename" }),
        iconLeft: <UiIcon type={"pencil"} size={14} color={"complementary-5"} />,
        isDisabled: tab.isRenaming,
        onSelect: () => dispatch(startRenamingDashboardTab(tab.localIdentifier)),
        closeOnSelect: "all" as const,
        dataTestId: "s-tab-action-rename",
    };
}

function createMoveLeftAction(params: ITabActionsParams) {
    const { index, intl, dispatch } = params;
    if (index <= 0) {
        return undefined;
    }
    return {
        id: "moveLeft",
        label: intl.formatMessage({ id: "dashboard.tabs.move.left" }),
        iconLeft: <UiIcon type={"arrowLeft"} size={14} color={"complementary-5"} />,
        onSelect: () => {
            if (index <= 0) {
                return;
            }

            dispatch(repositionDashboardTab(index, index - 1));
        },
        closeOnSelect: false as const,
        dataTestId: "s-tab-action-move-left",
    };
}

function createMoveRightAction(params: ITabActionsParams) {
    const { index, totalTabs, intl, dispatch } = params;
    if (index >= totalTabs - 1) {
        return undefined;
    }
    return {
        id: "moveRight",
        label: intl.formatMessage({ id: "dashboard.tabs.move.right" }),
        iconLeft: <UiIcon type={"arrowRight"} size={14} color={"complementary-5"} />,
        onSelect: () => {
            if (index >= totalTabs - 1) {
                return;
            }

            dispatch(repositionDashboardTab(index, index + 1));
        },
        closeOnSelect: false as const,
        dataTestId: "s-tab-action-move-right",
    };
}

function createDeleteAction(params: ITabActionsParams, isOnlyOneTab: boolean) {
    const { tab, intl, dispatch } = params;
    return {
        id: "delete",
        label: intl.formatMessage({ id: "delete" }),
        isDisabled: isOnlyOneTab,
        iconLeft: <UiIcon type={"trash"} size={14} color={"complementary-5"} />,
        isDestructive: true,
        tooltip: isOnlyOneTab
            ? intl.formatMessage({
                  id: "dashboard.tabs.delete.disabled-tooltip",
              })
            : undefined,
        tooltipWidth: 250,
        onSelect: () => dispatch(deleteDashboardTab(tab.localIdentifier)),
        dataTestId: "s-tab-action-delete",
    };
}

function buildTabActions(params: ITabActionsParams, isOnlyOneTab: boolean) {
    const actions = [
        createRenameAction(params),
        createMoveLeftAction(params),
        createMoveRightAction(params),
        separatorStaticItem,
        createDeleteAction(params, isOnlyOneTab),
    ];
    return actions.filter((x): x is NonNullable<typeof x> => !!x);
}

export function useDashboardTabsProps(): IDashboardTabsProps {
    const intl = useIntl();

    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const tabs = useDashboardSelector(selectTabs) ?? EMPTY_TABS;
    const activeTabLocalIdentifier = useDashboardSelector(selectActiveTabLocalIdentifier);
    const dispatch = useDashboardDispatch();

    // Generate a stable unique ID for the default tab
    const defaultTabIdRef = useRef<string>(uuid());

    const handleTabSelect = useCallback(
        (tab: IDashboardUiTab) => {
            if (tab.id !== activeTabLocalIdentifier) {
                dispatch(switchDashboardTab(tab.id));
            }
        },
        [activeTabLocalIdentifier, dispatch],
    );

    const uiTabs = useMemo<IDashboardUiTab[]>(() => {
        const isOnlyOneTab = tabs.length < 2;
        const totalTabs = tabs.length;

        return (
            tabs.map((tab, index) => {
                const actionParams: ITabActionsParams = { tab, index, totalTabs, intl, dispatch };
                return {
                    id: tab.localIdentifier,
                    label: tab.title || intl.formatMessage({ id: "dashboard.tabs.default.label" }), // handles also empty string
                    isRenaming: tab.isRenaming,
                    variant: isOnlyOneTab ? "placeholder" : "default",
                    actions: isEditMode ? buildTabActions(actionParams, isOnlyOneTab) : [],
                } satisfies IDashboardUiTab;
            }) ?? []
        );
    }, [tabs, isEditMode, intl, dispatch]);

    // Use the default tab ID as activeTabLocalIdentifier if we created a default tab and no activeTabLocalIdentifier is set
    const effectiveActiveTabLocalIdentifier = useMemo(() => {
        if (isEditMode && tabs.length === 0 && !activeTabLocalIdentifier) {
            return defaultTabIdRef.current;
        }
        return activeTabLocalIdentifier;
    }, [isEditMode, tabs, activeTabLocalIdentifier]);

    return {
        activeTabLocalIdentifier: effectiveActiveTabLocalIdentifier,
        uiTabs,
        handleTabSelect,
    };
}

const tabsBem = bemFactory("gd-dash-tabs");

interface IDashboardTabsProps {
    activeTabLocalIdentifier?: string;
    uiTabs: IDashboardUiTab[];
    handleTabSelect: (tab: IDashboardUiTab) => void;
}
/**
 * @internal
 */
export function DashboardTabs({
    activeTabLocalIdentifier,
    uiTabs,
    handleTabSelect,
}: IDashboardTabsProps): ReactElement | null {
    const intl = useIntl();
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const hideAddTabButton = useDashboardSelector(selectIsAddTabButtonHidden);
    const dispatch = useDashboardDispatch();

    const ACCESSIBILITY_CONFIG = useMemo(
        () => ({
            role: "tablist",
            tabRole: "tab",
            ariaLabel: intl.formatMessage({ id: "dashboard.tabs.accessibility.label" }),
        }),
        [intl],
    );

    const isCreateEnabled = isEditMode && !hideAddTabButton;
    const hasDefaultTab = uiTabs.some((tab) => tab.id === DEFAULT_TAB_ID);

    const handleCreateTab = useCallback(() => {
        if (hasDefaultTab) {
            dispatch(convertDashboardTabFromDefault());
        }
        dispatch(createDashboardTab());
    }, [dispatch, hasDefaultTab]);

    const shouldHideTabs = useMemo(() => {
        if (!uiTabs || activeTabLocalIdentifier === undefined) {
            return true;
        }
        return isEditMode ? uiTabs.length < 1 : uiTabs.length <= 1;
    }, [isEditMode, uiTabs, activeTabLocalIdentifier]);

    if (shouldHideTabs) {
        return null;
    }

    return (
        <div className={tabsBem.b({ "with-create": isCreateEnabled })}>
            <div className={tabsBem.e("list")}>
                <UiTabs
                    size="large"
                    tabs={uiTabs}
                    onTabSelect={handleTabSelect}
                    selectedTabId={activeTabLocalIdentifier ?? uiTabs[0].id}
                    accessibilityConfig={ACCESSIBILITY_CONFIG}
                    maxLabelLength={255}
                    TabValue={RenamableTabValue}
                />
            </div>
            {isCreateEnabled ? (
                <div className={tabsBem.e("add-wrapper")}>
                    <div className={tabsBem.e("add")}>
                        <UiTooltip
                            anchor={
                                <UiIconButton
                                    icon={"plus"}
                                    size={"large"}
                                    variant={"tertiary"}
                                    onClick={handleCreateTab}
                                    dataTestId="s-tab-add-new"
                                    accessibilityConfig={{
                                        ariaLabel: intl.formatMessage({
                                            id: "dashboard.tabs.accessibility.add-button-label",
                                        }),
                                    }}
                                />
                            }
                            content={intl.formatMessage({ id: "dashboard.tabs.add-button-tooltip" })}
                            triggerBy={["hover"]}
                            arrowPlacement={"bottom"}
                            optimalPlacement
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function RenamableTabValue(props: IUiTabComponentProps<"TabValue", IDashboardUiTab>) {
    const { location, tab } = props;

    const dispatch = useDashboardDispatch();
    const returnFocusId = useScopedIdOptional(tab, SELECT_ITEM_ACTION);

    const [name, setName] = usePropState(tab.label);

    const handleRename = useCallback(
        (newName: string) => {
            dispatch(renameDashboardTab(newName, tab.id));

            if (tab.id === DEFAULT_TAB_ID) {
                dispatch(convertDashboardTabFromDefault(newName));
            }
        },
        [dispatch, tab.id],
    );

    const handleCancel = useCallback(() => {
        dispatch(cancelRenamingDashboardTab(tab.id));
    }, [dispatch, tab.id]);

    const preventPropagateKeydown = useCallback<KeyboardEventHandler>((e) => e.stopPropagation(), []);

    if (location === "allList" || !tab.isRenaming) {
        return <DefaultUiTabsTabValue {...props} />;
    }

    return (
        <div onKeyDown={preventPropagateKeydown} className={tabsBem.e("rename-wrapper")}>
            <UiFocusManager enableAutofocus enableReturnFocusOnUnmount={{ returnFocusTo: returnFocusId }}>
                {/*
                We are autosizing the input by using a little trick.
                The input field is absolutely positioned and fills the available space.
                Then we render the default value component with visibility: hidden to provide the sizing.
                */}

                <div className={tabsBem.e("rename-value")}>
                    <RenamingTabValue
                        name={name}
                        onChange={setName}
                        onRename={handleRename}
                        onCancel={handleCancel}
                        isSubmitOnBlur
                    />
                </div>

                <div className={tabsBem.e("rename-ghost-value")}>
                    <DefaultUiTabsTabValue
                        {...props}
                        // A little hack to prevent the input from jumping when empty
                        tab={{ ...tab, label: name.length === 0 ? "M" : name }}
                    />
                </div>
            </UiFocusManager>
        </div>
    );
}

function RenamingTabValue(props: {
    name: string;
    onChange: (newName: string) => void;
    onRename: (newName: string) => void;
    onCancel: () => void;
    isSubmitOnBlur?: boolean;
}) {
    const { name, isSubmitOnBlur, onChange, onCancel, onRename } = props;

    const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
        (e) => onChange(e.currentTarget.value),
        [onChange],
    );
    const handleSubmit = useCallback(() => onRename(name), [name, onRename]);
    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
        (e) => {
            if (e.key === "Enter") {
                handleSubmit();
            }
            if (e.key === "Escape") {
                onCancel();
            }
        },
        [handleSubmit, onCancel],
    );

    // Id or name is required for an <input />.
    // We don't do anything with it, it's just here to prevent console warnings.
    const id = useId();

    return (
        <input
            className={tabsBem.e("rename-input")}
            onChange={handleChange}
            onBlur={isSubmitOnBlur ? handleSubmit : undefined}
            value={name}
            onKeyDown={handleKeyDown}
            name={id}
        />
    );
}
