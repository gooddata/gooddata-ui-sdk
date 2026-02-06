// (C) 2026 GoodData Corporation

import type { IAllowedRelationshipType } from "@gooddata/sdk-model";

/**
 * When user has view-only permission, restrict semantic search to dashboard→visualization
 * relationships (no orphans) so results align with what they can access.
 * @internal
 */
export const ALLOWED_RELATIONSHIP_TYPES_FOR_VIEWER: IAllowedRelationshipType[] = [
    { sourceType: "dashboard", targetType: "visualization", allowOrphans: false },
];
