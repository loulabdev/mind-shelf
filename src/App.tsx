import React, { useEffect, useState } from "react";
import { Header } from "./components/Header";
import PrescriptionView from "./components/PrescriptionView";
import { getPrescription } from "./services/geminiService";
import {
  deleteSavedPrescription,
  getBookBookmarks,
  getSavedPrescriptions,
  resetAllStorage,
  savePrescriptionToStorage,
} from "./services/storageService";
import { AppState, Prescription, SavedPrescription, BookBookmark } from "./types";
import { Clock3, Trash2, Bookmark, ChevronDown, ChevronUp, X, BookOpen, Leaf } from "lucide-react";

// ─── 마음 날씨 옵션 ───────────────────────────────────────────
type WeatherOption = {
  label: string;
  emoji: string;
  text: string;
  selectedClass: string;
  tagClass: string;
};

const WEATHER_OPTIONS: WeatherOption[] = [
  { label: "맑음",   emoji: "☀️",  text: "마음 날씨: 맑음. 요즘 비교적 괜찮지만, 더 단단해지고 싶어요.",                 selectedClass: "bg-amber-100 text-amber-900 border-amber-400",    tagClass: "bg-amber-50 text-amber-900 border-amber-200" },
  { label: "흐림",   emoji: "⛅",  text: "마음 날씨: 흐림. 이유를 정확히 모르겠지만 마음이 조금 가라앉아 있어요.",        selectedClass: "bg-stone-200 text-stone-900 border-stone-400",    tagClass: "bg-stone-100 text-stone-900 border-stone-200" },
  { label: "안개",   emoji: "🌫️", text: "마음 날씨: 안개. 앞이 잘 보이지 않고 모든 것이 흐릿하게 느껴져요.",            selectedClass: "bg-gray-200 text-gray-800 border-gray-400",      tagClass: "bg-gray-100 text-gray-800 border-gray-200" },
  { label: "이슬비", emoji: "🌦️", text: "마음 날씨: 이슬비. 딱히 슬프진 않은데 마음 한켠이 촉촉하게 젖어 있어요.",      selectedClass: "bg-blue-100 text-blue-900 border-blue-300",      tagClass: "bg-blue-50 text-blue-900 border-blue-200" },
  { label: "비",     emoji: "🌧️", text: "마음 날씨: 비. 우울하고 축 처지는 느낌이 들어요.",                             selectedClass: "bg-slate-200 text-slate-900 border-slate-400",   tagClass: "bg-slate-100 text-slate-900 border-slate-200" },
  { label: "천둥",   emoji: "⛈️", text: "마음 날씨: 천둥. 불안과 걱정이 커서 마음이 시끄러워요.",                        selectedClass: "bg-indigo-200 text-indigo-950 border-indigo-400", tagClass: "bg-indigo-50 text-indigo-950 border-indigo-200" },
  { label: "강풍",   emoji: "🌪️", text: "마음 날씨: 강풍. 생각이 많고 혼란스러워서 중심을 잡기 어려워요.",              selectedClass: "bg-violet-200 text-violet-950 border-violet-400", tagClass: "bg-violet-50 text-violet-950 border-violet-200" },
  { label: "눈",     emoji: "❄️",  text: "마음 날씨: 눈. 무기력하고 에너지가 거의 없어요.",                              selectedClass: "bg-sky-100 text-sky-900 border-sky-300",         tagClass: "bg-sky-50 text-sky-900 border-sky-200" },
  { label: "황사",   emoji: "🟡",  text: "마음 날씨: 황사. 뭔가 탁하고 답답한 느낌이 떠나지 않아요.",                   selectedClass: "bg-yellow-200 text-yellow-900 border-yellow-400", tagClass: "bg-yellow-50 text-yellow-900 border-yellow-200" },
  { label: "무더위", emoji: "🌡️", text: "마음 날씨: 무더위. 지치고 짜증스럽고 아무것도 하기 싫어요.",                   selectedClass: "bg-orange-200 text-orange-900 border-orange-400", tagClass: "bg-orange-50 text-orange-900 border-orange-200" },
  { label: "서리",   emoji: "🥶",  text: "마음 날씨: 서리. 감각이 무뎌지고 마음이 차갑게 굳어 있는 것 같아요.",         selectedClass: "bg-cyan-100 text-cyan-900 border-cyan-300",      tagClass: "bg-cyan-50 text-cyan-900 border-cyan-200" },
  { label: "무지개", emoji: "🌈",  text: "마음 날씨: 무지개. 힘든 일이 있었지만 조금씩 나아지는 것 같아요.",            selectedClass: "bg-pink-100 text-pink-900 border-pink-300",      tagClass: "bg-pink-50 text-pink-900 border-pink-200" },
];

