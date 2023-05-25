// (C) 2022 GoodData Corporation
import { IInsightDefinition } from "@gooddata/sdk-model";
import { IEmbeddingCodeContext } from "../../interfaces/VisualizationDescriptor.js";

/**
 * Metadata of an import.
 */
export interface IImportInfo {
    /**
     * Name of the imported member.
     */
    name: string;
    /**
     * Type of the import.
     */
    importType: "default" | "named";
    /**
     * Name of the package the member is imported from.
     */
    package: string;
}

/**
 * Defines a factory that can be used along with the ones already supported by {@link @gooddata/sdk-model#factoryNotationFor}.
 */
export interface IAdditionalFactoryDefinition {
    /**
     * Import metadata of the factory.
     */
    importInfo: IImportInfo;
    /**
     * The functional definition of the factory notation.
     *
     * @remarks
     * See {@link @gooddata/sdk-model#factoryNotationFor} `additionalConversion` parameter for more info.
     */
    transformation: (obj: any) => string | undefined;
}

/**
 * Metadata of a single prop.
 */
export type PropMeta = {
    /**
     * Metadata of the property type import.
     */
    typeImport?: IImportInfo;
    /**
     * Type of the property, array or scalar.
     */
    cardinality: "scalar" | "array";
};

/**
 * Wrapper around the prop with added metadata.
 */
export type PropWithMeta<TProp> = {
    /**
     * The actual prop value.
     */
    value: TProp;
    /**
     * Additional metadata.
     */
    meta: PropMeta;
};

/**
 * Props object with some extra information for each property (like type and so on).
 */
export type PropsWithMeta<TProps> = { [K in keyof TProps]: PropWithMeta<TProps[K]> };

/**
 * Function that converts a given insight in a given context to a props object for some visualization.
 */
export type InsightToPropsConverter<TProps> = (
    insight: IInsightDefinition,
    ctx?: IEmbeddingCodeContext,
) => PropsWithMeta<TProps>;

/**
 * Specification for the embedding code generator factory.
 *
 * @remarks
 * Contains all the visualization-type-specific information for the code generator.
 */
export interface IEmbeddingCodeGeneratorSpecification<TProps> {
    component: IImportInfo;
    insightToProps: InsightToPropsConverter<TProps>;
    additionalFactories?: IAdditionalFactoryDefinition[];
}
