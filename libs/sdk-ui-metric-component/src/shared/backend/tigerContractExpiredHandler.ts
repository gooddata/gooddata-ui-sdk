// (C) 2022-2026 GoodData Corporation

let openContractExpiredDialog: (tier: string) => void;
let expiredTier: string | undefined;

export function initOpenContractExpiredDialog(callback: (tier: string) => void): void {
    openContractExpiredDialog = callback;
    // In cases when "contractExpiredHandler" is called before "initOpenContractExpiredDialog"
    if (expiredTier) {
        contractExpiredHandler(expiredTier);
        expiredTier = undefined;
    }
}

export function contractExpiredHandler(tier: string): void {
    if (openContractExpiredDialog) {
        openContractExpiredDialog(tier);
    } else {
        expiredTier = tier;
    }
}
