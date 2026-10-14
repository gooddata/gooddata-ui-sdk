// (C) 2026 GoodData Corporation

import {
    BuiltInPublisherPageLayoutCoverV1,
    BuiltInPublisherPageLayoutPortraitCoverV1,
    BuiltInPublisherPageLayoutPortraitSectionV1,
    BuiltInPublisherPageLayoutPortraitSummaryV1,
    BuiltInPublisherPageLayoutSectionV1,
    BuiltInPublisherPageLayoutViz6TextLeftV1,
    BuiltInPublisherPageLayoutsV1,
} from "./v1/builtinPageLayouts.js";
import {
    type IPublisherAttributeFilterConfigV1,
    type IPublisherDocumentContentV1,
    type IPublisherDocumentPageV1,
} from "./v1/content.js";
import {
    type IPublisherDocumentBaseV1,
    type IPublisherDocumentDefinitionV1,
    type IPublisherDocumentTemplateDefinitionV1,
    type IPublisherDocumentTemplateV1,
    type IPublisherDocumentV1,
    isPublisherDocumentDefinitionV1,
    isPublisherDocumentTemplateDefinitionV1,
    isPublisherDocumentTemplateV1,
    isPublisherDocumentV1,
} from "./v1/document.js";
import {
    newAdHocPublisherDocumentDefinitionV1,
    newPublisherDocumentContentV1,
    newPublisherDocumentDefinitionFromTemplateV1,
    newPublisherDocumentPageFromLayoutV1,
    newPublisherDocumentTemplateDefinitionV1,
    newPublisherPageLayoutDefinitionV1,
    publisherDocumentPageV1,
} from "./v1/factory.js";
import {
    type IPublisherLayoutNodeBaseV1,
    type IPublisherLayoutSectionV1,
    type IPublisherLayoutSlotRefV1,
    type PublisherPageLayoutNodeV1,
    isPublisherLayoutSectionV1,
    isPublisherLayoutSlotRefV1,
} from "./v1/layout.js";
import {
    DefaultPublisherPageFormatV1,
    PublisherPageFormatAspectRatiosV1,
    type PublisherPageFormatV1,
    PublisherPageFormatsV1,
    isPublisherPageFormatV1,
} from "./v1/pageFormat.js";
import {
    type IPublisherPageBodyV1,
    type IPublisherPageBodyValidationIssueV1,
    type IPublisherPageLayoutContentV1,
    type IPublisherPageLayoutDefinitionV1,
    type IPublisherPageLayoutV1,
    isPublisherPageLayoutDefinitionV1,
    isPublisherPageLayoutV1,
    validatePublisherPageBodyV1,
} from "./v1/pageLayout.js";
import {
    BuiltInPublisherSlotTypesV1,
    type IPublisherAiTextSourceV1,
    type IPublisherHeadingSlotV1,
    type IPublisherImageSlotV1,
    type IPublisherParagraphSlotV1,
    type IPublisherSlotBaseV1,
    type IPublisherSlotPlaceholderV1,
    type IPublisherStaticTextSourceV1,
    type IPublisherTextSlotV1,
    type IPublisherVisualizationSlotV1,
    type PublisherImageFitV1,
    type PublisherImageSourceV1,
    type PublisherSlotV1,
    type PublisherTextSourceV1,
    PublisherTextTypesV1,
    isPublisherHeadingSlotV1,
    isPublisherImageSlotV1,
    isPublisherParagraphSlotV1,
    isPublisherSlotV1,
    isPublisherTextSlotV1,
    isPublisherVisualizationSlotV1,
    publisherTextSlotTypeV1,
    publisherTextSlotTypesV1,
} from "./v1/slot.js";
import {
    DefaultPublisherHeadingTypeV1,
    DefaultPublisherParagraphTypeV1,
    type IPublisherBoxStyleV1,
    type IPublisherColorBackgroundV1,
    type IPublisherHeadingStyleV1,
    type IPublisherImageBackgroundV1,
    type IPublisherImageStyleV1,
    type IPublisherParagraphStyleV1,
    type IPublisherTextStyleV1,
    type PublisherBackgroundV1,
    type PublisherContentAlignmentV1,
    type PublisherHeadingTypeV1,
    PublisherHeadingTypesV1,
    type PublisherParagraphTypeV1,
    PublisherParagraphTypesV1,
    type PublisherTextTypeV1,
    isPublisherColorBackgroundV1,
    isPublisherHeadingTypeV1,
    isPublisherImageBackgroundV1,
    isPublisherParagraphTypeV1,
} from "./v1/styling.js";
import {
    type IPublisherVariableDefinitionV1,
    type PublisherBuiltInVariableV1,
    PublisherBuiltInVariablesV1,
    type PublisherDateStringV1,
    getPublisherTextPlaceholdersV1,
    publisherTextPlaceholderV1,
    resolvePublisherTextPlaceholdersV1,
} from "./v1/variables.js";

