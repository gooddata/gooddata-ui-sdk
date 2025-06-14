---
trigger: model_decision
description: Repository packages overview, descriptions and responsibilities
globs:
---

# GoodData.UI SDK - Package Overview

This rule provides a comprehensive overview of all packages in the GoodData.UI SDK repository, organized by their architectural layer and purpose.

## Layered Architecture Overview

The GoodData.UI SDK follows a strict layered architecture:

1. **Layer 1: API Clients and Platform Specific Models** - Packages with `api-*` prefix
2. **Layer 2: Platform-Agnostic Domain Model and Backend SPIs** - Packages with `sdk-model` and `sdk-backend-*` prefix
3. **Layer 3: UI SDK React Components** - Packages with `sdk-ui-*` prefix

## Layer 1: API Clients

### @gooddata/api-client-tiger

The REST API client for GoodData Cloud and GoodData.CN platforms. Provides a thin wrapper over the REST API endpoints. Use this for low-level API access when higher-level abstractions are insufficient.

## Layer 2: Domain Model and Backend

### @gooddata/sdk-model

The core package providing domain models for GoodData.UI that are backend-agnostic. Contains TypeScript definitions, factory functions, and utilities for analytical objects like measures, attributes, filters, and visualizations.

### @gooddata/sdk-backend-spi

Defines the Service Provider Interface (SPI) for Analytical Backends. This is the contract that any backend implementation must fulfill to work with GoodData.UI components.

### @gooddata/sdk-backend-base

Base implementation classes for backend SPI. Provides common functionality for concrete backend implementations.

### @gooddata/sdk-backend-tiger

Implementation of the Analytical Backend SPI for GoodData Cloud and GoodData.CN platforms.

### @gooddata/sdk-backend-mockingbird

Mock implementation of the Analytical Backend SPI for testing and development purposes.

### @gooddata/sdk-embedding

Utilities and components for embedding GoodData visualizations in applications.

## Layer 3: UI Components

### @gooddata/sdk-ui

Core UI package with base functionality for building React visualizations. Provides hooks and components that serve as building blocks, data loading utilities, and drilling support.

### @gooddata/sdk-ui-charts

React visualization components for various chart types (bar, column, line, pie, etc.). Use these for standard chart visualizations.

### @gooddata/sdk-ui-pivot

Table visualization components including pivot tables. Use these for tabular data representation.

### @gooddata/sdk-ui-geo

Geospatial visualization components for map-based data. Use these for geographical data visualization.

### @gooddata/sdk-ui-filters

Filter components like attribute filters, date filters, and measure value filters. Use these to allow users to filter data in visualizations.

### @gooddata/sdk-ui-ext

Extended components building on top of the core visualizations, including insight-related components, dashboard components, and more.

### @gooddata/sdk-ui-dashboard

Components for building and working with dashboards.

### @gooddata/sdk-ui-kit

Low-level UI components and design system elements that form the foundation of the UI layer.

### @gooddata/sdk-ui-theme-provider

Theme management for GoodData.UI components.

### @gooddata/sdk-ui-vis-commons

Common utilities and components shared by various visualization components.

### @gooddata/sdk-ui-web-components

Web Components version of GoodData.UI components.

### @gooddata/sdk-ui-all

Convenience package that re-exports all UI components packages.

### @gooddata/sdk-ui-semantic-search

Components for semantic search functionality.

### @gooddata/sdk-ui-gen-ai

Components for AI-assisted data exploration and analysis.

### @gooddata/sdk-ui-loaders

Data loading components and utilities.

## Testing Packages

### @gooddata/sdk-ui-tests

Testing utilities and test harnesses for UI components.

### @gooddata/sdk-ui-tests-e2e

End-to-end testing infrastructure and test scenarios.

## Utility Packages

### @gooddata/util

Common utility functions used across the SDK.

## Tools

### @gooddata/app-toolkit

Toolkit for building GoodData applications.

### @gooddata/plugin-toolkit

Toolkit for developing plugins for GoodData.

### @gooddata/i18n-toolkit

Internationalization tools for validating translations.

### @gooddata/catalog-export

Tools for exporting catalog definitions.

### @gooddata/mock-handling

Utilities for handling mocks in testing.

### @gooddata/reference-workspace

Reference workspace management tools.

### @gooddata/reference-workspace-mgmt

Tools for managing reference workspaces.

### @gooddata/applink

Tools for linking applications.

### @gooddata/react-app-template

Template for creating React applications with GoodData.UI.

### @gooddata/dashboard-plugin-template

Template for creating dashboard plugins.
