
# Supabase Edge Function: 국가법령정보 API

이 Edge Function은 국가법령정보 API를 통해 현행법령 및 행정규칙을 조회하는 웹 API를 제공합니다. GPTs Action 등 외부 서비스에서 쉽게 법령 정보를 검색하고 조회할 수 있도록 설계되었습니다.

## API Endpoint

`https://[your-project-ref].supabase.co/functions/v1/api_openlaw`

## 요청 방식

- **HTTP Method**: `GET`
- **Query Parameters**:
  - `type` (필수): 조회할 법령의 종류입니다.
    - `law`: 현행법령
    - `admrul`: 행정규칙
  - `query` (목록 조회 시 필수): 검색할 키워드를 지정합니다.
  - `id` (본문 조회 시 필수): 조회할 법령/행정규칙의 고유 ID를 지정합니다.

### 예시

- **법령 목록 검색 (도로교통법)**
  ```
  GET /api_openlaw?type=law&query=도로교통법
  ```

- **법령 본문 조회 (ID: 001638)**
  ```
  GET /api_openlaw?type=law&id=001638
  ```

## 응답 형식

### 일반 응답 (100KB 미만)

API 조회 결과가 100KB 미만일 경우, 국가법령정보 API의 응답 JSON을 그대로 반환합니다.

```json
{
  "lawSearch": {
    "target": "law",
    "query": "도로교통법",
    "totalCnt": 10,
    "page": 1,
    "law": [
      // ... 법령 목록
    ]
  }
}
```

### 대용량 응답 (100KB 이상)

API 응답(주로 법령 본문)이 100KB를 초과할 경우, 결과는 Supabase Storage `caches-bucket`에 JSON 파일로 저장되고, 해당 파일에 접근할 수 있는 URL을 담은 JSON 객체를 반환합니다.

```json
{
  "type": "storage",
  "url": "https://[ref].supabase.co/storage/v1/object/public/caches-bucket/law_001638.json",
  "filename": "law_001638.json"
}
```

## 배포 및 테스트

1. **API 키 설정 (최초 1회)**:
   국가법령정보센터에서 발급받은 API 키를 Supabase secret으로 설정합니다.
   ```bash
   npx supabase secrets set OPEN_LAW_OC=your_api_key_here
   ```

2. **Edge Function 배포**:
   ```bash
   npx supabase functions deploy api_openlaw
   ```

3. **테스트**:
   배포 후 `curl` 명령어를 사용하여 API가 올바르게 동작하는지 확인할 수 있습니다.
   ```bash
   # 아래 [your-project-ref] 부분을 실제 Supabase 프로젝트의 ref ID로 변경하세요.
   curl "https://[your-project-ref].supabase.co/functions/v1/api_openlaw?type=law&query=도로교통법"
   ```
