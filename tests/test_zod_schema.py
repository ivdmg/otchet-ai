import os

def test_zod_schema_file_exists_and_valid():
    file_path = os.path.join("frontend", "src", "schemas", "docAstSchema.ts")
    assert os.path.exists(file_path), "docAstSchema.ts must exist"
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    expected_exports = [
        "nodeTypeSchema",
        "listTypeSchema",
        "sourceTypeSchema",
        "astNodeSchema",
        "sectionAstSchema",
        "chapterAstSchema",
        "outlineSectionItemSchema",
        "outlineChapterItemSchema",
        "outlineAstSchema",
        "introductionAstSchema",
        "taskResultItemSchema",
        "conclusionAstSchema",
        "bibliographyItemSchema",
        "bibliographyAstSchema",
        "documentAstGraphSchema",
        "export type DocumentASTGraph",
    ]

    for exp in expected_exports:
        assert exp in content, f"Zod schema file must contain export '{exp}'"
