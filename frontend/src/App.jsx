
import React, { useEffect, useState } from 'react'
import {
  BookOpen, BrainCircuit, ChartNoAxesCombined, ClipboardList, LogOut,
  Plus, Sparkles, Upload, X, FileText, WandSparkles, Trash2, RefreshCw
} from 'lucide-react'
import { api, token } from './api'

const initialQuestions = [{
  prompt: 'Which data structure follows FIFO?',
  options: ['Stack', 'Queue', 'Tree', 'Graph'],
  correctOption: 1,
  marks: 1
}]

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('qubiq_user'))
    } catch {
      return null
    }
  })

  const [view, setView] = useState('overview')
  const [quizzes, setQuizzes] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [busy, setBusy] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'STUDENT'
  })

  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    questions: initialQuestions
  })

  const [attemptAnswers, setAttemptAnswers] = useState({})
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)

  const [pdfSettings, setPdfSettings] = useState({
    questionCount: 10,
    difficulty: 'MEDIUM'
  })

  const [generatedQuiz, setGeneratedQuiz] = useState(null)

  const isTeacher = user &&
    (user.role === 'TEACHER' || user.role === 'ADMIN')

  async function load() {
    try {
      const q = await api('/quizzes')
      setQuizzes(q)

      if (user && (user.role === 'TEACHER' || user.role === 'ADMIN')) {
        try {
          setAnalytics(await api('/analytics/overview'))
        } catch {}
      }
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    if (token() && user) load()
  }, [])

  async function auth(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')

    try {
      const data = await api(`/auth/${authMode}`, {
        method: 'POST',
        body: JSON.stringify(form)
      })

      localStorage.setItem('qubiq_token', data.token)
      localStorage.setItem('qubiq_user', JSON.stringify(data.user))
      setUser(data.user)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  function logout() {
    localStorage.removeItem('qubiq_token')
    localStorage.removeItem('qubiq_user')
    setUser(null)
    setQuizzes([])
    setAnalytics(null)
    setGeneratedQuiz(null)
  }

  async function createQuiz(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')

    try {
      await api('/quizzes', {
        method: 'POST',
        body: JSON.stringify(quiz)
      })

      setShowCreate(false)
      setQuiz({
        title: '',
        description: '',
        questions: initialQuestions
      })

      await load()
      setSuccess('Quiz published successfully.')
      setView('quizzes')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  // Upload PDF and generate quiz automatically
  async function generateQuiz() {
    if (!pdfFile) {
      setError('Choose a PDF before generating a quiz.')
      return
    }

    setPdfBusy(true)
    setError('')
    setSuccess('')
    setGeneratedQuiz(null)

    try {
      const fd = new FormData()
      fd.append('file', pdfFile)
      fd.append('questionCount', String(pdfSettings.questionCount))
      fd.append('difficulty', pdfSettings.difficulty)

      const draft = await api('/documents/generate-quiz', {
        method: 'POST',
        body: fd
      })

      if (!draft.questions?.length) {
        throw new Error('No questions were generated. Try another PDF.')
      }

      setGeneratedQuiz(draft)
      setSuccess(
        `Generated ${draft.questions.length} questions. Review them before publishing.`
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setPdfBusy(false)
    }
  }

  function updateDraftQuestion(index, field, value) {
    setGeneratedQuiz(current => ({
      ...current,
      questions: current.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    }))
  }

  function updateDraftOption(qIndex, optionIndex, value) {
    setGeneratedQuiz(current => ({
      ...current,
      questions: current.questions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === optionIndex ? value : o
              )
            }
          : q
      )
    }))
  }

  function removeDraftQuestion(index) {
    setGeneratedQuiz(current => ({
      ...current,
      questions: current.questions.filter((_, i) => i !== index)
    }))
  }

  async function publishGeneratedQuiz() {
    if (!generatedQuiz?.questions?.length) {
      setError('Add at least one question before publishing.')
      return
    }

    setBusy(true)
    setError('')
    setSuccess('')

    try {
      await api('/quizzes', {
        method: 'POST',
        body: JSON.stringify(generatedQuiz)
      })

      setGeneratedQuiz(null)
      setPdfFile(null)

      const input = document.getElementById('pdf-upload-input')
      if (input) input.value = ''

      await load()
      setSuccess('Your AI-generated quiz is now published.')
      setView('quizzes')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function submitAttempt() {
    try {
      const result = await api(
        `/quizzes/${activeQuiz.id}/attempts`,
        {
          method: 'POST',
          body: JSON.stringify({ answers: attemptAnswers })
        }
      )

      alert(`Submitted! Your score: ${result.score}/${result.totalMarks}`)
      setActiveQuiz(null)
      setAttemptAnswers({})
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  if (!user) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="brand">
            <div className="brand-mark">Q</div>
            <span>qubiq</span>
          </div>

          <p className="eyebrow">SMART ASSESSMENT PLATFORM</p>

          <h1>
            {authMode === 'login'
              ? 'Welcome back.'
              : 'Create your account.'}
          </h1>

          <p className="muted">
            Learn. Assess. Improve. One quiz at a time.
          </p>

          <form onSubmit={auth} className="stack">
            {authMode === 'register' && (
              <label>
                Full name
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({
                    ...form,
                    name: e.target.value
                  })}
                  placeholder="Your name"
                />
              </label>
            )}

            <label>
              Email address
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm({
                  ...form,
                  email: e.target.value
                })}
                placeholder="you@example.com"
              />
            </label>

            <label>
              Password
              <input
                required
                minLength="8"
                type="password"
                value={form.password}
                onChange={e => setForm({
                  ...form,
                  password: e.target.value
                })}
                placeholder="At least 8 characters"
              />
            </label>

            {authMode === 'register' && (
              <label>
                Account type
                <select
                  value={form.role}
                  onChange={e => setForm({
                    ...form,
                    role: e.target.value
                  })}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">
                    Teacher (requires admin approval)
                  </option>
                </select>
              </label>
            )}

            <button className="primary" disabled={busy}>
              {busy
                ? 'Please wait…'
                : authMode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
            </button>
          </form>

          {error && <p className="error">{error}</p>}

          <p className="switch">
            {authMode === 'login'
              ? 'New to Qubiq?'
              : 'Already have an account?'}

            <button
              className="link"
              onClick={() => {
                setAuthMode(
                  authMode === 'login' ? 'register' : 'login'
                )
                setError('')
              }}
            >
              {authMode === 'login'
                ? 'Create an account'
                : 'Sign in'}
            </button>
          </p>

          <p className="tiny">
            Any valid email address is accepted. Teacher accounts
            become active after admin approval.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">Q</div>
          <span>qubiq</span>
        </div>

        <div className="workspace">
          <span className="avatar">
            {user.name?.[0]?.toUpperCase()}
          </span>
          <div>
            <b>{user.name}</b>
            <small>{user.role}</small>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav>
          <button
            className={view === 'overview' ? 'active' : ''}
            onClick={() => setView('overview')}
          >
            <ChartNoAxesCombined /> Overview
          </button>

          <button
            className={view === 'quizzes' ? 'active' : ''}
            onClick={() => setView('quizzes')}
          >
            <BookOpen />
            {isTeacher ? 'My quizzes' : 'Explore quizzes'}
          </button>

          {isTeacher && (
            <button
              className={view === 'analytics' ? 'active' : ''}
              onClick={() => setView('analytics')}
            >
              <ChartNoAxesCombined /> Analytics
            </button>
          )}

          {isTeacher && (
            <button
              className={view === 'materials' ? 'active' : ''}
              onClick={() => setView('materials')}
            >
              <Upload /> PDF to Quiz AI
            </button>
          )}
        </nav>

        <div className="sidebar-bottom">
          <button onClick={logout}>
            <LogOut /> Sign out
          </button>
          <small>Qubiq · AI Quiz Studio</small>
        </div>
      </aside>

      <main className="main">
        <header>
          <div>
            <p className="eyebrow">YOUR LEARNING SPACE</p>
            <h1>
              {view === 'overview'
                ? 'Overview'
                : view === 'quizzes'
                  ? 'Quizzes'
                  : view === 'analytics'
                    ? 'Analytics'
                    : 'PDF to Quiz AI'}
            </h1>
          </div>

          <div className="header-right">
            <span className="role-pill">{user.role}</span>

            {isTeacher && (
              <button
                className="primary small"
                onClick={() => setShowCreate(true)}
              >
                <Plus size={16} /> Manual quiz
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="notice">
            {error}
            <button onClick={() => setError('')}>
              <X size={15} />
            </button>
          </div>
        )}

        {success && (
          <div className="success-notice">
            {success}
            <button onClick={() => setSuccess('')}>
              <X size={15} />
            </button>
          </div>
        )}

        {view === 'overview' && (
          <>
            <section className="hero">
              <div>
                <p className="eyebrow light">WELCOME TO QUBIQ</p>
                <h2>
                  Make every assessment
                  <br />
                  a little more meaningful.
                </h2>
                <p>
                  Build knowledge, measure progress, and turn insights into action.
                </p>
              </div>
              <div className="hero-icon">
                <BrainCircuit size={76} />
                <Sparkles size={24} />
              </div>
            </section>

            <div className="stats">
              {(isTeacher
                ? [
                    ['Quizzes', quizzes.length],
                    ['Attempts', analytics?.totalAttempts ?? '—'],
                    [
                      'Average score',
                      analytics
                        ? `${Math.round(analytics.averageScore)}%`
                        : '—'
                    ]
                  ]
                : [
                    ['Available quizzes', quizzes.length],
                    ['Your role', 'Student'],
                    ['Learning mode', 'Active']
                  ]
              ).map(([a, b]) => (
                <div className="stat" key={a}>
                  <span>{a}</span>
                  <strong>{b}</strong>
                </div>
              ))}
            </div>

            <section className="section-head">
              <div>
                <p className="eyebrow">KEEP MOVING</p>
                <h2>
                  {isTeacher
                    ? 'Your recent quizzes'
                    : 'Available quizzes'}
                </h2>
              </div>

              <button
                className="text-button"
                onClick={() => setView('quizzes')}
              >
                View all →
              </button>
            </section>

            <QuizGrid
              quizzes={quizzes}
              isTeacher={isTeacher}
              onStart={setActiveQuiz}
            />
          </>
        )}

        {view === 'quizzes' && (
          <>
            <section className="section-head">
              <div>
                <p className="eyebrow">ASSESSMENT LIBRARY</p>
                <h2>
                  {isTeacher
                    ? 'Manage your quizzes'
                    : 'Pick up where you left off'}
                </h2>
              </div>
            </section>

            <QuizGrid
              quizzes={quizzes}
              isTeacher={isTeacher}
              onStart={setActiveQuiz}
            />
          </>
        )}

        {view === 'analytics' && isTeacher && (
          <>
            <div className="stats">
              {[
                ['Total attempts', analytics?.totalAttempts ?? 0],
                [
                  'Average score',
                  `${Math.round(analytics?.averageScore ?? 0)}%`
                ],
                ['Quizzes', analytics?.quizCount ?? 0]
              ].map(([a, b]) => (
                <div className="stat" key={a}>
                  <span>{a}</span>
                  <strong>{b}</strong>
                </div>
              ))}
            </div>

            <section className="panel">
              <h2>Performance insights</h2>
              <p className="muted">
                Analytics are limited to quizzes you own.
                Admin accounts can see platform-wide totals.
              </p>

              <div className="insight">
                <ChartNoAxesCombined />
                <div>
                  <b>Assessment activity</b>
                  <p>
                    {analytics?.totalAttempts ?? 0} attempts recorded
                    across {analytics?.quizCount ?? 0} quizzes.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {view === 'materials' && isTeacher && (
          <div className="ai-studio">
            <section className="ai-intro">
              <div className="ai-icon">
                <WandSparkles size={27} />
              </div>

              <p className="eyebrow">QUBIQ AI QUIZ STUDIO</p>
              <h2>Turn your PDF into a quiz.</h2>
              <p>
                Upload study material and let AI create multiple-choice
                questions grounded in the document. Review the draft,
                make edits, and publish when you're ready.
              </p>
            </section>

            <section className="panel generator-panel">
              <h3>
                <FileText size={19} /> 1. Upload study material
              </h3>

              <label className="upload ai-upload">
                <Upload size={27} />

                <b>
                  {pdfFile
                    ? pdfFile.name
                    : 'Choose a PDF file'}
                </b>

                <span>
                  {pdfFile
                    ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB · Ready to process`
                    : 'PDF only · Maximum 10 MB'}
                </span>

                <input
                  id="pdf-upload-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={e => {
                    const file = e.target.files?.[0] || null
                    setPdfFile(file)
                    setGeneratedQuiz(null)
                    setError('')
                    setSuccess('')
                  }}
                />
              </label>

              <div className="generator-controls">
                <label>
                  Number of questions
                  <select
                    value={pdfSettings.questionCount}
                    onChange={e => setPdfSettings({
                      ...pdfSettings,
                      questionCount: Number(e.target.value)
                    })}
                  >
                    {[5, 10, 15, 20].map(n => (
                      <option key={n} value={n}>
                        {n} questions
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Difficulty
                  <select
                    value={pdfSettings.difficulty}
                    onChange={e => setPdfSettings({
                      ...pdfSettings,
                      difficulty: e.target.value
                    })}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </label>
              </div>

              <button
                className="primary generate-button"
                onClick={generateQuiz}
                disabled={!pdfFile || pdfBusy}
              >
                {pdfBusy ? (
                  <>
                    <RefreshCw className="spin" size={17} />
                    Reading PDF and generating…
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Generate quiz with AI
                  </>
                )}
              </button>

              <p className="tiny ai-footnote">
                Your PDF is processed by the Qubiq backend and sent
                to Gemini to generate the draft. It is not permanently
                stored by this feature.
              </p>
            </section>

            {generatedQuiz && (
              <section className="panel draft-panel">
                <div className="draft-header">
                  <div>
                    <p className="eyebrow">AI-GENERATED DRAFT</p>
                    <h2>2. Review your questions</h2>
                    <p className="muted">
                      {generatedQuiz.questions.length} questions ·
                      Edit any field before publishing.
                    </p>
                  </div>

                  <span className="draft-count">
                    {generatedQuiz.questions.length} Qs
                  </span>
                </div>

                <div className="stack draft-fields">
                  <label>
                    Quiz title
                    <input
                      value={generatedQuiz.title}
                      onChange={e => setGeneratedQuiz({
                        ...generatedQuiz,
                        title: e.target.value
                      })}
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      value={generatedQuiz.description}
                      onChange={e => setGeneratedQuiz({
                        ...generatedQuiz,
                        description: e.target.value
                      })}
                    />
                  </label>
                </div>

                {generatedQuiz.questions.map((q, i) => (
                  <article className="draft-question" key={i}>
                    <div className="draft-question-top">
                      <b>Question {i + 1}</b>

                      <button
                        className="remove-question"
                        onClick={() => removeDraftQuestion(i)}
                        title="Remove question"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <label>
                      Question text
                      <textarea
                        value={q.prompt}
                        onChange={e => updateDraftQuestion(
                          i, 'prompt', e.target.value
                        )}
                      />
                    </label>

                    <div className="draft-options">
                      {q.options.map((option, j) => (
                        <label key={j}>
                          Option {j + 1}
                          <input
                            value={option}
                            onChange={e => updateDraftOption(
                              i, j, e.target.value
                            )}
                          />
                        </label>
                      ))}
                    </div>

                    <label>
                      Correct answer
                      <select
                        value={q.correctOption}
                        onChange={e => updateDraftQuestion(
                          i, 'correctOption', Number(e.target.value)
                        )}
                      >
                        {q.options.map((option, j) => (
                          <option key={j} value={j}>
                            {String.fromCharCode(65 + j)} · {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </article>
                ))}

                <button
                  className="primary publish-button"
                  disabled={busy}
                  onClick={publishGeneratedQuiz}
                >
                  {busy ? 'Publishing…' : 'Publish quiz'}
                </button>
              </section>
            )}
          </div>
        )}
      </main>

      {showCreate && (
        <div className="modal-backdrop">
          <form className="modal stack" onSubmit={createQuiz}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">NEW ASSESSMENT</p>
                <h2>Create a manual quiz</h2>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setShowCreate(false)}
              >
                <X />
              </button>
            </div>

            <label>
              Quiz title
              <input
                required
                value={quiz.title}
                onChange={e => setQuiz({
                  ...quiz,
                  title: e.target.value
                })}
              />
            </label>

            <label>
              Description
              <textarea
                value={quiz.description}
                onChange={e => setQuiz({
                  ...quiz,
                  description: e.target.value
                })}
              />
            </label>

            <label>
              Question
              <input
                required
                value={quiz.questions[0].prompt}
                onChange={e => setQuiz({
                  ...quiz,
                  questions: [{
                    ...quiz.questions[0],
                    prompt: e.target.value
                  }]
                })}
              />
            </label>

            {quiz.questions[0].options.map((o, i) => (
              <label key={i}>
                Option {i + 1}
                <input
                  value={o}
                  onChange={e => setQuiz({
                    ...quiz,
                    questions: [{
                      ...quiz.questions[0],
                      options: quiz.questions[0].options.map(
                        (v, j) => i === j ? e.target.value : v
                      )
                    }]
                  })}
                />
              </label>
            ))}

            <label>
              Correct option
              <select
                value={quiz.questions[0].correctOption}
                onChange={e => setQuiz({
                  ...quiz,
                  questions: [{
                    ...quiz.questions[0],
                    correctOption: Number(e.target.value)
                  }]
                })}
              >
                {quiz.questions[0].options.map((o, i) => (
                  <option value={i} key={i}>{o}</option>
                ))}
              </select>
            </label>

            <button className="primary" disabled={busy}>
              Publish quiz
            </button>
          </form>
        </div>
      )}

      {activeQuiz && (
        <div className="modal-backdrop">
          <div className="modal stack">
            <div className="modal-head">
              <div>
                <p className="eyebrow">QUIZ IN PROGRESS</p>
                <h2>{activeQuiz.title}</h2>
              </div>

              <button
                className="icon-button"
                onClick={() => setActiveQuiz(null)}
              >
                <X />
              </button>
            </div>

            {activeQuiz.questions?.map((q, i) => (
              <div className="question" key={q.id || i}>
                <b>{i + 1}. {q.prompt}</b>

                {q.options.map((o, j) => (
                  <label className="choice" key={j}>
                    <input
                      type="radio"
                      name={`q${i}`}
                      checked={attemptAnswers[i] === j}
                      onChange={() => setAttemptAnswers({
                        ...attemptAnswers,
                        [i]: j
                      })}
                    />
                    {o}
                  </label>
                ))}
              </div>
            ))}

            <button className="primary" onClick={submitAttempt}>
              Submit answers
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function QuizGrid({ quizzes, isTeacher, onStart }) {
  if (!quizzes?.length) {
    return (
      <div className="empty">
        <div className="empty-icon"><ClipboardList /></div>
        <h3>No quizzes yet</h3>
        <p>
          {isTeacher
            ? 'Create your first quiz to get started.'
            : 'Your teacher has not published any quizzes yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="quiz-grid">
      {quizzes.map(q => (
        <article className="quiz-card" key={q.id}>
          <div className="quiz-symbol"><BookOpen /></div>
          <span className="quiz-tag">ASSESSMENT</span>
          <h3>{q.title}</h3>
          <p>
            {q.description ||
              'Test your understanding and track your progress.'}
          </p>

          <div className="quiz-meta">
            <span>{q.questions?.length || 0} questions</span>
            <button onClick={() => onStart(q)}>
              {isTeacher ? 'Preview' : 'Start quiz'} →
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default App
