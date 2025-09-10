// (C) 2025 GoodData Corporation

/**
 * @internal
 */
export const navigate = (url?: string) => {
    if (!url || url.length === 0) {
        return;
    }
    window.location.href = url;
};
