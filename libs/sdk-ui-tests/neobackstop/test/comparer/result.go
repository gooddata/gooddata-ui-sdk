package comparer

import (
	"neobackstop/screenshotter"
)

// Result - todo some of these should be pointers
type Result struct {
	ScreenshotterResult *screenshotter.Result
	HasReference        bool
	DiffCreated         bool
	MismatchPercentage  *float64
	MatchesReference    bool
	Error               *string
}
