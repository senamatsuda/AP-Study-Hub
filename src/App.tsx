import { useEffect, useMemo, useState, type ReactNode } from "react";
import katex from "katex";
import { courseById, courses, problemById, problems, referenceById, references, topicFor, unitFor } from "./data";
import type { Course, Language, LocalizedText, Problem, QuestionType, ReferenceItem, Route } from "./types";

const ui = {
  ja: {
    navHome: "ホーム", navReferences: "Reference検索", navProblems: "Problem検索",
    searchAll: "全教材を検索", searchPlaceholder: "例：electric field、合成関数、energy…", search: "検索",
    courses: "科目を選ぶ", coursesLead: "学びたい科目から始めましょう。",
    explore: "科目を開く", refs: "References", practice: "Practice Problems", units: "Units", topics: "Topics",
    refSearchTitle: "Referenceを探す", refSearchBody: "キーワードや学習範囲から、概念の解説を絞り込みます。",
    problemSearchTitle: "Practice Problemを探す", problemSearchBody: "難易度や問題形式を選んで、今の目的に合う問題に挑戦しましょう。",
    keyword: "キーワード", allCourses: "すべての科目", allUnits: "すべてのUnit", allTopics: "すべてのTopic", allTags: "すべてのタグ",
    course: "Course", unit: "Unit", topic: "Topic", tags: "Tags", difficulty: "Difficulty", questionType: "Question Type",
    allDifficulties: "すべての難易度", allTypes: "すべての形式", results: "件の結果", noResults: "条件に合う教材が見つかりません。フィルターを変えてお試しください。",
    clear: "条件をクリア", overview: "学習マップ", relatedRefs: "関連するReference", relatedProblems: "関連するPractice Problem",
    reference: "Reference", problem: "Practice Problem", solution: "解答と解説", showSolution: "解答を見る", hideSolution: "解答を閉じる",
    back: "戻る", notFound: "ページが見つかりません", startOver: "ホームへ戻る", question: "問題", browseAll: "すべて見る",
    countRefs: "個のReference", countProblems: "問のProblem", footer: "自分のペースで、理解を一歩ずつ。", original: "すべての問題はオリジナルです。", officialGuide: "公式CED", examWeight: "AP Exam配点",
  },
  en: {
    navHome: "Home", navReferences: "Find References", navProblems: "Find Problems",
    searchAll: "Search all materials", searchPlaceholder: "Try electric field, chain rule, energy…", search: "Search",
    courses: "Choose a course", coursesLead: "Start with the AP course you want to study.",
    explore: "Open course", refs: "References", practice: "Practice Problems", units: "Units", topics: "Topics",
    refSearchTitle: "Find a Reference", refSearchBody: "Filter concept notes by keyword or where they sit in the course.",
    problemSearchTitle: "Find a Practice Problem", problemSearchBody: "Choose a difficulty and format to practice with purpose.",
    keyword: "Keyword", allCourses: "All courses", allUnits: "All units", allTopics: "All topics", allTags: "All tags",
    course: "Course", unit: "Unit", topic: "Topic", tags: "Tags", difficulty: "Difficulty", questionType: "Question type",
    allDifficulties: "All difficulties", allTypes: "All types", results: "results", noResults: "No material matches these filters. Try broadening your search.",
    clear: "Clear filters", overview: "Learning map", relatedRefs: "Related References", relatedProblems: "Related Practice Problems",
    reference: "Reference", problem: "Practice Problem", solution: "Solution & explanation", showSolution: "Show Solution", hideSolution: "Hide Solution",
    back: "Back", notFound: "We couldn't find that page", startOver: "Return home", question: "Question", browseAll: "View all",
    countRefs: "References", countProblems: "Problems", footer: "Build understanding, one step at a time.", original: "All practice questions are original.", officialGuide: "Official CED", examWeight: "AP Exam weight",
  },
} as const;

