# micro-hawk.github.io

Personal site of Vikas Das — plain HTML/CSS/JS, served by GitHub Pages.

## Updating the resume

The "Resume" buttons open the PDF in a new tab and always point to `resume/Vikas_Das_Resume.pdf`.
To publish a new version, run one command with whatever you have:

```bash
tools/update-resume.sh ~/path/to/resume.pdf   # use a ready-made PDF as-is
tools/update-resume.sh ~/path/to/main.md      # render markdown to PDF (needs Google Chrome)
tools/update-resume.sh ~/path/to/resume.zip   # zip containing a .pdf or .md
```

The script replaces the PDF, bumps the `?v=` cache-buster on the download links
and the "last updated" date, so visitors always get the newest file. Then:

```bash
git add resume index.html && git commit -m "Update resume" && git push
```
