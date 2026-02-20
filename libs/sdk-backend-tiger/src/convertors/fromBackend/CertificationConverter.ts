// (C) 2026 GoodData Corporation

import { type IObjectCertification } from "@gooddata/sdk-model";

type CertificationAttributes = {
    certification?: unknown;
    certificationMessage?: unknown;
    certifiedAt?: unknown;
};

/**
 * Converts backend certification payload to platform-agnostic certification format.
 */
export function convertCertificationFromBackend(
    attributes: CertificationAttributes = {},
): IObjectCertification | undefined {
    const { certification, certificationMessage, certifiedAt } = attributes;

    if (certification !== "CERTIFIED") {
        return;
    }

    return {
        status: "CERTIFIED",
        ...(typeof certificationMessage === "string" ? { message: certificationMessage } : {}),
        ...(typeof certifiedAt === "string" ? { certifiedAt } : {}),
    };
}
