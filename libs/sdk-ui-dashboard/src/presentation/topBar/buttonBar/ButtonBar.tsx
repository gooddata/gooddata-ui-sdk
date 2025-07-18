// (C) 2020-2025 GoodData Corporation
import { ReactElement } from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IButtonBarProps } from "./types.js";

/**
 * @internal
 */
export function ButtonBar(props: IButtonBarProps): ReactElement {
    const { ButtonBarComponent } = useDashboardComponentsContext();

    return <ButtonBarComponent {...props} />;
}
