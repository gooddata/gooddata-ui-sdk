// (C) 2020 GoodData Corporation
import React from "react";
import {
    IFluidLayoutColumnRenderProps,
    IFluidLayoutRowRenderer,
    IFluidLayoutColumnRenderer,
    IFluidLayoutContentRenderer,
    IFluidLayoutRowKeyGetter,
    IFluidLayoutColumnKeyGetter,
} from "../../FluidLayout";

import {
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutContent,
    IDashboardViewLayoutRow,
} from "./dashboardLayout";

export type IDashboardViewLayoutRowKeyGetter = IFluidLayoutRowKeyGetter<
    IDashboardViewLayoutContent,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutRow
>;

export type IDashboardViewLayoutRowRenderer = IFluidLayoutRowRenderer<
    IDashboardViewLayoutContent,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutRow,
    { debug?: boolean }
>;

export type IDashboardViewLayoutColumnKeyGetter = IFluidLayoutColumnKeyGetter<
    IDashboardViewLayoutContent,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutRow
>;

export type IDashboardViewLayoutColumnRenderProps = IFluidLayoutColumnRenderProps<
    IDashboardViewLayoutContent,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutRow
>;

export type IDashboardViewLayoutColumnRenderer = IFluidLayoutColumnRenderer<
    IDashboardViewLayoutContent,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutRow
>;

export type IDashboardViewLayoutContentRenderer = IFluidLayoutContentRenderer<
    IDashboardViewLayoutContent,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutRow,
    {
        debug?: boolean;
        layoutContentRef?: React.RefObject<HTMLDivElement>;
        style?: React.CSSProperties;
        className?: string;
    }
>;
