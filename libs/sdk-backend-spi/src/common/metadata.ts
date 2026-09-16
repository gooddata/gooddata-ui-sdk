// (C) 2026 GoodData Corporation

import type {
    IMetadataObjectBase,
    IMetadataObjectIdentity,
    ISemanticConditionalFormatting,
} from "@gooddata/sdk-model";

/**
 * Payload of the partial `update*Meta` services: an omitted field is left untouched,
 * `conditionalFormatting: null` clears it.
 *
 * @public
 */
export type IUpdateMetadataObjectMetaPayload = Partial<IMetadataObjectBase> &
    IMetadataObjectIdentity & {
        conditionalFormatting?: ISemanticConditionalFormatting | null;
    };
