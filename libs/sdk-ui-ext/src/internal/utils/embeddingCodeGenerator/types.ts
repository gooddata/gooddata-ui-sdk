// (C) 2022 GoodData Corporation
import { IInsightDefinition } from "@gooddata/sdk-model";
import { IEmbeddingCodeContext } from "../../interfaces/VisualizationDescriptor";

export interface IImportInfo {
    name: string;
    importType: "default" | "named";
    package: string;
}

export interface IAdditionalFactoryDefinition {
    importInfo: IImportInfo;
    transformation: (obj: any) => string | undefined;
}

export type InsightToPropsConverter<TProps> = (
    insight: IInsightDefinition,
    ctx?: IEmbeddingCodeContext,
) => TProps;

export interface IEmbeddingCodeGeneratorInput<TProps> {
    component: IImportInfo;
    insightToProps: InsightToPropsConverter<TProps>;
    additionalFactories?: IAdditionalFactoryDefinition[];
}
