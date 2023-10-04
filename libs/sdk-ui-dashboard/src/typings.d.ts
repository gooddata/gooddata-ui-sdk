// (C) 2023 GoodData Corporation

interface DocumentEventMap {
    "gdc-llm-chat-apply-insight-description": CustomEvent<{ insightId: string; description: string }>;
    "gdc-llm-chat-apply-dashboard-section-description": CustomEvent<{
        dashboardId: string;
        sectionIndex: number;
        description: string;
    }>;
}
