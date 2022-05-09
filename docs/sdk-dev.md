# GoodData.UI SDK - Developer's Guide

## Architecture Overview

The SDK follows layered architecture with several packages (modules) on each layer. Each layer has clear set of responsibilities
and constraints.

-   Layer 1: Platform-specific API clients and their supporting code (models, DTOs and the like)
-   Layer 2: Platform-agnostic domain model, analytical backend SPI, application APIs;
    > Note: SPI realizations are on this layer as well
-   Layer 3: UI SDK - React components
-   Utility Layer: Standalone, minimum dependency packages containing code utilities and convenience functions that
    can be used in any other SDK package

The main constraints - hard rules - in the architecture are:

1.  Packages on lower layers MUST NOT depend on packages on higher layers
2.  Packages on one layer MUST depend only on packages either on same layer, one layer down or on utility layer
3.  Packages on one layer MUST NOT have cyclic dependencies
4.  Utility Layer MUST NOT depend on any other SDK package

> Also check out [Technology & architecture decisions log](./decisions.md) to get more background information about
> various decisions we did as part of this project.

## Package Overview

### Naming conventions

-   All platform-specific API client packages (clients, models and the like) start with `api-` prefix => **Layer 1 packages**
-   All SDK packages have `sdk-` prefix => **Layer 2 packages**
-   All SDK packages which implement Analytical Backend SPI have `sdk-backend-` prefix => **Layer 2 packages**
-   All SDK React packages have `sdk-ui-` prefix => **Layer 3 packages**

### Package rules and guidelines

**Strictly defined and controlled package API** - Each package MUST have an index.ts(x) in its source root.
This is where API surface of the package is defined. API surface of each package is enumerated _exactly_.
Wildcard re-exports are not allowed. All production packages MUST include api-extractor in their build pipeline.

**Fully documented and annotated public API** - Types and code exported as package's public API MUST have 100% TSDoc and
MUST be annotated as @public, @alpha, @beta or @internal.

**Inter-Package dependencies** - Packages MUST adhere to architectural layering constraints (see above). Packages
MUST depend only on each other's public APIs.

**Intra-Package dependencies** - Code within the same package MUST NOT have cyclic dependencies. Code within
the same package MUST be imported directly. In other words: never import through package's index.

### Layer 1: API Clients and platform specific data models

##### @gooddata/api-client-bear

REST API Client for the GoodData 'bear' platform is implemented here. When APIs used by frontend are added or updated
in 'bear', they SHOULD be added or updated in this package.

##### @gooddata/api-model-bear

Data types fundamental to bear's domain model SHOULD be implemented here, together with any and all functions
needed to manipulate these types.

**Rule of thumb**: if you're writing a function whose first parameter is the type defined in this package, then it
is highly likely that the function SHOULD be located here as well.

##### @gooddata/api-client-tiger

REST API Client for the GoodData 'tiger' platform is implemented here. Majority of the client is generated from
the OpenAPI documents supplied by tiger.

### Layer 2: Platform agnostic data model, backend interfaces and application interfaces

The real GoodData.UI SDK starts here. On the lowest layer are the packages defining and realizing the platform
agnostic Analytical Backend SPIs. On top of this stand the various `sdk-ui-*` packages which are React components
that can work with any platform.

##### @gooddata/sdk-model

Backend-agnostic domain model is defined here together with any and all functions to work with the model.

**Rule of thumb**: if you are writing a function whose first parameter is of type that is defined in this package,
then it is highly likely that: a) such function is already in this package or b) your function can be implemented
swiftly and briefly using functions in this package or c) the function you are writing MAY be included in the
sdk-model.

##### @gooddata/sdk-backend-spi

**S**ervice **P**rovider **I**nterface (SPI) for Analytical Backends is defined here. The interface is not tightly
coupled with particular platform; however it IS tightly coupled with BI modeling concepts used in GoodData.

**Rule of thumb**: if you are writing any new feature into `sdk-ui-*` packages and this feature
requires interfacing with backend, then the interface MUST be defined here and must be implemented in any SPI
realizations that support that feature.

**Backend capabilities**:
If you need to enable / disable specific feature, but only for the particular backend implementation,
you should not check in the code what is the currently running backend implementation (eg bear / tiger).
Use `IBackendCapabilities` so your code will stay backend agnostic.

##### @gooddata/sdk-backend-bear

Code in this package realizes Analytical Backend SPI using the GoodData 'bear' platform.

##### @gooddata/sdk-backend-tiger

Code in this package realizes Analytical Backend SPI using the GoodData 'tiger' platform.

##### @gooddata/sdk-backend-mockingbird

Code in this package realizes Analytical Backend SPI using mocks. It is great for testing in
dev and CI environments.

