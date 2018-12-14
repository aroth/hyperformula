typecheck: ## Typecheck the code
	@yarn tsc --noEmit

setup: ## Setup project
	@yarn install

compile: ## Compile to javascript
	@yarn tsc

test: ## Run tests
	@yarn jest

benchmark: ## Run benchmarks
	@yarn ts-node benchmark/01-simple-big.ts
	@echo
	@yarn ts-node benchmark/03-sheet-a.ts
	@echo
	@yarn ts-node benchmark/04-sheet-b.ts
	@echo
	@yarn ts-node benchmark/05-sheet-t.ts
	@echo
	@yarn ts-node benchmark/06-big-sum.ts

check: typecheck test

full: check lint-fix

lint: ## show linting errors
	@yarn tslint --project tsconfig.json

lint-fix: ## fix linting errors
	@yarn tslint --fix --project tsconfig.json > /dev/null

coverage: ## Run tests and show coverage
	@yarn jest --coverage

doc:
	@yarn typedoc --options .typedoc.js

servedoc:
	@yarn http-server doc -p 5005

clean: ## Clean compiled files
	@rm -rf lib/

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: test coverage benchmark

.DEFAULT_GOAL := help
