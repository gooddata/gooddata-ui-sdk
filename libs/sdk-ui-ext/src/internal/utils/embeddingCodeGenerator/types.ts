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

export type PropMeta = {
    typeImport: IImportInfo;
    cardinality: "scalar" | "array";
};

export type PropWithMeta<TProp> = {
    value: TProp;
    meta: PropMeta;
};

export type PropsWithMeta<TProps> = { [K in keyof TProps]: PropWithMeta<TProps[K]> };

export type InsightToPropsConverter<TProps> = (
    insight: IInsightDefinition,
    ctx?: IEmbeddingCodeContext,
) => PropsWithMeta<TProps>;

export interface IEmbeddingCodeGeneratorInput<TProps> {
    component: IImportInfo;
    insightToProps: InsightToPropsConverter<TProps>;
    additionalFactories?: IAdditionalFactoryDefinition[];
}
