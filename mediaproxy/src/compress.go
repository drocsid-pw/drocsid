package main

import (
	"errors"

	"github.com/discord/lilliput"
)

func CompressJPG(input []byte, quality int, downsize int) ([]byte, error) {
	if len(input) == 0 {
		return nil, errors.New("empty input data")
	}

	decoder, err := lilliput.NewDecoder(input)
	if err != nil {
		return nil, err
	}
	defer decoder.Close()

	header, err := decoder.Header()
	if err != nil {
		return nil, err
	}

	ops := lilliput.NewImageOps(8192) // max output pixels
	defer ops.Close()

	outputOpts := &lilliput.ImageOptions{
		FileType:             ".jpeg",
		NormalizeOrientation: true,
		ResizeMethod:         lilliput.ImageOpsSizeMethod(2),
		Width:                header.Width() / downsize,
		Height:               header.Height() / downsize,
		EncodeOptions:        map[int]int{lilliput.JpegQuality: quality},
	}

	outputBuf := make([]byte, 5*1024*1024)

	output, err := ops.Transform(decoder, outputOpts, outputBuf)
	if err != nil {
		return nil, err
	}

	return output, nil
}
