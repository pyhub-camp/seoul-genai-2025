# Gemini 컨텍스트: 검증기반 Supabase Edge Functions 개발

## 🎯 프로젝트 개요

서울시 공무원을 위한 맞춤형 API 서비스를 Supabase Edge Functions와 Deno 런타임을 사용하여 개발합니다. 이 프로젝트의 핵심 목표는 공공 데이터를 활용하여 업무를 자동화하고 시민 서비스를 개선하는 것입니다. 모든 기능은 **한 번에 오류 없이 배포**하는 것을 원칙으로 합니다.

## 🏗️ 개발 워크플로우 및 아키텍처

모든 Edge Function은 다음의 3-Layer 패턴을 엄격히 준수합니다.

1.  **`lib.ts`**: 순수 비즈니스 로직을 담습니다. 이 파일은 HTTP 요청과 독립적이며, 재사용 가능해야 합니다.
2.  **`index.ts`**: `lib.ts`를 감싸는 HTTP 래퍼입니다. CORS, 인증, 에러 처리 등 HTTP 관련 로직만 처리합니다.
3.  **`cli.ts`**: 개발 및 테스트를 위한 커맨드라인 인터페이스입니다. `lib.ts`를 직접 호출하여 기능을 검증합니다.

**개발 순서:**

1.  **요구사항 명확화**: 사용자의 요구사항을 바탕으로 기능, 입출력, 외부 API 등을 명확히 정의합니다.
2.  **Function 이름 제안**: 기능에 맞는 `kebab-case` 형식의 이름을 제안하고 사용자 승인을 받습니다.
3.  **API Key 등록**: 필요한 API 키는 `supabase secrets set` 명령어를 사용하여 안전하게 등록합니다.
4.  **점진적 구현 및 테스트**: `lib.ts`의 핵심 로직을 10-20줄 단위의 작은 코드로 작성하고, `cli.ts`로 즉시 테스트합니다.
5.  **HTTP 래퍼 및 통합 테스트**: `index.ts`를 작성하고 `supabase functions serve`로 전체 기능을 검증합니다.
6.  **문서화 및 배포**: `schema.json`에 OpenAPI 스키마를 업데이트하고, `supabase functions deploy`로 배포합니다. 마지막으로 사용자 승인 하에 변경사항을 커밋합니다.

## 🚨 주요 제약사항 및 원칙

-   **런타임**: **Deno 전용**입니다. Node.js 및 관련 모듈(예: `require`)은 절대 사용할 수 없습니다.
-   **HTTP 요청**: `fetch()` API만 사용해야 합니다. Puppeteer, Playwright와 같은 브라우저 자동화 라이브러리는 사용할 수 없습니다.
-   **실행 환경 제약**: Supabase Edge Functions는 **10초의 실행 시간**, **512MB 메모리**, **6MB 요청/응답 크기** 제한이 있습니다.
-   **API Key 관리**: 모든 API 키와 민감 정보는 반드시 Supabase Secrets를 통해 관리해야 합니다.
-   **추측 금지**: 요구사항이 불분명할 경우, 반드시 사용자에게 역질문하여 명확히 해야 합니다.
-   **문제 발생 시 롤백**: 개발 중 문제가 발생하면 `git reset --hard HEAD`를 사용하여 즉시 이전 상태로 롤백하고 다시 시작합니다.
-   **응답 언어**: 항상 **한국어**로 소통하고 답변합니다.

## 🚀 주요 구현 예정 기능

-   **`naver-news-crawler`**: 키워드를 이용한 네이버 뉴스 크롤링
-   **`seoul-population-api`**: 서울시 구별 인구 데이터 조회
-   **`air-quality-api`**: 실시간 미세먼지 정보 조회
-   **`public-wifi-finder`**: 공공 와이파이 위치 검색
-   **`civil-complaint-stats`**: 민원 통계 및 트렌드 분석
-   **`policy-impact-analyzer`**: 정책 효과 분석 및 데이터 시각화