.PHONY: build run test clean deps

build:
	go build -o bin/chain-adapter ./main.go

run:
	go run ./main.go

test:
	go test ./...

clean:
	rm -rf bin/

deps:
	go mod download
	go mod tidy