##### @gooddata/sdk-embedding

Code in this package defines APIs and contracts for embedding and interfacing with GoodData applications using
Post Message API.

### Layer 3: React-land

Packages on this layer implement visual and non-visual React components that can be used to build
analytical applications.

Packages in this group MUST NOT depend on any particular backend implementation. All interfacing with backend
is done via the platform agnostic `sdk-model` and `sdk-backend-spi`.

##### @gooddata/sdk-ui

The bare minimum UI SDK. Essential providers, HOCs and low level React components such as Executor are implemented
here. This is all that developer needs to implement completely custom visualizations.

##### @gooddata/sdk-ui-pivot

React wrappers for the ag-grid library are implemented here. On top of them stands our implementation of PivotTable.

**Note**: ag-grid wrapper is ideal candidate to split into a separate package

##### @gooddata/sdk-ui-charts

All our charts that use the Highcharts library (via our wrapper) are implemented here.

**Note**: we should consider to further split this package into package-visualization structure.

##### @gooddata/sdk-ui-filters

React components that can be used to define attribute, date or measure filters are implemented here.

##### @gooddata/sdk-ui-geo

React components that implement Geo charts.

##### @gooddata/sdk-ui-vis-commons

Code and components that are intended to be shared by different types of visualizations (e.g. legends, tooltips,
coloring strategies etc)

##### @gooddata/sdk-ui-ext

GoodData.UI extensions. Components and other code where we are not yet fully done is located here. This
can be production code but with alpha-quality API, or non-production code that we produce for 'try outs'.

##### @gooddata/sdk-ui-all

Umbrella for all packages.

### Utility Layer

Packages on this layer start with prefix `util`. The packages are intended to hold utility and convenience
functions used across different SDK packages - thus reducing code duplication when addressing cross-cutting
concerns.

There are couple of hard rules for utility package(s):

1.  Adding new third party dependencies into existing utility packages is prohibited
    -   Naturally, third party dependencies are essential when writing utility code on top of a 3rd party library.
    -   Instead of adding dependency, create a new util package specific for that third party library
    -   This rule is in place to prevent util dependency bloat
2.  Utilities must never depend on SDK packages

## TypeScript setup

Each project has four TS Config files:

-   tsconfig.build.json, tsconfig.build.esm.json - used for production builds
-   tsconfig.dev.json - used for builds on dev workstation, typically used in conjunction with --watch
-   tsconfig.json - base file, used for IDEs

The TypeScript configuration in `tsconfig.json` uses `baseUrl` and `paths` to link to source directories of
other dependent SDK projects: this is to enable fully integrated developer experience in the IDE. In this setup,
changes made in dependent project are immediately visible in the depending project. In other words, IDE resolves
intra-SDK dependencies to their source files instead of built files in the `dist`.

The `tsconfig.dev.json` and `tsconfig.build.json` nullify the `baseUrl` and `paths` settings.

## Development guidelines

Here are a few guidelines that apply for all packages in the SDK:

-   Keep the each package's API minimal and focused on what is the package responsible for
-   Keep things DRY; always look for existing code to handle the job
-   Keep things in the right packages; see package overview above for hints
-   Every change in the code must be fully unit tested

    -   Tests are placed in `tests` directory located in the package that contains the tested file
    -   The file with the test is named `<testedFile>.test.ts`
    -   The file with fixtures (mocks) used by the unit test is named `<testedFile>.fixture.ts`

Then there are specific guidelines for each layer / groups of packages.

### Layer 1 - API Clients

These are low level packages:

-   They SHOULD map almost 1-1 to the public REST APIs. There is none or very little magic here
-   REST API specific types & functions working with them MUST be in 'model' package
-   REST API calls MUST be in 'client' package.
-   The API clients MUST be usable from both browser and node.js.

### Layer 2 - Model

This is where types specific to GoodData analytics model are defined and where functions working with the various
model elements (Measures, Attributes, Filters, Dimensions etc) are implemented. The goal here is to build a package
that provides a lightweight 'DSL' that simplifies development on higher layers of SDK and in applications.

The model elements define WHAT and HOW to analyze and visualize.

The model does not necessarily map 1-1 to public APIs of particular backend implementation. The model is first pillar
to achieve independence on backend implementation.

Here are couple of ground rules:

-   Model elements MUST be immutable
-   Model elements MUST be fully encapsulated
    The package MUST provide functions to inspect and manipulate the elements. Factories and builders are used to
    construct new instances. Functions are used to access or manipulate properties.
-   Model MUST provide generic, reusable functions to perform routine tasks
    Sometimes the line can be quite blurry on what still belongs to the model and what not. Consult if you are unsure.

### Layer 2 - Backend SPI

