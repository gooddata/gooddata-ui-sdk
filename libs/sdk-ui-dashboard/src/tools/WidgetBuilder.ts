// (C) 2022 GoodData Corporation

import { IInsight } from "@gooddata/sdk-model";
import { InsightWidgetBuilder } from "./InsightWidgetBuilder";

/**
 * Wrapper for builders of all types of widgets.
 *
 * @remarks
 * The wrapper currently supports these builders
 *
 * - {@link InsightWidgetBuilder}
 *
 * @internal
 */
export class WidgetBuilder {
    static forInsightWidget(insight: IInsight) {
        return new InsightWidgetBuilder(insight);
    }
}
