// (C) 2022 GoodData Corporation
import { API as CodeShiftApi, JSXElement, JSXIdentifier } from "jscodeshift";

const SUPPORTED_VISUALIZATIONS = new Set([
    "AreaChart",
    "BarChart",
    "BubbleChart",
    "BulletChart",
    "ColumnChart",
    "ComboChart",
    "DonutChart",
    "FunnelChart",
    "GeoPushpinChart",
    "Headline",
    "Heatmap",
    "LineChart",
    "PieChart",
    "PivotTable",
    "ScatterPlot",
    "Treemap",
    "Xirr",
    "PluggableAreaChart",
    "PluggableBarChart",
    "PluggableBubbleChart",
    "PluggableBulletChart",
    "PluggableColumnChart",
    "PluggableComboChart",
    "PluggableDonutChart",
    "PluggableFunnelChart",
    "PluggableGeoPushpinChart",
    "PluggableHeadline",
    "PluggableHeatmap",
    "PluggableLineChart",
    "PluggablePieChart",
    "PluggablePivotTable",
    "PluggableScatterPlot",
    "PluggableTreemap",
    "PluggableXirr",
]);

/**
 * Transform that renames prop names.
 *
 * @remarks
 * Only touches props of known components to avoid changes to components not coming from GoodData packages.
 *
 * @param api - the jscodeshift API to use for the transformations
 * @param spec - specification of the renames in the shape of \{ oldName: newName \}
 */
export const visPropNameTransform =
    (api: CodeShiftApi, spec: Record<string, string>) =>
    (source: string): string => {
        const { j } = api;
        const supportedPropNames = new Set(Object.keys(spec));

        return j(source)
            .find(j.JSXAttribute)
            .filter((path) => {
                const isSupportedVisType = SUPPORTED_VISUALIZATIONS.has(
                    ((path.parent.value as JSXElement).name as JSXIdentifier).name,
                );
                const isSupportedProp = supportedPropNames.has((path.value.name as JSXIdentifier).name);

                return isSupportedVisType && isSupportedProp;
            })
            .replaceWith((path) =>
                j.jsxAttribute(
                    { type: "JSXIdentifier", name: spec[(path.value.name as JSXIdentifier).name] },
                    path.value.value,
                ),
            )
            .toSource();
    };
