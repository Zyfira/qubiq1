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
