# Supabase Edge Function 배포 가이드 - 국가법령정보 API

## 무엇을 만드나요?
@samples/api_openlaw/ Deno CLI 프로그램을 Supabase Edge Function으로 포팅하여 GPTs Action에서 활용할 수 있는 Web API를 구축합니다.
- 현행법령 및 행정규칙 검색/조회 기능 제공
- GPTs에서 바로 사용 가능한 REST API 형태

## 어떻게 동작하나요?

### 요청 형식
- **목록 조회**: `GET /api_openlaw?type=law&query=도로교통법`
- **본문 조회**: `GET /api_openlaw?type=law&id=001638`
- **파라미터**:
  - `type`: `law`(현행법령) 또는 `admrul`(행정규칙)
  - `query`: 검색 키워드 (목록 조회 시)
  - `id`: 법령/행정규칙 ID (본문 조회 시)

### 응답 처리 방식
- **작은 응답(목록)**: 직접 JSON 반환
- **큰 응답(본문)**: Supabase Storage(caches-bucket)에 저장 후 URL 반환
  ```json
  {
    "type": "storage",
    "url": "https://[ref].supabase.co/storage/v1/object/public/caches-bucket/law_001638.json",
    "filename": "law_001638.json"
  }
  ```

## 구현 방법

### 1. 환경 준비
```bash
# API 키 확인 (이미 설정되어 있는지 확인)
npx supabase secrets list

# OPEN_LAW_OC가 없다면 설정
npx supabase secrets set OPEN_LAW_OC=your_api_key_here
```

### 2. 코드 작성
- **lib.ts**: samples/api_openlaw/lib.ts를 그대로 복사
- **index.ts**: HTTP 래퍼 생성 (CORS 처리, Query Parameter 파싱)
- **Storage 처리**: 100KB 초과 시 caches-bucket에 JSON 저장

### 3. 배포 및 테스트
```bash
# 프로젝트 연결 (인증 필요시만)
npx supabase link --project-ref <project-id>

# 함수 배포
npx supabase functions deploy api_openlaw

# 동작 테스트
curl "https://[ref].supabase.co/functions/v1/api_openlaw?type=law&query=도로교통법"
```

## Supabase 환경 정보
- **Project Name**: `seoul-genai-2025` (npx supabase project list로 ID 조회 가능)
- **Storage Bucket**: `caches-bucket` (PUBLIC 버킷, signed URL 불필요)
- **실행 제한**: 10초 최대 실행시간, 6MB 응답 크기

## 꼭 지켜주세요
✅ **GET 요청만 지원** (조회 목적)
✅ **Query Parameter 사용** (URL 경로에 파라미터 포함 금지)
✅ **samples 코드 재사용** (lib.ts를 복사해서 활용)
✅ **100KB 초과시 Storage 활용** (GPTs Action 제한 회피)
✅ **CORS 헤더 필수 설정** (브라우저 접근 허용)
✅ **npx supabase 명령 사용** (npm이 아닌 npx)

## 주의사항

### 인증 문제 발생시
유저에게 다음 명령을 안내:
```bash
npx supabase login
npx supabase link --project-ref <project-id>
```
(project ID는 Supabase 사이트 > Project Settings에서 확인)

### 기타 제약사항
- **로컬 테스트**: `supabase serve` 지원 불가 → 바로 배포 후 테스트
- **CLI 인자**: `verbose` 제외하고 기존 CLI 인자 그대로 지원
- **인증**: Authorization 헤더 미지원 (익명 요청)
- **README**: 구현 완료 후 함수 폴더에 사용법 문서 생성