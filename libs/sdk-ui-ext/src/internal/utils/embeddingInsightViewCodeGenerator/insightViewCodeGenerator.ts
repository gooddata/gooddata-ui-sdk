// (C) 2022 GoodData Corporation

import { IInsight, insightId, insightTitle } from "@gooddata/sdk-model";
import { IInsightViewProps } from "../../interfaces/InsightView.js";
import { getReactEmbeddingCodeGenerator } from "../embeddingCodeGenerator/index.js";
import { removeUseless } from "../removeUseless.js";
import { configForInsightView, localeForInsightView } from "./insightViewConfig.js";

/**
 * DO NOT USE THIS INSIGHTVIEW CODE GENERATOR, IT'S FOR INTERNAL PURPOSE ONLY.
 *
 * @internal
 */
export const insightViewCodeGenerator = getReactEmbeddingCodeGenerator<IInsightViewProps>({
    component: {
        importType: "named",
        name: "InsightView",
        package: "@gooddata/sdk-ui-ext",
    },
    insightToProps: (insightDefinition, ctx) => {
        return {
            insight: {
                value: insightId(insightDefinition as IInsight),
                meta: {
                    cardinality: "scalar",
                },
            },
            showTitle: {
                value: insightTitle(insightDefinition),
                meta: {
                    cardinality: "scalar",
                },
            },
            execConfig: {
                value: ctx?.executionConfig && removeUseless(ctx.executionConfig),
                meta: {
                    cardinality: "scalar",
                    typeImport: {
                        importType: "named",
                        name: "IExecutionConfig",
                        package: "@gooddata/sdk-model",
                    },
                },
            },
            config: configForInsightView(insightDefinition),
            locale: localeForInsightView(ctx),
        };
    },
});
