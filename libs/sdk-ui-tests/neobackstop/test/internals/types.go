package internals

import (
	"neobackstop/browser"
	"neobackstop/viewport"
	"time"
)

type Delay struct {
	PostReady     time.Duration `json:"postReady"`
	PostOperation time.Duration `json:"postOperation"`
}

type KeyPressSelector struct {
	KeyPress string `json:"keyPress"`
	Selector string `json:"selector"`
}

type SelectorWithBeforeAfterDelay struct {
	Selector   string         `json:"selector"`
	WaitBefore *time.Duration `json:"waitBefore"`
	WaitAfter  *time.Duration `json:"waitAfter"`
}

type SelectorOrDelay struct {
	Selector *string        `json:"selector"`
	Delay    *time.Duration `json:"delay"`
}

// Scenario - An internal scenario type, properties in order of processing, constructed from scenario.Scenario and config.Config
// this type is exposed in ci-report so needs json keys
type Scenario struct {
	Browser             browser.Browser                `json:"browser"`
	Viewport            viewport.Viewport              `json:"viewport"`
	Id                  string                         `json:"id"`
	Label               string                         `json:"label"`
	Url                 string                         `json:"url"`
	ReadySelector       *string                        `json:"readySelector"`
	ReloadAfterReady    bool                           `json:"reloadAfterReady"`
	Delay               *Delay                         `json:"delay"`
	KeyPressSelector    *KeyPressSelector              `json:"keyPressSelector"`
	HoverSelector       *string                        `json:"hoverSelector"`
	HoverSelectors      []SelectorWithBeforeAfterDelay `json:"hoverSelectors"`
	ClickSelector       *string                        `json:"clickSelector"`
	ClickSelectors      []SelectorWithBeforeAfterDelay `json:"clickSelectors"`
	PostInteractionWait *SelectorOrDelay               `json:"postInteractionWait"`
	ScrollToSelector    *string                        `json:"scrollToSelector"`
	MisMatchThreshold   *float64                       `json:"misMatchThreshold"`
}
