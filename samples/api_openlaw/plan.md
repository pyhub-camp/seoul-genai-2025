# OpenLaw Deno CLI 계획

## 범위

- 대상: `law`(법령) · `admrul`(행정규칙)
- 기능: 목록 조회(검색어), 본문 조회(ID) — 출력은 JSON 고정(가독용 들여쓰기)
- 스크립트: `samples/api_openlaw/cli.ts` 단일 진입점

## 인자 및 옵션

- 위치 인자: `kind` = `law` | `admrul`
- 목록 조회: `--query <검색어>`
- 본문 조회: `--id <ID>` (본문은 ID만 지원)
- 공통 옵션:
  - `--verbose` (디버깅 로그: .env 경로, 최종 URL, HTTP status 등)
  - `--output <파일>` (결과 JSON을 파일로 저장)
  - `--env-path <파일>` (기본 루트 `.env` 로드 후 추가 로드)

## 환경설정

- Git 루트의 `.env` 우선 로드(+ `--env-path` 제공 시 추가 로드)
- 필수 변수: `OPEN_LAW_OC`
  - 미설정/`test`/`your_api_key_here`이면 에러 처리

## 요청 규칙

- 목록: `http(s)://www.law.go.kr/DRF/lawSearch.do?target={kind}&type=JSON&query=...`
- 본문: `http(s)://www.law.go.kr/DRF/lawService.do?target={kind}&type=JSON&ID=...`
- 타임아웃 및 HTTP 오류 시 예외 발생(에러 숨김 없음)

## 로깅 방침 (`--verbose`)

- 읽은 `.env` 절대경로 목록 출력
- 최종 요청 URL, HTTP status, 응답 바이트/길이 출력
- 필요 시 응답 일부 스니펫(최대 300자) 출력

## 산출물

- `samples/api_openlaw/cli.ts`
- `samples/api_openlaw/README.md` (실제 검증한 실행 예시 및 출력 스니펫 포함)

## 검증 계획

- 네트워크 허용 상태에서 실제 목록/본문 호출 검증
- 규칙 목록 검색어 예시: "도로교통법"
- 법령 목록 검색어 예시: "119"
- 본문 예시 `ID`는 실제 호출로 확인 후 README에 반영

