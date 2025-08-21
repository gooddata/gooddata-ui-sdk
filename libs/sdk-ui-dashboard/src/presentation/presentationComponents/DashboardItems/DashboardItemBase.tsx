// (C) 2020-2025 GoodData Corporation
import React, { MouseEvent } from "react";

import { DashboardItemContent } from "./DashboardItemContent.js";
import { DashboardItemContentWrapper } from "./DashboardItemContentWrapper.js";

export interface IDashboardItemBaseProps {
    /**
     * Render prop for the content itself.
     */
    children: (params: { clientWidth?: number; clientHeight?: number }) => React.ReactNode;
    /**
     * Render prop for the item headline.
     */
    renderHeadline?: (clientHeight?: number, clientWidth?: number) => React.ReactNode;
    /**
     * Render prop for content rendered inside the main content before the visualization container.
     */
    renderBeforeVisualization?: () => React.ReactNode;
    /**
     * Render prop for content rendered inside the main content after the visualization container.
     */
    renderAfterVisualization?: () => React.ReactNode;
    /**
     * Render prop for content rendered before the main content.
     */
    renderBeforeContent?: () => React.ReactNode;
    /**
     * Render prop for content rendered after the main content.
     */
    renderAfterContent?: () => React.ReactNode;
    /**
     * Class name applied to the main content.
     */
    contentClassName?: string;
    /**
     * Class name applied to the visualization container.
     */
    visualizationClassName?: string;
    /**
     * Ref forwarded to the main content container.
     */
    contentRef?: React.Ref<HTMLDivElement>;
    /**
     * Flag indicating the given item can be selected.
     */
    isSelectable?: boolean;
    /**
     * Flag indicating the given item is selected.
     */
    isSelected?: boolean;

    /**
     * Is export flag.
     */
    isExport?: boolean;
    /**
     * Callback to call when an item is selected. Called with the relevant mouse event if originating from a click.
     */
    onSelected?: (e?: MouseEvent) => void;

    onEnter?: () => void;
    onLeave?: () => void;

    /**
     * Flag indicating the given item is hidden in some context (e.g. in export mode).
     */
    ariaHidden?: boolean;
}

const noopRender = () => null;

export function DashboardItemBase({
    children,
    contentClassName,
    visualizationClassName,
    renderHeadline = noopRender,
    renderBeforeVisualization = noopRender,
    renderAfterVisualization = noopRender,
    renderBeforeContent = noopRender,
    renderAfterContent = noopRender,
    contentRef,
    isSelectable = false,
    isSelected = false,
    isExport = false,
    onSelected,
    onEnter,
    onLeave,
    ariaHidden,
}: IDashboardItemBaseProps) {
    return (
        <DashboardItemContentWrapper>
            {({ clientWidth, clientHeight }) => (
                <>
                    {renderBeforeContent()}
                    <DashboardItemContent
                        className={contentClassName}
                        ref={contentRef}
                        isSelectable={isSelectable}
                        isSelected={isSelected}
                        isExport={isExport}
                        onSelected={onSelected}
                        onEnter={onEnter}
                        onLeave={onLeave}
                    >
                        {renderBeforeVisualization()}
                        <div className={visualizationClassName} aria-hidden={ariaHidden}>
                            {renderHeadline(clientHeight, clientWidth)}
                            {children({ clientWidth, clientHeight })}
                        </div>
                        {renderAfterVisualization()}
                    </DashboardItemContent>
                    {renderAfterContent()}
                </>
            )}
        </DashboardItemContentWrapper>
    );
}