/**
 * Current version of {@link PublisherDateStringV1}.
 *
 * @alpha
 */
export type PublisherDateString = PublisherDateStringV1;

/**
 * Current version of {@link PublisherBuiltInVariableV1}.
 *
 * @alpha
 */
export type PublisherBuiltInVariable = PublisherBuiltInVariableV1;

/**
 * Current version of {@link IPublisherVariableDefinitionV1}.
 *
 * @alpha
 */
export type IPublisherVariableDefinition = IPublisherVariableDefinitionV1;

/**
 * Current version of {@link PublisherBuiltInVariablesV1}.
 *
 * @alpha
 */
export const PublisherBuiltInVariables = PublisherBuiltInVariablesV1;

/**
 * Current version of {@link getPublisherTextPlaceholdersV1}.
 *
 * @alpha
 */
export const getPublisherTextPlaceholders = getPublisherTextPlaceholdersV1;

/**
 * Current version of {@link publisherTextPlaceholderV1}.
 *
 * @alpha
 */
export const publisherTextPlaceholder = publisherTextPlaceholderV1;

/**
 * Current version of {@link resolvePublisherTextPlaceholdersV1}.
 *
 * @alpha
 */
export const resolvePublisherTextPlaceholders = resolvePublisherTextPlaceholdersV1;

/**
 * Current version of {@link PublisherPageLayoutNodeV1}.
 *
 * @alpha
 */
export type PublisherPageLayoutNode = PublisherPageLayoutNodeV1;

/**
 * Current version of {@link IPublisherLayoutNodeBaseV1}.
 *
 * @alpha
 */
export type IPublisherLayoutNodeBase = IPublisherLayoutNodeBaseV1;

/**
 * Current version of {@link IPublisherLayoutSectionV1}.
 *
 * @alpha
 */
export type IPublisherLayoutSection = IPublisherLayoutSectionV1;

/**
 * Current version of {@link IPublisherLayoutSlotRefV1}.
 *
 * @alpha
 */
export type IPublisherLayoutSlotRef = IPublisherLayoutSlotRefV1;

/**
 * Current version of {@link isPublisherLayoutSectionV1}.
 *
 * @alpha
 */
export const isPublisherLayoutSection = isPublisherLayoutSectionV1;

/**
 * Current version of {@link isPublisherLayoutSlotRefV1}.
 *
 * @alpha
 */
export const isPublisherLayoutSlotRef = isPublisherLayoutSlotRefV1;

/**
 * Current version of {@link IPublisherSlotPlaceholderV1}.
 *
 * @alpha
 */
export type IPublisherSlotPlaceholder = IPublisherSlotPlaceholderV1;

/**
 * Current version of {@link IPublisherSlotBaseV1}.
 *
 * @alpha
 */
export type IPublisherSlotBase = IPublisherSlotBaseV1;

/**
 * Current version of {@link IPublisherVisualizationSlotV1}.
 *
 * @alpha
 */
export type IPublisherVisualizationSlot = IPublisherVisualizationSlotV1;

/**
 * Current version of {@link IPublisherStaticTextSourceV1}.
 *
 * @alpha
 */
export type IPublisherStaticTextSource = IPublisherStaticTextSourceV1;

/**
 * Current version of {@link IPublisherAiTextSourceV1}.
 *
 * @alpha
 */
export type IPublisherAiTextSource = IPublisherAiTextSourceV1;

/**
 * Current version of {@link PublisherTextSourceV1}.
 *
 * @alpha
 */
export type PublisherTextSource = PublisherTextSourceV1;

/**
 * Current version of {@link IPublisherHeadingSlotV1}.
 *
 * @alpha
 */
export type IPublisherHeadingSlot = IPublisherHeadingSlotV1;

/**
 * Current version of {@link IPublisherParagraphSlotV1}.
 *
 * @alpha
 */
export type IPublisherParagraphSlot = IPublisherParagraphSlotV1;

/**
 * Current version of {@link IPublisherTextSlotV1}.
 *
 * @alpha
 */
export type IPublisherTextSlot = IPublisherTextSlotV1;

/**
 * Current version of {@link PublisherImageSourceV1}.
 *
 * @alpha
 */
