# Mocking bird

This package contains test support and mock implementations of various concepts in the sdk-backend-spi.

## Dummy backend

This implementation of Analytical Backend SPI focuses on the execution branch of the SPI; it creates
and sets up Prepared Execution just like any other implementation would. When the prepared execution
is started (execute()) it returns an empty result which only contains execution definition and has
the result dimensions empty. Reading any data views from this result will return empty data views.

Purpose:

-   use in unit tests which need to verify whether the execution is prepared correctly
    for instance functions which transform props => prepared execution

-   use in unit tests which need to verify whether code works correctly with execution definition
    stored in result / data view / data view facade

-   use in component-level 'smoke tests' (e.g. something renders or happens, we don't care about the details)

## Recorded backend

This implementation of Analytical Backend SPI for now focuses on the execution branch of the SPI.

Purpose:

-   use in unit and component tests which need to verify behaviour based on particular definition + results + data of
    an execution

Using the recorded executions is the preferred approach when test fixture requires non-trivial setup. Favor the
recorded executions over hand-crafting the execution results and data views. The benefit of recorded executions
is their easier change-ability in case of breaking changes of the execution or data shape: transformer code can
rake through all of them in a straightforward fashion.
