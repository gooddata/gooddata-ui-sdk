// (C) 2025-2026 GoodData Corporation

import "./mockWindow.js";

try {
    await import("../stories/_infra/generateInsightStories.js");
    await import("../stories/_infra/generateScenarioStories.js");
    process.exit(0);
} catch (err) {
    console.error("❌ Failed to generate stories:", err);
    process.exit(1);
}
