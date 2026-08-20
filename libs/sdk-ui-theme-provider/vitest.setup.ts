// (C) 2026 GoodData Corporation

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// The suite runs with isolation disabled, so every test file shares one DOM. Unmount whatever a test
// rendered, otherwise it leaks into the files that run afterwards - a provider left mounted keeps its
// global theme <style> in <head>, which fails cssProperties.test.ts when it happens to run later.
afterEach(() => {
    cleanup();
});
