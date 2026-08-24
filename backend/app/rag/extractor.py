import io
import pypdf
import docx
import pandas as pd


class DocumentExtractor:
    """Extracts raw text content from uploaded PDF, DOCX, TXT, CSV, and MD files."""

    @classmethod
    def extract_text(cls, file_bytes: bytes, filename: str) -> str:
        fn_lower = filename.lower()

        if fn_lower.endswith(".pdf"):
            return cls._extract_pdf(file_bytes)
        elif fn_lower.endswith(".docx"):
            return cls._extract_docx(file_bytes)
        elif fn_lower.endswith(".csv"):
            return cls._extract_csv(file_bytes)
        elif fn_lower.endswith(".txt") or fn_lower.endswith(".md"):
            return file_bytes.decode("utf-8", errors="ignore")
        else:
            return file_bytes.decode("utf-8", errors="ignore")

    @classmethod
    def _extract_pdf(cls, file_bytes: bytes) -> str:
        text_parts = []
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                text_parts.append(f"--- Page {idx+1} ---\n{page_text}")
        return "\n\n".join(text_parts)

    @classmethod
    def _extract_docx(cls, file_bytes: bytes) -> str:
        doc = docx.Document(io.BytesIO(file_bytes))
        full_text = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(full_text)

    @classmethod
    def _extract_csv(cls, file_bytes: bytes) -> str:
        df = pd.read_csv(io.BytesIO(file_bytes))
        summary = f"CSV Data Summary: {len(df)} rows, Columns: {', '.join(df.columns)}\n\n"
        table = df.head(50).to_markdown(index=False)
        return summary + (table or "")
