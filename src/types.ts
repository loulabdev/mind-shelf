export interface Book {
  title: string;
  author: string;
  publisher: string;
  year: string | number;
  isbn?: string;
  genre: string;
  why_this_book: string;
  healing_point: string;
  reading_guide: string;
  quote: string;
}

export interface EmotionalAnalysis {
  detected_emotion: string;
  intensity: number;
  empathy_message: string;
}

export interface AdditionalCare {
  activities: string[];
  professional_help?: string;
}

export interface Prescription {
  emotional_analysis: EmotionalAnalysis;
  recommended_books: Book[];
  additional_care: AdditionalCare;
}

export interface SavedPrescription {
  id: string;
  createdAt: string;
  userInput: string;
  prescription: Prescription;
}

export interface BookBookmark {
  id: string;
  createdAt: string;
  book: Book;
}

export interface LibraryAvailability {
  libCode?: string;
  libraryName: string;
  address: string;
  homepage?: string;
  telephone?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  hasBook: boolean;
  loanAvailable?: boolean;
  mapUrl?: string;
  // [B] 어떤 ISBN으로 이 도서관을 찾았는지 추적
  foundByIsbn?: string;
}

// ============================================================
// [A] 판본 ISBN 수집 단계별 카운트 구조화
// ============================================================

/** 각 소스별 ISBN 수집 결과 */
export interface IsbnSourceStat {
  /** 수집 출처: "원본ISBN" | "최신판검색" | "정보나루" | "국립중앙도서관" */
  source: "원본ISBN" | "최신판검색" | "정보나루" | "국립중앙도서관";
  count: number;
  isbns: string[];
}

/** ISBN 수집 전체 통계 (editionIsbnService에서 반환) */
export interface IsbnCollectionStats {
  totalCount: number;
  sources: IsbnSourceStat[];
}

// ============================================================
// [D] 도서관 검색 메타 — "매칭 실패" vs "실제 미소장" 구분
// ============================================================

/** 도서관 검색 결과 메타 정보 */
export interface LibrarySearchMeta {
  /** 실제로 검색에 사용한 ISBN 수 (0이면 매칭 실패) */
  isbnCount: number;
  /** 검색한 지역 수 */
  regionCount: number;
  /** ISBN 소스별 통계 (선택) */
  isbnStats?: IsbnCollectionStats;
}

export enum AppState {
  IDLE = "IDLE",
  ANALYZING = "ANALYZING",
  PRESCRIBED = "PRESCRIBED",
  ERROR = "ERROR",
}
