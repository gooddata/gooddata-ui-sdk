// (C) 2007-2025 GoodData Corporation

/**
 * Configuration for ExecutionAbortManager
 */
export interface IExecutionAbortManagerConfig {
    enableExecutionCancelling?: boolean;
}

/**
 * State information needed for abort decisions
 */
export interface IExecutionAbortState {
    isLoading: boolean;
    readyToRender: boolean;
}

/**
 * Manages execution abort controllers for the pivot table.
 * This class encapsulates the logic for creating, refreshing, and managing
 * abort controllers used to cancel ongoing executions.
 *
 * @internal
 */
export class ExecutionAbortManager {
    private abortController: AbortController | undefined;
    private config: IExecutionAbortManagerConfig;

    constructor(config: IExecutionAbortManagerConfig) {
        this.config = config;
        if (this.config.enableExecutionCancelling) {
            this.abortController = new AbortController();
        }
    }

    /**
     * Refreshes the abort controller, potentially aborting any ongoing operations.
     * Creates a new controller if execution cancelling is enabled.
     *
     * @param state - Current state to determine if abort should happen
     */
    public refresh(state: IExecutionAbortState): void {
        if (!this.config.enableExecutionCancelling) {
            return;
        }

        // Abort ongoing operations if loading or not ready to render
        if (state.isLoading || !state.readyToRender) {
            this.abortController?.abort();
        }

        // Create a fresh controller for new operations
        this.abortController = new AbortController();
    }

    /**
     * Gets the current abort controller if execution cancelling is enabled.
     *
     * @returns The current AbortController or undefined
     */
    public getCurrentController(): AbortController | undefined {
        return this.config.enableExecutionCancelling ? this.abortController : undefined;
    }

    /**
     * Updates the configuration and potentially creates/removes the abort controller.
     *
     * @param config - New configuration
     */
    public updateConfig(config: IExecutionAbortManagerConfig): void {
        const wasEnabled = this.config.enableExecutionCancelling;
        this.config = config;

        if (!wasEnabled && config.enableExecutionCancelling) {
            // Execution cancelling was just enabled
            this.abortController = new AbortController();
        } else if (wasEnabled && !config.enableExecutionCancelling) {
            // Execution cancelling was just disabled
            this.abortController = undefined;
        }
    }

    /**
     * Checks if execution cancelling is currently enabled.
     *
     * @returns true if execution cancelling is enabled
     */
    public isEnabled(): boolean {
        return Boolean(this.config.enableExecutionCancelling);
    }

    /**
     * Cleans up by aborting any ongoing operations.
     * Should be called when the component is being unmounted.
     */
    public destroy(): void {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = undefined;
        }
    }
}
