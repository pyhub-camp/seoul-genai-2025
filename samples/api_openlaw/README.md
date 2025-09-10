# 국가법령정보 API Deno CLI

이 스크립트는 국가법령정보 API를 사용하여 법령 정보를 검색하고 조회하는 Deno CLI 도구입니다.

## 요구사항

- [Deno](https://deno.land/) 런타임

## 환경변수

스크립트를 실행하기 전에, git 저장소의 루트 경로에 `.env` 파일을 생성하고 아래와 같이 API 인증 키를 설정해야 합니다.

```
OPEN_LAW_OC=발급받은_인증키
```

`--env-path` 옵션을 사용하여 다른 경로의 `.env` 파일을 추가로 로드할 수 있습니다.

## 사용법

Deno 태스크 러너를 통해 스크립트를 실행할 수 있습니다.

**법령 목록 검색**

```sh
deno run --allow-net --allow-read --allow-env <path-to-cli.ts> "<검색어>"
```

**법령 본문 조회**

```sh
deno run --allow-net --allow-read --allow-env <path-to-cli.ts> --id <법령ID 또는 법령MST>
```

### 옵션

-   `--id <ID>`: 법령 ID 또는 법령 마스터 번호(MST)를 지정하여 해당 법령의 본문을 조회합니다.
-   `--output <FILE_PATH>`: 결과를 지정된 파일 경로에 저장합니다.
-   `--verbose`: API 요청 URL, API 응답 등 상세한 디버깅 메시지를 출력합니다.
-   `--env-path <FILE_PATH>`: 기본 `.env` 파일 외에 추가로 로드할 `.env` 파일 경로를 지정합니다.

## 실행 예시

> **참고**: 아래 예시는 `OPEN_LAW_OC` 환경변수가 올바르게 설정되었다고 가정합니다. `<path-to-cli.ts>`는 실제 `cli.ts` 파일의 상대 경로로 변경해야 합니다. (예: `samples/api_openlaw/cli.ts`)

### 1. "도로교통법" 검색

```sh
deno run --allow-net --allow-read --allow-env samples/api_openlaw/cli.ts "도로교통법"
```

### 2. "도로교통법" 검색 결과를 파일로 저장

```sh
deno run --allow-net --allow-read --allow-env samples/api_openlaw/cli.ts "도로교통법" --output search_result.json
```

### 3. 법령 ID로 본문 조회 (예: 법령 ID '001312')

```sh
deno run --allow-net --allow-read --allow-env samples/api_openlaw/cli.ts --id 001312
```

### 4. 상세 정보와 함께 본문 조회

```sh
deno run --allow-net --allow-read --allow-env samples/api_openlaw/cli.ts --id 001312 --verbose
```
