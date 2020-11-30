// (C) 2020 GoodData Corporation
import React, { useRef } from "react";

interface IDashboardItemContentWrapperProps {
    children: (params: { clientWidth: number }) => React.ReactNode;
}

export const DashboardItemContentWrapper: React.FC<IDashboardItemContentWrapperProps> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>();

    const clientWidth = containerRef.current?.clientWidth ?? 0;

    return (
        <div className="dash-item-content-wrapper" ref={containerRef}>
            {children({ clientWidth })}
        </div>
    );
};
