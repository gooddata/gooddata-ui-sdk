// (C) 2021-2026 GoodData Corporation

// oxlint-disable no-barrel-files/no-barrel-files

export { type Locale, locales } from "./docs/index.js";
export { MaqlLanguageService, type ILanguageService } from "./maqlLanguageService.js";
export { type IMetadataServiceOptions, MetadataService } from "./metadataService.js";
export {
    type ILabelElementList,
    type ILabelElementsFuncResult,
    type ILdmDataset,
    type IMetadataObjectStruct,
    type ITigerAttribute,
    type ITigerComputedAttribute,
    type ITigerDataset,
    type ITigerFact,
    type ITigerLabel,
    type ITigerMetadataObject,
    type ITigerMetadataObjectStub,
    type ITigerMetric,
    type ITigerParameter,
    type LabelElementsFunc,
    LdmObjects,
    type TypeModifiers,
    isITigerParameter,
} from "./metadata/model.js";
export type { DecorationType, IDecoration, IDecorationOptions } from "./decorations.js";
export {
    renderParameterDefaults,
    resolveParameterValues,
    type IRenderedMaql,
    type IResolvedParameter,
} from "./renderParameters.js";
export type { ObjectContent, HoverWithData } from "./hover.js";
export { normalizeMaqlObjectType } from "./maqlObjectTypes.js";
export type { IMetadataInterface } from "./metadata/types.js";
export {
    type HighlightToken,
    type ModifierTypes,
    ModifierTypesList,
    type TokenTypes,
    TokenTypesList,
    semanticTokensLegend,
} from "./highlight/semanticsHighlight.js";
