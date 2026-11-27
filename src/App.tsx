import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  BookOpen,
  Download,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react'
import { renderAsync } from 'docx-preview'
import { subjects, type Question, type Subject, type Unit } from './mockData'

type Theme = 'light' | 'dark'
type Page = 'home' | 'notes' | 'questions'
type SubjectFilter = 'all' | 'physics' | 'c-programming' | 'bee'

interface SelectedMaterial {
  subject: Subject
  unit: Unit
}

const filters: { id: SubjectFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'physics', label: 'Physics' },
  { id: 'c-programming', label: 'C Programming' },
  { id: 'bee', label: 'BEE' },
]

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem('classvault-theme')
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getPage(): Page {
  if (window.location.pathname === '/notes') return 'notes'
  if (window.location.pathname === '/questions') return 'questions'
  return 'home'
}

function getInitialFilter(): SubjectFilter {
  const subject = new URLSearchParams(window.location.search).get('subject')
  return filters.some((filter) => filter.id === subject)
    ? (subject as SubjectFilter)
    : 'all'
}

function fileUrl(fileName: string) {
  return `/materials/${encodeURIComponent(fileName)}`
}

function DocxPreview({ fileName }: { fileName: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const container = containerRef.current

    async function loadDocument() {
      if (!container) return
      setError('')
      setIsLoading(true)
      container.replaceChildren()

      try {
        const response = await fetch(fileUrl(fileName), { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`The document could not be loaded (HTTP ${response.status}).`)
        }

        const document = await response.arrayBuffer()
        if (!active) return

        await renderAsync(document, container, undefined, {
          breakPages: false,
          ignoreWidth: true,
          renderAltChunks: false,
        })
      } catch (cause) {
        if (!active || controller.signal.aborted) return
        setError(cause instanceof Error ? cause.message : 'The document preview failed.')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadDocument()
    return () => {
      active = false
      controller.abort()
      container?.replaceChildren()
    }
  }, [fileName])

  if (error) {
    return <p className="reader-error" role="alert">{error} You can still download the original file.</p>
  }

  return (
    <div className="docx-reader" aria-busy={isLoading}>
      {isLoading && <p className="reader-loading" role="status">Loading notes…</p>}
      <div className="docx-content" ref={containerRef} />
    </div>
  )
}

function MaterialReader({
  material,
  onClose,
}: {
  material: SelectedMaterial
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const isPdf = material.unit.fileName.toLowerCase().endsWith('.pdf')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      className="reader-dialog"
      ref={dialogRef}
      aria-labelledby="reader-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <header className="reader-header">
        <div className="reader-heading">
          <span className="reader-subject">{material.subject.name}</span>
          <h2 id="reader-title">{material.unit.title}</h2>
        </div>
        <div className="reader-actions">
          <a
            className="download-button"
            href={fileUrl(material.unit.fileName)}
            download={material.unit.fileName}
          >
            <Download size={17} />
            <span>Download</span>
          </a>
          <button className="close-button" type="button" onClick={onClose} aria-label="Close reader">
            <X size={20} />
          </button>
        </div>
      </header>
      <div
        className={`reader-body${isPdf ? ' reader-body-pdf' : ''}`}
        aria-busy={isPdf ? !pdfLoaded : undefined}
      >
        {isPdf ? (
          <>
            {!pdfLoaded && <p className="reader-loading" role="status">Loading notes…</p>}
            <iframe
              className="pdf-frame"
              src={fileUrl(material.unit.fileName)}
              title={`${material.unit.title} PDF`}
              onLoad={() => setPdfLoaded(true)}
            />
          </>
        ) : (
          <DocxPreview fileName={material.unit.fileName} />
        )}
      </div>
    </dialog>
  )
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="search-field">
      <Search size={20} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search notes and questions"
      />
    </label>
  )
}