The SPI defines analytical backend and interactions with it in a platform-agnostic, API-client independent way. The goal
is to provide fluent API with solid abstractions; the main benefits of this extra layer of indirection are:

-   (obviously) independence on particular backend implementation
-   simplification of code in above layers
-   separation of concerns (React components care about WHAT and HOW to visualize, not about WHAT API calls to do)
-   straightforward testability (test backend implementations can be plugged in swiftly)

Here are couple of ground rules for this package:

-   Backend SPI MUST NOT expose platform-specific types; e.g. stuff defined in client packages

### Testing and testing guidelines

#### Testing strategy

1.  Unit tests to verify all the non-React code. We don't have to aim for 100% coverage. Trivial code that does not
    implement essential algorithms does not have to be tested (e.g. people should not be testing getters and
    setters).

    Dev hints:

    -   Use Jest snapshots to save typing expected result where applicable

2.  Component tests for non-React code that works with data obtained from backend. Use standardized model and real
    data captured from backend and stored in reference workspace.

    Dev hints:

    -   Use sdk-ui-tests to define new test scenarios and recordings for your tests

3.  Component tests with enzyme for React components. The goal of these tests is to quickly 'smoke' the component
    before more expensive tests kick in.

    Dev hints:

    -   Minimize the complexity of these tests
    -   Do not test trivial stuff using complex mechanisms (e.g. testing that props are propagated using spies etc)
    -   If you find yourself doing complex stuff -> redesign the code under test so that it can be tested easier (extract
        function)
    -   If you find yourself doing complex stuff and redesign is not possible and tests are crazy and flaky -> don't
        do the component tests. Do the end-to-end tests.
    -   Black-box testing

4.  API Regression tests for publicly available React components and pluggable visualizations. The goal of these tests
    is to quickly verify that there are no breaking API changes and that the same API leads to the same results
    displayed to the user.

    Dev hints:

    -   Describe as many scenarios as possible

5.  Visual Regression tests. The goal of these tests is to verify that using public API of a React components and
    Pluggable Visualizations leads to expected visualization rendered in the browser.

    Dev hints:

    -   These tests are fairly cheap to create (share same infra as api regression tests)
    -   However, they are orders of magnitude more expensive to execute (api regression suite with 2k tests runs for
        30 sec, visual regression suite with ~1k tests runs for 3mins)

6.  End-To-End tests. The goal of these tests is to verify (complex) interactions with a rendered React component or
    Pluggable Visualization.

    Dev hints:

    -   The BackstopJS is now also usable for end-to-end tests. It is possible to write stories and easily specify
        what things to click on the rendered component before taking the snapshot

#### Reference Workspaces

In order to standardize and simplify testing, all our tests SHOULD use same GoodData model and even further same testing
data. The reference workspace and the tooling surrounding it sets the foundation to enable this and automate as many
tasks as feasible.

The entire story goes as follows:

-   Reference workspace exists in GoodData Platform - it is realized by a standardized project derived from GoodSales v2
    demo. It comes with non-trivial LDM and with made-up test data. The workspace can be created automatically and
    in matter of minute(s).

-   The catalog-export tool located in this repository can be used to export LDM from the workspace into a TypeScript
    representation; with facts, measures, attributes and date data sets represented by constants initialized to
    respective sdk-model instances

-   The mock-handling tool also located in this repository can be used to create and maintain data and metadata
    recordings taken from the reference workspace.

-   This all comes together in the tools/reference-workspace project; this is where TypeScript code representing
    LDM exists. This is where we store definitions of what data to capture from the reference workspace living in
    GoodData platform.

-   The tools/reference-workspace project is built as any other project and can be depended-on as needed. It contains
    all the code and recording artifacts. The recordings are accessible through a RecordingIndex - this can be used
    as input to recordedBackend() implemented in sdk-backend-mockingbird.

Thus, the tools/reference-workspace project delivers testing infrastructure that SHOULD be used for all types of tests:

-   The Reference LDM on its own SHOULD be used in unit tests in the area of execution definition
-   The Reference LDM in conjunction with dummyBackend() SHOULD be used in unit and component tests focused on
    creating and driving executions (e.g. when results are unimportant)
-   The Reference LDM in conjunction with recordedBackend() SHOULD be used for component tests and end-to-end tests
    where it is important to have valid data and metadata

To learn more, please see:

-   [tools/reference-workspace](tools/reference-workspace)
-   [tools/catalog-export](tools/catalog-export)
-   [tools/mock-handling](tools/mock-handling)

For inspiration how to automatically obtain execution recording definitions (not the data, just the input on
what data to obtain) please see:

-   [libs/sdk-ui-tests](libs/sdk-ui-tests)
