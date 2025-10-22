package operations

import (
	"neobackstop/internals"
	"slices"
	"strings"

	"github.com/playwright-community/playwright-go"
)

var validKeyPressKeys = []string{
	"Enter",
	"Tab",
	"Backspace",
	"Delete",
	"Escape",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"Home",
	"End",
	"PageUp",
	"PageDown",
	"F1",
	"F2",
	"F3",
	"F4",
	"F5",
	"F6",
	"F7",
	"F8",
	"F9",
	"F10",
	"F11",
	"F12",
	"Control",
	"Alt",
	"Meta",
	"Shift", // optional, but included
}

func KeyPressSelector(page playwright.Page, scenario internals.Scenario) *string {
	if scenario.KeyPressSelector != nil {
		kps := *scenario.KeyPressSelector

		// Wait for the element to exist
		_, err := page.WaitForSelector(kps.Selector, playwright.PageWaitForSelectorOptions{
			State: playwright.WaitForSelectorStateVisible,
		})
		if err != nil {
			e := "KeyPressSelector " + kps.Selector + " not found"
			return &e
		}

		isValidKey := false
		if strings.Contains(kps.KeyPress, "+") {
			parts := strings.Split(kps.KeyPress, "+")
			if len(parts) == 2 && (len(parts[0]) == 1 || slices.Contains(validKeyPressKeys, parts[0])) && (len(parts[1]) == 1 || slices.Contains(validKeyPressKeys, parts[1])) {
				isValidKey = true
			}
		} else if len(kps.KeyPress) == 1 || slices.Contains(validKeyPressKeys, kps.KeyPress) {
			isValidKey = true
		}

		// if key is pressable
		if isValidKey {
			err = page.Press(kps.Selector, kps.KeyPress)
			if err != nil {
				e := "KeyPressSelector " + kps.Selector + " couldn't be keyPressed"
				return &e
			}
		} else {
			// text must be typed
			err = page.Type(kps.Selector, kps.KeyPress)
			if err != nil {
				e := "KeyPressSelector " + kps.Selector + " couldn't be typed"
				return &e
			}
		}

		return postInteractionWait(page, scenario.PostInteractionWait)
	}

	return nil
}
