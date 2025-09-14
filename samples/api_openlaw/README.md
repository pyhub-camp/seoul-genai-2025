# 국가법령정보 API Deno CLI

이 스크립트는 국가법령정보 Open API를 사용하여 행정규칙 및 현행법령의 목록과 본문을 조회하는 Deno CLI 도구입니다.

## 사전 준비

1.  **Deno 설치**: 이 스크립트를 실행하려면 [Deno](https://deno.land/)가 설치되어 있어야 합니다.
2.  **API 인증키 설정**: 국가법령정보센터에서 발급받은 API 인증키가 필요합니다. 프로젝트 루트 경로(`.`)에 `.env` 파일을 생성하고 아래와 같이 `OPEN_LAW_OC` 값을 추가하세요.

    ```.env
    OPEN_LAW_OC=your_api_key_here
    ```

## 실행 권한

스크립트를 처음 실행할 때 Deno는 환경 변수, 네트워크, 파일 읽기/쓰기 권한을 요청합니다. 아래 명령어를 사용하여 필요한 모든 권한을 부여하고 실행할 수 있습니다.

```bash
deno run --allow-env --allow-net --allow-read --allow-write samples/api_openlaw/cli.ts [명령] [인자]
```

## 사용법

```
cli.ts <type> [query] [options]
```

### 인자 (Arguments)

-   `<type>` (필수): 조회할 법령의 종류입니다.
    -   `행정규칙`
    -   `현행법령`
-   `[query]` (`--id`가 없을 경우 필수): 검색할 단어입니다.

### 옵션 (Options)

-   `--id <ID>`: 목록 조회 결과에서 얻은 `행정규칙ID` 또는 `법령ID`를 사용하여 해당 법령/규칙의 본문을 직접 조회합니다.
-   `--output <file_path>`: 결과를 콘솔에 출력하는 대신 지정된 파일 경로에 저장합니다.
-   `--verbose`: API 요청 URL, 원시 응답 등 상세한 디버깅 정보를 출력합니다.
-   `--env-path <file_path>`: 기본 `.env` 파일 외에 추가적인 `.env` 파일을 로드합니다. 여기에 정의된 변수는 기본 값을 덮어씁니다.

## 명령어 예시

**참고**: 아래 예시에서 `your_api_key_here` 부분은 실제 발급받은 API 키로 대체해야 합니다.

1.  **현행법령 목록 검색**

    "도로교통법"을 포함하는 현행법령 목록을 검색합니다.

    ```bash
    deno run --allow-env --allow-net --allow-read samples/api_openlaw/cli.ts 현행법령 "도로교통법"
    ```

2.  **법령 본문 조회 (ID 사용)**

    위 검색 결과에서 얻은 `법령ID` (`009682`)를 사용하여 "도로교통법"의 본문을 조회합니다.

    ```bash
    deno run --allow-env --allow-net --allow-read samples/api_openlaw/cli.ts 현행법령 --id 009682
    ```

3.  **행정규칙 목록 검색 결과를 파일로 저장**

    "개인정보"를 포함하는 행정규칙을 검색하고, 결과를 `output.json` 파일로 저장합니다.

    ```bash
    deno run --allow-env --allow-net --allow-read --allow-write samples/api_openlaw/cli.ts 행정규칙 "개인정보" --output output.json
    ```

4.  **상세 정보와 함께 조회 (Verbose)**

    API 요청 및 응답의 상세 정보를 함께 보려면 `--verbose` 옵션을 추가합니다.

    ```bash
    deno run --allow-env --allow-net --allow-read samples/api_openlaw/cli.ts 현행법령 "도로교통법" --verbose
    ```
