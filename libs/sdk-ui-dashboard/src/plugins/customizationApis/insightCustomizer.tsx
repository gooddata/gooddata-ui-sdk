// (C) 2021 GoodData Corporation
import { IDashboardInsightCustomizer } from "../customizer";
import { DefaultDashboardInsightInner, InsightComponentProvider } from "../../presentation";
import React from "react";
import { InvariantError } from "ts-invariant";
import includes from "lodash/includes";
import { insightTags } from "@gooddata/sdk-model";
import { DashboardCustomizationLogger } from "./customizationLogging";

const DefaultInsightRendererProvider: InsightComponentProvider = () => {
    return DefaultDashboardInsightInner;
};

interface IInsightCustomizerState {
    addTagProvider(tag: string, provider: InsightComponentProvider): void;
    addCustomProvider(provider: InsightComponentProvider): void;
    getRootProvider(): InsightComponentProvider;
    switchRootProvider(provider: InsightComponentProvider): void;
}

class DefaultInsightCustomizerState implements IInsightCustomizerState {
    /*
     * Chain of 'core' providers. Core providers are evaluated from last to first. As soon as some provider
     * returns a Component, then that component will be used for rendering. If provider returns undefined,
     * the evaluation continues to next provider in the chain.
     *
     * Note: the chain is 'primed' with a provider that always returns the default insight renderer. This is
     * essential to allow the decorations to work - purely because decorations can only work if there is
     * something to decorate. See constructor.
     */
    private readonly coreProviderChain: InsightComponentProvider[];

    /*
     * Maintains index between tag and the position within coreProviderChain where the provider
     * for each tag is located. This is used to replace existing providers in case plugins make
     * multiple calls to `withTag` with the same tag.
     */
    private readonly tagProviderIndexes: Record<string, number> = {};

    /*
     * Core provider encapsulates resolution using the chain of core providers.
     */
    private readonly coreProvider: InsightComponentProvider = (insight, widget) => {
        const providerStack = [...this.coreProviderChain].reverse();

        for (const provider of providerStack) {
            const Component = provider(insight, widget);

            if (Component) {
                return Component;
            }
        }

        // if this happens then the provider chain got messed up. by default the chain contains the default
        // provider which never returns undefined
        throw new InvariantError();
    };

    /*
     * Root provider is THE provider that should be used in the dashboard extension properties. The
     * provider function included here will reflect the setup where there may be N registered decorators
     * sitting on top of a chain of core providers.
     *
     * In the initial state the root provider IS the core provider - meaning no decorations. As the
     * decorators get registered, the rootProvider changes.
     */
    private rootProvider: InsightComponentProvider = this.coreProvider;

    private logger: DashboardCustomizationLogger;

    constructor(logger: DashboardCustomizationLogger, defaultProvider: InsightComponentProvider) {
        this.logger = logger;
        this.coreProviderChain = [defaultProvider];
    }

    addTagProvider(tag: string, provider: InsightComponentProvider): void {
        // provider may already be registered for this tag
        const providerIdx = this.tagProviderIndexes[tag];

        if (providerIdx !== undefined) {
            this.logger.warn(`Overriding insight component provider for tag '${tag}'.`);

            // if that is the case, replace the previous provider (last provider wins) with this
            // new provider
            this.coreProviderChain[providerIdx] = provider;
        } else {
            // otherwise add new provider onto the chain
            this.tagProviderIndexes[tag] = this.coreProviderChain.length;
            this.coreProviderChain.push(provider);
        }
    }

    addCustomProvider(provider: InsightComponentProvider): void {
        this.coreProviderChain.push(provider);
    }

    getRootProvider(): InsightComponentProvider {
        return this.rootProvider;
    }

    switchRootProvider(provider: InsightComponentProvider): void {
        this.rootProvider = provider;
    }
}

