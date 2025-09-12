# api_openlaw (Supabase Edge Function)

OpenLaw D.R.F API를 Supabase Edge Function으로 포팅한 샘플입니다. 샘플 CLI(`samples/api_openlaw`) 코드를 참조하지 않고 필요한 헬퍼만 복사하여 구현했습니다.

## 특징
- 메서드: GET, OPTIONS만 지원 (POST 미지원)
- 인증: 무인증(익명) 요청 허용, Authorization 헤더 미사용
- 입력: 모든 인자는 쿼리 파라미터로만 전달 (URL 경로에 포함 금지)
- 대용량 처리: `law.detail` 응답은 Storage `caches-bucket`에 JSON 저장 후 서명 URL만 반환
- CORS: `Access-Control-Allow-Origin: *`, `GET, OPTIONS` 허용

## 지원 액션 및 파라미터
- `action=law.search` — 법령 검색
  - `query`(필수), `display`(옵션), `page`(옵션)
- `action=law.detail` — 법령 상세(본문)
  - `idOrMst`(필수) — ID 또는 MST
  - 본문 JSON은 Storage에 저장하고 `{ url: "<signed-url>" }` 형태로 응답
- `action=admrul.search` — 행정규칙 검색
  - `query`(필수), `display`(옵션), `page`(옵션)

## 예시 호출
- `GET /api_openlaw?action=law.search&query=119`
- `GET /api_openlaw?action=law.detail&idOrMst=011349`
- `GET /api_openlaw?action=admrul.search&query=교통&page=1&display=20`

## 환경 변수 (프로젝트 시크릿)
Edge Functions 실행 환경에서 다음 변수를 설정해 주세요.

- `OPEN_LAW_OC`: OpenLaw API OC 키
- `SUPABASE_URL`: 프로젝트 URL (예: https://xxxxxxxx.supabase.co)
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role 키 (서버 전용, 노출 금지)

> 주의: Service Role 키는 강력한 권한을 가지므로 클라이언트에 절대 노출하지 마세요. 본 함수는 서버 측에서만 사용합니다.

## Storage 버킷
- 버킷명: `caches-bucket`
- 권장 설정: 비공개(Private)
- 함수는 업로드 후 1시간 유효한 서명 URL을 생성하여 반환합니다.
- 버킷은 대시보드(Storage)에서 생성해 주세요.

## Supabase 명령 안내 (인증/연결)
> 함수에서 직접 인증을 수행하지 않습니다. 아래 명령을 사용자가 직접 실행해 주세요.

```sh
npx supabase login
npx supabase link --project-ref <project-id>
```

`<project-id>`는 Supabase 대시보드의 Project Settings에서 확인할 수 있습니다.

## 배포/로컬 실행
```sh
# (옵션) 로컬에서 함수 실행
npx supabase functions serve api_openlaw

# 배포
npx supabase functions deploy api_openlaw
```

필요 시 프로젝트 시크릿 설정:
```sh
npx supabase secrets set OPEN_LAW_OC=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
```

## 구현 세부
- OpenLaw 호출은 D.R.F(JSON) 엔드포인트를 사용합니다.
- `law.detail` 저장 키는 요청 파라미터를 SHA-256 해시하여 `law_detail/<hash>.json`으로 저장합니다(중복 방지).
- 에러가 발생하면 JSON `{ error, ...details }`로 응답합니다.

## 참고
- 이 함수 코드는 `samples/api_openlaw/lib.ts`를 직접 참조하지 않고 필요한 부분만 복사하여 재구성했습니다.
- Deno 표준 라이브러리는 버전 고정 URL(`deno.land/std@0.224.0`)로 사용했습니다.
