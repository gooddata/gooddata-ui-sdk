package screenshotter

import (
	"neobackstop/internals"
)

type Result struct {
	Scenario *internals.Scenario
	Success  bool
	Error    *string
	FileName *string
}

func buildResultFromScenario(scenario internals.Scenario, fileName *string, error *string) Result {
	return Result{
		Scenario: &scenario,
		Success:  error == nil,
		Error:    error,
		FileName: fileName,
	}
}
