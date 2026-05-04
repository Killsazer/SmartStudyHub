import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { NoteComponent } from '../domain/patterns/composite/note-component';
import { HtmlExportVisitor } from '../domain/patterns/visitor/html-export.visitor';

@Injectable()
export class NotesPdfExportService {
  private readonly logger = new Logger(NotesPdfExportService.name);

  constructor(private readonly htmlVisitor: HtmlExportVisitor) {}

  async exportTreeToPdf(roots: NoteComponent[], title = 'Notes'): Promise<Buffer> {
    if (roots.length === 0) {
      throw new NotFoundException('No notes to export.');
    }

    const body = roots.map((root) => root.accept(this.htmlVisitor, 0)).join('\n');
    const html = this.wrapDocument(title, body);

    return this.renderPdf(html);
  }

  private async renderPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '18mm', right: '18mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private wrapDocument(title: string, body: string): string {
    const safeTitle = title.replace(/</g, '&lt;');
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #18181b;
      line-height: 1.55;
      margin: 0;
      padding: 0;
    }
    h1, h2, h3, h4, h5, h6 { color: #111; line-height: 1.25; margin: 0 0 0.5em; }
    h1 { font-size: 26px; border-bottom: 2px solid #6366f1; padding-bottom: 6px; }
    h2 { font-size: 20px; color: #4338ca; }
    h3 { font-size: 17px; color: #4f46e5; }
    h4, h5, h6 { font-size: 15px; color: #6366f1; }

    .doc-header {
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e4e4e7;
    }
    .doc-title { font-size: 28px; margin: 0; }
    .doc-meta { color: #71717a; font-size: 12px; margin-top: 4px; }

    .note-section { margin: 18px 0; }
    .note-section.depth-0 { margin: 24px 0; padding: 14px 16px; background: #fafafa; border-left: 3px solid #6366f1; border-radius: 6px; }
    .note-section.depth-1 { margin-left: 8px; padding-left: 10px; border-left: 2px solid #c7d2fe; }
    .note-section.depth-2 { margin-left: 16px; padding-left: 10px; border-left: 1px solid #e0e7ff; }

    .note-block { margin: 14px 0; padding: 12px 14px; background: #fff; border: 1px solid #e4e4e7; border-radius: 6px; page-break-inside: avoid; }
    .block-meta { font-size: 11px; color: #a1a1aa; margin-bottom: 8px; }
    .block-content { font-size: 13px; }

    .empty-section { color: #a1a1aa; font-style: italic; font-size: 12px; }

    .block-content p { margin: 0.5em 0; }
    .block-content ul, .block-content ol { margin: 0.5em 0; padding-left: 1.5em; }
    .block-content li { margin: 0.25em 0; }
    .block-content code {
      background: #f4f4f5; padding: 2px 5px; border-radius: 3px;
      font-family: 'Menlo', 'Monaco', monospace; font-size: 12px;
    }
    .block-content pre {
      background: #18181b; color: #fafafa; padding: 12px; border-radius: 6px;
      overflow-x: auto; font-size: 12px; line-height: 1.45;
    }
    .block-content pre code { background: transparent; color: inherit; padding: 0; }
    .block-content blockquote {
      border-left: 3px solid #6366f1; padding-left: 12px; margin: 0.6em 0;
      color: #52525b; font-style: italic;
    }
    .block-content a { color: #4f46e5; text-decoration: underline; }
    .block-content mark { background: #fef08a; padding: 0 2px; border-radius: 2px; }
    .block-content hr { border: none; border-top: 1px solid #e4e4e7; margin: 1em 0; }
    .block-content ul[data-type="taskList"] { list-style: none; padding-left: 0.5em; }
    .block-content ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 6px; }
    .block-content ul[data-type="taskList"] li input[type="checkbox"] { margin-top: 4px; }
  </style>
</head>
<body>
  <header class="doc-header">
    <h1 class="doc-title">${safeTitle}</h1>
    <div class="doc-meta">Generated ${new Date().toLocaleDateString()}</div>
  </header>
  ${body}
</body>
</html>`;
  }
}
