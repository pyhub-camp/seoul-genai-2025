# OpenLaw Deno CLI 구현 보고서

## 개요

- 목적: 국가법령정보(OpenAPI)를 활용한 Deno 기반 CLI 구현으로 법령(`law`)·행정규칙(`admrul`)의 목록/본문 조회를 JSON으로 제공
- 산출물:
  - `samples/api_openlaw/cli.ts` — 단일 실행 스크립트
  - `samples/api_openlaw/README.md` — 사용자 가이드(실행 예시 포함)
  - `samples/api_openlaw/plan.md` — 구현 계획 문서
  - `samples/api_openlaw/report.md` — 본 구현 보고서

## 요구 사항 및 제약

- 실행 환경: Deno 2.x (검증: deno 2.4.5)
- 환경 변수: 저장소 루트의 `.env`에서 `OPEN_LAW_OC` 필수
  - 미설정 또는 `test`/`your_api_key_here`인 경우 즉시 예외 발생
- 네트워크: 실제 OpenAPI 호출이 필요(사용자 컨펌에 따라 허용됨)
- 출력 형식: JSON 고정, 가독용 들여쓰기 적용
- 보안/구성: `.env`는 읽기만 수행(절대 덮어쓰지 않음), `--env-path`로 추가 로드 지원

## 설계 요약

### 명령행 인터페이스

- 위치 인자: `kind` = `law` | `admrul`
- 동작 전환:
  - 목록 조회: `--query <검색어>`
  - 본문 조회: `--id <ID>` — 범위 축소: ID만 지원(법령=법령ID, 행정규칙=행정규칙일련번호)
- 공통 옵션:
  - `--verbose`: 디버깅 로그(.env 로드 경로, 최종 URL, HTTP status, 응답 길이)
  - `--output <파일>`: 결과 JSON 파일 저장
  - `--env-path <파일>`: 루트 `.env` 로드 후 추가로 병합 로드

### 환경 로딩 및 검증

- 저장소 루트 탐색: 현재 작업 경로 기준 상위로 올라가며 `.git`/`.env`/`.env.example` 유무로 루트 추정
- `.env` 파싱: 주석/빈 줄 무시, `key=value` 파싱, 양끝 따옴표 제거 처리
- `OPEN_LAW_OC` 유효성: 공백·금지 플레이스홀더(`test`, `your_api_key_here`) 거부

### API 엔드포인트·요청 규칙

- 목록 조회: `https://www.law.go.kr/DRF/lawSearch.do?OC=<OC>&target=<kind>&type=JSON&query=<검색어>`
- 본문 조회: `https://www.law.go.kr/DRF/lawService.do?OC=<OC>&target=<kind>&type=JSON&ID=<ID>`
- 전송·타임아웃: `fetch` + AbortController, 기본 15초 타임아웃
- 에러 처리: HTTP 비정상 상태, 빈 본문, JSON 파싱 실패 모두 예외 발생(에러 숨김 없음)

### 출력·로깅 정책

- 기본 출력: 결과 JSON을 pretty-print(JSON.stringify, indent=2)
- `--output`: 지정 경로 디렉토리 생성 후 파일 저장
- `--verbose`: 로드한 `.env` 절대경로, 요청 URL, HTTP status, 응답 길이 출력(원문 스니펫은 파싱 실패·에러 시 일부만)

## 구현 주요 코드 포인트(`cli.ts`)

- 인자 파싱: 위치 인자 + 스위치형 옵션 수동 파싱(단순성·의존성 최소화)
- 루트 탐색: `findRepoRoot`로 `.env` 기본 경로 결정
- `.env` 병합 로드: 루트 → `--env-path` 순서로 덮어쓰기
- URL 생성: 목록/본문 별 `URLSearchParams` 사용(한글 검색어 자동 인코딩)
- 네트워크: `fetchJson`에서 status 검증·JSON 파싱·빈 응답 검사

## 동작 검증

실제 OpenAPI 호출로 아래를 확인했습니다(값은 시점에 따라 변동 가능). OC 값은 보고서에서 표기상 `OC=<OC>`로 마스킹합니다.

1) 법령 목록: 검색어 "119"

```sh
deno run -A samples/api_openlaw/cli.ts law --query 119 --verbose
```

- 관찰: `status=200`, `totalCnt="7"` 확인, `LawSearch.law[]`에 관련 법령들 노출(예: 119구조·구급 관련 법령들)

2) 법령 본문: ID=`011349`

```sh
deno run -A samples/api_openlaw/cli.ts law --id 011349 --verbose
```

- 관찰: `status=200`, 응답 길이 약 57KB, `법령.기본정보.법령명_한글="119구조ㆍ구급에 관한 법률"` 등 필드 확인

3) 행정규칙 목록: 검색어 "도로교통법" 및 "교통"

```sh
# 결과 0건일 수 있음(시점 의존)
deno run -A samples/api_openlaw/cli.ts admrul --query 도로교통법 --verbose

# 대체 예시(검증 성공)
deno run -A samples/api_openlaw/cli.ts admrul --query 교통 --verbose
```

- 관찰: "도로교통법"은 `totalCnt="0"`였음. "교통" 검색 시 다수 결과 수신(`AdmRulSearch.admrul[]` 목록 포함)

4) 행정규칙 본문: ID=`2100000001267`

```sh
deno run -A samples/api_openlaw/cli.ts admrul --id 2100000001267 --verbose
```

- 관찰: `status=200`, `AdmRulService.행정규칙기본정보.행정규칙명` 등 본문 필드 확인, 응답 길이 약 1.2KB

5) 파일 저장 동작

```sh
deno run -A samples/api_openlaw/cli.ts law --query 119 --output ./tmp/law-119.json --verbose
```

- 관찰: 디렉토리 자동 생성 후 파일 생성, 표준출력 미사용, `--verbose`에 절대경로 표시

## 예외·오류 케이스 검증

- `OPEN_LAW_OC` 미설정/금지값 → 즉시 예외: "환경변수 OPEN_LAW_OC 가 유효하지 않습니다"
- HTTP 에러(가정) → `HTTP <status>: <본문 일부>` 형태 예외
- 비JSON 응답/깨짐 → `JSON 파싱 실패` 예외와 원문 스니펫 300자 내 제공
- 빈 본문 → "응답 본문이 비어 있습니다." 예외

## 파일 구조 및 변경 목록

- `samples/api_openlaw/cli.ts` — CLI 스크립트(메인 로직)
- `samples/api_openlaw/README.md` — 실행 가이드 및 검증 예시
- `samples/api_openlaw/plan.md` — 합의된 구현 계획
- `samples/api_openlaw/report.md` — 본 보고서

## 제한사항 및 향후 보완점

- 본문 조회는 현재 `ID`만 지원(법령 `MST`, 규칙 `LID` 등은 미구현)
- 목록 페이징 파라미터(`page`, `display` 등) 미지원 — 필요 시 옵션 추가 예정
- 네트워크 종속 — 일시적 장애·스키마 변동 시 오류 가능
- 스키마 변경 대응 — 현재는 단순 파싱(엄격한 스키마 검증은 비활성)

## 결론

요구사항(한국어 CLI, JSON 응답, pretty 출력, `.env` 로드·검증, `--verbose`/`--output`/`--env-path` 지원, 오류 은닉 금지)을 충족하는 Deno CLI를 구현·검증했습니다. 추가로 원하시는 옵션(페이징, ID 대안 파라미터 지원 등)이나 출력 포맷 조정이 있으면 알려주세요.