const typeLabels: Record<QuestionType, LocalizedText> = {
  "multiple-choice": { en: "Multiple Choice", ja: "選択式" },
  "free-response": { en: "Free Response", ja: "自由記述" },
  conceptual: { en: "Conceptual", ja: "概念理解" },
  calculation: { en: "Calculation", ja: "計算" },
};

const l = (value: LocalizedText, lang: Language) => value[lang];
const bilingualTerm = (value: LocalizedText, lang: Language) => {
  if (lang === "en" || value.ja === value.en) return value.en;
  if (!value.en.includes(",") && value.en.split(" and ").length === 2 && value.ja.split("と").length === 2) {
    const [jaFirst, jaSecond] = value.ja.split("と");
    const [enFirst, enSecond] = value.en.split(" and ");
    return `${jaFirst}（${enFirst}）と${jaSecond}（${enSecond}）`;
  }
  if (!value.en.includes(":") && value.en.includes(",") && value.ja.includes("・")) {
    const englishParts = value.en.split(/,\s*(?:and\s+)?/);
    const japaneseParts = value.ja.split("・");
    if (englishParts.length === japaneseParts.length) {
      return japaneseParts.map((part, index) => `${part}（${englishParts[index]}）`).join("・");
    }
  }
  return `${value.ja}（${value.en}）`;
};
const href = (path: string) => `#${path}`;

function parseRoute(): Route {
  const path = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  const parts = path.split("/").filter(Boolean);
  if (!parts.length) return { page: "home" };
  if (parts[0] === "references") return { page: "references" };
  if (parts[0] === "problems") return { page: "problems" };
  if (parts[0] === "course" && parts[1]) return { page: "course", id: parts[1] };
  if (parts[0] === "reference" && parts[1]) return { page: "reference", id: parts[1] };
  if (parts[0] === "problem" && parts[1]) return { page: "problem", id: parts[1] };
  return { page: "home" };
}

