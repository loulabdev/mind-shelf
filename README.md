# 마음서가 (Mind Shelf)

감정을 기록하면, 마음과 공명하는 책을 골라드립니다.

---

## 프로젝트 소개

**마음서가(Mind Shelf)** 는 사용자가 입력한 감정과 마음 상태를 AI가 분석하여  
그에 어울리는 한국어 도서를 추천하고,  
가까운 공공도서관의 소장 여부까지 연결해주는 감성 독서 큐레이션 서비스입니다.

> "이 순간의 마음을 기록하는, 작은 서가"

단순한 책 추천이 아니라,  
**마음 계절 선택 → 감정 입력 → 도서 추천 → 도서관 소장 조회 → 기록 저장**  
까지 이어지는 흐름을 중심으로 설계했습니다.

---

## 주요 기능

- 🍂 **마음의 계절 선택** — 봄·여름·가을·겨울로 현재 감정 상태를 직관적으로 표현
- 💬 **감정 입력 기반 AI 독서 처방** — Gemini AI가 감정을 분석하고 맞춤 도서 추천
- 📚 **다양한 장르 추천** — 에세이, 소설, 시집, 그림책, 독립출판, 그래픽노블 등
- 🎵 **어울리는 음악 키워드 제공** — 책과 함께할 음악 분위기 안내
- 🎧 **오디오북 플랫폼 안내** — 밀리의서재, 윌라, 네이버 오디오클립 연결
- 📍 **위치 기반 도서관 소장 조회** — 가까운 공공도서관 소장 및 대출 가능 여부 확인
- 🔖 **북마크 저장** — 마음에 드는 도서 북마크
- 🕐 **서가 기록** — 추천 받은 처방 기록 저장 및 재열람
- 📤 **공유하기** — 서가 기록과 북마크 도서를 텍스트로 공유
- 🗑 **기록 초기화** — 북마크 및 서가 기록 전체 삭제

---

## 기술 스택

### Frontend
- React + TypeScript
- Vite
- Lucide React Icons

### API / Services
- Google Gemini API (`gemini-2.0-flash`)
- 도서관 정보나루 API
- 국립중앙도서관 API
- 카카오 Books API
- 네이버 Books API
- Google Books API

### 인프라
- Vercel (배포)
- localStorage (기록 저장)
- Geolocation API (위치 기반 도서관 검색)

---

## 폴더 구조

```
src/
  components/
    PrescriptionView.tsx   # 추천 결과 화면
    BookCover.tsx          # 책 표지 컴포넌트
  services/
    geminiService.ts       # Gemini AI 연동
    libraryService.ts      # 도서관 소장 조회
    locationService.ts     # 위치 서비스
    storageService.ts      # 로컬 저장소
    bookCoverService.ts    # 책 표지 이미지
    bookSearchOrchestrator.ts  # 도서 검색 통합
    editionIsbnService.ts  # ISBN 판본 수집
  data/
    emotionBooks.ts        # 감정별 큐레이션 도서
  types.ts
  App.tsx
```

---

## 환경 변수

```env
VITE_GEMINI_API_KEY=         # Google Gemini API 키
VITE_KAKAO_REST_API_KEY=     # 카카오 REST API 키
VITE_NAVER_CLIENT_ID=        # 네이버 클라이언트 ID
VITE_NAVER_CLIENT_SECRET=    # 네이버 클라이언트 시크릿
VITE_GOOGLE_BOOKS_API_KEY=   # Google Books API 키
VITE_LIBRARY_API_KEY=        # 도서관 정보나루 API 키
NL_SEOUL_KEY=                # 국립중앙도서관 API 키
```

---

## 로컬 실행

```bash
npm install
npm run dev
```

---

## 배포

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://paper-pharmacy-pearl.vercel.app)

---

© 2026 마음서가 by lou · Powered by Google Gemini