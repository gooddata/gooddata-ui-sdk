package comparer

import (
	"neobackstop/config"
	"neobackstop/screenshotter"
	"os"
)

func doJob(c config.Config, job screenshotter.Result, results chan Result) {
	if _, err := os.Stat(c.BitmapsReferencePath + "/" + *job.FileName); os.IsNotExist(err) {
		// reference image doesn't exist
		e := "Reference image does not exist"
		results <- Result{
			ScreenshotterResult: &job,
			Error:               &e,
		}
		return
	}

	referenceImg, err := loadImage(c.BitmapsReferencePath + "/" + *job.FileName)
	if err != nil {
		panic(err)
	}
	testImg, err := loadImage(c.BitmapsTestPath + "/" + *job.FileName)
	if err != nil {
		panic(err)
	}

	diff, mismatch := diffImagesPink(referenceImg, testImg)

	if (job.Scenario.MisMatchThreshold != nil && *job.Scenario.MisMatchThreshold >= mismatch) || (job.Scenario.MisMatchThreshold == nil && mismatch == 0) {
		// do not save diff, image matches
		results <- Result{
			ScreenshotterResult: &job,
			HasReference:        true,
			MatchesReference:    true,
			MismatchPercentage:  &mismatch,
		}
		return
	}

	err = saveImage(c.BitmapsTestPath+"/diff_"+*job.FileName, diff)
	if err != nil {
		panic(err.Error())
	}

	results <- Result{
		ScreenshotterResult: &job,
		HasReference:        true,
		DiffCreated:         true,
		MatchesReference:    false,
		MismatchPercentage:  &mismatch,
	}
}
