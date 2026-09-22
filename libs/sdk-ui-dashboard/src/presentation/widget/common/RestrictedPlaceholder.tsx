// (C) 2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { type ScreenSize } from "@gooddata/sdk-model";
import { UiRestrictedPlaceholder } from "@gooddata/sdk-ui-kit";

import { type CustomRestrictedPlaceholderComponent } from "../../dashboardContexts/types.js";
import { type WidgetExportData } from "../../export/types.js";
import { DashboardItem } from "../../presentationComponents/DashboardItems/DashboardItem.js";
import { DashboardItemVisualization } from "../../presentationComponents/DashboardItems/DashboardItemVisualization.js";

/**
 * Below this, the recovery step does not fit on a line of its own and the design keeps the reason
 * alone. The width decides it, never the height: the same tile is measured ten pixels shorter in
 * edit mode than in view mode, and one widget must not read differently between the two.
 */
const COMPACT_WIDTH = 320;

/**
 * Props of the replaceable content of a restricted placeholder. The dashboard owns the tile and,
 * for a visualization switcher, the entry list; a consumer supplies only what goes inside.
 *
 * @alpha
 */
export interface IRestrictedPlaceholderContentProps {
    /** Width of the area the content is given, in pixels; absent before it is measured. */
    width?: number;
    /** Height of the area the content is given, in pixels; absent before it is measured. */
    height?: number;
}

/**
 * The built-in restricted placeholder content: a lock with the reason and the recovery step, as the
 * design has it. It takes over the whole widget, title included, because a stored title can name the
 * object the reader may not know exists.
 *
 * @alpha
 */
export function RestrictedPlaceholderContent({ width }: IRestrictedPlaceholderContentProps) {
    const intl = useIntl();

    const title = intl.formatMessage({ id: "widget.error.restricted_insight.message" });
    const description = intl.formatMessage({ id: "widget.error.restricted_insight.description" });

    return (
        <div className="gd-restricted-placeholder-trigger">
            <UiRestrictedPlaceholder
                title={title}
                description={description}
                size={width !== undefined && width < COMPACT_WIDTH ? "compact" : "default"}
                dataTestId="restricted-placeholder"
            />
        </div>
    );
}

/**
 * Props of the component standing in for a widget the current user is not allowed to see.
 *
 * @alpha
 */
export interface IRestrictedPlaceholderProps {
    screen: ScreenSize;
    dashboardItemClasses: string;

    /**
     * Present only while the dashboard is being exported; carries the attributes the export
     * pipeline reads off the rendered item.
     */
    exportData?: WidgetExportData;
}

/**
 * Stands in for an insight widget the current user is not allowed to see. It replaces the widget title
 * too, because a stored title can name the restricted object.
 */
export function RestrictedPlaceholder({
    screen,
    dashboardItemClasses,
    exportData,
    Content,
}: IRestrictedPlaceholderProps & { Content: CustomRestrictedPlaceholderComponent }) {
    return (
        <DashboardItem
            className={cx(dashboardItemClasses, "type-visualization", "gd-dashboard-view-widget")}
            screen={screen}
            exportData={exportData?.section}
            as="div"
        >
            <DashboardItemVisualization isExport={!!exportData}>
                {({ clientHeight, clientWidth }) => (
                    // the wrapper the insight path also puts here: it is the positioned box the
                    // content's absolutely sized container resolves its 100% height against, and
                    // without it that box is the padded dash item, so the content overflows the tile
                    <div className="visualization-content">
                        <Content width={clientWidth} height={clientHeight} />
                    </div>
                )}
            </DashboardItemVisualization>
        </DashboardItem>
    );
}
