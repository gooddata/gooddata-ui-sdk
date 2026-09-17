// (C) 2026 GoodData Corporation

import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { type ITotal, bucketsFind } from "@gooddata/sdk-model";

import { totalTypeMessages } from "../../locales.js";
import { RenameTotalLabelPopover } from "../components/TotalLabel/RenameTotalLabelPopover.js";
import { TotalActionMenu } from "../components/TotalLabel/TotalActionMenu.js";
import {
    type IOpenTotalLabelMenuRequest,
    type ITotalLabelTarget,
    getTotalAliasForTarget,
} from "../features/aggregations/totalLabelTarget.js";
import { type TotalLabelBucketType, updateTotalAlias } from "../features/aggregations/totals.js";

import { useCurrentDataView } from "./CurrentDataViewContext.js";
import { usePivotTableProps } from "./PivotTablePropsContext.js";

interface ITotalLabelMenuState extends IOpenTotalLabelMenuRequest {
    currentLabel: string;
    defaultLabel: string;
    mode: "menu" | "popover";
}

interface ITotalLabelContextValue {
    enabled: boolean;
    openTotalLabelMenu: (request: IOpenTotalLabelMenuRequest) => void;
    getCustomTotalLabel: (target: ITotalLabelTarget | undefined) => string | undefined;
}

const TotalLabelContext = createContext<ITotalLabelContextValue | undefined>(undefined);

export function TotalLabelProvider({ children }: { children: ReactNode }) {
    const intl = useIntl();
    const { config, execution, pushData } = usePivotTableProps();
    const { currentDataView } = useCurrentDataView();
    const [menuState, setMenuState] = useState<ITotalLabelMenuState | null>(null);
    const enabled = config.menu.totalLabelsEditable === true;

    const getTotalsForWrite = useCallback(
        (bucketType: TotalLabelBucketType): ITotal[] =>
            bucketsFind(execution.definition.buckets, bucketType)?.totals ?? [],
        [execution],
    );

    const getCustomTotalLabel = useCallback(
        (target: ITotalLabelTarget | undefined): string | undefined => {
            if (!target) {
                return undefined;
            }

            return getTotalAliasForTarget(currentDataView?.definition.buckets ?? [], target);
        },
        [currentDataView],
    );

    const openTotalLabelMenu = useCallback(
        (request: IOpenTotalLabelMenuRequest) => {
            if (!enabled) {
                return;
            }

            const currentLabel = getCustomTotalLabel(request) ?? "";
            setMenuState({
                ...request,
                currentLabel,
                defaultLabel: intl.formatMessage(totalTypeMessages[request.type]),
                mode: "menu",
            });
        },
        [enabled, getCustomTotalLabel, intl],
    );

    const closeMenu = useCallback(() => {
        const anchor = menuState?.anchor;
        setMenuState(null);
        anchor?.focus();
    }, [menuState?.anchor]);

    useEffect(() => {
        if (!enabled && menuState) {
            closeMenu();
        }
    }, [enabled, menuState, closeMenu]);

    const saveLabel = useCallback(
        (newLabel: string | undefined) => {
            if (!menuState || !pushData || !enabled) {
                closeMenu();
                return;
            }

            const updatedTotals = updateTotalAlias(
                getTotalsForWrite(menuState.bucketType),
                menuState.type,
                menuState.attributeIdentifier,
                newLabel,
                menuState.measureIdentifier,
            );

            if (updatedTotals) {
                pushData({
                    properties: {
                        totals: updatedTotals,
                        bucketType: menuState.bucketType,
                    },
                });
            }

            closeMenu();
        },
        [closeMenu, enabled, getTotalsForWrite, menuState, pushData],
    );

    const contextValue = useMemo<ITotalLabelContextValue>(
        () => ({ enabled, openTotalLabelMenu, getCustomTotalLabel }),
        [enabled, getCustomTotalLabel, openTotalLabelMenu],
    );

    return (
        <TotalLabelContext.Provider value={contextValue}>
            {children}
            {menuState?.mode === "menu" ? (
                <TotalActionMenu
                    intl={intl}
                    anchor={menuState.anchor}
                    onRenameClick={() =>
                        setMenuState((current) => (current ? { ...current, mode: "popover" } : null))
                    }
                    onResetClick={() => saveLabel(undefined)}
                    onClose={closeMenu}
                />
            ) : null}
            {menuState?.mode === "popover" ? (
                <RenameTotalLabelPopover
                    intl={intl}
                    anchor={menuState.anchor}
                    currentLabel={menuState.currentLabel}
                    defaultLabel={menuState.defaultLabel}
                    onSave={saveLabel}
                    onCancel={closeMenu}
                />
            ) : null}
        </TotalLabelContext.Provider>
    );
}

export function useTotalLabelContext(): ITotalLabelContextValue {
    const context = useContext(TotalLabelContext);
    if (!context) {
        throw new Error("useTotalLabelContext must be used within TotalLabelProvider");
    }

    return context;
}
