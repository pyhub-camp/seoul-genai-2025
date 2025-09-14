
# Supabase Edge Function 배포 가이드

이 문서는 Supabase Edge Function을 개발하고 배포하는 과정의 핵심 절차와 주요 주의사항을 안내합니다.

## 1. 기본 배포 절차

Edge Function을 배포하는 표준적인 순서는 다음과 같습니다.

### 1.1. Supabase CLI 로그인

가장 먼저 Supabase CLI에 로그인해야 합니다. 브라우저를 통해 인증이 진행됩니다.

```bash
npx supabase login
```

### 1.2. 프로젝트 연결

로컬 개발 환경을 Supabase에 호스팅된 원격 프로젝트와 연결합니다. `<project-id>`는 Supabase 대시보드의 `Project Settings > General`에서 확인할 수 있습니다.

```bash
npx supabase link --project-ref <project-id>
```

### 1.3. 함수 배포

작성한 함수를 배포합니다. `<function-name>`은 `supabase/functions` 디렉터리 아래에 있는 함수 폴더의 이름과 일치해야 합니다.

```bash
npx supabase functions deploy <function-name>
```

## 2. Secret 관리

API 키와 같이 민감한 정보는 코드가 아닌 Supabase의 Secret 관리 기능을 통해 안전하게 저장해야 합니다.

- **Secret 설정**:
  ```bash
  npx supabase secrets set MY_API_KEY=your_secret_value
  ```

- **Secret 목록 확인**:
  ```bash
  npx supabase secrets list
  ```

- **코드에서 Secret 사용**:
  `Deno.env.get()`를 사용하여 코드 내에서 Secret 값을 불러올 수 있습니다.
  ```typescript
  const apiKey = Deno.env.get("MY_API_KEY");
  ```

## 3. 주요 주의사항

### 3.1. CORS (Cross-Origin Resource Sharing) 설정

GPTs Action과 같이 브라우저 환경에서 Edge Function을 호출하려면 CORS 설정이 필수적입니다. `OPTIONS` 메서드에 대한 preflight 요청을 처리하고, 실제 응답에 `Access-Control-Allow-Origin` 헤더를 포함해야 합니다.

- **와일드카드(`*`)**: 개발 및 GPTs 테스트 시 편리하지만, 프로덕션 환경에서는 보안을 위해 특정 도메인을 명시하는 것이 좋습니다.

### 3.2. 응답 크기 제한

- **Supabase**: Edge Function의 최대 응답 크기는 **6MB**입니다.
- **GPTs Action**: GPTs가 처리할 수 있는 API 응답의 크기는 약 **100KB**로 매우 작습니다.

이를 해결하기 위해, 응답 데이터가 클 경우(특히 법령 본문 등) 결과를 직접 반환하는 대신 Supabase Storage에 JSON 파일로 저장하고 해당 파일의 **Public URL**을 반환하는 패턴을 사용해야 합니다.

### 3.3. 로컬 테스트의 한계

`npx supabase serve` 명령으로 로컬 테스트를 진행할 수 있지만, `Deno.env.get()`으로 Secret을 불러오는 등 일부 기능은 실제 배포 환경과 다르게 동작할 수 있습니다. 따라서 로컬 테스트 후에는 반드시 실제 환경에 배포하여 최종 테스트를 진행하는 것이 중요합니다.

### 3.4. 인증 문제

CLI 명령어 실행 시 권한 관련 오류가 발생하면, `npx supabase login` 명령을 다시 실행하여 인증 세션을 갱신해야 할 수 있습니다.

## 4. 기본 `index.ts` 템플릿

아래는 CORS 처리, Secret 접근, 기본 에러 핸들링을 포함하는 최소 기능의 Edge Function 템플릿입니다.

```typescript
// supabase/functions/<your-function-name>/index.ts

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Secret 키 가져오기
    const apiKey = Deno.env.get("MY_API_KEY");
    if (!apiKey) {
      throw new Error("MY_API_KEY is not set in Supabase secrets.");
    }

    // URL 파라미터 파싱
    const url = new URL(req.url);
    const name = url.searchParams.get('name') || 'World';

    const data = {
      message: `Hello, ${name}! Your API key starts with ${apiKey.substring(0, 4)}...`,
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
```

---

문의 : 이진석 me@pyhub.kr
