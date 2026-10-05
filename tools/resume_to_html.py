#!/usr/bin/env python3
"""Convert the pandoc-flavoured resume markdown (main.md) into a print-ready HTML page."""
import html
import re
import sys


def inline(text):
    text = html.escape(text.strip(), quote=False)
    text = text.replace("$|$", "|")
    text = re.sub(r"\{[^}]*\}", "", text)
    text = re.sub(r"\[\[+([^\]]+?)\]+\(([^)]+)\)", r'<a href="\2">\1</a>', text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', text)
    text = re.sub(r"\[([^\]]+)\]", r"\1", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)
    text = re.sub(r"`(.+?)`", r"<code>\1</code>", text)
    return text.replace("\\", "").replace(" -- ", " – ").strip()


def split_row(line):
    parts = re.split(r"\s{3,}", line.strip())
    left = parts[0] if parts else ""
    right = parts[-1] if len(parts) > 1 else ""
    return inline(left), inline(right)


def convert(md):
    lines = md.splitlines()
    out = []
    i = 0
    in_list = False

    def close_list():
        nonlocal in_list
        if in_list:
            out.append("</ul>")
            in_list = False

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith("::: center"):
            block = []
            i += 1
            while i < len(lines) and lines[i].strip() != ":::":
                block.append(lines[i].strip())
                i += 1
            joined = " ".join(block)
            name_match = re.search(r"\*\*\[?([^\]*]+)\]?(\{[^}]*\})?\*\*", joined)
            name = name_match.group(1) if name_match else ""
            rest = joined[name_match.end():] if name_match else joined
            links = [inline(p) for p in rest.split("$|$") if p.strip()]
            links = [l for l in links if "tel:" not in l]
            out.append(f'<header><h1>{html.escape(name.title())}</h1>'
                       f'<p class="contact">{" &middot; ".join(links)}</p></header>')
        elif stripped.startswith("::: itemize"):
            i += 1
            out.append('<dl class="skills">')
            buffer = ""
            while i < len(lines) and lines[i].strip() != ":::":
                buffer += " " + lines[i].strip()
                i += 1
            for entry in [e for e in buffer.split("\\") if e.strip()]:
                label, _, value = entry.partition(":")
                out.append(f"<div><dt>{inline(label)}</dt><dd>{inline(value)}</dd></div>")
            out.append("</dl>")
        elif stripped.startswith("# "):
            close_list()
            out.append(f"<h2>{inline(stripped[2:])}</h2>")
        elif re.match(r"^- -{5,}", stripped):
            close_list()
            rows = []
            i += 1
            while i < len(lines) and not re.match(r"^-{5,}", lines[i].strip()):
                if lines[i].strip():
                    rows.append(split_row(lines[i]))
                i += 1
            title, place = rows[0] if rows else ("", "")
            sub, when = rows[1] if len(rows) > 1 else ("", "")
            out.append(f'<div class="entry"><div class="row"><span>{title}</span><span>{place}</span></div>'
                       f'<div class="row sub"><span>{sub}</span><span>{when}</span></div></div>')
        elif re.match(r"^-\s{1,}\S", stripped) and line.startswith("  "):
            text = stripped[1:].strip()
            i += 1
            while i < len(lines) and lines[i].startswith("    ") and not lines[i].strip().startswith("-"):
                text += " " + lines[i].strip()
                i += 1
            if not in_list:
                out.append("<ul>")
                in_list = True
            out.append(f"<li>{inline(text)}</li>")
            continue
        elif stripped and not stripped.startswith(":::"):
            close_list()
            paragraph = stripped
            i += 1
            while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith(("#", "-", ":::")):
                paragraph += " " + lines[i].strip()
                i += 1
            out.append(f"<p>{inline(paragraph)}</p>")
            continue
        i += 1

    close_list()
    return "\n".join(out)


STYLE = """
@page { size: A4; margin: 12mm 14mm; }
* { box-sizing: border-box; }
body { font: 10pt/1.42 "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1a1a1a; margin: 0; }
header { text-align: center; margin-bottom: 6pt; }
h1 { font-size: 20pt; letter-spacing: .14em; margin: 0 0 3pt; font-variant: small-caps; }
.contact { margin: 0; font-size: 9pt; }
a { color: #1f5fbf; text-decoration: none; }
h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: .08em; border-bottom: 1px solid #999;
     padding-bottom: 2pt; margin: 10pt 0 5pt; }
p { margin: 0 0 4pt; }
.skills { margin: 0; }
.skills div { display: flex; gap: 6pt; margin-bottom: 2pt; }
.skills dt { font-weight: 700; flex: 0 0 auto; }
.skills dt::after { content: ":"; }
.skills dd { margin: 0; }
.entry { margin-top: 6pt; break-inside: avoid; }
.row { display: flex; justify-content: space-between; gap: 12pt; }
.row.sub { font-size: 9.5pt; }
ul { margin: 2pt 0 0; padding-left: 14pt; }
li { margin-bottom: 1.5pt; }
code { font-family: Menlo, monospace; font-size: 9pt; }
"""


def main():
    source, target = sys.argv[1], sys.argv[2]
    with open(source, encoding="utf-8") as handle:
        body = convert(handle.read())
    with open(target, "w", encoding="utf-8") as handle:
        handle.write(f'<!doctype html><html lang="en"><head><meta charset="utf-8">'
                     f'<title>Vikas Das - Resume</title><style>{STYLE}</style></head>'
                     f'<body>{body}</body></html>')


if __name__ == "__main__":
    main()
