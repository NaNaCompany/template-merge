# Template Merge

Buildless, private-review browser tool for W020. Serve `dist/` as the site root. Korean is the root; `/en/`, `/es/`, `/zh/`, `/ja/`, `/de/` share the same logic with complete static locale catalogs and a manual language menu. No external runtime dependencies, tracking, uploads or persistence.

## Behavior

- Plain text templates use `{{column}}`; CSV headers must be unique, nonempty and match the trimmed placeholder name exactly.
- CSV parser supports comma delimiters, quoted commas, escaped double quotes and embedded newlines. Malformed quoting and inconsistent column counts stop generation.
- Cell strings remain unchanged: leading zeroes, large integers and dates are not coerced. Replacement values are not recursively interpreted as placeholders.
- Missing columns and empty referenced values stop generation with row/column details. Previous outputs are invalidated immediately after input changes.
- Preview and clipboard output, individual UTF-8 TXT/HTML, and complete TXT/HTML ZIP exports. HTML output escapes all data and displays a plain text document. ZIP is an original uncompressed store implementation with CRC32.
- Limits: 2,000,000 input characters (file limit 2,000,000 bytes), 500 data records, 100 columns, 30,000 template characters, 5,000,000 combined output characters. Exports may contain personal data.

## Verification

Executed from this app directory using explicit workspace RTK `proxy` and the bundled Node/Python runtimes:

```text
node --check dist/core.js
node --check dist/app.js
node test.mjs
python -X utf8 -c 'import zipfile; z=zipfile.ZipFile("fixture.zip"); assert z.testzip() is None; assert z.read("a.txt").decode("utf-8") == "안녕 <&>\n00001"; assert z.read("b.txt") == b"line\nnext"; print("PASS: Python zipfile independent CRC/content verification")'
```

All commands exited 0. Node fixtures passed CSV quoting/errors, raw value preservation, literal replacement strings, missing/blank fields, HTML escaping, ZIP fixture generation, and six complete locale catalogs/routes. Independent Python `zipfile` confirmed CRCs and exact UTF-8 content of both entries. Browser visual QA is not claimed.

CSV reference: https://www.rfc-editor.org/rfc/rfc4180 . Interface, code and examples are original; no third-party assets are distributed.

Release route regression: `node test.mjs` rerun after repairing static route generation. All six HTML titles now match their locale catalogs. Every page has the correct document language and exactly one menu identity each for ko/en/es/zh/ja/de. All existing functional fixtures and the new static-title/menu regression exited 0.

## Public GitHub Pages release

Launch: https://nanalab.kr/template-merge/

Korean is at the root. English, Spanish, Chinese, Japanese and German use `/en/`, `/es/`, `/zh/`, `/ja/`, `/de/`.
GitHub Pages serves `main` → `/docs` using the branch build. No project CNAME is used.

Build: `node scripts/build-public.mjs`. The `dist/` snapshot and its original generators/tests are preserved as the application source. The public build adds metadata, six-locale sitemaps, original JPEG cards, More Apps styling and the existing NaNa publisher integrations. It does not upload selected user files.

Publisher integrations: AdSense, Google Tag Manager, Google Analytics and Cloudflare Web Analytics, with the same publisher settings as the NaNa Lab homepage. These scripts can make network requests independently of local file processing.

Original JPEG cards are rendered from original text and geometry using an installed system font; no font files are redistributed. Existing source references and third-party notices remain applicable.