export type PublisherImageSource = PublisherImageSourceV1;

/**
 * Current version of {@link PublisherImageFitV1}.
 *
 * @alpha
 */
export type PublisherImageFit = PublisherImageFitV1;

/**
 * Current version of {@link IPublisherImageSlotV1}.
 *
 * @alpha
 */
export type IPublisherImageSlot = IPublisherImageSlotV1;

/**
 * Current version of {@link PublisherSlotV1}.
 *
 * @alpha
 */
export type PublisherSlot = PublisherSlotV1;

/**
 * Current version of {@link BuiltInPublisherSlotTypesV1}.
 *
 * @alpha
 */
export const BuiltInPublisherSlotTypes = BuiltInPublisherSlotTypesV1;

/**
 * Current version of {@link PublisherTextTypesV1}.
 *
 * @alpha
 */
export const PublisherTextTypes = PublisherTextTypesV1;

/**
 * Current version of {@link publisherTextSlotTypeV1}.
 *
 * @alpha
 */
export const publisherTextSlotType = publisherTextSlotTypeV1;

/**
 * Current version of {@link publisherTextSlotTypesV1}.
 *
 * @alpha
 */
export const publisherTextSlotTypes = publisherTextSlotTypesV1;

/**
 * Current version of {@link isPublisherVisualizationSlotV1}.
 *
 * @alpha
 */
export const isPublisherVisualizationSlot = isPublisherVisualizationSlotV1;

/**
 * Current version of {@link isPublisherHeadingSlotV1}.
 *
 * @alpha
 */
export const isPublisherHeadingSlot = isPublisherHeadingSlotV1;

/**
 * Current version of {@link isPublisherParagraphSlotV1}.
 *
 * @alpha
 */
export const isPublisherParagraphSlot = isPublisherParagraphSlotV1;

/**
 * Current version of {@link isPublisherTextSlotV1}.
 *
 * @alpha
 */
export const isPublisherTextSlot = isPublisherTextSlotV1;

/**
 * Current version of {@link isPublisherImageSlotV1}.
 *
 * @alpha
 */
export const isPublisherImageSlot = isPublisherImageSlotV1;

/**
 * Current version of {@link isPublisherSlotV1}.
 *
 * @alpha
 */
export const isPublisherSlot = isPublisherSlotV1;

/**
 * Current version of {@link PublisherContentAlignmentV1}.
 *
 * @alpha
 */
export type PublisherContentAlignment = PublisherContentAlignmentV1;

/**
 * Current version of {@link IPublisherColorBackgroundV1}.
 *
 * @alpha
 */
export type IPublisherColorBackground = IPublisherColorBackgroundV1;

/**
 * Current version of {@link IPublisherImageBackgroundV1}.
 *
 * @alpha
 */
export type IPublisherImageBackground = IPublisherImageBackgroundV1;

/**
 * Current version of {@link PublisherBackgroundV1}.
 *
 * @alpha
 */
export type PublisherBackground = PublisherBackgroundV1;

/**
 * Current version of {@link IPublisherBoxStyleV1}.
 *
 * @alpha
 */
export type IPublisherBoxStyle = IPublisherBoxStyleV1;

/**
 * Current version of {@link IPublisherImageStyleV1}.
 *
 * @alpha
 */
export type IPublisherImageStyle = IPublisherImageStyleV1;

/**
 * Current version of {@link IPublisherTextStyleV1}.
 *
 * @alpha
 */
export type IPublisherTextStyle = IPublisherTextStyleV1;

/**
 * Current version of {@link IPublisherHeadingStyleV1}.
 *
 * @alpha
 */
export type IPublisherHeadingStyle = IPublisherHeadingStyleV1;

/**
 * Current version of {@link IPublisherParagraphStyleV1}.
 *
 * @alpha
 */
export type IPublisherParagraphStyle = IPublisherParagraphStyleV1;

/**
 * Current version of {@link PublisherHeadingTypeV1}.
 *
 * @alpha
 */
export type PublisherHeadingType = PublisherHeadingTypeV1;

/**
 * Current version of {@link PublisherParagraphTypeV1}.
 *
 * @alpha
 */
export type PublisherParagraphType = PublisherParagraphTypeV1;

/**
 * Current version of {@link PublisherTextTypeV1}.
 *
 * @alpha
 */
export type PublisherTextType = PublisherTextTypeV1;

/**
 * Current version of {@link PublisherHeadingTypesV1}.
 *
 * @alpha
 */
export const PublisherHeadingTypes = PublisherHeadingTypesV1;

