# GoodData.UI SDK - Developer's Guide

## Architecture Overview

TBD

## Package Overview

### Layer 1: API Clients and platform specific data models

#### @gooddata/gd-bear-client

REST API Client for the GoodData 'bear' platform is implemented here. When APIs used by frontend are added or updated
in 'bear', they SHOULD be added or updated in this package.

#### @gooddata/gd-bear-client-model

Data types fundamental to bear's domain model SHOULD be implemented here, together with any and all functions
needed to manipulate these types.

**Rule of thumb**: if you're writing a function whose first parameter is the type defined in this package, then it
is highly likely that the function SHOULD be located here as well.

#### @gooddata/gd-tiger-client

REST API Client for the GoodData 'tiger' platform is implemented here.

#### @gooddata/gd-tiger-client-model

Data types fundamental to tiger's domain model SHOULD be implemented here, together with any and all functions
needed to manipulate these types.

**Rule of thumb**: if you're writing a function whose first parameter is the type defined in this package, then it
is highly likely that the function SHOULD be located here as well.

### Layer 2: Platform agnostic data model and backend interfaces

The real GoodData.UI SDK starts here. On the lowest layer are the packages defining and realizing the platform
agnostic Analytical Backend SPIs. On top of this stand the various `sdk-ui-*` packages which are React components
that can work with any platform.

#### @gooddata/sdk-model

Backend-agnostic domain model is defined here together with any and all functions to work with the model.

#### @gooddata/sdk-backend-spi

**S**ervice **P**rovider **I**nterface (SPI) for Analytical Backends is defined here. The interface is not tightly
coupled with particular platform; however it IS tightly coupled with BI modeling concepts used in GoodData.

**Rule of thumb**: if you are writing any new feature into `sdk-ui-*` packages and this feature
requires interfacing with backend, then the interface MUST be defined here and must be implemented in any SPI
realizations that support that feature.

**Backend capabilities**: TBD

#### @gooddata/sdk-backend-bear

Code in this package realizes Analytical Backend SPI using the GoodData 'bear' platform.

#### @gooddata/sdk-backend-tiger

Code in this package realizes Analytical Backend SPI using the GoodData 'tiger' platform.

#### @gooddata/sdk-backend-mockingbird

Code in this package realizes Analytical Backend SPI using mocks. It is great for testing in
dev and CI environments.

### Layer 3: React-land

Packages on this layer implement visual and non-visual React components that can be used to build
analytical applications.

Packages in this group MUST NOT depend on any particular backend implementation. All interfacing with backend
is done via the platform agnostic `sdk-model` and `sdk-backend-spi`.

#### @gooddata/sdk-ui-base

Low level functionality, utility functions and backend SPI wiring are implemented here.

#### @gooddata/sdk-ui-highcharts-wrapper

React wrappers for the Highcharts library are implemented here together with a host supporting functions.

**Rule of thumb**: if you are writing code that in any way directly interfaces with the Highcharts library, then
it is highly likely that this code SHOULD be located in this package.

#### @gooddata/sdk-ui-pivot-table

React wrappers for the ag-grid library are implemented here. On top of them stands our implementation of PivotTable.

**Note**: ag-grid wrapper is ideal candidate to split into a separate package

#### @gooddata/sdk-ui-charts

All our charts that use the Highcharts library (via our wrapper) are implemented here.

**Note**: we should consider to further split this package into package-visualization structure.

#### @gooddata/sdk-ui-filters

React components that can be used to define attribute or measure filters are implemented here.

#### @gooddata/sdk-ui-support

Non-visual, 'supporting' components... Executor, BucketExecutor and the like.

#### @gooddata/sdk-ui

Umbrella for all packages.

### Naming conventions

-   All platform-specific packages (clients, models and the like) start with `gd-` prefix
-   All SDK packages have `sdk-` prefix
-   All SDK packages which implement Analytical Backend SPI have `sdk-backend-` prefix
-   All SDK React packages have `sdk-ui-` prefix
