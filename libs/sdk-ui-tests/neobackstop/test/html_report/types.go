package html_report

type DimensionDifference struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

type Diff struct {
	IsSameDimensions    bool                `json:"isSameDimensions"`
	DimensionDifference DimensionDifference `json:"dimensionDifference"`
	MisMatchPercentage  string              `json:"misMatchPercentage"`
	AnalysisTime        int                 `json:"analysisTime"`
}

type Pair struct {
	Reference             string  `json:"reference"`
	Test                  string  `json:"test"`
	Selector              string  `json:"selector"`
	FileName              string  `json:"fileName"`
	Label                 string  `json:"label"`
	RequireSameDimensions bool    `json:"requireSameDimensions"`
	MisMatchThreshold     float64 `json:"misMatchThreshold"`
	Url                   string  `json:"url"`
	Expect                int     `json:"expect"`
	ViewportLabel         string  `json:"viewportLabel"`
	Diff                  *Diff   `json:"diff,omitempty"`
	DiffImage             *string `json:"diffImage,omitempty"`
	EngineErrorMsg        *string `json:"engineErrorMsg,omitempty"`
	Error                 *string `json:"error,omitempty"`
}

type Test struct {
	Pair   Pair   `json:"pair"`
	Status string `json:"status"`
}

type Result struct {
	TestSuite string `json:"testSuite"`
	Tests     []Test `json:"tests"`
	Id        string `json:"id"`
}