/**
 * Current version of {@link PublisherParagraphTypesV1}.
 *
 * @alpha
 */
export const PublisherParagraphTypes = PublisherParagraphTypesV1;

/**
 * Current version of {@link DefaultPublisherHeadingTypeV1}.
 *
 * @alpha
 */
export const DefaultPublisherHeadingType = DefaultPublisherHeadingTypeV1;

/**
 * Current version of {@link DefaultPublisherParagraphTypeV1}.
 *
 * @alpha
 */
export const DefaultPublisherParagraphType = DefaultPublisherParagraphTypeV1;

/**
 * Current version of {@link isPublisherHeadingTypeV1}.
 *
 * @alpha
 */
export const isPublisherHeadingType = isPublisherHeadingTypeV1;

/**
 * Current version of {@link isPublisherParagraphTypeV1}.
 *
 * @alpha
 */
export const isPublisherParagraphType = isPublisherParagraphTypeV1;

/**
 * Current version of {@link isPublisherColorBackgroundV1}.
 *
 * @alpha
 */
export const isPublisherColorBackground = isPublisherColorBackgroundV1;

/**
 * Current version of {@link isPublisherImageBackgroundV1}.
 *
 * @alpha
 */
export const isPublisherImageBackground = isPublisherImageBackgroundV1;

/**
 * Current version of {@link PublisherPageFormatV1}.
 *
 * @alpha
 */
export type PublisherPageFormat = PublisherPageFormatV1;

/**
 * Current version of {@link DefaultPublisherPageFormatV1}.
 *
 * @alpha
 */
export const DefaultPublisherPageFormat = DefaultPublisherPageFormatV1;

/**
 * Current version of {@link PublisherPageFormatsV1}.
 *
 * @alpha
 */
export const PublisherPageFormats = PublisherPageFormatsV1;

/**
 * Current version of {@link PublisherPageFormatAspectRatiosV1}.
 *
 * @alpha
 */
export const PublisherPageFormatAspectRatios = PublisherPageFormatAspectRatiosV1;

/**
 * Current version of {@link isPublisherPageFormatV1}.
 *
 * @alpha
 */
export const isPublisherPageFormat = isPublisherPageFormatV1;

/**
 * Current version of {@link IPublisherPageBodyV1}.
 *
 * @alpha
 */
export type IPublisherPageBody = IPublisherPageBodyV1;

/**
 * Current version of {@link IPublisherPageLayoutContentV1}.
 *
 * @alpha
 */
export type IPublisherPageLayoutContent = IPublisherPageLayoutContentV1;

/**
 * Current version of {@link IPublisherPageLayoutDefinitionV1}.
 *
 * @alpha
 */
export type IPublisherPageLayoutDefinition = IPublisherPageLayoutDefinitionV1;

/**
 * Current version of {@link IPublisherPageLayoutV1}.
 *
 * @alpha
 */
export type IPublisherPageLayout = IPublisherPageLayoutV1;

/**
 * Current version of {@link IPublisherPageBodyValidationIssueV1}.
 *
 * @alpha
 */
export type IPublisherPageBodyValidationIssue = IPublisherPageBodyValidationIssueV1;

/**
 * Current version of {@link isPublisherPageLayoutDefinitionV1}.
 *
 * @alpha
 */
export const isPublisherPageLayoutDefinition = isPublisherPageLayoutDefinitionV1;

/**
 * Current version of {@link isPublisherPageLayoutV1}.
 *
 * @alpha
 */
export const isPublisherPageLayout = isPublisherPageLayoutV1;

/**
 * Current version of {@link validatePublisherPageBodyV1}.
 *
 * @alpha
 */
export const validatePublisherPageBody = validatePublisherPageBodyV1;

/**
 * Current version of {@link IPublisherDocumentPageV1}.
 *
 * @alpha
 */
export type IPublisherDocumentPage = IPublisherDocumentPageV1;

/**
 * Current version of {@link IPublisherDocumentContentV1}.
 *
 * @alpha
 */
export type IPublisherDocumentContent = IPublisherDocumentContentV1;

/**
 * Current version of {@link IPublisherAttributeFilterConfigV1}.
 *
 * @alpha
 */
export type IPublisherAttributeFilterConfig = IPublisherAttributeFilterConfigV1;

/**
 * Current version of {@link IPublisherDocumentTemplateDefinitionV1}.
 *
 * @alpha
 */
export type IPublisherDocumentTemplateDefinition = IPublisherDocumentTemplateDefinitionV1;

/**
 * Current version of {@link IPublisherDocumentTemplateV1}.
 *
 * @alpha
 */
