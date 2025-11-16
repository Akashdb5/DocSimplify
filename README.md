# DocSimplify.ai

DocSimplify.ai is a Lingo.dev–powered workflow that transforms dense PDFs into accessible, multilingual summaries. It combines:

- **pdf2md** for local PDF-to-Markdown extraction.
- **GPT-4o** for simplification and question answering.
- **Lingo.dev SDK** for real-time translations (document outputs + multilingual chat).
- **Lingo.dev CLI / Compiler** for static UI localization driven by `i18n.json`.

This README highlights how the project meets the judging criteria.

---

## 🎯 Why It Matters (Potential Impact)

Legal, medical, and regulatory PDFs are often impenetrable—and rarely localized. DocSimplify.ai lets institutions upload any PDF and instantly:

- produce simplified summaries,
- translate them into 15+ languages,
- let users ask follow-up questions in their native language,
- export PDFs or share links.

Critical information becomes accessible to communities that were previously left behind.

---

## ✨ Creativity & Originality

We use Lingo.dev in **two** complementary ways:

1. **Runtime SDK** (`LingoDotDevEngine`)  
   - Translates the simplified Markdown and the original text for each target language.  
   - Powers `/api/chat` so questions are translated to English, answered via GPT-4o, then localized back to the user’s language.

2. **CLI / Compiler** (`i18n.json` + `lingo.dev run`)  
   - Manages all UI copy in `i18n/en.json`.  
   - Locale switcher fetches `/api/i18n/<locale>` so the entire interface localizes instantly.  
   - Judges can run `lingo.dev run` to create additional locale files; the app will pick them up automatically.

This hybrid approach showcases Lingo.dev’s flexibility beyond a single API surface.

---

## 📚 Learning & Growth

- Implemented a custom client-side i18n provider that loads CLI-generated dictionaries via an API route.
- Built a locale switcher that plays nicely with the CLI pipeline and theme toggle.
- Learned how to orchestrate pdf2md, OpenAI Responses, and Lingo.dev SDK without mocks.
- Added translations for both simplified and “original translation” tabs, showcasing double translation passes per language.

---

## ⚙️ Technical Implementation

### Architecture

```
app/
├─ api/
│  ├─ process/route.ts        # PDF → pdf2md → GPT → Lingo SDK translations
│  ├─ chat/route.ts           # Multilingual chat via Lingo SDK
│  └─ i18n/[locale]/route.ts  # Serves CLI-generated dictionaries
├─ layout.tsx                 # Root shell + providers (Toaster + i18n)
└─ page.tsx                   # Client workflow + locale/theme toggles

src/
├─ components/
│  ├─ i18n/                   # I18n context + locale switcher
│  ├─ workflow/               # Upload, processing indicator, results, chat, share cards
│  └─ ui/                     # Tailwind primitives
├─ lib/
│  ├─ pdf2md.ts               # Buffer to Markdown
│  ├─ llm.ts                  # OpenAI simplification and Q&A
│  ├─ lingo.ts                # Lingo.dev SDK helper
│  ├─ storage.ts              # Session persistence
│  └─ pdf.ts                  # `pdf-lib` export
└─ types/document.ts          # Shared DTOs

i18n/
├─ en.json                    # Source locale
└─ i18n.json                  # CLI configuration (locales/buckets)
```

### Flow

1. **Upload** (client)  
   - PDF + domain + languages.

2. **Process API** (`/api/process`)  
   - `parseDocumentWithPdf2Md` extracts Markdown locally—no vision API.  
   - `simplifyDocumentText` uses OpenAI Responses with JSON Schema.  
   - Lingo.dev SDK translates both the simplified summary and the original text per language.

3. **Results Viewer**  
   - Tabs show Original, Original Translation, Simplified, Simplified Translation.  
   - Download buttons use `createPdfFromText`.

4. **Chat API** (`/api/chat`)  
   - Loads session, translates user question to English (SDK), asks GPT-4o, translates answer back (SDK), and returns both the localized answer and what GPT saw.

5. **Static Localization**  
   - `lingo.dev run` updates `i18n/*.json` + `i18n.lock`.  
   - Locale switcher fetches `/api/i18n/<locale>`; the i18n context re-renders the whole app.

---

## 🖥️ Aesthetics & UX

- Lingo-inspired gradients, Lingo green badge, and card surfaces.  
- Processing indicator shows each subsystem (pdf2md → GPT → Lingo).  
- Locale + theme toggles in the hero.  
- Chat bubble annotations show “LLM received/response” for transparency.  
- Share card exposes PDF export + secure link copy.

---

## 🚀 Setup & Commands

1. **Install**
   ```bash
   npm install
   ```

2. **Environment (`.env.local`)**
   ```
   OPENAI_API_KEY=sk-...
   OPENAI_RESPONSE_MODEL=gpt-4o-mini
   OPENAI_CHAT_MODEL=gpt-4o-mini
   LINGODOTDEV_API_KEY=...
   LINGO_CLI_PATH=lingo
   SESSION_STORAGE_PATH=.temp
   ```

3. **Dev server**
   ```bash
   npm run dev
   ```

4. **Build**
   ```bash
   npm run build && npm start
   ```

5. **Localization workflow**
   ```bash
   lingo.dev run            # Generates locale files per i18n.json
   npm run dev              # Reload and test locale switcher
   ```

---

## ✅ Verification

- `npm run lint`: static analysis.
- Manual: upload a PDF, watch processing indicator, review tabs, download PDFs, change locale + theme, and start multilingual chat.

---

## 📎 References

- [Lingo.dev SDK](https://lingo.dev/en/sdk)  
- [Lingo.dev CLI](https://lingo.dev/en/cli)  
- [pdf2md](https://github.com/opendocsg/pdf2md)  
- [OpenAI Responses API](https://platform.openai.com/docs/guides/text-generation)

DocSimplify.ai brings Lingo.dev’s runtime and compiler workflows together to translate the world’s most intimidating PDFs. Upload a document—and let Lingo handle the rest.
