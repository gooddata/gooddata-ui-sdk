// (C) 2020-2022 GoodData Corporation
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
    renderHeadline?: (clientHeight?: number) => React.ReactNode;
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
     * Callback to call when an item is selected. Called with the relevant mouse event if originating from a click.
     */
    onSelected?: (e?: MouseEvent) => void;
}

const noopRender = () => null;

export const DashboardItemBase: React.FC<IDashboardItemBaseProps> = ({
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
    onSelected,
}) => {
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
                        onSelected={onSelected}
                    >
                        {renderBeforeVisualization()}
                        <div className={visualizationClassName}>
                            {renderHeadline(clientHeight)}
                            {children({ clientWidth, clientHeight })}
                        </div>
                        {renderAfterVisualization()}
                    </DashboardItemContent>
                    {renderAfterContent()}
                </>
            )}
        </DashboardItemContentWrapper>
    );
};
