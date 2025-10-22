package result

import (
	"neobackstop/internals"
)

type Result struct {
	Scenario           internals.Scenario `json:"scenario"`
	Error              *string            `json:"error"`
	ReferenceFileName  *string            `json:"reference_file_name"`
	ScreenshotFileName *string            `json:"screenshot_file_name"`
	MatchesReference   *bool              `json:"matches_reference"`
	DiffFileName       *string            `json:"diff_file_name"`
	MisMatchPercentage *float64           `json:"misMatchPercentage"`
}
