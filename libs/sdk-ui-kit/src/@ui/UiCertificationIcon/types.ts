// (C) 2026 GoodData Corporation

import { type CertificationStatus } from "@gooddata/sdk-model";

/**
 * Display model for object certification shown by UI kit components.
 *
 * @internal
 */
export interface IUiCertification {
    status: CertificationStatus;
    message?: string;
    certifiedBy?: string;
    certifiedAt?: Date | null;
}

/**
 * @internal
 */
export interface IUiCertificationIconProps {
    certification: IUiCertification;
    accessibilityConfig?: {
        ariaLabel?: string;
    };
}