/**
 * Sealed customizer state will not allow to perform any modifications of the state. Sealing the state
 * is essential to make the customization more defensive: during the registration, the plugin can hang
 * onto the dashboard customizer - stash it somewhere. And then after registration try to use the customizer
 * and try to do additional 'ad-hoc' customizations.
 *
 * Such a thing is not supported by the lifecycle and this sealing is in place to prevent plugins going into
 * that dangerous territory.
 */
class SealedInsightCustomizerState implements IInsightCustomizerState {
    constructor(
        private readonly logger: DashboardCustomizationLogger,
        private readonly state: IInsightCustomizerState,
    ) {}

    public addCustomProvider = (_provider: InsightComponentProvider): void => {
        // eslint-disable-next-line no-console
        this.logger.warn(
            `Attempting to customize insight rendering outside of plugin registration. Ignoring.`,
        );
    };

    // eslint-disable-next-line sonarjs/no-identical-functions
    public addTagProvider = (_tag: string, _provider: InsightComponentProvider): void => {
        // eslint-disable-next-line no-console
        this.logger.warn(
            `Attempting to customize insight rendering outside of plugin registration. Ignoring.`,
        );
    };

    // eslint-disable-next-line sonarjs/no-identical-functions
    public switchRootProvider = (_provider: InsightComponentProvider): void => {
        // eslint-disable-next-line no-console
        this.logger.warn(
            `Attempting to customize insight rendering outside of plugin registration. Ignoring.`,
        );
    };

    public getRootProvider = (): InsightComponentProvider => {
        return this.state.getRootProvider();
    };
}

/**
 * Default implementation of the insight rendering customizer. Notice that the state of the customizations
 * is kept separate from this class.
 *
 * This code is responsible for creation of the providers (if needed) and then updating the state
 * accordingly. The customizer state methods are responsible for doing correct updates of the state itself. This
 * decoupling is in place so that it is possible to seal the state and prevent write operations from some point
 * onward. See {@link SealedInsightCustomizerState} for more motivation behind this.
 *
 * @internal
 */
export class DefaultInsightCustomizer implements IDashboardInsightCustomizer {
    private readonly logger: DashboardCustomizationLogger;
    private state: IInsightCustomizerState;

    constructor(
        logger: DashboardCustomizationLogger,
        defaultProvider: InsightComponentProvider = DefaultInsightRendererProvider,
    ) {
        this.logger = logger;
        this.state = new DefaultInsightCustomizerState(logger, defaultProvider);
    }

    public withTag = (tag: string, component: React.ComponentType): IDashboardInsightCustomizer => {
        const newProvider: InsightComponentProvider = (insight) => {
            if (includes(insightTags(insight), tag)) {
                return component;
            }
        };

        this.state.addTagProvider(tag, newProvider);

        return this;
    };

    public withCustomProvider = (provider: InsightComponentProvider): IDashboardInsightCustomizer => {
        this.state.addCustomProvider(provider);

        return this;
    };

    public withCustomDecorator = (
        providerFactory: (next: InsightComponentProvider) => InsightComponentProvider,
    ): IDashboardInsightCustomizer => {
        // snapshot current root provider
        const rootSnapshot = this.state.getRootProvider();
        // call user's factory in order to obtain the actual provider - pass the current root so that user's
        // code can use it to obtain component to decorate
        const decoratorProvider = providerFactory(rootSnapshot);
        // construct new root provider; this will be using user's provider with a fallback to root provider
        // in case user's code does not return anything
        const newRootProvider: InsightComponentProvider = (insight, widget) => {
            const Component = decoratorProvider(insight, widget);

            if (Component) {
                return Component;
            }

            return rootSnapshot(insight, widget);
        };

        // finally modify the root provider; next time someone registers decorator, it will be on top of
        // this currently registered one
        this.state.switchRootProvider(newRootProvider);

        return this;
    };

    public getInsightProvider = (): InsightComponentProvider => {
        return this.state.getRootProvider();
    };

    public sealCustomizer = (): void => {
        this.state = new SealedInsightCustomizerState(this.logger, this.state);
    };
}
