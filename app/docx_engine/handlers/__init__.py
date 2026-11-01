from app.docx_engine.handlers.paragraph import render_paragraph
from app.docx_engine.handlers.heading import render_heading
from app.docx_engine.handlers.table import render_table
from app.docx_engine.handlers.figure import render_figure
from app.docx_engine.handlers.footnote import render_footnote, setup_footnotes_separator
from app.docx_engine.handlers.formula import render_formula
from app.docx_engine.handlers.appendix import render_appendix
from app.docx_engine.handlers.title_page import render_title_page

__all__ = [
    "render_paragraph",
    "render_heading",
    "render_table",
    "render_figure",
    "render_footnote",
    "setup_footnotes_separator",
    "render_formula",
    "render_appendix",
    "render_title_page"
]
