package operations

import (
	"log"
	"neobackstop/internals"

	"github.com/playwright-community/playwright-go"
)

func ReloadAfterReady(page playwright.Page, scenario internals.Scenario) *string {
	// todo: we might be able to check if the scenario runs on chromium
	//  before doing this, as these issues do not happen on firefox

	// todo: consider enabling this by default at the end, depends on how much it affects time
	if _, err := page.Reload(playwright.PageReloadOptions{
		WaitUntil: playwright.WaitUntilStateNetworkidle,
	}); err != nil {
		log.Panicf("could not reload: %v", err)
	}

	return ReadySelector(page, scenario.ReadySelector)
}
