// (C) 2020 GoodData Corporation
import React from "react";

import { DashboardItemContent } from "./DashboardItemContent";
import { DashboardItemContentWrapper } from "./DashboardItemContentWrapper";

export interface IDashboardItemBaseProps {
    /**
     * Render prop for the content itself.
     */
    children: (params: { clientWidth: number }) => React.ReactNode;
    /**
     * Render prop for the item headline.
     */
    renderHeadline?: () => React.ReactNode;
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
}

export const DashboardItemBase: React.FC<IDashboardItemBaseProps> = ({
    children,
    contentClassName,
    visualizationClassName,
    renderHeadline = () => null,
    renderBeforeVisualization = () => null,
    renderAfterVisualization = () => null,
    renderBeforeContent = () => null,
    renderAfterContent = () => null,
    contentRef,
}) => {
    return (
        <DashboardItemContentWrapper>
            {({ clientWidth }) => (
                <>
                    {renderBeforeContent()}
                    <DashboardItemContent className={contentClassName} ref={contentRef}>
                        {renderBeforeVisualization()}
                        <div className={visualizationClassName}>
                            {renderHeadline()}
                            {children({ clientWidth })}
                        </div>
                        {renderAfterVisualization()}
                    </DashboardItemContent>
                    {renderAfterContent()}
                </>
            )}
        </DashboardItemContentWrapper>
    );
};
