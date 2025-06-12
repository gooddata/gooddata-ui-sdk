// (C) 2023 GoodData Corporation
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.mock("mapbox-gl", () => ({}));

afterEach(() => {
    cleanup();
});
