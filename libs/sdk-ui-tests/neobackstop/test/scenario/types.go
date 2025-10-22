package scenario

import (
	"neobackstop/viewport"
)

type KeyPressSelector struct {
	KeyPress string `json:"keyPress"`
	Selector string `json:"selector"`
}

// Scenario - properties in order of processing, scenarios.json must be an array of Scenario
type Scenario struct {
	Viewports           []viewport.Viewport `json:"viewports"`
	Id                  string              `json:"id"`
	Label               string              `json:"label"`
	Url                 string              `json:"url"`
	ReadySelector       *string             `json:"readySelector"`
	ReloadAfterReady    bool                `json:"reloadAfterReady"`
	Delay               interface{}         `json:"delay"`
	KeyPressSelector    *KeyPressSelector   `json:"keyPressSelector"`
	HoverSelector       *string             `json:"hoverSelector"`
	HoverSelectors      []interface{}       `json:"hoverSelectors"`
	ClickSelector       *string             `json:"clickSelector"`
	ClickSelectors      []interface{}       `json:"clickSelectors"`
	PostInteractionWait interface{}         `json:"postInteractionWait"`
	ScrollToSelector    *string             `json:"scrollToSelector"`
	MisMatchThreshold   *float64            `json:"misMatchThreshold"`
}
