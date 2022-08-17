// (C) 2020-2022 GoodData Corporation
import React, { useMemo } from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { extendedWidgetDebugStr } from "../../../model";
import { DefaultDashboardWidget } from "./DefaultDashboardWidget";
import { isDashboardWidget } from "@gooddata/sdk-model";
import { CustomDashboardWidgetComponent, IDashboardWidgetProps } from "./types";
import { EmptyDashboardDropZone, WidgetDropZone } from "../../dragAndDrop";
import {
    isInitialPlaceholderWidget,
    isInsightPlaceholderWidget,
    isKpiPlaceholderWidget,
    isPlaceholderWidget,
} from "../../../widgets";

const BadWidgetType: React.FC = () => {
    return <div>Missing renderer</div>;
};

const MissingWidget: React.FC = () => {
    return <div>Missing widget</div>;
};

/**
 * @internal
 */
export const DashboardWidget = (props: IDashboardWidgetProps): JSX.Element => {
    const { WidgetComponentProvider, KpiWidgetComponentSet, InsightWidgetComponentSet } =
        useDashboardComponentsContext();
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
            // eslint-disable-next-line no-console
            console.warn("Attempting render an undefined widget.");
            return MissingWidget;
        }

        const Component = WidgetComponentProvider(widget);

        // the default WidgetComponentProvider always returns something, DefaultDashboardWidget by default
        if (Component && Component !== DefaultDashboardWidget) {
            return Component;
        }

        if (isInitialPlaceholderWidget(widget)) {
            return EmptyDashboardDropZone;
        }

        if (isPlaceholderWidget(widget)) {
            return WidgetDropZone;
        }

        if (isKpiPlaceholderWidget(widget) && KpiWidgetComponentSet.creating) {
            return KpiWidgetComponentSet.creating.CreatingPlaceholderComponent;
        }

        if (isInsightPlaceholderWidget(widget) && InsightWidgetComponentSet.creating) {
            return InsightWidgetComponentSet.creating.CreatingPlaceholderComponent;
        }

        if (isDashboardWidget(widget)) {
            return DefaultDashboardWidget;
        }

        // eslint-disable-next-line no-console
        console.warn(`Unable to render widget ${extendedWidgetDebugStr(widget)}`);
        return BadWidgetType;
    }, [widget]);

    return (
        <WidgetComponent
            {...props}
            // @ts-expect-error Don't expose index prop on public interface (we need it only for css class for KD tests)
            index={index}
        />
    );
};
