// (C) 2022 GoodData Corporation

import { IInsight, insightRef, insightTitle } from "@gooddata/sdk-model";
import { IInsightViewProps } from "../../insightView";
import { getReactEmbeddingCodeGenerator } from "../utils/embeddingCodeGenerator";
import { insightViewAdditionalTransformations } from "./insightViewCodeGenUtils";

export const insightViewCodeGenerator = getReactEmbeddingCodeGenerator<IInsightViewProps>({
    component: {
        importType: "named",
        name: "InsightView",
        package: "@gooddata/sdk-ui-ext",
    },
    insightToProps: (insightDefinition, _context) => {
        return {
            insight: {
                value: insightRef(insightDefinition as IInsight),
                meta: {
                    typeImport: {
                        name: "ObjRef",
                        importType: "named",
                        package: "@gooddata/sdk-model",
                    },
                    cardinality: "scalar",
                },
            },
            showTitle: {
                value: insightTitle(insightDefinition),
                meta: {
                    cardinality: "scalar",
                },
            },
        };
    },
    additionalFactories: insightViewAdditionalTransformations(),
});
