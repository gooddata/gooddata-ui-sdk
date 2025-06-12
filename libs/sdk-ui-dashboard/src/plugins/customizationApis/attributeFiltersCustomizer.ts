// (C) 2021-2022 GoodData Corporation
import union from "lodash/union.js";
import { InvariantError } from "ts-invariant";

import { IAttributeFiltersCustomizer } from "../customizer.js";
import {
    AttributeFilterComponentProvider,
    DefaultDashboardAttributeFilter,
    OptionalAttributeFilterComponentProvider,
} from "../../presentation/index.js";

import { IDashboardCustomizationLogger } from "./customizationLogging.js";
import { CustomizerMutationsContext } from "./types.js";

const DefaultAttributeFilterRendererProvider: AttributeFilterComponentProvider = () => {
    return DefaultDashboardAttributeFilter;
};

interface IAttributeFiltersCustomizerState {
    addCustomProvider(provider: OptionalAttributeFilterComponentProvider): void;
    getRootProvider(): AttributeFilterComponentProvider;
    switchRootProvider(provider: AttributeFilterComponentProvider): void;
}

class DefaultAttributeFiltersCustomizerState implements IAttributeFiltersCustomizerState {
    /*
     * Chain of 'core' providers. Core providers are evaluated from last to first. As soon as some provider
     * returns a Component, then that component will be used for rendering. If provider returns undefined,
     * the evaluation continues to next provider in the chain.
     *
     * Note: the chain is 'primed' with a provider that always returns the default AttributeFilter renderer. This is
     * essential to allow the decorations to work - purely because decorations can only work if there is
     * something to decorate. See constructor.
     */
    private readonly coreProviderChain: AttributeFilterComponentProvider[];

    /*
     * Core provider encapsulates resolution using the chain of core providers.
     */
    private readonly coreProvider: AttributeFilterComponentProvider = (attributeFilter) => {
        const providerStack = [...this.coreProviderChain].reverse();

        for (const provider of providerStack) {
            const Component = provider(attributeFilter);

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
    private rootProvider: AttributeFilterComponentProvider = this.coreProvider;

    constructor(defaultProvider: AttributeFilterComponentProvider) {
        this.coreProviderChain = [defaultProvider];
    }

    addCustomProvider(provider: AttributeFilterComponentProvider): void {
        this.coreProviderChain.push(provider);
    }

    getRootProvider(): AttributeFilterComponentProvider {
        return this.rootProvider;
    }

    switchRootProvider(provider: AttributeFilterComponentProvider): void {
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
class SealedAttributeFiltersCustomizerState implements IAttributeFiltersCustomizerState {
    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly state: IAttributeFiltersCustomizerState,
    ) {}

    public addCustomProvider = (_provider: AttributeFilterComponentProvider): void => {
        // eslint-disable-next-line no-console
        this.logger.warn(
            `Attempting to customize AttributeFilter rendering outside of plugin registration. Ignoring.`,
        );
    };

    // eslint-disable-next-line sonarjs/no-identical-functions
    public switchRootProvider = (_provider: AttributeFilterComponentProvider): void => {
        // eslint-disable-next-line no-console
        this.logger.warn(
            `Attempting to customize AttributeFilter rendering outside of plugin registration. Ignoring.`,
        );
    };

    public getRootProvider = (): AttributeFilterComponentProvider => {
        return this.state.getRootProvider();
    };
}

/**
 * Default implementation of the AttributeFilter rendering customizer. Notice that the state of the customizations
 * is kept separate from this class.
 *
 * This code is responsible for creation of the providers (if needed) and then updating the state
 * accordingly. The customizer state methods are responsible for doing correct updates of the state itself. This
 * decoupling is in place so that it is possible to seal the state and prevent write operations from some point
 * onward. See {@link SealedAttributeFilterCustomizerState} for more motivation behind this.
 *
 * @internal
 */
export class DefaultAttributeFiltersCustomizer implements IAttributeFiltersCustomizer {
    private readonly logger: IDashboardCustomizationLogger;
    private readonly mutationContext: CustomizerMutationsContext;
    private state: IAttributeFiltersCustomizerState;

    constructor(
        logger: IDashboardCustomizationLogger,
        mutationContext: CustomizerMutationsContext,
        defaultProvider: AttributeFilterComponentProvider = DefaultAttributeFilterRendererProvider,
    ) {
        this.logger = logger;
        this.mutationContext = mutationContext;
        this.state = new DefaultAttributeFiltersCustomizerState(defaultProvider);
    }

    public withCustomProvider = (provider: OptionalAttributeFilterComponentProvider): this => {
        this.state.addCustomProvider(provider);
        this.mutationContext.attributeFilter = union(this.mutationContext.attributeFilter, ["provider"]);

        return this;
    };

    public withCustomDecorator = (
        providerFactory: (next: AttributeFilterComponentProvider) => OptionalAttributeFilterComponentProvider,
    ): this => {
        // snapshot current root provider
        const rootSnapshot = this.state.getRootProvider();
        // call user's factory in order to obtain the actual provider - pass the current root so that user's
        // code can use it to obtain component to decorate
        const decoratorProvider = providerFactory(rootSnapshot);
        // construct new root provider; this will be using user's provider with a fallback to root provider
        // in case user's code does not return anything
        const newRootProvider: AttributeFilterComponentProvider = (filter) => {
            const Component = decoratorProvider(filter);

            if (Component) {
                return Component;
            }

            return rootSnapshot(filter);
        };

        // finally modify the root provider; next time someone registers decorator, it will be on top of
        // this currently registered one
        this.state.switchRootProvider(newRootProvider);
        this.mutationContext.attributeFilter = union(this.mutationContext.attributeFilter, ["decorator"]);

        return this;
    };

    public getAttributeFilterProvider = (): AttributeFilterComponentProvider => {
        return this.state.getRootProvider();
    };

    public sealCustomizer = (): void => {
        this.state = new SealedAttributeFiltersCustomizerState(this.logger, this.state);
    };
}
