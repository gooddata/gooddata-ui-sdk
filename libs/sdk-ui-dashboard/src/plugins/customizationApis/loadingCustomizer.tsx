// (C) 2021-2025 GoodData Corporation
import React, { ComponentType } from "react";

import union from "lodash/union.js";
import { InvariantError } from "ts-invariant";

import { ILoadingProps, LoadingComponent } from "@gooddata/sdk-ui";

import { IDashboardCustomizationLogger } from "./customizationLogging.js";
import { CustomizerMutationsContext } from "./types.js";
import { LoadingComponentProvider, OptionalLoadingComponentProvider } from "../../presentation/index.js";
import { ILoadingCustomizer } from "../customizer.js";

const DefaultLoadingRendererProvider: LoadingComponentProvider = () => {
    return LoadingComponent;
};

interface ILoadingCustomizerState {
    addCustomProvider(provider: OptionalLoadingComponentProvider): void;
    getRootProvider(): LoadingComponentProvider;
    switchRootProvider(provider: LoadingComponentProvider): void;
}

interface ILoadingCustomizerResult {
    LoadingComponent: ComponentType<ILoadingProps> | undefined;
}

class DefaultLoadingCustomizerState implements ILoadingCustomizerState {
    /*
     * Chain of 'core' providers. Core providers are evaluated from last to first. As soon as some provider
     * returns a Component, then that component will be used for rendering. If provider returns undefined,
     * the evaluation continues to next provider in the chain.
     *
     * Note: the chain is 'primed' with a provider that always returns the default DateFilter renderer. This is
     * essential to allow the decorations to work - purely because decorations can only work if there is
     * something to decorate. See constructor.
     */
    private readonly coreProviderChain: LoadingComponentProvider[];

    /*
     * Core provider encapsulates resolution using the chain of core providers.
     */
    private readonly coreProvider: LoadingComponentProvider = (topBar) => {
        const providerStack = [...this.coreProviderChain].reverse();

        for (const provider of providerStack) {
            const Component = provider(topBar);

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
    private rootProvider: LoadingComponentProvider = this.coreProvider;

    constructor(defaultProvider: LoadingComponentProvider) {
        this.coreProviderChain = [defaultProvider];
    }

    addCustomProvider(provider: LoadingComponentProvider): void {
        this.coreProviderChain.push(provider);
    }

    getRootProvider(): LoadingComponentProvider {
        return this.rootProvider;
    }

    switchRootProvider(provider: LoadingComponentProvider): void {
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
class SealedLoadingCustomizerState implements ILoadingCustomizerState {
    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly state: ILoadingCustomizerState,
    ) {}

    public addCustomProvider = (_provider: LoadingComponentProvider): void => {
        // eslint-disable-next-line no-console
        this.logger.warn(
            `Attempting to customize Loading rendering outside of plugin registration. Ignoring.`,
        );
    };

    // eslint-disable-next-line sonarjs/no-identical-functions
    public switchRootProvider = (_provider: LoadingComponentProvider): void => {
        // eslint-disable-next-line no-console
        this.logger.warn(
            `Attempting to customize Loading rendering outside of plugin registration. Ignoring.`,
        );
    };

    public getRootProvider = (): LoadingComponentProvider => {
        return this.state.getRootProvider();
    };
}

/**
 * Default implementation of the Loading rendering customizer. Notice that the state of the customizations
 * is kept separate from this class.
 *
 * This code is responsible for creation of the providers (if needed) and then updating the state
 * accordingly. The customizer state methods are responsible for doing correct updates of the state itself. This
 * decoupling is in place so that it is possible to seal the state and prevent write operations from some point
 * onward. See {@link SealedLoadingCustomizerState} for more motivation behind this.
 *
 * @internal
 */
export class DefaultLoadingCustomizer implements ILoadingCustomizer {
    private readonly logger: IDashboardCustomizationLogger;
    private readonly mutationContext: CustomizerMutationsContext;
    private state: ILoadingCustomizerState;
    private updated = false;

    constructor(
        logger: IDashboardCustomizationLogger,
        mutationContext: CustomizerMutationsContext,
        defaultProvider: LoadingComponentProvider = DefaultLoadingRendererProvider,
    ) {
        this.logger = logger;
        this.mutationContext = mutationContext;
        this.state = new DefaultLoadingCustomizerState(defaultProvider);
    }

    public withCustomProvider = (provider: OptionalLoadingComponentProvider): ILoadingCustomizer => {
        this.state.addCustomProvider(provider);
        this.mutationContext.loading = union(this.mutationContext.loading, ["provider"]);
        this.updated = true;

        return this;
    };

    public withCustomDecorator(
        providerFactory: (next: LoadingComponentProvider) => OptionalLoadingComponentProvider,
    ): ILoadingCustomizer {
        // snapshot current root provider
        const rootSnapshot = this.state.getRootProvider();
        // call user's factory in order to obtain the actual provider - pass the current root so that user's
        // code can use it to obtain component to decorate
        const decoratorProvider = providerFactory(rootSnapshot);
        // construct new root provider; this will be using user's provider with a fallback to root provider
        // in case user's code does not return anything
        const newRootProvider: LoadingComponentProvider = (props) => {
            const Component = decoratorProvider(props);

            if (Component) {
                return Component;
            }

            return rootSnapshot(props);
        };

        // finally modify the root provider; next time someone registers decorator, it will be on top of
        // this currently registered one
        this.state.switchRootProvider(newRootProvider);
        this.mutationContext.loading = union(this.mutationContext.loading, ["decorator"]);
        this.updated = true;

        return this;
    }

    getCustomizerResult = (): ILoadingCustomizerResult => {
        return {
            LoadingComponent: this.updated
                ? (props) => {
                      const Comp = this.state.getRootProvider()(props);
                      return <Comp {...props} />;
                  }
                : undefined,
        };
    };

    public sealCustomizer = (): void => {
        this.state = new SealedLoadingCustomizerState(this.logger, this.state);
    };
}