// ─── 유틸 ────────────────────────────────────────────────────────────
const formatRxNum = (id: string) => `No. ${id.slice(0, 4).toUpperCase()}`;
const formatDate  = (iso: string) =>
  new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });

// ─── 디자인 토큰 ─────────────────────────────────────────────────────
const F          = "'Special Elite', 'Courier New', monospace";
const GB_FONT    = "'Gowun Batang', serif";
const BG         = "#f2ead8";
const PAGE1      = "#f2ead8";
const PAGE2      = "#f5f0e4";
const GREEN_DARK  = "#2e4a38";
const GREEN_MID   = "#4a6e50";
const INK        = "#1a1a18";
const BROWN      = "#3a2a18";
const GOLD_DIM   = "rgba(200,160,64,0.70)";
const BORDER     = "rgba(180,160,120,0.30)";
const MUTED      = "#9a8060";

// 용지 줄무늬
const linesBg = `repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(110,84,40,0.05) 27px,rgba(110,84,40,0.05) 28px)`;
const paperStyle = (bg: string): React.CSSProperties => ({ backgroundColor: bg, backgroundImage: linesBg });

// ════════════════════════════════════════════════════════════════════
const App: React.FC = () => {
  const [input,              setInput]              = useState("");
  const [appState,           setAppState]           = useState<AppState>(AppState.IDLE);
  const [prescription,       setPrescription]       = useState<Prescription | null>(null);
  const [error,              setError]              = useState<string | null>(null);
  const [savedPrescriptions, setSavedPrescriptions] = useState<SavedPrescription[]>([]);
  const [bookmarks,          setBookmarks]          = useState<BookBookmark[]>([]);
  const [isSavedOpen,        setIsSavedOpen]        = useState(false);
  const [isBookmarksOpen,    setIsBookmarksOpen]    = useState(false);
  const [selectedWeather,    setSelectedWeather]    = useState<WeatherOption | null>(null);

  useEffect(() => {
    setSavedPrescriptions(getSavedPrescriptions());
    setBookmarks(getBookBookmarks());
  }, []);

  const refreshBookmarks = () => setBookmarks(getBookBookmarks());

  const handleResetStorage = () => {
    if (!window.confirm("북마크와 서재 기록을 모두 삭제할까요?\n이 작업은 되돌릴 수 없습니다.")) return;
    resetAllStorage();
    setBookmarks([]); setSavedPrescriptions([]); setPrescription(null);
    setInput(""); setSelectedWeather(null); setError(null); setAppState(AppState.IDLE);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    setAppState(AppState.ANALYZING); setError(null);
    try {
      const result = await getPrescription(input);
      setPrescription(result);
      const savedItem: SavedPrescription = {
        id: crypto.randomUUID(), createdAt: new Date().toISOString(),
        userInput: input, prescription: result,
      };
      setSavedPrescriptions(savePrescriptionToStorage(savedItem));
      refreshBookmarks();
      setAppState(AppState.PRESCRIBED);
    } catch (err) {
      console.error(err);
      setError("죄송합니다. 추천을 생성하는 도중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setInput(""); setPrescription(null); setError(null);
    refreshBookmarks(); setSelectedWeather(null); setAppState(AppState.IDLE);
  };

  const handleOpenSaved = (item: SavedPrescription) => {
    setPrescription(item.prescription); setInput(item.userInput);
    refreshBookmarks(); setAppState(AppState.PRESCRIBED);
  };

  const handleDeleteSaved = (id: string) => setSavedPrescriptions(deleteSavedPrescription(id));

  const handleWeatherSelect = (weather: WeatherOption) => {
    setSelectedWeather(weather);
    setInput(prev => {
      const cleaned = WEATHER_OPTIONS.reduce((acc, opt) => acc.replace(opt.text, "").trim(), prev.trim());
      return cleaned ? `${weather.text}\n\n${cleaned}` : weather.text;
    });
  };

  const handleClearWeather = () => {
    setSelectedWeather(null);
    setInput(prev => WEATHER_OPTIONS.reduce((acc, opt) => acc.replace(opt.text, "").trim(), prev.trim()));
  };

  // ── IDLE (오픈북 메인) ────────────────────────────────────────────
  if (appState === AppState.IDLE) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: BG, fontFamily: F }}>
        <Header onResetStorage={handleResetStorage} />

        <main style={{ flex: 1, padding: "clamp(12px,3vw,28px) clamp(10px,3vw,20px) 48px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <style>{`
            @media (max-width: 767px) {
              .book-inner   { flex-direction: column !important; }
              .book-left-page { border-right: none !important; border-bottom: 1px dashed rgba(110,84,40,0.22) !important; }
              .book-spine   { display: none !important; }
              .book-edge-l, .book-edge-r { display: none !important; }
            }
          `}</style>

          {/* 오픈북 외곽 */}
          <div style={{
            width: "100%", maxWidth: 920,
            border: `3px solid ${GREEN_DARK}`,
            borderRadius: 6,
            boxShadow: "0 20px 60px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.18)",
            position: "relative",
            marginTop: 12,
          }}>
            {/* 상단 책등 */}
            <div style={{
              position: "absolute", left: -3, right: -3, top: -13, height: 13,
              background: `linear-gradient(to bottom,#0f2018,${GREEN_DARK} 60%,#506e5c)`,
              border: `3px solid ${GREEN_DARK}`, borderBottom: "none",
              borderRadius: "4px 4px 0 0", zIndex: 20,
            }} />
            {/* 하단 페이지 단면 */}
            <div style={{
              position: "absolute", left: 6, right: 6, bottom: -8, height: 8,
              background: "linear-gradient(to bottom,#d0c09a,#a89060)",
              borderRadius: "0 0 3px 3px", zIndex: 20,
            }} />

            {/* 책 내부 */}
            <div className="book-inner" style={{ display: "flex" }}>

              {/* 왼쪽 여백 */}
              <div className="book-edge-l" style={{
                width: "clamp(8px,1.2vw,13px)", flexShrink: 0, zIndex: 5, position: "relative",
                background: "repeating-linear-gradient(to right,#ede3ce 0,#ede3ce 1.5px,#c8b888 2px,#f0e6d4 4px,#c8b888 4.5px,#ede3ce 6px,#c8b888 6.5px,#f0e6d4 8.5px,#c8b888 9px,#ede3ce 13px)",
              }}>
                <div style={{ position: "absolute", left: 0, top: -13, bottom: 0, width: 6, background: GREEN_DARK }} />
              </div>

              {/* ── 왼쪽 페이지: 이용 안내 ── */}
              <div
                className="book-left-page"
                style={{
                  flex: 1, ...paperStyle(PAGE1),
                  padding: "22px 18px 30px 20px",
                  borderRight: "1px dashed rgba(110,84,40,0.22)",
                  display: "flex", flexDirection: "column", gap: 0,
                }}
              >
                {/* 로고 배너 */}
                <div style={{
                  background: `linear-gradient(135deg,${GREEN_DARK} 0%,#1a3224 100%)`,
                  borderRadius: 10, padding: "14px 16px", marginBottom: 16,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                    <div style={{
                      flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(200,160,64,0.15)", border: "1px solid rgba(200,160,64,0.35)",
                      color: GOLD_DIM, fontFamily: F, fontSize: 15,
                    }}>℞</div>
                    <div>
                      <p style={{ fontFamily: F, fontSize: 9, letterSpacing: "0.14em", color: GOLD_DIM, marginBottom: 3 }}>마음서재 · Mind Library</p>
                      <h1 style={{ fontFamily: F, fontSize: 16, color: PAGE2, lineHeight: 1.35, marginBottom: 4 }}>
                        오늘 마음을 기록하는<br />작은 서재
                      </h1>
                      <p style={{ fontFamily: GB_FONT, fontSize: 11.5, color: "rgba(245,240,228,0.6)", lineHeight: 1.7 }}>
                        감정을 기록하면 AI가 당신의 마음에<br />공명하는 책을 찾아드립니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 이용 안내 용지 */}
                <div style={{ flex: 1, borderRadius: 8, overflow: "hidden", border: `1px solid ${BORDER}`, background: "#fdf8ee" }}>
                  <div style={{
                    padding: "7px 14px", borderBottom: "1px dashed rgba(180,160,120,0.30)",
                    background: "rgba(245,240,228,0.6)", display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <span style={{ color: GOLD_DIM, fontFamily: F, fontSize: 11 }}>✦</span>
                    <span style={{ fontFamily: F, fontSize: 9, letterSpacing: "0.1em", color: MUTED }}>이용 안내 및 주의사항</span>
                  </div>

                  <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 11 }}>
                    {[
                      { icon: "📖", title: "마음서재란?",      body: "감정을 언어로 꺼내고, 그 감정에 공명하는 책을 찾아드리는 AI 북큐레이션 서비스입니다." },
                      { icon: "🗺️", title: "이렇게 사용하세요", body: "① 마음 날씨 태그 선택  ② 감정·고민 자유 입력  ③ → 버튼으로 추천  ④ 도서관 소장 확인" },
                      { icon: "🤖", title: "AI 추천의 한계",   body: "추천 결과는 Gemini AI가 생성하며 개인 상황에 따라 맞지 않을 수 있습니다. 본 서비스는 의료행위가 아닙니다." },
                      { icon: "🔒", title: "개인정보 미수집",  body: "입력 텍스트는 AI 추천 생성에만 사용됩니다. 서재 기록은 이 기기의 로컬 스토리지에만 저장됩니다." },
                    ].map(({ icon, title, body }, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <div style={{ borderTop: "1px dashed rgba(180,160,120,0.20)" }} />}
                        <div style={{ display: "flex", gap: 9 }}>
                          <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                          <div>
                            <p style={{ fontFamily: F, fontSize: 9.5, color: GREEN_MID, fontWeight: 700, marginBottom: 2 }}>{title}</p>
                            <p style={{ fontFamily: GB_FONT, fontSize: 11, color: BROWN, lineHeight: 1.75 }}>{body}</p>
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>

                  <div style={{
                    padding: "6px 14px", borderTop: "1px dashed rgba(180,160,120,0.20)",
                    background: "rgba(245,240,228,0.45)", display: "flex", justifyContent: "space-between",
                  }}>
                    <span style={{ fontFamily: F, fontSize: 8.5, color: MUTED }}>© 2026 마음서재 by lou</span>
                    <span style={{ fontFamily: F, fontSize: 8.5, color: MUTED }}>Powered by Google Gemini</span>
                  </div>
                </div>
              </div>

              {/* ── 가름대 ── */}
              <div className="book-spine" style={{
                width: "clamp(16px,2.2vw,24px)", flexShrink: 0,
                position: "relative", zIndex: 10, backgroundColor: PAGE1,
              }}>
                <div style={{
                  position: "absolute", top: 0, bottom: 28, left: "50%",
                  transform: "translateX(-50%)", width: 8,
                  background: `linear-gradient(90deg,${GREEN_DARK} 0%,#2e6040 20%,${GREEN_MID} 45%,#4a9060 50%,${GREEN_MID} 55%,#2e6040 80%,${GREEN_DARK} 100%)`,
                  zIndex: 11,
                }} />
                {/* 네잎클로버 */}
                <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 20, height: 20, zIndex: 13 }}>
                  <div style={{
                    position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
                    width: 6, height: 6, borderRadius: "50%",
                    background: "radial-gradient(circle,#5aaa60 30%,#2e6a38 100%)",
                    boxShadow: "0 -6px 0 1.5px #3a8848, 0 6px 0 1.5px #3a8848, -6px 0 0 1.5px #3a8848, 6px 0 0 1.5px #3a8848",
                  }} />
                  <div style={{
                    position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
                    width: 5, height: 5, borderRadius: "50%",
                    background: "radial-gradient(circle,#7acc80 30%,#3a7a48 100%)", zIndex: 2,
                  }} />
                </div>
              </div>

              {/* ── 오른쪽 페이지: 타이틀 + 날씨 + 입력 + 서재 ── */}
              <div style={{
                flex: 1, ...paperStyle(PAGE2),
                padding: "22px 20px 30px 18px",
                display: "flex", flexDirection: "column", gap: 13,
              }}>

                {/* 오른쪽 상단: 마음서재 타이틀 */}
                <div style={{ textAlign: "center", paddingBottom: 10, borderBottom: "1px dashed rgba(110,84,40,0.22)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 3 }}>
                    <h2 style={{ fontFamily: F, fontSize: 21, color: INK, letterSpacing: "0.04em", margin: 0 }}>마음서재</h2>
                    <span style={{ fontFamily: F, fontSize: 12, color: MUTED }}>·</span>
                    <span style={{ fontFamily: F, fontSize: 11, color: MUTED, letterSpacing: "0.06em" }}>Mind Library</span>
                    <button
                      type="button" onClick={handleReset} title="초기화"
                      style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 14, lineHeight: 1, opacity: 0.65, padding: 0 }}
                    >↺</button>
                  </div>
                  <p style={{ fontFamily: GB_FONT, fontSize: 11.5, color: MUTED }}>마음을 기록하고, 책을 만나보세요</p>
                </div>

                {/* 오른쪽 중단: 마음 날씨 태그 + 감정 입력창 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {/* 날씨 태그 */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                      <span style={{ fontFamily: F, fontSize: 9, letterSpacing: "0.12em", color: "#6e5428" }}>── 마음 날씨 빠른 선택 ──</span>
                      {selectedWeather && (
                        <button
                          type="button" onClick={handleClearWeather}
                          style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: F, fontSize: 9, color: "#6e5428", background: "none", border: "none", cursor: "pointer", opacity: 0.7 }}
                        >
                          <X style={{ width: 9, height: 9 }} /> 선택 해제
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {WEATHER_OPTIONS.map(w => {
                        const isSel = selectedWeather?.label === w.label;
                        return (
                          <button
                            key={w.label} type="button"
                            onClick={() => handleWeatherSelect(w)}
                            style={{
                              fontFamily: F, fontSize: 10.5, padding: "4px 9px",
                              borderRadius: 18, border: "1px solid", cursor: "pointer", transition: "all 0.15s",
                              ...(isSel
                                ? { background: GREEN_DARK, color: PAGE2, borderColor: GREEN_MID, boxShadow: "0 2px 8px rgba(46,74,56,0.28)" }
                                : { background: "rgba(255,255,255,0.55)", color: BROWN, borderColor: "rgba(180,160,120,0.35)" }
                              ),
                            }}
                          >
                            {w.emoji} {w.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 감정 입력창 */}
                  <div style={{
                    borderRadius: 8, overflow: "hidden",
                    border: `1px solid ${BORDER}`,
                    background: "#fdf8ee",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  }}>
                    <div style={{
                      padding: "6px 12px", borderBottom: "1px dashed rgba(180,160,120,0.30)",
                      background: "rgba(245,240,228,0.55)", display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <span style={{ fontFamily: F, fontSize: 9.5, color: MUTED }}>✍️ 오늘의 마음 기록</span>
                      {selectedWeather && (
                        <span style={{ fontFamily: F, fontSize: 9.5, padding: "2px 7px", borderRadius: 10, background: GREEN_DARK, color: PAGE2 }}>
                          {selectedWeather.emoji} {selectedWeather.label}
                        </span>
                      )}
                    </div>
                    <div style={{ position: "relative" }}>
                      <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
                        placeholder="지금 마음의 날씨를 들려주세요..."
                        rows={4}
                        style={{
                          width: "100%", padding: "12px 50px 12px 14px",
                          background: "transparent", border: "none", outline: "none",
                          fontFamily: F, fontSize: 13, color: INK,
                          lineHeight: 1.9, resize: "none", boxSizing: "border-box",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={!input.trim()}
                        style={{
                          position: "absolute", right: 10, bottom: 10,
                          width: 34, height: 34, borderRadius: "50%",
                          background: input.trim() ? GREEN_DARK : "rgba(110,84,40,0.18)",
                          color: PAGE2, border: "none",
                          cursor: input.trim() ? "pointer" : "not-allowed",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 18, fontFamily: F,
                          transition: "all 0.2s",
                          boxShadow: input.trim() ? "0 3px 10px rgba(46,74,56,0.35)" : "none",
                        }}
                        aria-label="감정 제출"
                      >→</button>
                    </div>
                    <div style={{
                      padding: "5px 12px", borderTop: "1px dashed rgba(180,160,120,0.22)",
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      <Leaf style={{ width: 9, height: 9, color: MUTED, flexShrink: 0 }} />
                      <span style={{ fontFamily: F, fontSize: 9, color: MUTED }}>AI 북큐레이터 · 한국어 도서 추천 · 맞춤형 읽기 가이드</span>
                    </div>
                  </div>
                </div>

                {/* 서재 기록 */}
                <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${BORDER}`, background: PAGE2 }}>
                  <button
                    type="button" onClick={() => setIsSavedOpen(p => !p)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "9px 13px", background: "none", border: "none", cursor: "pointer",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: F, fontSize: 11.5, color: BROWN }}>
                      <Clock3 style={{ width: 11, height: 11, color: "#6e5428" }} />
                      서재 기록
                      <span style={{ fontFamily: F, fontSize: 8.5, padding: "1px 5px", borderRadius: 10, background: GREEN_DARK, color: PAGE2 }}>
                        {savedPrescriptions.length}
                      </span>
                    </span>
                    {isSavedOpen
                      ? <ChevronUp style={{ width: 11, height: 11, color: MUTED }} />
                      : <ChevronDown style={{ width: 11, height: 11, color: MUTED }} />}
                  </button>

                  {isSavedOpen && (
                    <div style={{
                      height: 150, overflowY: "auto",
                      borderTop: "1px dashed rgba(180,160,120,0.30)",
                      padding: "7px 11px 9px",
                    }}>
                      {savedPrescriptions.length === 0 ? (
                        <p style={{ fontFamily: F, fontSize: 10, color: MUTED, textAlign: "center", paddingTop: 6 }}>
                          아직 서재 기록이 없어요.
                        </p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {savedPrescriptions.map(item => (
                            <div key={item.id} style={{
                              borderRadius: 6, padding: "7px 9px",
                              background: "rgba(255,255,255,0.55)",
                              border: "1px solid rgba(180,160,120,0.22)",
                            }}>
                              <button
                                type="button" onClick={() => handleOpenSaved(item)}
                                style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                              >
                                <p style={{
                                  fontFamily: F, fontSize: 10, color: BROWN, lineHeight: 1.5, marginBottom: 2,
                                  overflow: "hidden", display: "-webkit-box",
                                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                                }}>{item.userInput}</p>
                                <p style={{ fontFamily: F, fontSize: 9, color: MUTED }}>
                                  {formatRxNum(item.id)} · {formatDate(item.createdAt)}
                                </p>
                              </button>
                              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                                <button
                                  type="button" onClick={() => handleDeleteSaved(item.id)}
                                  style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: F, fontSize: 9, color: "#a04030", background: "none", border: "none", cursor: "pointer", opacity: 0.5 }}
                                >
                                  <Trash2 style={{ width: 9, height: 9 }} /> 삭제
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 북마크 도서 */}
                <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${BORDER}`, background: PAGE2 }}>
                  <button
                    type="button" onClick={() => setIsBookmarksOpen(p => !p)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "9px 13px", background: "none", border: "none", cursor: "pointer",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: F, fontSize: 11.5, color: BROWN }}>
                      <Bookmark style={{ width: 11, height: 11, color: "#6e5428" }} />
                      북마크 도서
                      <span style={{ fontFamily: F, fontSize: 8.5, padding: "1px 5px", borderRadius: 10, background: GREEN_DARK, color: PAGE2 }}>
                        {bookmarks.length}
                      </span>
                    </span>
                    {isBookmarksOpen
                      ? <ChevronUp style={{ width: 11, height: 11, color: MUTED }} />
                      : <ChevronDown style={{ width: 11, height: 11, color: MUTED }} />}
                  </button>

                  {isBookmarksOpen && (
                    <div style={{
                      maxHeight: 180, overflowY: "auto",
                      borderTop: "1px dashed rgba(180,160,120,0.30)",
                      padding: "7px 11px 9px",
                    }}>
                      {bookmarks.length === 0 ? (
                        <p style={{ fontFamily: F, fontSize: 10, color: MUTED, textAlign: "center", paddingTop: 6 }}>북마크한 도서가 없어요.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {bookmarks.slice(0, 10).map(item => (
                            <div key={item.id} style={{
                              borderRadius: 6, padding: "7px 9px",
                              background: "rgba(255,255,255,0.55)",
                              border: "1px solid rgba(180,160,120,0.22)",
                            }}>
                              <p style={{ fontFamily: GB_FONT, fontSize: 10.5, color: BROWN }}>
                                <BookOpen style={{ width: 9, height: 9, display: "inline", marginRight: 4, color: GREEN_MID, verticalAlign: "middle" }} />
                                {item.book.title}
                              </p>
                              <p style={{ fontFamily: F, fontSize: 9, color: MUTED, marginTop: 2 }}>
                                {item.book.author} · {item.book.publisher}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* 오른쪽 여백 */}
              <div className="book-edge-r" style={{
                width: "clamp(8px,1.2vw,13px)", flexShrink: 0, zIndex: 5, position: "relative",
                background: "repeating-linear-gradient(to left,#ede3ce 0,#ede3ce 1.5px,#c8b888 2px,#f0e6d4 4px,#c8b888 4.5px,#ede3ce 6px,#c8b888 6.5px,#f0e6d4 8.5px,#c8b888 9px,#ede3ce 13px)",
              }}>
                <div style={{ position: "absolute", right: 0, top: -13, bottom: 0, width: 6, background: GREEN_DARK }} />
              </div>
            </div>
          </div>
        </main>

        <footer style={{
          padding: "11px", textAlign: "center", fontFamily: F,
          fontSize: 9.5, color: "rgba(90,70,40,0.38)",
          borderTop: "1px solid rgba(180,160,120,0.22)", background: BG,
        }}>
          © 2026 마음서재 by lou · Powered by Google Gemini
        </footer>
      </div>
    );
  }

  // ── ANALYZING ────────────────────────────────────────────────────
  if (appState === AppState.ANALYZING) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, fontFamily: F }}>
        <div style={{
          textAlign: "center", padding: "48px 40px", borderRadius: 16,
          background: PAGE2, border: `1px solid ${BORDER}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", margin: "0 auto 24px",
            border: "3px solid rgba(180,160,120,0.20)", borderTopColor: GREEN_DARK,
            animation: "spin 1s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ fontFamily: F, fontSize: 10, letterSpacing: "0.18em", color: MUTED, marginBottom: 10 }}>── Rx ──</p>
          <h2 style={{ fontFamily: F, fontSize: 17, color: INK, marginBottom: 8 }}>마음을 읽고 있습니다...</h2>
          <p style={{ fontFamily: F, fontSize: 13, color: MUTED }}>서가에서 책을 고르는 중입니다.</p>
        </div>
      </div>
    );
  }

  // ── PRESCRIBED ───────────────────────────────────────────────────
  if (appState === AppState.PRESCRIBED && prescription) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: BG }}>
        <Header onResetStorage={handleResetStorage} />
        <main style={{ flex: 1 }}>
          <PrescriptionView
            data={prescription}
            onReset={handleReset}
            onBookmarksChange={refreshBookmarks}
          />
        </main>
      </div>
    );
  }

  // ── ERROR ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", background: BG, fontFamily: F }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center", padding: "32px", borderRadius: 16, background: PAGE2, border: "1px solid rgba(180,80,60,0.25)" }}>
        <p style={{ fontFamily: F, fontSize: 13, color: "#7a3020", marginBottom: 20 }}>{error}</p>
        <button
          type="button"
          onClick={() => setAppState(AppState.IDLE)}
          style={{ fontFamily: F, fontSize: 12, color: GREEN_DARK, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          다시 시도하기
        </button>
      </div>
    </div>
  );
};

export default App;
