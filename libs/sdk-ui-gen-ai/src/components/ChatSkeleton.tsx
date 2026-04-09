// (C) 2026 GoodData Corporation

import Skeleton from "react-loading-skeleton";

export function ChatSkeleton() {
    return (
        <Skeleton
            count={3}
            height="2em"
            baseColor="var(--gd-palette-complementary-2, #ebeff4)"
            highlightColor="var(--gd-palette-complementary-0, #fff)"
        />
    );
}
