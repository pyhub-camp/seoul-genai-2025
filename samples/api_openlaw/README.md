# OpenLaw Deno CLI 사용 가이드

본 CLI는 국가법령정보 OpenAPI를 사용하여 법령(`law`) 및 행정규칙(`admrul`)의 목록/본문을 조회합니다. 출력은 항상 JSON이며, 기본적으로 가독용 들여쓰기를 적용합니다.

## 요구 사항

- Deno 2.x 이상
- 저장소 루트의 `.env`에 `OPEN_LAW_OC` 설정 필요
  - 예: `OPEN_LAW_OC=your_id`
  - 값이 없거나 `test`/`your_api_key_here`이면 에러로 종료

## 실행 방법

```sh
# 도움말(형식)
deno run -A samples/api_openlaw/cli.ts <law|admrul> (--query <검색어> | --id <ID>) [--verbose] [--output <파일>] [--env-path <파일>]
```

### 옵션

- `--query <검색어>`: 목록 조회
- `--id <ID>`: 본문 조회(법령은 `법령ID`, 행정규칙은 `행정규칙일련번호` 사용)
- `--verbose`: 디버깅 정보 출력(.env 로드 경로, 최종 URL, HTTP status 등)
- `--output <파일>`: 결과 JSON을 파일로 저장
- `--env-path <파일>`: 기본 루트 `.env`를 읽은 뒤, 추가로 이 경로의 `.env`를 로드하여 덮어씀

## 예시(검증 완료)

아래 예시는 실제 호출로 검증한 값입니다. 네트워크·데이터는 수시로 변동될 수 있습니다.

### 1) 법령 목록: "119"

```sh
deno run -A samples/api_openlaw/cli.ts law --query 119 --verbose
```

출력 필드 예시: `LawSearch.totalCnt`, `LawSearch.law[].법령명한글`, `LawSearch.law[].법령ID`, ...

### 2) 법령 본문: ID=011349

```sh
deno run -A samples/api_openlaw/cli.ts law --id 011349 --verbose
```

출력 필드 예시: `법령.기본정보.법령명_한글`, `법령.개정문`, `법령.조문`, ...

### 3) 행정규칙 목록: "교통"(가용 예시)

```sh
deno run -A samples/api_openlaw/cli.ts admrul --query 교통 --verbose
```

참고: "도로교통법"으로는 시점에 따라 검색 결과가 0건일 수 있습니다. 검증 가능한 예시로 "교통"을 사용합니다.

### 4) 행정규칙 본문: ID=2100000001267

```sh
deno run -A samples/api_openlaw/cli.ts admrul --id 2100000001267 --verbose
```

출력 필드 예시: `AdmRulService.행정규칙기본정보.행정규칙명`, `AdmRulService.개정문`, `AdmRulService.조문내용`, ...

### 5) 결과를 파일로 저장

```sh
deno run -A samples/api_openlaw/cli.ts law --query 119 --output ./tmp/law-119.json
```

## 동작 메모

- 항상 JSON(type=JSON)으로 요청하며, 오류/빈 응답은 예외로 표출합니다.
- `--verbose` 시 다음 정보를 추가 출력합니다.
  - 로드된 `.env` 절대경로들
  - 최종 요청 URL, HTTP status, 응답 바이트/길이
- 한글 터미널에서 인코딩이 깨져 보일 수 있습니다. 필요한 경우 `--output`으로 파일 저장 후 확인하세요.

## 트러블슈팅

- `환경변수 OPEN_LAW_OC 가 유효하지 않습니다` 에러:
  - `.env`의 `OPEN_LAW_OC`를 유효한 값으로 설정했는지 확인하세요(예: `test`/`your_api_key_here`는 허용되지 않음).
- `HTTP 4xx/5xx` 또는 `JSON 파싱 실패` 에러:
  - `--verbose`로 원문 스니펫과 URL을 확인해 요청 파라미터를 점검하세요.

## 관련 스펙 문서(루트 상대 경로)

- `specs/law.go.kr/현행법령목록조회.md`
- `specs/law.go.kr/현행법령본문조회.md`
- `specs/law.go.kr/행정규칙목록조회.md`
- `specs/law.go.kr/행정규칙본문조회.md`

