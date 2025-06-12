// (C) 2021-2025 GoodData Corporation
import { log } from "@gooddata/fixtures";

export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryOperation(operation, maxRetries, delayMs) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (err) {
            log(`Attempt ${i} failed, retrying after ${delayMs}ms.`);
            await delay(delayMs);
        }
    }
    throw new Error(`Operation failed after ${maxRetries} attempts.`);
}
