import React, {useEffect, useState} from 'react'
import {BookOpen, BrainCircuit, ChartNoAxesCombined, ClipboardList, GraduationCap, LogOut, Plus, ShieldCheck, Sparkles, Users, Upload, X} from 'lucide-react'
import {api, token} from './api'

const initialQuestions = [{prompt:'Which data structure follows FIFO?',options:['Stack','Queue','Tree','Graph'],correctOption:1,marks:1}]
function App(){
  const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('qubiq_user'))}catch{return null}})
  const [view,setView]=useState('overview'), [quizzes,setQuizzes]=useState([]), [analytics,setAnalytics]=useState(null)
  const [busy,setBusy]=useState(false), [error,setError]=useState(''), [showCreate,setShowCreate]=useState(false)
  const [authMode,setAuthMode]=useState('login')
  const [form,setForm]=useState({name:'',email:'',password:'',role:'STUDENT'})
  const [quiz,setQuiz]=useState({title:'',description:'',questions:initialQuestions})
  const [attemptAnswers,setAttemptAnswers]=useState({})
  const [activeQuiz,setActiveQuiz]=useState(null)
  const [pdfPreview,setPdfPreview]=useState('')
  const isTeacher = user && (user.role==='TEACHER'||user.role==='ADMIN')
  async function load(){
    try{
      const q=await api('/quizzes'); setQuizzes(q)
      if(isTeacher){try{setAnalytics(await api('/analytics/overview'))}catch{}}
    }catch(e){setError(e.message)}
  }
  useEffect(()=>{if(token()&&user)load()},[])
  async function auth(e){
    e.preventDefault();setBusy(true);setError('')
    try{
      const data=await api(`/auth/${authMode}`,{method:'POST',body:JSON.stringify(form)})
      localStorage.setItem('qubiq_token',data.token);localStorage.setItem('qubiq_user',JSON.stringify(data.user));setUser(data.user);await load()
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }
  function logout(){localStorage.clear();setUser(null);setQuizzes([]);setAnalytics(null)}
  async function createQuiz(e){
    e.preventDefault();setBusy(true);setError('')
    try{await api('/quizzes',{method:'POST',body:JSON.stringify(quiz)});setShowCreate(false);setQuiz({title:'',description:'',questions:initialQuestions});await load()}
    catch(e){setError(e.message)}finally{setBusy(false)}
  }
  async function submitAttempt(){
    try{const result=await api(`/quizzes/${activeQuiz.id}/attempts`,{method:'POST',body:JSON.stringify({answers:attemptAnswers})});alert(`Submitted! Your score: ${result.score}/${result.totalMarks}`);setActiveQuiz(null);setAttemptAnswers({});await load()}
    catch(e){setError(e.message)}
  }
  async function uploadPdf(e){
    const file=e.target.files?.[0];if(!file)return
    const fd=new FormData();fd.append('file',file)
    try{const r=await api('/documents/preview',{method:'POST',body:fd});setPdfPreview(r.text||'No text found in PDF.')}
    catch(e){setError(e.message)}
  }
  if(!user)return <div className="auth-shell"><div className="auth-card"><div className="brand"><div className="brand-mark">Q</div><span>qubiq</span></div><p className="eyebrow">SMART ASSESSMENT PLATFORM</p><h1>{authMode==='login'?'Welcome back.':'Create your account.'}</h1><p className="muted">Learn. Assess. Improve. One quiz at a time.</p>
    <form onSubmit={auth} className="stack">{authMode==='register'&&<label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label>}<label>Email address<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input required minLength="8" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 8 characters"/></label>{authMode==='register'&&<label>Account type<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="STUDENT">Student</option><option value="TEACHER">Teacher (requires admin approval)</option></select></label>}<button className="primary" disabled={busy}>{busy?'Please wait…':authMode==='login'?'Sign in':'Create account'}</button></form>
    {error&&<p className="error">{error}</p>}<p className="switch">{authMode==='login'?"New to Qubiq?":"Already have an account?"} <button className="link" onClick={()=>{setAuthMode(authMode==='login'?'register':'login');setError('')}}>{authMode==='login'?'Create an account':'Sign in'}</button></p><p className="tiny">Any valid email address is accepted. Teacher accounts become active after admin approval.</p></div></div>
  return <div className="app"><aside className="sidebar"><div className="brand"><div className="brand-mark">Q</div><span>qubiq</span></div><div className="workspace"><span className="avatar">{user.name?.[0]?.toUpperCase()}</span><div><b>{user.name}</b><small>{user.role}</small></div></div><p className="nav-label">WORKSPACE</p><nav><button className={view==='overview'?'active':''} onClick={()=>setView('overview')}><ChartNoAxesCombined/> Overview</button><button className={view==='quizzes'?'active':''} onClick={()=>setView('quizzes')}><BookOpen/> {isTeacher?'My quizzes':'Explore quizzes'}</button>{isTeacher&&<button className={view==='analytics'?'active':''} onClick={()=>setView('analytics')}><ChartNoAxesCombined/> Analytics</button>}{isTeacher&&<button className={view==='materials'?'active':''} onClick={()=>setView('materials')}><Upload/> PDF materials</button>}</nav><div className="sidebar-bottom"><button onClick={logout}><LogOut/> Sign out</button><small>Qubiq · MVP</small></div></aside>
  <main className="main"><header><div><p className="eyebrow">YOUR LEARNING SPACE</p><h1>{view==='overview'?'Overview':view==='quizzes'?'Quizzes':view==='analytics'?'Analytics':'PDF materials'}</h1></div><div className="header-right"><span className="role-pill">{user.role}</span>{isTeacher&&<button className="primary small" onClick={()=>setShowCreate(true)}><Plus size={16}/> Create quiz</button>}</div></header>
  {error&&<div className="notice">{error}<button onClick={()=>setError('')}><X size={15}/></button></div>}
  {view==='overview'&&<><section className="hero"><div><p className="eyebrow light">WELCOME TO QUBIQ</p><h2>Make every assessment<br/>a little more meaningful.</h2><p>Build knowledge, measure progress, and turn insights into action.</p></div><div className="hero-icon"><BrainCircuit size={76}/><Sparkles size={24}/></div></section><div className="stats">{(isTeacher?[['Quizzes',quizzes.length],['Attempts',analytics?.totalAttempts??'—'],['Average score',analytics?`${Math.round(analytics.averageScore)}%`:'—']]:[['Available quizzes',quizzes.length],['Your role','Student'],['Learning mode','Active']]).map(([a,b])=><div className="stat" key={a}><span>{a}</span><strong>{b}</strong></div>)}</div><section className="section-head"><div><p className="eyebrow">KEEP MOVING</p><h2>{isTeacher?'Your recent quizzes':'Available quizzes'}</h2></div><button className="text-button" onClick={()=>setView('quizzes')}>View all →</button></section><QuizGrid quizzes={quizzes} isTeacher={isTeacher} onStart={setActiveQuiz}/></>}
  {view==='quizzes'&&<><section className="section-head"><div><p className="eyebrow">ASSESSMENT LIBRARY</p><h2>{isTeacher?'Manage your quizzes':'Pick up where you left off'}</h2></div></section><QuizGrid quizzes={quizzes} isTeacher={isTeacher} onStart={setActiveQuiz}/></>}
  {view==='analytics'&&isTeacher&&<><div className="stats">{[['Total attempts',analytics?.totalAttempts??0],['Average score',`${Math.round(analytics?.averageScore??0)}%`],['Quizzes',analytics?.quizCount??0]].map(([a,b])=><div className="stat" key={a}><span>{a}</span><strong>{b}</strong></div>)}</div><section className="panel"><h2>Performance insights</h2><p className="muted">Analytics are limited to quizzes you own. Admin accounts can see platform-wide totals.</p><div className="insight"><ChartNoAxesCombined/><div><b>Assessment activity</b><p>{analytics?.totalAttempts??0} attempts recorded across {analytics?.quizCount??0} quizzes.</p></div></div></section></>}
  {view==='materials'&&isTeacher&&<section className="panel"><h2>Turn learning materials into quiz drafts</h2><p className="muted">Upload a PDF to extract its text. You can review the extracted content before creating questions.</p><label className="upload"><Upload/><b>Choose a PDF file</b><span>PDF up to 10 MB</span><input type="file" accept="application/pdf" onChange={uploadPdf}/></label>{pdfPreview&&<pre className="preview">{pdfPreview}</pre>}</section>}
  </main>
  {showCreate&&<div className="modal-backdrop"><form className="modal stack" onSubmit={createQuiz}><div className="modal-head"><div><p className="eyebrow">NEW ASSESSMENT</p><h2>Create a quiz</h2></div><button type="button" className="icon-button" onClick={()=>setShowCreate(false)}><X/></button></div><label>Quiz title<input required value={quiz.title} onChange={e=>setQuiz({...quiz,title:e.target.value})}/></label><label>Description<textarea value={quiz.description} onChange={e=>setQuiz({...quiz,description:e.target.value})}/></label><label>Question<input required value={quiz.questions[0].prompt} onChange={e=>setQuiz({...quiz,questions:[{...quiz.questions[0],prompt:e.target.value}]})}/></label>{quiz.questions[0].options.map((o,i)=><label>Option {i+1}<input value={o} onChange={e=>setQuiz({...quiz,questions:[{...quiz.questions[0],options:quiz.questions[0].options.map((v,j)=>i===j?e.target.value:v)}]})}/></label>)}<label>Correct option<select value={quiz.questions[0].correctOption} onChange={e=>setQuiz({...quiz,questions:[{...quiz.questions[0],correctOption:Number(e.target.value)}]})}>{quiz.questions[0].options.map((o,i)=><option value={i}>{o}</option>)}</select></label><button className="primary" disabled={busy}>Publish quiz</button></form></div>}
  {activeQuiz&&<div className="modal-backdrop"><div className="modal stack"><div className="modal-head"><div><p className="eyebrow">QUIZ IN PROGRESS</p><h2>{activeQuiz.title}</h2></div><button className="icon-button" onClick={()=>setActiveQuiz(null)}><X/></button></div>{activeQuiz.questions?.map((q,i)=><div className="question"><b>{i+1}. {q.prompt}</b>{q.options.map((o,j)=><label className="choice"><input type="radio" name={`q${i}`} checked={attemptAnswers[i]===j} onChange={()=>setAttemptAnswers({...attemptAnswers,[i]:j})}/>{o}</label>)}</div>)}<button className="primary" onClick={submitAttempt}>Submit answers</button></div></div>}
  </div>
}
function QuizGrid({quizzes,isTeacher,onStart}){if(!quizzes?.length)return <div className="empty"><div className="empty-icon"><ClipboardList/></div><h3>No quizzes yet</h3><p>{isTeacher?'Create your first quiz to get started.':'Your teacher has not published any quizzes yet.'}</p></div>;return <div className="quiz-grid">{quizzes.map(q=><article className="quiz-card" key={q.id}><div className="quiz-symbol"><BookOpen/></div><span className="quiz-tag">ASSESSMENT</span><h3>{q.title}</h3><p>{q.description||'Test your understanding and track your progress.'}</p><div className="quiz-meta"><span>{q.questions?.length||0} questions</span><button onClick={()=>onStart(q)}>{isTeacher?'Preview':'Start quiz'} →</button></div></article>)}</div>}
export default App