function FilterChips({
  selected,
  onSelect,
}: {
  selected: SubjectFilter
  onSelect: (filter: SubjectFilter) => void
}) {
  return (
    <div className="filter-chips" aria-label="Filter by subject">
      {filters.map((filter) => (
        <button
          className={`filter-chip${selected === filter.id ? ' is-selected' : ''}`}
          key={filter.id}
          type="button"
          aria-pressed={selected === filter.id}
          onClick={() => onSelect(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

function HomePage() {
  const [query, setQuery] = useState('')
  const [showFirstVisitContent] = useState(() => localStorage.getItem('cv_seen') !== '1')

  useEffect(() => {
    localStorage.setItem('cv_seen', '1')
  }, [])

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const search = query.trim()
    window.location.href = search ? `/notes?q=${encodeURIComponent(search)}` : '/notes'
  }

  return (
    <>
      <main className="home-content">
        <section className="hero" aria-labelledby="home-title">
          <h1 id="home-title">Everything for the next exam. One place.</h1>
          <p className="hero-subhead">AI/DS · Semester 1 · N division</p>
          <form className="hero-search" onSubmit={submitSearch}>
            <Search size={22} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={'Search a topic — "wave optics", "pointers"'}
              aria-label="Search a topic"
            />
            <button type="submit" aria-label="Search">
              <span>Search</span>
            </button>
          </form>
          <div className="hero-actions">
            <a className="primary-button" href="/notes">Open notes</a>
            <a className="secondary-button" href="/questions">Important questions</a>
          </div>
        </section>

        {showFirstVisitContent && (
          <div className="first-visit-content">
            <section className="how-section" aria-labelledby="how-title">
              <h2 id="how-title">How this helps</h2>
              <p>Find notes and questions by subject or topic.</p>
              <p>Review key questions with answers when you need them.</p>
              <p>Open a unit’s notes directly from its questions.</p>
            </section>

            <section className="faq-section" aria-labelledby="faq-title">
              <h2 id="faq-title">Frequently asked questions</h2>
              <details>
                <summary>Where do I find notes for a subject?</summary>
                <p>Open notes and choose a subject filter to browse its units.</p>
              </details>
              <details>
                <summary>Can I search by a topic?</summary>
                <p>Yes. Search notes or questions by topic, unit or subject name.</p>
              </details>
              <details>
                <summary>How do I download a unit?</summary>
                <p>Use the Download button beside a unit on the notes page.</p>
              </details>
              <details>
                <summary>Where can I find answers?</summary>
                <p>Open important questions and choose Show answer on a question.</p>
              </details>
              <details>
                <summary>Can I open notes from a question?</summary>
                <p>Each question unit includes a link to its notes.</p>
              </details>
              <details>
                <summary>Does dark mode stay on?</summary>
                <p>Your theme choice is saved on this device.</p>
              </details>
            </section>
          </div>
        )}
      </main>
    </>
  )
}

function NotesPage({
  query,
  setQuery,
  selectedFilter,
  setSelectedFilter,
  openMaterial,
  selectedUnit,
}: {
  query: string
  setQuery: (value: string) => void
  selectedFilter: SubjectFilter
  setSelectedFilter: (filter: SubjectFilter) => void
  openMaterial: (subject: Subject, unit: Unit) => void
  selectedUnit: string | null
}) {
  const normalizedQuery = query.trim().toLowerCase()
  const visibleSubjects = useMemo(
    () =>
      subjects.flatMap((subject) => {
        if (selectedFilter !== 'all' && subject.id !== selectedFilter) return []
        const matchingUnits = subject.units.filter((unit) =>
          (!selectedUnit || unit.id === selectedUnit) &&
          `${subject.name} ${unit.title} ${unit.fileName}`.toLowerCase().includes(normalizedQuery),
        )
        return matchingUnits.length ? [{ subject, units: matchingUnits }] : []
      }),
    [normalizedQuery, selectedFilter, selectedUnit],
  )

  return (
    <main className="content-page">
      <div className="page-heading">
        <p className="page-eyebrow">Study materials</p>
        <h1>Notes</h1>
        <p>Browse notes by subject or find a unit by name.</p>
      </div>
      <div className="page-tools">
        <SearchField value={query} onChange={setQuery} placeholder="Search notes" />
        <FilterChips selected={selectedFilter} onSelect={setSelectedFilter} />
      </div>
      <div className="group-list">
        {visibleSubjects.map(({ subject, units }) => (
          <section className="subject-group" key={subject.id} aria-labelledby={`notes-${subject.id}`}>
            <div className="group-heading">
              <h2 id={`notes-${subject.id}`}>{subject.name}</h2>
              <span>{units.length} {units.length === 1 ? 'unit' : 'units'}</span>
            </div>
            <div className="unit-list">
              {units.map((unit) => (
                <article className="notes-unit-row" key={unit.id}>
                  <div className="unit-details">
                    <h3>{unit.title}</h3>
                    <span>{unit.pageCount} pages</span>
                    <a
                      className="unit-cross-link"
                      href={`/questions?subject=${encodeURIComponent(subject.id)}&unit=${encodeURIComponent(unit.id)}`}
                    >
                      Questions from this unit <span aria-hidden="true">→</span>
                    </a>
                  </div>
                  <div className="unit-actions">
                    <button className="small-primary-button" type="button" onClick={() => openMaterial(subject, unit)}>
                      Open
                    </button>
                    <a
                      className="small-secondary-button"
                      href={fileUrl(unit.fileName)}
                      download={unit.fileName}
                    >
                      <Download size={16} aria-hidden="true" />
                      Download
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
        {visibleSubjects.length === 0 && (
          <p className="empty-state" role="status">No notes match this search.</p>
        )}
      </div>
    </main>
  )
}

function AnswerToggle({ question }: { question: Question }) {
  const [isOpen, setIsOpen] = useState(false)
  const answerId = `answer-${question.id}`
  return (
    <div className="answer-control">
      <button
        className="answer-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? 'Hide answer' : 'Show answer'}
      </button>
      {isOpen && <p className="answer-text" id={answerId}>{question.answer}</p>}
    </div>
  )
}

function PriorityDots({ priority }: { priority: Question['priority'] }) {
  return (
    <span className="priority-dots" aria-label={`Priority ${priority}`}>
      {[1, 2, 3].map((dot) => (
        <span className={dot <= priority ? 'dot is-filled' : 'dot'} key={dot} aria-hidden="true" />
      ))}
    </span>
  )
}

function QuestionsPage({
  query,
  setQuery,
  selectedFilter,
  setSelectedFilter,
  selectedUnit,
}: {
  query: string
  setQuery: (value: string) => void
  selectedFilter: SubjectFilter
  setSelectedFilter: (filter: SubjectFilter) => void
  selectedUnit: string | null
}) {
  const normalizedQuery = query.trim().toLowerCase()
  const visibleSubjects = useMemo(
    () =>
      subjects.flatMap((subject) => {
        if (selectedFilter !== 'all' && subject.id !== selectedFilter) return []
        let units = subject.units
        if (selectedUnit) units = units.filter((unit) => unit.id === selectedUnit)
        const matchingUnits = units.flatMap((unit) => {
          const questions = unit.questions.filter((question) =>
            `${subject.name} ${unit.title} ${question.text} ${question.answer}`.toLowerCase().includes(normalizedQuery),
          )
          return questions.length ? [{ ...unit, questions }] : []
        })
        return matchingUnits.length ? [{ subject, units: matchingUnits }] : []
      }),
    [normalizedQuery, selectedFilter, selectedUnit],
  )

  return (
    <main className="content-page">
      <div className="page-heading">
        <p className="page-eyebrow">Practice and review</p>
        <h1>Important questions</h1>
        <p>Questions are grouped by subject and unit. Answers stay hidden until you open them.</p>
      </div>
      <div className="page-tools">
        <SearchField value={query} onChange={setQuery} placeholder="Search questions" />
        <FilterChips selected={selectedFilter} onSelect={setSelectedFilter} />
      </div>
      <div className="group-list">
        {visibleSubjects.map(({ subject, units }) => (
          <section className="subject-group" key={subject.id} aria-labelledby={`questions-${subject.id}`}>
            <div className="group-heading">
              <h2 id={`questions-${subject.id}`}>{subject.name}</h2>
            </div>
            {units.map((unit) => (
              <section className="question-unit" key={unit.id} aria-labelledby={`unit-${unit.id}`}>
                <h3 id={`unit-${unit.id}`}>{unit.title}</h3>
                <div className="question-list">
                  {unit.questions.map((question) => (
                    <article className="question-row" key={question.id}>
                      <PriorityDots priority={question.priority} />
                      <div className="question-content">
                        <p className="question-text">{question.text}</p>
                        <span className="question-marks">{question.marks} {question.marks === 1 ? 'mark' : 'marks'}</span>
                        <AnswerToggle question={question} />
                      </div>
                    </article>
                  ))}
                </div>
                <a
                  className="unit-cross-link notes-cross-link"
                  href={`/notes?subject=${encodeURIComponent(subject.id)}&unit=${encodeURIComponent(unit.id)}`}
                >
                  Read the notes for this unit <span aria-hidden="true">→</span>
                </a>
              </section>
            ))}
          </section>
        ))}
        {visibleSubjects.length === 0 && (
          <p className="empty-state" role="status">
            {selectedUnit ? 'No questions match this unit and search.' : 'No questions match this search.'}
          </p>
        )}
      </div>
    </main>
  )
}

function App() {
  const page = getPage()
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') ?? '')
  const [selectedFilter, setSelectedFilter] = useState<SubjectFilter>(getInitialFilter)
  const [selectedMaterial, setSelectedMaterial] = useState<SelectedMaterial | null>(null)
  const selectedUnit = new URLSearchParams(window.location.search).get('unit')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('classvault-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#292521' : '#f7f4ee',
    )
  }, [theme])

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="ClassVault home">
          <span className="brand-mark" aria-hidden="true"><BookOpen size={19} /></span>
          <span className="brand-name">ClassVault</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/notes">Notes</a>
          <a href="/questions">Questions</a>
        </nav>
        <button
          className="theme-toggle"
          type="button"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
        </button>
      </header>

      {page === 'home' && <HomePage />}
      {page === 'notes' && (
        <NotesPage
          query={query}
          setQuery={setQuery}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          openMaterial={(subject, unit) => setSelectedMaterial({ subject, unit })}
          selectedUnit={selectedUnit}
        />
      )}
      {page === 'questions' && (
        <QuestionsPage
          query={query}
          setQuery={setQuery}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          selectedUnit={selectedUnit}
        />
      )}

      <footer className="page-footer">
        <span>ClassVault</span>
        <span>Notes and questions for your next study session.</span>
      </footer>

      {selectedMaterial && (
        <MaterialReader
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
        />
      )}
    </div>
  )
}

export default App