function App() {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem("ap-language") === "en" ? "en" : "ja"));
  const [route, setRoute] = useState<Route>(parseRoute);

  useEffect(() => {
    const update = () => { setRoute(parseRoute()); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  useEffect(() => {
    localStorage.setItem("ap-language", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const copy = ui[lang];
  let content: ReactNode;
  if (route.page === "home") content = <Home lang={lang} />;
  else if (route.page === "references") content = <ReferenceSearch lang={lang} />;
  else if (route.page === "problems") content = <ProblemSearch lang={lang} />;
  else if (route.page === "course") content = <CoursePage id={route.id} lang={lang} />;
  else if (route.page === "reference") content = <ReferencePage id={route.id} lang={lang} />;
  else content = <ProblemPage id={route.id} lang={lang} />;

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href={href("/")} aria-label="AP Study Hub home">
            <span className="brand-mark">AP</span><span>Study Hub</span>
          </a>
          <nav className="main-nav" aria-label="Primary navigation">
            <a className={route.page === "home" ? "active" : ""} href={href("/")}>{copy.navHome}</a>
            <a className={route.page === "references" ? "active" : ""} href={href("/references")}>{copy.navReferences}</a>
            <a className={route.page === "problems" ? "active" : ""} href={href("/problems")}>{copy.navProblems}</a>
          </nav>
          <div className="language-switch" aria-label="Language">
            <button className={lang === "ja" ? "selected" : ""} onClick={() => setLang("ja")} aria-pressed={lang === "ja"}>日本語</button>
            <button className={lang === "en" ? "selected" : ""} onClick={() => setLang("en")} aria-pressed={lang === "en"}>English</button>
          </div>
        </div>
      </header>
      <main>{content}</main>
      <footer className="site-footer"><div><strong>AP Study Hub</strong><span>{copy.footer}</span></div><p>{copy.original}</p></footer>
    </div>
  );
}

function Home({ lang }: { lang: Language }) {
  const copy = ui[lang];
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const matches = useMemo(() => {
    const q = submitted.trim().toLowerCase();
    if (!q) return [];
    const refMatches = references.filter((item) => searchable(item, lang).includes(q)).map((item) => ({ kind: "reference" as const, item }));
    const problemMatches = problems.filter((item) => searchable(item, lang).includes(q)).map((item) => ({ kind: "problem" as const, item }));
    return [...refMatches, ...problemMatches].slice(0, 8);
  }, [submitted, lang]);

  return <>
    <section className="hero">
      <form className="global-search" onSubmit={(event) => { event.preventDefault(); setSubmitted(query); }}>
        <label htmlFor="global-search">{copy.searchAll}</label>
        <div><span aria-hidden="true">⌕</span><input id="global-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder}/><button>{copy.search}</button></div>
      </form>
      {submitted && <div className="quick-results" aria-live="polite">
        <div className="result-heading"><strong>{matches.length} {copy.results}</strong><button className="text-button" onClick={() => { setSubmitted(""); setQuery(""); }}>{copy.clear}</button></div>
        {matches.length ? matches.map(({ kind, item }) => kind === "reference" ? <ReferenceResult key={item.id} item={item} lang={lang}/> : <ProblemResult key={item.id} item={item} lang={lang}/>) : <EmptyState lang={lang}/>} 
      </div>}
    </section>
    <section className="section course-section">
      <div className="section-heading"><div><p className="eyebrow muted">6 AP COURSES</p><h2>{copy.courses}</h2><p>{copy.coursesLead}</p></div></div>
      <div className="course-grid">{courses.map((course) => <CourseCard key={course.id} course={course} lang={lang}/>)}</div>
    </section>
  </>;
}

function CourseCard({ course, lang }: { course: Course; lang: Language }) {
  const copy = ui[lang];
  const refCount = references.filter((item) => item.course === course.id).length;
  const problemCount = problems.filter((item) => item.course === course.id).length;
  return <a className="course-card" href={href(`/course/${course.id}`)} style={{ "--accent": course.accent } as React.CSSProperties}>
    <h3>{course.name.en}</h3><p>{l(course.description, lang)}</p>
    <div className="course-meta"><span>{course.units.length} {copy.units}</span><span>{refCount} {copy.countRefs}</span><span>{problemCount} {copy.countProblems}</span></div>
    <strong className="card-link">{copy.explore} <span>→</span></strong>
  </a>;
}

function CoursePage({ id, lang }: { id: string; lang: Language }) {
  const course = courseById(id);
  if (!course) return <NotFound lang={lang}/>;
  const copy = ui[lang];
  return <div className="page-wrap">
    <Breadcrumb lang={lang} parts={[course.name.en]}/>
    <section className="course-hero" style={{ "--accent": course.accent } as React.CSSProperties}>
      <div><p className="eyebrow">AP COURSE</p><h1>{course.name.en}</h1><p>{l(course.description, lang)}</p></div>
      <div className="course-stats"><div><strong>{course.units.length}</strong><span>{copy.units}</span></div><div><strong>{references.filter(r => r.course === id).length}</strong><span>{copy.refs}</span></div><div><strong>{problems.filter(p => p.course === id).length}</strong><span>{copy.practice}</span></div></div>
    </section>
    <section className="content-section"><div className="section-heading row"><div><p className="eyebrow muted">UNIT → TOPIC → MATERIAL</p><h2>{copy.overview}</h2></div><div className="section-actions"><a className="outline-button" href={course.sourceUrl} target="_blank" rel="noreferrer">{copy.officialGuide} ↗</a><a className="outline-button" href={href(`/references?course=${id}`)}>{copy.refs}</a><a className="solid-button" href={href(`/problems?course=${id}`)}>{copy.practice}</a></div></div>
      <div className="unit-list">{course.units.map((unit) => {
        const unitHasMaterials = references.some(item => item.course === id && item.unit === unit.id) || problems.some(item => item.course === id && item.unit === unit.id);
        return <details className="unit-block" key={unit.id} open={unitHasMaterials || undefined}>
        <summary><div><span>UNIT {unit.number}</span><h3>{unit.name.en}</h3></div><div className="unit-summary-meta"><small><b>{copy.examWeight}</b>{l(unit.examWeighting, lang)}</small><i aria-hidden="true">+</i></div></summary>
        <div className="topic-list">{unit.topics.map((topic) => {
          const topicRefs = references.filter(item => item.course === id && item.unit === unit.id && item.topic === topic.id);
          const topicProblems = problems.filter(item => item.course === id && item.unit === unit.id && item.topic === topic.id);
          const hasMaterials = topicRefs.length > 0 || topicProblems.length > 0;
          return <section className={`topic-block${hasMaterials ? " has-materials" : ""}`} key={topic.id}><div className="topic-title"><span>{topic.code}</span><h4>{topic.name.en}</h4></div>{hasMaterials ? <div className="material-columns">
            <div><h5>{copy.refs}</h5>{topicRefs.map(item => <MiniLink key={item.id} title={bilingualTerm(item.title, lang)} meta={l(item.description, lang)} url={`/reference/${item.id}`}/>)}</div>
            <div><h5>{copy.practice}</h5>{topicProblems.map(item => <MiniLink key={item.id} title={item.title.en} meta={`${l(typeLabels[item.questionType], lang)} · ${difficultyDots(item.difficulty)}`} url={`/problem/${item.id}`}/>)}</div>
          </div> : <span className="topic-empty" aria-label={lang === "ja" ? "教材準備中" : "Materials coming soon"}>—</span>}</section>;
        })}</div>
      </details>;})}</div>
    </section>
  </div>;
}

function MiniLink({ title, meta, url }: { title: string; meta: string; url: string }) {
  return <a className="mini-link" href={href(url)}><span><strong>{title}</strong><small>{meta}</small></span><b>→</b></a>;
}

type Filters = { query: string; course: string; unit: string; topic: string; tag: string };
const emptyFilters: Filters = { query: "", course: "", unit: "", topic: "", tag: "" };

function useQueryCourse() {
  const hashQuery = window.location.hash.split("?")[1] || "";
  return new URLSearchParams(hashQuery).get("course") || "";
}

function ReferenceSearch({ lang }: { lang: Language }) {
  const copy = ui[lang];
  const initialCourse = useQueryCourse();
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters, course: initialCourse });
  const result = references.filter((item) => matchesCommon(item, filters, lang));
  return <SearchLayout title={copy.refSearchTitle} body={copy.refSearchBody} eyebrow="REFERENCE LIBRARY">
    <FilterPanel filters={filters} setFilters={setFilters} lang={lang}/>
    <ResultBar count={result.length} lang={lang} clear={() => setFilters(emptyFilters)}/>
    <div className="result-list">{result.length ? result.map(item => <ReferenceResult key={item.id} item={item} lang={lang}/>) : <EmptyState lang={lang}/>}</div>
  </SearchLayout>;
}

function ProblemSearch({ lang }: { lang: Language }) {
  const copy = ui[lang];
  const initialCourse = useQueryCourse();
  const [filters, setFilters] = useState<Filters & { difficulty: string; type: string }>({ ...emptyFilters, course: initialCourse, difficulty: "", type: "" });
  const result = problems.filter((item) => matchesCommon(item, filters, lang) && (!filters.difficulty || item.difficulty === Number(filters.difficulty)) && (!filters.type || item.questionType === filters.type));
  return <SearchLayout title={copy.problemSearchTitle} body={copy.problemSearchBody} eyebrow="PRACTICE LIBRARY">
    <FilterPanel filters={filters} setFilters={setFilters} lang={lang} problem/>
    <ResultBar count={result.length} lang={lang} clear={() => setFilters({ ...emptyFilters, difficulty: "", type: "" })}/>
    <div className="result-list">{result.length ? result.map(item => <ProblemResult key={item.id} item={item} lang={lang}/>) : <EmptyState lang={lang}/>}</div>
  </SearchLayout>;
}

function SearchLayout({ title, body, eyebrow, children }: { title: string; body: string; eyebrow: string; children: ReactNode }) {
  return <div className="page-wrap search-page"><section className="search-hero"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{body}</p></section><section className="search-body">{children}</section></div>;
}

function FilterPanel({ filters, setFilters, lang, problem = false }: { filters: Filters & Partial<{difficulty: string; type: string}>; setFilters: (value: never) => void; lang: Language; problem?: boolean }) {
  const copy = ui[lang];
  const availableUnits = filters.course ? courseById(filters.course)?.units ?? [] : courses.flatMap(course => course.units);
  const availableTopics = filters.unit ? availableUnits.find(unit => unit.id === filters.unit)?.topics ?? [] : availableUnits.flatMap(unit => unit.topics);
  const source = problem ? problems : references;
  const tags = [...new Set(source.flatMap(item => item.tags))].sort();
  const update = (field: string, value: string) => {
    const next = { ...filters, [field]: value } as typeof filters;
    if (field === "course") { next.unit = ""; next.topic = ""; }
    if (field === "unit") next.topic = "";
    setFilters(next as never);
  };
  return <div className="filter-panel">
    <label className="wide"><span>{copy.keyword}</span><input value={filters.query} onChange={e => update("query", e.target.value)} placeholder={copy.searchPlaceholder}/></label>
    <label><span>{copy.course}</span><select value={filters.course} onChange={e => update("course", e.target.value)}><option value="">{copy.allCourses}</option>{courses.map(course => <option key={course.id} value={course.id}>{course.name.en}</option>)}</select></label>
    <label><span>{copy.unit}</span><select value={filters.unit} onChange={e => update("unit", e.target.value)}><option value="">{copy.allUnits}</option>{availableUnits.map(unit => <option key={unit.id} value={unit.id}>{unit.name.en}</option>)}</select></label>
    <label><span>{copy.topic}</span><select value={filters.topic} onChange={e => update("topic", e.target.value)}><option value="">{copy.allTopics}</option>{availableTopics.map(topic => <option key={topic.id} value={topic.id}>{topic.name.en}</option>)}</select></label>
    {problem && <><label><span>{copy.difficulty}</span><select value={filters.difficulty || ""} onChange={e => update("difficulty", e.target.value)}><option value="">{copy.allDifficulties}</option>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} / 5</option>)}</select></label><label><span>{copy.questionType}</span><select value={filters.type || ""} onChange={e => update("type", e.target.value)}><option value="">{copy.allTypes}</option>{Object.entries(typeLabels).map(([key, value]) => <option key={key} value={key}>{l(value, lang)}</option>)}</select></label></>}
    <label><span>{copy.tags}</span><select value={filters.tag} onChange={e => update("tag", e.target.value)}><option value="">{copy.allTags}</option>{tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}</select></label>
  </div>;
}

