.PHONY: all render preview clean

all: render

render:
	quarto render
	@touch docs/.nojekyll

preview:
	quarto preview

clean:
	rm -rf docs .quarto
