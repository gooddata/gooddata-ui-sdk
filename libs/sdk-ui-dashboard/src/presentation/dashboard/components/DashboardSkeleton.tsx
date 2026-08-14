// (C) 2024-2026 GoodData Corporation

import type { ReactNode } from "react";
import Skeleton from "react-loading-skeleton";

import { useScreenSize } from "./DashboardScreenSizeContext.js";

interface IDashboardSkeletonWrapperProps {
    children?: ReactNode;
}

function DashboardSkeletonWrapper({ children }: IDashboardSkeletonWrapperProps) {
    return <div className="gd-skeleton-wrapper">{children}</div>;
}

function DashboardSkeletonFilter({ index }: { index: number }) {
    return (
        <div className="gd-skeleton-filter">
            <Skeleton className="gd-react-loading-skeleton" width={index % 2 === 0 ? 40 : 80} height={14} />
            <Skeleton className="gd-react-loading-skeleton" width={index % 2 === 0 ? 80 : 40} height={14} />
        </div>
    );
}

function DashboardSkeletonFilterBar() {
    return (
        <div className="gd-skeleton-filter-bar">
            <DashboardSkeletonFilter key={0} index={0} />
            <DashboardSkeletonFilter key={1} index={1} />
            <DashboardSkeletonFilter key={2} index={2} />
        </div>
    );
}

/**
 * @internal
 */
export function DashboardSkeleton() {
    const screenSize = useScreenSize();
    const isSmall = screenSize === "xs" || screenSize === "sm";

    return (
        <div className="sdk-dashboard-skeleton">
            <DashboardSkeletonWrapper>
                <DashboardSkeletonFilterBar />
                <div className="gd-skeleton-content">
                    {isSmall ? (
                        <>
                            <Skeleton
                                containerClassName="skeleton-flex"
                                className="gd-react-loading-skeleton"
                                width={"100%"}
                                height={220}
                            />
                            <Skeleton
                                containerClassName="skeleton-flex"
                                className="gd-react-loading-skeleton"
                                width={"100%"}
                                height={220}
                            />
                        </>
                    ) : (
                        <>
                            <Skeleton
                                containerClassName="skeleton-flex"
                                className="gd-react-loading-skeleton"
                                width={"100%"}
                                height={440}
                            />
                            <Skeleton
                                containerClassName="skeleton-flex"
                                className="gd-react-loading-skeleton"
                                width={"100%"}
                                height={440}
                            />
                        </>
                    )}
                </div>
            </DashboardSkeletonWrapper>
        </div>
    );
}
