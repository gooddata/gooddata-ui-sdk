package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"maps"
	"os"
	"slices"
	"strconv"
	"time"

	"github.com/gooddata/gooddata-neobackstop/browser"
	"github.com/gooddata/gooddata-neobackstop/config"
	"github.com/gooddata/gooddata-neobackstop/converters"
	"github.com/gooddata/gooddata-neobackstop/internals"
	"github.com/gooddata/gooddata-neobackstop/scenario"
	"github.com/gooddata/gooddata-neobackstop/screenshotter"

	"github.com/playwright-community/playwright-go"
)

var scenarioLabel = ""
var increment = 100 * time.Millisecond
var browserAlias = "chromium"

func main() {
	// read config
	configFile, err := os.Open("../config.json")
	if err != nil {
		panic(err.Error())
	}

	configFileBytes, err := io.ReadAll(configFile)
	if err != nil {
		panic(err.Error())
	}

	var configuration config.Config
	if err = json.Unmarshal(configFileBytes, &configuration); err != nil {
		panic(err.Error())
	}

	configurationJson, err := json.MarshalIndent(configuration, "", "  ")
	if err != nil {
		panic(err.Error())
	}

	fmt.Println("Received configuration:", string(configurationJson))

	// read scenarios
	scenariosFile, err := os.Open("../scenarios.json")
	if err != nil {
		panic(err.Error())
	}

	scenariosFileBytes, err := io.ReadAll(scenariosFile)
	if err != nil {
		panic(err.Error())
	}

	var scenarios []scenario.Scenario
	if err = json.Unmarshal(scenariosFileBytes, &scenarios); err != nil {
		panic(err.Error())
	}

	// grab unique browsers to install, from the browser alias map
	browsers := map[string]interface{}{}
	for _, b := range configuration.Browsers {
		// convert to string because playwright.Install requires a slice of strings
		browsers[string(b.Name)] = nil
	}

	// download drivers
	if err = playwright.Install(&playwright.RunOptions{
		Browsers: slices.Collect(maps.Keys(browsers)),
	}); err != nil {
		log.Panicf("could not install playwright drivers: %v", err)
	}

	// build internal scenarios
	internalScenarios := converters.ScenariosToInternal(configuration.DefaultBrowsers, configuration.Viewports, configuration.RetryCount, scenarios)

	var debugScenario *internals.Scenario
	for _, s := range internalScenarios {
		if s.Label == scenarioLabel {
			debugScenario = &s
		}
	}

	if debugScenario == nil {
		panic("scenario not found")
	}

	// run playwright
	pw, err := playwright.Run()
	if err != nil {
		log.Panicf("could not start playwright: %v", err)
	}

	var b playwright.Browser
	browserConfig := configuration.Browsers[browserAlias]
	if browserConfig.Name == browser.Chromium {
		b, err = pw.Chromium.Launch(playwright.BrowserTypeLaunchOptions{
			Headless: playwright.Bool(false),
			Args:     browserConfig.Args,
		})
		if err != nil {
			log.Panicf("could not launch browser: %v", err)
		}
	} else if browserConfig.Name == browser.Firefox {
		b, err = pw.Firefox.Launch(playwright.BrowserTypeLaunchOptions{
			Headless: playwright.Bool(false),
			Args:     browserConfig.Args,
		})
		if err != nil {
			log.Panicf("could not launch browser: %v", err)
		}
	} else {
		// this case shouldn't happen and should throw an error when unmarshalling,
		// but we should check for it anyway
		panic("Unknown browser " + browserAlias)
	}

	context, err := b.NewContext(playwright.BrowserNewContextOptions{
		Viewport: &playwright.Size{
			Width:  debugScenario.Viewport.Width,
			Height: debugScenario.Viewport.Height,
		},
	})
	if err != nil {
		log.Panicf("could not create context: %v", err)
	}

	// create a new page for the newly created context
	page, err := context.NewPage()
	if err != nil {
		log.Panicf("could not create page: %v", err)
	}

	testChan := make(chan screenshotter.Result)

	go func() {
		for range testChan {
			// do nothing
		}
	}()

	saveDir := "./output"

	if _, err = os.Stat(saveDir); os.IsNotExist(err) {
		// saveDir does not exist
		if err = os.Mkdir(saveDir, 0777); err != nil {
			panic(err.Error())
		}
	}

	jobJson, err := json.Marshal(debugScenario)
	if err != nil {
		panic(err.Error())
	}

	fmt.Println(string(jobJson))

	fmt.Println("Original delay:", debugScenario.Delay)
	debugScenario1 := *debugScenario
	// test delays
	for i := range 10 {
		delayValue := time.Duration(i) * increment
		debugScenario1.Id = "delay_" + strconv.Itoa(int(delayValue/time.Millisecond)) + "ms"

		fmt.Println(delayValue)

		delay := scenario.Delay{
			PostReady: time.Duration(i) * increment,
		}

		debugScenario1.Delay = &delay

		screenshotter.Job("debug |", saveDir, debugScenario1.Viewport.Label, page, debugScenario1, testChan, "debug", configuration)
		fmt.Println("Screenshot taken", delayValue)

		time.Sleep(3 * time.Second)
	}

	if debugScenario.PostInteractionWait != nil {
		fmt.Println("Original piw:", *debugScenario.PostInteractionWait)
	}
	debugScenario2 := *debugScenario
	// test postInteractionWait
	for i := range 10 {
		piwValue := time.Duration(i) * increment
		debugScenario2.Id = "postInteractionWait_" + strconv.Itoa(int(piwValue/time.Millisecond)) + "ms"

		fmt.Println(piwValue)

		debugScenario2.PostInteractionWait = &scenario.SelectorThenDelay{
			Delay: &piwValue,
		}

		screenshotter.Job("debug |", saveDir, debugScenario2.Viewport.Label, page, debugScenario2, testChan, "debug", configuration)
		fmt.Println("Screenshot taken", piwValue)

		time.Sleep(3 * time.Second)
	}
}
