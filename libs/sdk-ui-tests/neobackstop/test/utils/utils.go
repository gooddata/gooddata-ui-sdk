package utils

import (
	"io"
	"io/fs"
	"os"
	"path/filepath"
)

// this was written by AI

// copyFile copies a single file from src to dst
func copyFile(srcFile, dstFile string) error {
	src, err := os.Open(srcFile)
	if err != nil {
		return err
	}
	defer src.Close()

	dst, err := os.Create(dstFile)
	if err != nil {
		return err
	}
	defer dst.Close()

	_, err = io.Copy(dst, src)
	if err != nil {
		return err
	}

	// Copy file permissions
	info, err := os.Stat(srcFile)
	if err != nil {
		return err
	}
	return os.Chmod(dstFile, info.Mode())
}

// CopyDir recursively copies a folder from src to dst
func CopyDir(srcDir, dstDir string) error {
	return filepath.Walk(srcDir, func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Compute the target path
		relPath, err := filepath.Rel(srcDir, path)
		if err != nil {
			return err
		}
		dstPath := filepath.Join(dstDir, relPath)

		if info.IsDir() {
			// Create directory
			return os.MkdirAll(dstPath, info.Mode())
		}

		// Copy file
		return copyFile(path, dstPath)
	})
}
