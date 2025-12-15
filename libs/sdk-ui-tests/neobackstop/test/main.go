package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"runtime"
	"slices"
	"strconv"
	"sync"
	"time"

	"github.com/gooddata/gooddata-neobackstop/comparer"
	"github.com/gooddata/gooddata-neobackstop/config"
	"github.com/gooddata/gooddata-neobackstop/converters"
	"github.com/gooddata/gooddata-neobackstop/html_report"
	"github.com/gooddata/gooddata-neobackstop/internals"
	"github.com/gooddata/gooddata-neobackstop/result"
	"github.com/gooddata/gooddata-neobackstop/scenario"
	"github.com/gooddata/gooddata-neobackstop/screenshotter"
	"github.com/gooddata/gooddata-neobackstop/utils"

	"github.com/playwright-community/playwright-go"
)

func bToMb(b uint64) uint64 {
	return b / 1024 / 1024
}

func main() {
	go (func() {
		for {
			var m runtime.MemStats
			runtime.ReadMemStats(&m)
			fmt.Printf("MEMORY STATS | Alloc = %v MiB", bToMb(m.Alloc))
			fmt.Printf("\tTotalAlloc = %v MiB", bToMb(m.TotalAlloc))
			fmt.Printf("\tSys = %v MiB", bToMb(m.Sys))
			fmt.Printf("\tNumGC = %v\n", m.NumGC)
			time.Sleep(2 * time.Second)
		}
	})()

	//go (func() {
	//	for {
	//		procs, err := process.Processes()
	//		if err != nil {
	//			log.Fatalf("Error listing processes: %v", err)
	//		}
	//
	//		var totalCPU float64
	//		var totalMemMB float64
	//
	//		for _, p := range procs {
	//			name, err := p.Name()
	//			if err != nil || name != "headless_shell" {
	//				continue
	//			}
	//
	//			cpuPercent, err := p.CPUPercent()
	//			if err == nil {
	//				totalCPU += cpuPercent
	//			}
	//
	//			memInfo, err := p.MemoryInfo()
	//			if err == nil {
	//				totalMemMB += float64(memInfo.RSS) / 1024.0 / 1024.0
	//			}
	//		}
	//
	//		numCores := runtime.NumCPU()
	//		cpuPercentNormalized := totalCPU / float64(numCores)
	//
	//		fmt.Printf("CHROMIUM USAGE STATS | CPU %.2f%% (normalized %.2f%%), Memory %.2f MB\n",
	//			totalCPU, cpuPercentNormalized, totalMemMB)
	//
	//		time.Sleep(2 * time.Second)
	//	}
	//})()

	if len(os.Args) < 2 {
		panic("Mode not provided")
	}

	mode := os.Args[1]
	if !slices.Contains([]string{"test", "approve"}, mode) {
		panic("Mode is invalid")
	}

	configFilePath := flag.String("config", "../config.json", "config.json file path")
	scenariosFilePath := flag.String("scenarios", "../scenarios.json", "scenarios.json file path")

	// read config
	configFile, err := os.Open(*configFilePath)
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
	scenariosFile, err := os.Open(*scenariosFilePath)
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

	numScenarios := len(scenarios)
	fmt.Println("Received", numScenarios, "scenarios")

	// we use a slice of our Browser enums, which we need to convert to a slice of strings
	browsers := make([]string, len(configuration.Browsers))
	for i, b := range configuration.Browsers {
		browsers[i] = string(b)
	}

	// download drivers
	if err = playwright.Install(&playwright.RunOptions{
		Browsers: browsers,
	}); err != nil {
		log.Panicf("could not install playwright drivers: %v", err)
	}

	// build internal scenarios
	internalScenarios := converters.ScenariosToInternal(configuration.Browsers, configuration.Viewports, scenarios)

	numInternalScenarios := len(internalScenarios)
	fmt.Println("Generated", numInternalScenarios, "internal scenarios")

	// run playwright
	pw, err := playwright.Run()
	if err != nil {
		log.Panicf("could not start playwright: %v", err)
	}

	screenshotterSaveDir := configuration.BitmapsTestPath
	if mode == "approve" {
		screenshotterSaveDir = configuration.BitmapsReferencePath
	}

	if _, err = os.Stat(screenshotterSaveDir); os.IsNotExist(err) {
		// saveDir does not exist
		if err = os.Mkdir(screenshotterSaveDir, 0777); err != nil {
			panic(err.Error())
		}
	}

	// create the channel and wait group
	screenshotterJobs := make(chan internals.Scenario, numInternalScenarios)
	screenshotterResults := make(chan screenshotter.Result, numInternalScenarios)
	var wg1 sync.WaitGroup

	for w := 1; w <= configuration.AsyncCaptureLimit; w++ {
		wg1.Add(1)
		go screenshotter.Run(screenshotterSaveDir, pw, configuration, screenshotterJobs, &wg1, screenshotterResults, w, mode)
	}

	// send jobs and close
	for _, s := range internalScenarios {
		screenshotterJobs <- s
	}

	close(screenshotterJobs)

	t0 := time.Now()

	wg1.Wait()

	close(screenshotterResults)

	fmt.Println("Screenshotter took", time.Now().Sub(t0).String())

	if err = pw.Stop(); err != nil {
		log.Panicf("could not stop playwright: %v", err)
	}

	if mode == "approve" {
		// we don't need to generate diffs, exit here
		return
	}

	// filter out unsuccessful captures
	unsuccessfulCaptures := make([]screenshotter.Result, 0)
	successfulCaptures := make([]screenshotter.Result, 0)
	for screenshotterResult := range screenshotterResults {
		if screenshotterResult.Success {
			successfulCaptures = append(successfulCaptures, screenshotterResult)
		} else {
			unsuccessfulCaptures = append(unsuccessfulCaptures, screenshotterResult)
		}
	}

	numSuccessfulCaptures := len(successfulCaptures)
	fmt.Println("Comparing", numSuccessfulCaptures, "screenshots")

	// now compare the screenshots with the reference
	compareJobs := make(chan screenshotter.Result, numSuccessfulCaptures)
	compareResults := make(chan comparer.Result, numSuccessfulCaptures)
	var wg2 sync.WaitGroup

	for w := 1; w <= configuration.AsyncCompareLimit; w++ {
		wg2.Add(1)
		go comparer.Run(configuration, compareJobs, &wg2, compareResults, w)
	}

	// send jobs and close
	for _, s := range successfulCaptures {
		compareJobs <- s
	}

	close(compareJobs)

	t1 := time.Now()

	wg2.Wait()

	close(compareResults)

	fmt.Println("Comparer took", time.Now().Sub(t1).String())

	t2 := time.Now()

	// create results for JSON output
	results := make([]result.Result, 0)

	for compareResult := range compareResults {
		// we assume that if we could compare, the screenshot job was successful
		r := result.Result{
			Scenario:           *compareResult.ScreenshotterResult.Scenario,
			ScreenshotFileName: compareResult.ScreenshotterResult.FileName,
		}

		if compareResult.HasReference {
			r.ReferenceFileName = compareResult.ScreenshotterResult.FileName
			r.MatchesReference = &compareResult.MatchesReference

			if !compareResult.MatchesReference {
				// diff will exist
				diffFileName := "diff_" + *compareResult.ScreenshotterResult.FileName
				r.DiffFileName = &diffFileName
			}

			if compareResult.MismatchPercentage != nil {
				// has mismatch value (which it should have in this case)
				r.MisMatchPercentage = compareResult.MismatchPercentage
			}
		} else {
			// no reference, there will be an error
			r.Error = compareResult.Error
		}

		results = append(results, r)
	}

	for _, unsuccessfulCapture := range unsuccessfulCaptures {
		// process unsuccessful captures
		results = append(results, result.Result{
			Scenario: *unsuccessfulCapture.Scenario,
			Error:    unsuccessfulCapture.Error,
		})
	}

	jsonResults, err := json.Marshal(results)
	if err != nil {
		panic(err.Error())
	}

	if _, err = os.Stat(configuration.CiReportPath); os.IsNotExist(err) {
		// CiReportPath does not exist
		if err = os.Mkdir(configuration.CiReportPath, 0777); err != nil {
			panic(err.Error())
		}
	}

	fmt.Println("Collecting results for", time.Now().Sub(t2).String())

	t3 := time.Now()

	// create reports and stuff
	if err = os.WriteFile(configuration.CiReportPath+"/results.json", jsonResults, 0755); err != nil {
		log.Panicf("error writing file: %v", err)
	}

	htmlReportTests := make([]html_report.Test, 0)
	for _, r := range results {
		success := r.Error == nil && r.MatchesReference != nil && *r.MatchesReference == true
		status := "fail"
		if success {
			// successful test
			if configuration.HtmlReport.ShowSuccessfulTests {
				// but do not want it in results
				continue
			}

			status = "pass"
		}

		pair := html_report.Pair{
			Label:                 r.Scenario.Label,
			RequireSameDimensions: true, // we don't have this option, so technically, true
			Url:                   r.Scenario.Url,
			ViewportLabel:         r.Scenario.Viewport.Label,
		}

		if r.ReferenceFileName != nil {
			pair.Reference = "../" + configuration.BitmapsReferencePath + "/" + *r.ReferenceFileName
		}

		if r.ScreenshotFileName != nil {
			pair.Test = "../" + configuration.BitmapsTestPath + "/" + *r.ScreenshotFileName
			pair.FileName = *r.ScreenshotFileName
		}

		if r.Scenario.MisMatchThreshold != nil {
			pair.MisMatchThreshold = *r.Scenario.MisMatchThreshold
		}

		if r.Error != nil {
			pair.EngineErrorMsg = r.Error
		}

		if r.DiffFileName != nil {
			diff := html_report.Diff{
				IsSameDimensions: true, // todo, this
				DimensionDifference: html_report.DimensionDifference{
					Width:  0, // todo
					Height: 0, // todo
				},
				AnalysisTime: 0, // todo: maybe?
			}

			if r.MisMatchPercentage != nil {
				diff.MisMatchPercentage = strconv.FormatFloat(*r.MisMatchPercentage, 'f', -1, 64)
			}

			pair.Diff = &diff
			diffFilePath := "../" + configuration.BitmapsTestPath + "/" + *r.DiffFileName
			pair.DiffImage = &diffFilePath
		}

		htmlReportTests = append(htmlReportTests, html_report.Test{
			Pair:   pair,
			Status: status,
		})
	}

	// generate html report
	htmlReport := html_report.Result{
		TestSuite: "BackstopJS",
		Tests:     htmlReportTests,
		Id:        "storybook",
	}

	htmlReportJson, err := json.Marshal(htmlReport)
	if err != nil {
		panic(err.Error())
	}

	err = utils.CopyDir("./html_report_assets", configuration.HtmlReport.Path)
	if err != nil {
		panic(err.Error())
	}

	fileContents := "report(" + string(htmlReportJson) + ");"
	if err = os.WriteFile(configuration.HtmlReport.Path+"/config.js", []byte(fileContents), 0755); err != nil {
		log.Panicf("error writing file: %v", err)
	}

	fmt.Println("Generating results for", time.Now().Sub(t3).String())

	for _, r := range results {
		if r.ReferenceFileName == nil || r.ScreenshotFileName == nil || r.MatchesReference == nil || !*r.MatchesReference || r.Error != nil {
			os.Exit(1)
		}
	}
}