function ResultBar({ count, lang, clear }: { count: number; lang: Language; clear: () => void }) {
  return <div className="result-heading"><strong><span>{count}</span> {ui[lang].results}</strong><button className="text-button" onClick={clear}>{ui[lang].clear}</button></div>;
}

function ReferenceResult({ item, lang }: { item: ReferenceItem; lang: Language }) {
  return <a className="result-card" href={href(`/reference/${item.id}`)}><div className="result-kind">REFERENCE</div><div className="result-content"><h3>{bilingualTerm(item.title, lang)}</h3><p>{l(item.description, lang)}</p><ContextLine item={item} lang={lang}/><TagList tags={item.tags}/></div><span className="result-arrow">→</span></a>;
}

function ProblemResult({ item, lang }: { item: Problem; lang: Language }) {
  return <a className="result-card problem-result" href={href(`/problem/${item.id}`)}><div className="result-kind">PROBLEM</div><div className="result-content"><h3>{item.title.en}</h3><p>{truncatePlain(item.question.en, 145)}</p><ContextLine item={item} lang={lang}/><div className="problem-badges"><span className="difficulty">{difficultyDots(item.difficulty)}</span><span>{l(typeLabels[item.questionType], lang)}</span></div></div><span className="result-arrow">→</span></a>;
}

