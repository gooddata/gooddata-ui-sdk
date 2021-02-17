// (C) 2020-2021 GoodData Corporation
import { CSSProperties } from "react";
import {
    IFluidLayoutColumnRenderProps,
    IFluidLayoutRowRenderProps,
    IFluidLayoutRowRenderer,
    IFluidLayoutColumnRenderer,
    IFluidLayoutContentRenderer,
    IFluidLayoutContentRenderProps,
    IFluidLayoutRowKeyGetter,
    IFluidLayoutColumnKeyGetter,
    IFluidLayoutRenderer,
    IFluidLayoutRowHeaderRenderProps,
    IFluidLayoutRowHeaderRenderer,
} from "../../FluidLayout";
import {
    IDashboardViewLayoutColumnFacade,
    IDashboardViewLayoutFacade,
    IDashboardViewLayoutRowFacade,
} from "../facade/interfaces";

import {
    IDashboardViewLayout,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutContent,
    IDashboardViewLayoutRow,
} from "./dashboardLayout";

/**
 * @alpha
 */
export interface IDashboardViewLayoutCommonRenderProps {
    debug?: boolean;
}

/**
 * @alpha
 */
export type IDashboardViewLayoutRowKeyGetter<
    TCustomContent extends IDashboardViewLayoutContent<any>
> = IFluidLayoutRowKeyGetter<
    TCustomContent,
    IDashboardViewLayoutRow<TCustomContent>,
    IDashboardViewLayoutRowFacade<TCustomContent>
>;

/**
 * @alpha
 */
export type IDashboardViewLayoutRowRenderProps<
    TCustomContent extends IDashboardViewLayoutContent<any>
> = IFluidLayoutRowRenderProps<
    TCustomContent,
    IDashboardViewLayoutRow<TCustomContent>,
    IDashboardViewLayoutRowFacade<TCustomContent>
> &
    IDashboardViewLayoutCommonRenderProps;

/**
 * @alpha
 */
export type IDashboardViewLayoutRowRenderer<
    TCustomContent extends IDashboardViewLayoutContent<any>
> = IFluidLayoutRowRenderer<
    TCustomContent,
    IDashboardViewLayoutRow<TCustomContent>,
    IDashboardViewLayoutRowFacade<TCustomContent>,
    IDashboardViewLayoutCommonRenderProps
>;

/**
 * @alpha
 */
export type IDashboardViewLayoutRowHeaderRenderProps<
    TCustomContent extends IDashboardViewLayoutContent<any>
> = IFluidLayoutRowHeaderRenderProps<
    TCustomContent,
    IDashboardViewLayoutRow<TCustomContent>,
    IDashboardViewLayoutRowFacade<TCustomContent>
> &
    IDashboardViewLayoutCommonRenderProps & {
        /**
         * Default row header renderer - can be used as a fallback for custom rowHeaderRenderer.
         */
        DefaultRowHeaderRenderer: IDashboardViewLayoutRowHeaderRenderer<TCustomContent>;
    };

/**
 * @alpha
 */
export type IDashboardViewLayoutRowHeaderRenderer<
    TCustomContent extends IDashboardViewLayoutContent<any>
> = IFluidLayoutRowHeaderRenderer<
    TCustomContent,
    IDashboardViewLayoutRow<TCustomContent>,
    IDashboardViewLayoutRowFacade<TCustomContent>,
    IDashboardViewLayoutRowHeaderRenderProps<TCustomContent>
>;

/**
 * @alpha
 */
export type IDashboardViewLayoutColumnKeyGetter<
    TCustomContent extends IDashboardViewLayoutContent<any>
> = IFluidLayoutColumnKeyGetter<
    TCustomContent,
    IDashboardViewLayoutColumn<TCustomContent>,
    IDashboardViewLayoutColumnFacade<TCustomContent>
>;

/**
 * @alpha
 */
export type IDashboardViewLayoutColumnRenderProps<
    TCustomContent extends IDashboardViewLayoutContent<any>
> = IFluidLayoutColumnRenderProps<
    TCustomContent,
    IDashboardViewLayoutColumn<TCustomContent>,
    IDashboardViewLayoutColumnFacade<TCustomContent>
> &
    IDashboardViewLayoutCommonRenderProps;

/**
 * @alpha
 */
export type IDashboardViewLayoutColumnRenderer<
    TCustomContent extends IDashboardViewLayoutContent<any>
> = IFluidLayoutColumnRenderer<
    TCustomContent,
    IDashboardViewLayoutColumn<TCustomContent>,
    IDashboardViewLayoutColumnFacade<TCustomContent>,
    IDashboardViewLayoutColumnRenderProps<TCustomContent>
>;

/**
 * @alpha
 */
export type IDashboardViewLayoutContentRenderProps<
    TCustomContent extends IDashboardViewLayoutContent<any>
> = IFluidLayoutContentRenderProps<
    TCustomContent,
    IDashboardViewLayoutColumn<TCustomContent>,
    IDashboardViewLayoutColumnFacade<TCustomContent>
> &
    IDashboardViewLayoutCommonRenderProps & {
        /**
         * React ref to content element.
         */
        contentRef?: React.RefObject<HTMLDivElement>;

        /**
         * Additional css class name of the content.
         */
        className?: string;

        /**
         * Content to render - widget, insight, or custom content.
         */
        children?: React.ReactNode;

        /**
         * Height of the content.
         */
        height?: CSSProperties["height"];

        /**
         * Minimum height of the content.
         */
        minHeight?: CSSProperties["minHeight"];

        /**
         * Allow vertical overflow?
         * (This basically sets overflowX to hidden and overflowY to auto)
         */
        allowOverflow?: boolean;

        /**
         * Was column size updated by layout sizing strategy?
         */
        isResizedByLayoutSizingStrategy?: boolean;

        /**
         * Default content renderer - can be used as a fallback for custom contentRenderer.
         */
        DefaultContentRenderer: IDashboardViewLayoutContentRenderer<TCustomContent>;
    };

/**
 * @alpha
 */
export type IDashboardViewLayoutContentRenderer<
    TCustomContent extends IDashboardViewLayoutContent<any>
> = IFluidLayoutContentRenderer<
    TCustomContent,
    IDashboardViewLayoutColumn<TCustomContent>,
    IDashboardViewLayoutColumnFacade<TCustomContent>,
    IDashboardViewLayoutContentRenderProps<TCustomContent>
>;

/**
 * Dashboard layout definition.
 *
 * @alpha
 */
export type IDashboardViewLayoutRenderer<
    TCustomContent extends IDashboardViewLayoutContent<any>
> = IFluidLayoutRenderer<
    TCustomContent,
    IDashboardViewLayoutRow<TCustomContent>,
    IDashboardViewLayoutColumn<TCustomContent>,
    IDashboardViewLayout<TCustomContent>,
    IDashboardViewLayoutFacade<TCustomContent>,
    IDashboardViewLayoutRowFacade<TCustomContent>,
    IDashboardViewLayoutColumnFacade<TCustomContent>
>;
