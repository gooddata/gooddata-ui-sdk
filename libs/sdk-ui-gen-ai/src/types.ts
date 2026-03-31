// (C) 2022-2026 GoodData Corporation

import { type IChatConversationVisualisationContent } from "@gooddata/sdk-backend-spi";
import { type IGenAIVisualization } from "@gooddata/sdk-model";

export type Config =
    | IGenAIVisualization["config"]
    | IChatConversationVisualisationContent["visualization"]["insight"]["properties"]["controls"];