function ReferencePage({ id, lang }: { id: string; lang: Language }) {
  const item = referenceById(id);
  if (!item) return <NotFound lang={lang}/>;
  const copy = ui[lang];
  const relatedProblemIds = new Set(item.relatedProblems);
  problems
    .filter(problem => problem.course === item.course && problem.unit === item.unit && problem.topic === item.topic)
    .forEach(problem => relatedProblemIds.add(problem.id));
  const relatedProblems = [...relatedProblemIds].map(problemById).filter(Boolean) as Problem[];
  const relatedRefs = references.filter(candidate => candidate.id !== item.id && candidate.course === item.course && (candidate.topic === item.topic || candidate.tags.some(tag => item.tags.includes(tag)))).slice(0, 3);
  return <DetailLayout item={item} lang={lang} kind={copy.reference} title={bilingualTerm(item.title, lang)} description={l(item.description, lang)}>
    <article className="prose-card">{lang === "ja" && <p><strong>重要用語：</strong>{bilingualTerm(item.title, lang)}</p>}<RichText text={l(item.content, lang)}/></article>
    <RelatedSection title={copy.relatedProblems}>{relatedProblems.map(problem => <ProblemResult key={problem.id} item={problem} lang={lang}/>)}</RelatedSection>
    {relatedRefs.length > 0 && <RelatedSection title={copy.relatedRefs}>{relatedRefs.map(ref => <ReferenceResult key={ref.id} item={ref} lang={lang}/>)}</RelatedSection>}
  </DetailLayout>;
}

