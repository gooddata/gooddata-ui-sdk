// // (C) 2020-2024 GoodData Corporation
// import React, { useMemo } from "react";
// import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
// import { IDashboardStackProps } from "./types.js";

// /**
//  * @internal
//  */
// export const DashboardStack = (props: IDashboardStackProps): JSX.Element => {
//     const { StackWidgetComponentSet } = useDashboardComponentsContext();
//     const { widget, st } = props;
//     const StackComponent = useMemo(
//         () => StackWidgetComponentSet.MainComponentProvider(widget),
//         [StackWidgetComponentSet, kpiWidget],
//     );

//     return <StackComponent {...props} />;
// };
