// (C) 2020-2025 GoodData Corporation
import React, { ReactElement, useMemo } from "react";

import { isDashboardWidget } from "@gooddata/sdk-model";

import { DefaultDashboardWidget } from "./DefaultDashboardWidget.js";
import { CustomDashboardWidgetComponent, IDashboardWidgetProps } from "./types.js";
import {
    extendedWidgetDebugStr,
    selectEnableFlexibleLayout,
    useDashboardSelector,
} from "../../../model/index.js";
import {
    isInitialPlaceholderWidget,
    isInsightPlaceholderWidget,
    isLoadingPlaceholderWidget,
} from "../../../widgets/index.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { LoadingDashboardPlaceholderWidget } from "../../dragAndDrop/index.js";
import { EmptyDashboardDropZone as FlexibleEmptyDashboardDropZone } from "../../flexibleLayout/dragAndDrop/draggableWidget/EmptyDashboardDropZone.js";
import { EmptyDashboardDropZone as FluidEmptyDashboardDropZone } from "../../layout/dragAndDrop/draggableWidget/EmptyDashboardDropZone.js";

function BadWidgetType() {
    return <div>Missing renderer</div>;
}

function MissingWidget() {
    return <div>Missing widget</div>;
}

/**
 * @internal
 */
export function DashboardWidget(props: IDashboardWidgetProps): ReactElement {
    const { WidgetComponentProvider, InsightWidgetComponentSet } = useDashboardComponentsContext();
    const isFlexibleLayoutEnabled = useDashboardSelector(selectEnableFlexibleLayout);
    const {
        widget,
        // @ts-expect-error Don't expose index prop on public interface (we need it only for css class for KD tests)
        index,
    } = props;
    const WidgetComponent = useMemo((): CustomDashboardWidgetComponent => {
        // TODO: we need to get rid of this; the widget being optional at this point is the problem; the parent
        //  components (or possibly the model) should deal with layout items that have no valid widgets associated
        //  and thus short-circuit.
        if (!widget) {
            console.warn("Attempting render an undefined widget.");
            return MissingWidget;
        }

        const Component = WidgetComponentProvider(widget);
        const EmptyDashboardDropZone = isFlexibleLayoutEnabled
            ? FlexibleEmptyDashboardDropZone
            : FluidEmptyDashboardDropZone;

        // the default WidgetComponentProvider always returns something, DefaultDashboardWidget by default
        if (Component && Component !== DefaultDashboardWidget) {
            return Component;
        }

        function InitialPlaceholder() {
            return <EmptyDashboardDropZone />;
        }

        if (isInitialPlaceholderWidget(widget)) {
            return InitialPlaceholder;
        }

        if (isLoadingPlaceholderWidget(widget)) {
            return LoadingDashboardPlaceholderWidget;
        }

        if (isInsightPlaceholderWidget(widget) && InsightWidgetComponentSet.creating) {
            return InsightWidgetComponentSet.creating.CreatingPlaceholderComponent!;
        }

        if (isDashboardWidget(widget)) {
            return DefaultDashboardWidget;
        }

        console.warn(`Unable to render widget ${extendedWidgetDebugStr(widget)}`);
        return BadWidgetType;
    }, [widget, isFlexibleLayoutEnabled]);

    return (
        <WidgetComponent
            {...props}
            // @ts-expect-error Don't expose index prop on public interface (we need it only for css class for KD tests)
            index={index}
        />
    );
}
