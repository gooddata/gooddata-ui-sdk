// (C) 2019-2026 GoodData Corporation

export const waitForAsync = () => new Promise((resolve: (...args: any[]) => void) => setTimeout(resolve, 0));
