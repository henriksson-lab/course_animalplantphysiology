.PHONY: all render preview clean package check check-r figures

# Keep Quarto's stylesheet cache inside the ignored project directory.
QUARTO_CACHE_DIR ?= $(CURDIR)/.quarto/cache

all: render

render: package
	XDG_CACHE_HOME="$(QUARTO_CACHE_DIR)" quarto render
	@touch docs/.nojekyll

preview: package
	XDG_CACHE_HOME="$(QUARTO_CACHE_DIR)" quarto preview

package:
	python3 tools/package_student_files.py

check:
	python3 tools/check_course.py

check-r: package
	python3 tools/check_optional_report.py

figures:
	Rscript --vanilla tools/make_figures.R

clean:
	rm -rf docs .quarto
