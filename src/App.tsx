import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  Download,
  FileText,
  Home,
  Library,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react'
import { renderAsync } from 'docx-preview'
import { subjects, type Subject, type Unit } from './data'

type Theme = 'light' | 'dark'

interface SelectedMaterial {
  subject: Subject
  unit: Unit
}

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem('classvault-theme')
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
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
          <span className="reader-filename">{material.unit.fileName}</span>
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
            {!pdfLoaded && <p className="reader-loading" role="status">Loading PDF…</p>}
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

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [query, setQuery] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState<SelectedMaterial | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('classvault-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#0E1116' : '#FAFAF9',
    )
  }, [theme])

  const normalizedQuery = query.trim().toLowerCase()
  const visibleSubjects = useMemo(
    () =>
      subjects.flatMap((subject) => {
        const subjectMatches = subject.name.toLowerCase().includes(normalizedQuery)
        const matchingUnits = subject.units.filter((unit) =>
          `${unit.title} ${unit.fileName}`.toLowerCase().includes(normalizedQuery),
        )

        if (normalizedQuery && !subjectMatches && matchingUnits.length === 0) return []
        return [{
          subject,
          units: normalizedQuery && !subjectMatches ? matchingUnits : subject.units,
        }]
      }),
    [normalizedQuery],
  )

  const unitCount = subjects.reduce((total, subject) => total + subject.units.length, 0)

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="ClassVault home">
          <span className="brand-mark" aria-hidden="true"><BookOpen size={19} /></span>
          <span className="brand-name">Class<span>Vault</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#subjects">Subjects</a>
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

      <main id="home" className="main-content">
        <section className="page-intro" aria-labelledby="page-title">
          <p className="eyebrow">YOUR CLASS NOTES</p>
          <h1 id="page-title">Your course library</h1>
          <p>Find a subject, open your notes, and study at your own pace.</p>
          <div className="library-summary">
            <span>{subjects.length} subjects</span>
            <span aria-hidden="true">·</span>
            <span>{unitCount} units with notes</span>
          </div>
        </section>

        <section className="library-section" id="subjects" aria-labelledby="subjects-heading">
          <div className="section-heading">
            <div>
              <p className="section-kicker">YOUR COURSES</p>
              <h2 id="subjects-heading">Subjects</h2>
            </div>
            <label className="search-box">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search subjects, units, notes..."
                aria-label="Search subjects, units, and notes"
              />
            </label>
          </div>

          {visibleSubjects.length ? (
            <div className="subject-grid">
              {visibleSubjects.map(({ subject, units }) => (
                <article className="subject-card" key={subject.id}>
                  <header className="subject-card-header">
                    <span
                      className="subject-symbol"
                      aria-hidden="true"
                    >
                      <FileText size={19} />
                    </span>
                    <div className="subject-heading">
                      <h3>{subject.name}</h3>
                      <span>{subject.units.length} {subject.units.length === 1 ? 'unit with notes' : 'units with notes'}</span>
                    </div>
                  </header>

                  {units.length ? (
                    <ul className="material-list">
                      {units.map((unit) => (
                        <li className="material-row" key={unit.id}>
                          <div className="material-info">
                            <span className="material-title">{unit.title}</span>
                            <span className="material-filename">{unit.fileName}</span>
                          </div>
                          <div className="material-actions">
                            <button
                              className="read-button"
                              type="button"
                              onClick={() => setSelectedMaterial({ subject, unit })}
                            >
                              <BookOpen size={15} />
                              <span>Read</span>
                            </button>
                            <a
                              className="download-link"
                              href={fileUrl(unit.fileName)}
                              download={unit.fileName}
                              aria-label={`Download ${unit.title}`}
                              title="Download material"
                            >
                              <Download size={17} />
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-subject">
                      {normalizedQuery
                        ? subject.units.length
                          ? 'No matching units in this subject.'
                          : 'This subject has no units yet.'
                        : 'Units and notes for this subject are coming soon.'}
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-search" role="status">
              <p>No subjects or units match “{query}”.</p>
              <button className="clear-search" type="button" onClick={() => setQuery('')}>
                Clear search
              </button>
            </div>
          )}
        </section>

        <footer className="page-footer">
          <span>ClassVault</span>
          <span>Read online or download your notes for later.</span>
        </footer>
      </main>

      <nav className="mobile-tab-bar" aria-label="Main navigation">
        <a href="#home">
          <Home size={20} aria-hidden="true" />
          <span>Home</span>
        </a>
        <a href="#subjects">
          <Library size={20} aria-hidden="true" />
          <span>Subjects</span>
        </a>
      </nav>

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
