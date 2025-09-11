# OpenLaw API 샘플 CLI (Deno)

법령정보 OpenAPI를 사용한 간단한 CLI 샘플입니다. 검색과 상세 조회를 지원합니다.

## 준비

- Deno 설치 필요: https://deno.land
- 리포지토리 루트에 `.env` 파일 생성 후 `OPEN_LAW_OC` 설정

```
# ./.env (예시)
OPEN_LAW_OC=your_issued_oc_here
```

> 주의: 실제 값은 저장소에 커밋하지 마세요. `.gitignore`에 의해 `.env*`는
> 제외됩니다.

## 사용법

명령은 저장소 루트에서 실행합니다.

```
deno run -A samples/api_openlaw/cli.ts law --query 도로교통
deno run -A samples/api_openlaw/cli.ts law --id 011349 --verbose
deno run -A samples/api_openlaw/cli.ts admrul --query 교통 --output tmp/out.json
```

옵션:

- `--query <텍스트>`: 목록 검색 질의어
- `--id <ID_or_MST>`: 법령 상세 조회 (ID 우선, 실패 시 MST 재시도)
- `--output <경로>`: 결과 JSON을 파일로 저장 (로그는 stderr)
- `--env-path <경로>`: `.env` 대체 경로 지정 (기본: `./.env`)
- `--verbose`: 디버그 정보 출력 (요청 URL, `.env` 경로 등)

## 인코딩 및 출력 팁

- 일부 터미널에서 한글 출력이 깨질 수 있습니다. 큰 JSON은 `--output`으로 파일에
  저장 후 편집기로 확인하세요.

## 개발

포맷/린트/캐시/테스트 명령:

```
deno fmt
deno lint
deno cache samples/api_openlaw/*.ts
deno test -A
```

## 참고

- 법령 목록 검색: `http://www.law.go.kr/DRF/lawSearch.do?target=law`
- 법령 본문 상세: `http://www.law.go.kr/DRF/lawService.do?target=law`
- 행정규칙 목록 검색: `http://www.law.go.kr/DRF/lawSearch.do?target=admrul`