function ProblemPage({ id, lang }: { id: string; lang: Language }) {
  const item = problemById(id);
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [id]);
  if (!item) return <NotFound lang={lang}/>;
  const copy = ui[lang];
  const relatedRefs = item.relatedReferences.map(referenceById).filter(Boolean) as ReferenceItem[];
  return <DetailLayout item={item} lang={lang} kind={copy.problem} title={item.title.en} description={`${l(typeLabels[item.questionType], lang)} · ${copy.difficulty} ${item.difficulty}/5`}>
    <article className="prose-card question-card"><p className="card-kicker">{copy.question}</p><RichText text={item.question.en}/>{item.choices && <ol className="choices" type="A">{item.choices.map((choice, index) => <li key={index}><RichText text={choice.en}/></li>)}</ol>}</article>
    <div className="solution-wrap"><button className="solution-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open}><span>{open ? "−" : "+"}</span>{open ? copy.hideSolution : copy.showSolution}</button>{open && <article className="prose-card solution-card"><p className="card-kicker">{copy.solution}</p><RichText text={l(item.solution, lang)}/></article>}</div>
    <RelatedSection title={copy.relatedRefs}>{relatedRefs.map(ref => <ReferenceResult key={ref.id} item={ref} lang={lang}/>)}</RelatedSection>
  </DetailLayout>;
}

function DetailLayout({ item, lang, kind, title, description, children }: { item: ReferenceItem | Problem; lang: Language; kind: string; title: string; description: string; children: ReactNode }) {
  const course = courseById(item.course)!;
  return <div className="page-wrap detail-page"><Breadcrumb lang={lang} parts={[course.name.en, title]}/><header className="detail-header"><div><p className="eyebrow">{kind.toUpperCase()}</p><h1>{title}</h1><p>{description}</p></div><span className="detail-course" style={{ "--accent": course.accent } as React.CSSProperties}>{course.name.en}</span></header><ContextLine item={item} lang={lang}/><TagList tags={item.tags}/><div className="detail-grid"><div>{children}</div><aside><h3>{ui[lang].course}</h3><a href={href(`/course/${course.id}`)}>{course.name.en} <span>→</span></a><dl><dt>{ui[lang].unit}</dt><dd>{unitFor(item.course, item.unit)!.name.en}</dd><dt>{ui[lang].topic}</dt><dd>{topicFor(item.course, item.unit, item.topic)!.name.en}</dd>{"difficulty" in item && <><dt>{ui[lang].difficulty}</dt><dd>{difficultyDots(item.difficulty)} ({item.difficulty}/5)</dd></>}</dl></aside></div></div>;
}

