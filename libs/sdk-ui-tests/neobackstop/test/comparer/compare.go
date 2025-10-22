package comparer

import (
	"image"
	"image/color"
	"image/png"
	"math"
	"os"
)

func loadImage(path string) (image.Image, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	img, _, err := image.Decode(f)
	return img, err
}

func diffImagesPink(img1, img2 image.Image) (diff *image.RGBA, mismatch float64) {
	bounds := img1.Bounds()
	diff = image.NewRGBA(bounds)

	var totalPixels int
	var diffPixels int

	pink := color.RGBA{R: 255, G: 0, B: 255, A: 255} // classic Backstop pink
	tolerance := 5.0                                 // fixed tolerance

	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			c1 := color.RGBAModel.Convert(img1.At(x, y)).(color.RGBA)
			c2 := color.RGBAModel.Convert(img2.At(x, y)).(color.RGBA)

			dr := float64(c1.R) - float64(c2.R)
			dg := float64(c1.G) - float64(c2.G)
			db := float64(c1.B) - float64(c2.B)

			dist := math.Sqrt(dr*dr + dg*dg + db*db)

			if dist > tolerance {
				diff.Set(x, y, pink) // mark difference
				diffPixels++
			} else {
				diff.Set(x, y, color.RGBA{}) // transparent if no diff
			}
			totalPixels++
		}
	}

	mismatch = float64(diffPixels) / float64(totalPixels) * 100
	return
}

func saveImage(path string, img image.Image) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	return png.Encode(f, img)
}
