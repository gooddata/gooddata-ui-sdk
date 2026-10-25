// (C) 2021-2026 GoodData Corporation

import { type Ref, forwardRef, useCallback, useContext } from "react";

import { type IWorkspacePermissions } from "@gooddata/sdk-model";

import { fullWorkspacePermissions } from "../shared/permissions.js";
import { IntlWrapper } from "../translations/IntlWrapper.js";

import { MinimizedMetricComponent } from "./MinimizedMetricComponent/MinimizedMetricComponent.js";
import { MultipleMetricsContext } from "./MultipleMetricsState.js";

/**
 * @internal
 */
export interface IMinimizedMetricsProps {
    ref?: Ref<HTMLElement | undefined>;
    permissions?: IWorkspacePermissions;
    locale?: string;
    setMinimized: (state: boolean) => void;
}

/**
 * @internal
 */
export const MinimizeMetrics = forwardRef<HTMLElement | undefined, IMinimizedMetricsProps>(
    function MinimizeMetrics({ locale, setMinimized, permissions = fullWorkspacePermissions() }, _) {
        const { tabsProps, closeAllTabs } = useContext(MultipleMetricsContext);

        const closeAllTabsHandler = useCallback(() => {
            if (closeAllTabs) {
                closeAllTabs();
            }
            setMinimized(false);
        }, [closeAllTabs, setMinimized]);

        const isDirty = tabsProps.tabs.find((tab) => tab.states?.dirty) !== undefined;
        const isInvalid = tabsProps.tabs.find((tab) => tab.states?.invalid) !== undefined;

        return (
            <IntlWrapper locale={locale}>
                <MinimizedMetricComponent
                    editable={permissions.canManageProject}
                    edited={tabsProps.tabs.length}
                    dirty={isDirty}
                    invalid={isInvalid}
                    onClose={closeAllTabsHandler}
                    onExpand={() => setMinimized(false)}
                    where="bottomRight"
                />
            </IntlWrapper>
        );
    },
);
