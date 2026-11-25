import io
from typing import List, Dict, Any
import datetime

class SimplePDFBuilder:
    """
    Lightweight, dependency-free pure Python PDF 1.4 generator.
    Produces well-formed, multi-page vector analytical reports with headers,
    colored panels, structured metric tables, and clean typography.
    """

    def __init__(self, title: str = "Student Risk Analytics Report"):
        self.title = title
        self.pages_content = []
        self.current_page_commands = []
        self.y = 750
        self.margin_left = 50
        self.page_width = 612
        self.page_height = 792

    def _flush_page(self):
        if self.current_page_commands:
            self.pages_content.append("\n".join(self.current_page_commands))
            self.current_page_commands = []
        self.y = 750

    def new_page(self):
        self._flush_page()

    def add_header(self, text: str, subtitle: str = None):
        # Header banner background
        self.current_page_commands.append("0.05 0.09 0.18 rg") # Dark navy #0D172E
        self.current_page_commands.append(f"0 720 612 72 re f")
        
        # Primary Title
        self.current_page_commands.append("1 1 1 rg") # White
        self.current_page_commands.append(f"BT /F2 16 Tf {self.margin_left} 755 Td ({self._escape(text)}) Tj ET")

        if subtitle:
            self.current_page_commands.append("0.6 0.7 0.9 rg") # Light blue
            self.current_page_commands.append(f"BT /F1 9 Tf {self.margin_left} 735 Td ({self._escape(subtitle)}) Tj ET")

        self.y = 700

    def add_section_title(self, title: str):
        if self.y < 90:
            self.new_page()
            self.add_header(self.title)

        self.current_page_commands.append("0.1 0.25 0.55 rg") # Blue accent
        self.current_page_commands.append(f"{self.margin_left} {self.y - 2} 512 1.5 re f")
        self.current_page_commands.append("0.08 0.15 0.3 rg")
        self.current_page_commands.append(f"BT /F2 12 Tf {self.margin_left} {self.y} Td ({self._escape(title)}) Tj ET")
        self.y -= 20

    def add_key_value(self, label: str, value: str, indent: int = 0):
        if self.y < 60:
            self.new_page()
            self.add_header(self.title)

        x = self.margin_left + indent
        self.current_page_commands.append("0.2 0.25 0.35 rg")
        self.current_page_commands.append(f"BT /F2 9 Tf {x} {self.y} Td ({self._escape(label)}:) Tj ET")
        self.current_page_commands.append("0.1 0.1 0.15 rg")
        self.current_page_commands.append(f"BT /F1 9 Tf {x + 160} {self.y} Td ({self._escape(str(value))}) Tj ET")
        self.y -= 14

    def add_paragraph(self, text: str, max_chars: int = 90):
        words = text.split()
        lines = []
        curr = []
        curr_len = 0
        for w in words:
            if curr_len + len(w) + 1 > max_chars:
                lines.append(" ".join(curr))
                curr = [w]
                curr_len = len(w)
            else:
                curr.append(w)
                curr_len += len(w) + 1
        if curr:
            lines.append(" ".join(curr))

        for line in lines:
            if self.y < 60:
                self.new_page()
                self.add_header(self.title)
            self.current_page_commands.append("0.2 0.25 0.3 rg")
            self.current_page_commands.append(f"BT /F1 9 Tf {self.margin_left} {self.y} Td ({self._escape(line)}) Tj ET")
            self.y -= 12
        self.y -= 6

    def add_table(self, headers: List[str], rows: List[List[str]], col_widths: List[int] = None):
        if not col_widths:
            w = 512 // len(headers)
            col_widths = [w] * len(headers)

        total_width = sum(col_widths)

        # Header row background
        if self.y < 80:
            self.new_page()
            self.add_header(self.title)

        self.current_page_commands.append("0.92 0.95 0.98 rg") # Table header light background
        self.current_page_commands.append(f"{self.margin_left} {self.y - 4} {total_width} 16 re f")

        # Header text
        curr_x = self.margin_left
        for i, h in enumerate(headers):
            self.current_page_commands.append("0.1 0.2 0.4 rg")
            self.current_page_commands.append(f"BT /F2 8.5 Tf {curr_x + 4} {self.y} Td ({self._escape(h)}) Tj ET")
            curr_x += col_widths[i]

        self.y -= 18

        # Data rows
        for r_idx, row in enumerate(rows):
            if self.y < 50:
                self.new_page()
                self.add_header(self.title)

            if r_idx % 2 == 0:
                self.current_page_commands.append("0.97 0.98 1.0 rg") # alternate row
                self.current_page_commands.append(f"{self.margin_left} {self.y - 3} {total_width} 14 re f")

            curr_x = self.margin_left
            for i, val in enumerate(row):
                self.current_page_commands.append("0.15 0.15 0.2 rg")
                self.current_page_commands.append(f"BT /F1 8 Tf {curr_x + 4} {self.y} Td ({self._escape(str(val))}) Tj ET")
                curr_x += col_widths[i]

            self.y -= 14

        self.y -= 10

    def _escape(self, s: str) -> str:
        s = s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        return "".join(c for c in s if ord(c) < 128)

    def build_pdf_bytes(self) -> bytes:
        self._flush_page()
        num_pages = len(self.pages_content)
        if num_pages == 0:
            self.pages_content.append("BT /F1 12 Tf 50 700 Td (No Content) Tj ET")
            num_pages = 1

        objects = []

        def add_obj(body: str) -> int:
            objects.append(body)
            return len(objects)

        # 1: Catalog
        catalog_idx = add_obj("<< /Type /Catalog /Pages 2 0 R >>")
        
        # 2: Pages placeholder
        pages_idx = add_obj("") # will fill later

        # Fonts
        font1_idx = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        font2_idx = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

        page_indices = []
        for content in self.pages_content:
            c_bytes = content.encode("latin1", errors="replace")
            stream_obj = f"<< /Length {len(c_bytes)} >>\nstream\n{content}\nendstream"
            content_idx = add_obj(stream_obj)

            page_obj = (
                f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {self.page_width} {self.page_height}] "
                f"/Contents {content_idx} 0 R /Resources << /Font << /F1 {font1_idx} 0 R /F2 {font2_idx} 0 R >> >> >>"
            )
            p_idx = add_obj(page_obj)
            page_indices.append(p_idx)

        # Update Pages object
        kids_str = " ".join(f"{idx} 0 R" for idx in page_indices)
        objects[1] = f"<< /Type /Pages /Kids [{kids_str}] /Count {len(page_indices)} >>"

        # Assemble full document
        out = io.BytesIO()
        out.write(b"%PDF-1.4\n")

        offsets = []
        for i, obj_str in enumerate(objects):
            offsets.append(out.tell())
            out.write(f"{i + 1} 0 obj\n{obj_str}\nendobj\n".encode("latin1", errors="replace"))

        xref_offset = out.tell()
        out.write(f"xref\n0 {len(objects) + 1}\n".encode("latin1"))
        out.write(b"0000000000 65535 f \n")
        for off in offsets:
            out.write(f"{off:010d} 00000 n \n".encode("latin1"))

        trailer = (
            f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n"
        )
        out.write(trailer.encode("latin1"))

        return out.getvalue()
