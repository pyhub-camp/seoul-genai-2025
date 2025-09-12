# Supabase Edge Function 개발

@samples/api_openlaw/ Deno CLI 프로그램을 Supabase Edge Function으로 포팅할 계획을 세우고 컨펌받고 진행해줘.

+ 샘플 프로젝트는 코드는 참조하지 말고, 복사해서 활용해줘.
+ 조회 목적이므로 GET 요청으로만 구현합니다. POST 요청은 생성/수정/삭제 요청 시에 사용하므로 지원하지 않음.
+ 모든 인자는 Query Parameters를 통해 받아줘. 절대 URL에는 포함시키지마.
+ 구현을 간단하게 할 목적으로 인증(Authorization) 헤더는 지원하지 않고, 익명 요청을 지원합니다.
+ 관련 구현 내역은 각 함수 폴더의 README.md 파일에 생성해줘.

## IMPORTANT

+ supabase 명령은 npx supabase 명령을 사용해줘.
+ supabase 인증이 필요하면 네가 직접 하지 말고, 유저에게 아래 명령을 안내해줘.
    - project ID는 supabase 사이트에서 개별 프로젝트의 Project Settings 에서 확인할 수 있다고 안내해줘.

```
npx supabase login
npx supabase link --project-ref <project-id>
```

## API 본문 응답 시에는 Storage에 저장하고 URL만 반환

+ GPTs Action에서는 받을 수 있는 서버의 최대 응답 크기 제한 (약 100KB)이 있습니다.
+ 법령/조례 본문 조회 API에서는 100KB가 넘는 응답이 많습니다.
    - 본문 조회 API에서는 응답내역을 Storage에 저장하고, URL로 응답토록 합시다.
    - Supabase storage의 `caches-bucket` 버킷을 사용합시다.
