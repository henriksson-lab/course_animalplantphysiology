.PHONY: all render preview clean package check check-r figures demos typecheck

# Keep Quarto's stylesheet cache inside the ignored project directory.
QUARTO_CACHE_DIR ?= $(CURDIR)/.quarto/cache

all: render

render: package demos
	XDG_CACHE_HOME="$(QUARTO_CACHE_DIR)" quarto render
	@touch docs/.nojekyll

preview: package
	XDG_CACHE_HOME="$(QUARTO_CACHE_DIR)" quarto preview

package:
	python3 tools/package_student_files.py

# Build the interactive demos (TypeScript, demos/src/) into demos/dist/.
# One-time setup: npm i   (installs esbuild + typescript into node_modules/).
demos:
	demos/build.sh

# Type-check the demo sources (esbuild only strips types).
typecheck:
	node_modules/.bin/tsc --noEmit -p demos

check:
	python3 tools/check_course.py

check-r: package
	python3 tools/check_optional_report.py

figures:
	Rscript --vanilla tools/make_figures.R

clean:
	rm -rf docs .quarto
