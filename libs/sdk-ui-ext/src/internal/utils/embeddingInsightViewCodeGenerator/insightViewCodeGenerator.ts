// (C) 2022 GoodData Corporation

import { IInsight, IInsightDefinition, insightId, insightTitle } from "@gooddata/sdk-model";
import { IInsightViewProps } from "../../interfaces/InsightView.js";
import {
    IEmbeddingCodeGeneratorSpecification,
    PropsWithMeta,
    getReactEmbeddingCodeGenerator,
} from "../embeddingCodeGenerator/index.js";
import { removeUseless } from "../removeUseless.js";
import { configForInsightView, localeForInsightView } from "./insightViewConfig.js";
import { IEmbeddingCodeContext } from "../../interfaces/VisualizationDescriptor.js";

const getInsightViewSpecification = (
    includeConfiguration = true,
): IEmbeddingCodeGeneratorSpecification<IInsightViewProps> => {
    return {
        component: {
            importType: "named",
            name: "InsightView",
            package: "@gooddata/sdk-ui-ext",
        },
        insightToProps: (insightDefinition: IInsightDefinition, ctx?: IEmbeddingCodeContext) => {
            const insightConfig: PropsWithMeta<IInsightViewProps> = {
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
                locale: localeForInsightView(ctx),
            };

            if (includeConfiguration) {
                insightConfig.config = configForInsightView(insightDefinition);
            }

            return insightConfig;
        },
    };
};

/**
 * generate the insight view embedded code
 *
 * @internal
 */
export const insightViewEmbeddedCodeGenerator = getReactEmbeddingCodeGenerator<IInsightViewProps>(
    getInsightViewSpecification(false),
);

/**
 * DO NOT USE THIS INSIGHTVIEW CODE GENERATOR, IT'S FOR INTERNAL PURPOSE ONLY.
 *
 * @internal
 */
export const insightViewCodeGenerator = getReactEmbeddingCodeGenerator<IInsightViewProps>(
    getInsightViewSpecification(),
);
