// (C) 2024 GoodData Corporation

export const extractError = (e: unknown) => {
    // Normal error
    if (e instanceof Error) {
        return `${e.name}: ${e.message}`;
    }

    if (typeof e === "object" && e !== null && "detail" in e) {
        return String(e.detail);
    }

    return String(e);
};