export type IPublisherDocumentTemplate = IPublisherDocumentTemplateV1;

/**
 * Current version of {@link IPublisherDocumentBaseV1}.
 *
 * @alpha
 */
export type IPublisherDocumentBase = IPublisherDocumentBaseV1;

/**
 * Current version of {@link IPublisherDocumentDefinitionV1}.
 *
 * @alpha
 */
export type IPublisherDocumentDefinition = IPublisherDocumentDefinitionV1;

/**
 * Current version of {@link IPublisherDocumentV1}.
 *
 * @alpha
 */
export type IPublisherDocument = IPublisherDocumentV1;

/**
 * Current version of {@link isPublisherDocumentTemplateDefinitionV1}.
 *
 * @alpha
 */
export const isPublisherDocumentTemplateDefinition = isPublisherDocumentTemplateDefinitionV1;

/**
 * Current version of {@link isPublisherDocumentTemplateV1}.
 *
 * @alpha
 */
export const isPublisherDocumentTemplate = isPublisherDocumentTemplateV1;

/**
 * Current version of {@link isPublisherDocumentDefinitionV1}.
 *
 * @alpha
 */
export const isPublisherDocumentDefinition = isPublisherDocumentDefinitionV1;

/**
 * Current version of {@link isPublisherDocumentV1}.
 *
 * @alpha
 */
export const isPublisherDocument = isPublisherDocumentV1;

/**
 * Current version of {@link newPublisherPageLayoutDefinitionV1}.
 *
 * @alpha
 */
export const newPublisherPageLayoutDefinition = newPublisherPageLayoutDefinitionV1;

/**
 * Current version of {@link newPublisherDocumentPageFromLayoutV1}.
 *
 * @alpha
 */
export const newPublisherDocumentPageFromLayout = newPublisherDocumentPageFromLayoutV1;

/**
 * Current version of {@link newPublisherDocumentContentV1}.
 *
 * @alpha
 */
export const newPublisherDocumentContent = newPublisherDocumentContentV1;

/**
 * Current version of {@link newPublisherDocumentTemplateDefinitionV1}.
 *
 * @alpha
 */
export const newPublisherDocumentTemplateDefinition = newPublisherDocumentTemplateDefinitionV1;

/**
 * Current version of {@link newPublisherDocumentDefinitionFromTemplateV1}.
 *
 * @alpha
 */
export const newPublisherDocumentDefinitionFromTemplate = newPublisherDocumentDefinitionFromTemplateV1;

/**
 * Current version of {@link newAdHocPublisherDocumentDefinitionV1}.
 *
 * @alpha
 */
export const newAdHocPublisherDocumentDefinition = newAdHocPublisherDocumentDefinitionV1;

/**
 * Current version of {@link publisherDocumentPageV1}.
 *
 * @alpha
 */
export const publisherDocumentPage = publisherDocumentPageV1;

/**
 * Current version of {@link BuiltInPublisherPageLayoutCoverV1}.
 *
 * @alpha
 */
export const BuiltInPublisherPageLayoutCover = BuiltInPublisherPageLayoutCoverV1;

/**
 * Current version of {@link BuiltInPublisherPageLayoutSectionV1}.
 *
 * @alpha
 */
export const BuiltInPublisherPageLayoutSection = BuiltInPublisherPageLayoutSectionV1;

/**
 * Current version of {@link BuiltInPublisherPageLayoutViz6TextLeftV1}.
 *
 * @alpha
 */
export const BuiltInPublisherPageLayoutViz6TextLeft = BuiltInPublisherPageLayoutViz6TextLeftV1;

/**
 * Current version of {@link BuiltInPublisherPageLayoutPortraitCoverV1}.
 *
 * @alpha
 */
export const BuiltInPublisherPageLayoutPortraitCover = BuiltInPublisherPageLayoutPortraitCoverV1;

/**
 * Current version of {@link BuiltInPublisherPageLayoutPortraitSectionV1}.
 *
 * @alpha
 */
export const BuiltInPublisherPageLayoutPortraitSection = BuiltInPublisherPageLayoutPortraitSectionV1;

/**
 * Current version of {@link BuiltInPublisherPageLayoutPortraitSummaryV1}.
 *
 * @alpha
 */
export const BuiltInPublisherPageLayoutPortraitSummary = BuiltInPublisherPageLayoutPortraitSummaryV1;

/**
 * Current version of {@link BuiltInPublisherPageLayoutsV1}.
 *
 * @alpha
 */
export const BuiltInPublisherPageLayouts = BuiltInPublisherPageLayoutsV1;