function RelatedSection({ title, children }: { title: string; children: ReactNode }) { return <section className="related-section"><h2>{title}</h2><div className="result-list compact">{children}</div></section>; }

function ContextLine({ item, lang }: { item: ReferenceItem | Problem; lang: Language }) {
  const course = courseById(item.course); const unit = unitFor(item.course, item.unit); const topic = topicFor(item.course, item.unit, item.topic);
  return <div className="context-line"><span>{course?.name.en}</span><b>/</b><span>{unit?.name.en}</span><b>/</b><span>{topic?.name.en}</span></div>;
}

function TagList({ tags }: { tags: string[] }) { return <div className="tag-list">{tags.map(tag => <span key={tag}>#{tag}</span>)}</div>; }

function Breadcrumb({ lang, parts }: { lang: Language; parts: string[] }) { return <nav className="breadcrumb" aria-label="Breadcrumb"><a href={href("/")}>{ui[lang].navHome}</a>{parts.map((part, index) => <span key={`${part}-${index}`}><b>/</b>{part}</span>)}</nav>; }

function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n/).filter(Boolean);
  return <div className="rich-text">{blocks.map((block, index) => {
    const display = block.match(/^\$\$(.*)\$\$$/);
    if (display) return <div className="math-display" key={index} dangerouslySetInnerHTML={{ __html: renderMath(display[1], true) }}/>;
    return <p key={index}>{inlineMath(block)}</p>;
  })}</div>;
}

function inlineMath(text: string) {
  return text.split(/(\$[^$]+\$)/g).filter(Boolean).map((part, index) => part.startsWith("$") && part.endsWith("$")
    ? <span className="math-inline" key={index} dangerouslySetInnerHTML={{ __html: renderMath(part.slice(1, -1), false) }}/>
    : <span key={index}>{part}</span>);
}

function renderMath(value: string, displayMode: boolean) { try { return katex.renderToString(value, { displayMode, throwOnError: false }); } catch { return value; } }

function EmptyState({ lang }: { lang: Language }) { return <div className="empty-state"><span>∅</span><p>{ui[lang].noResults}</p></div>; }
function NotFound({ lang }: { lang: Language }) { return <div className="not-found"><span>404</span><h1>{ui[lang].notFound}</h1><a className="solid-button" href={href("/")}>{ui[lang].startOver}</a></div>; }

function searchable(item: ReferenceItem | Problem, lang: Language) {
  const course = courseById(item.course); const unit = unitFor(item.course, item.unit); const topic = topicFor(item.course, item.unit, item.topic);
  const other: Language = lang === "ja" ? "en" : "ja";
  const body = "content" in item
    ? `${l(item.title, lang)} ${l(item.description, lang)} ${l(item.content, lang)} ${l(item.title, other)} ${l(item.description, other)} ${l(item.content, other)}`
    : `${l(item.title, lang)} ${l(item.question, lang)} ${l(item.solution, lang)} ${l(item.title, other)} ${l(item.question, other)} ${l(item.solution, other)}`;
  return `${body} ${item.tags.join(" ")} ${course ? `${l(course.name, lang)} ${l(course.name, other)}` : ""} ${unit ? `${l(unit.name, lang)} ${l(unit.name, other)}` : ""} ${topic ? `${l(topic.name, lang)} ${l(topic.name, other)}` : ""}`.toLowerCase();
}

function matchesCommon(item: ReferenceItem | Problem, filters: Filters, lang: Language) {
  const q = filters.query.trim().toLowerCase();
  return (!q || searchable(item, lang).includes(q)) && (!filters.course || item.course === filters.course) && (!filters.unit || item.unit === filters.unit) && (!filters.topic || item.topic === filters.topic) && (!filters.tag || item.tags.includes(filters.tag));
}

function difficultyDots(value: number) { return `${"●".repeat(value)}${"○".repeat(5 - value)}`; }
function truncatePlain(value: string, max: number) { const plain = value.replace(/\$+/g, ""); return plain.length > max ? `${plain.slice(0, max)}…` : plain; }

export default App;
