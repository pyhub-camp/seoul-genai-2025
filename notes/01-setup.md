# 컴퓨터 초기 설정

## 필요한 프로그램 설치

명령 프롬프트(cmd)를 띄워, 아래 명령을 복&붙해서 실행합니다.

```bat
:: nodejs 설치 (대소문자 정확히 입력)
winget install -e --id OpenJS.NodeJS

:: Supabase Edge Function 개발을 위해 deno 설치
winget install -e --id DenoLand.Deno

:: 소스코드 버전 관리 유틸리티 설치
winget install -e --id Git.Git
winget install -e --id GitHub.cli

:: 소스코드 편집기 설치
winget install -e --id Microsoft.VisualStudioCode

:: npm 명령이 인식되지 않으면, 명령 프롬프트 창을 껐다가 다시 열어주세요.
:: npm 명령은 반드시 외부 네트워크 접근이 필요합니다.
npm install -g @google/gemini-cli@latest
```

## 버전 관리를 위한 기본 설정

```bat
:: 저장(커밋)하는 유저에 대한 정보 등록
:: 컴퓨터에서 1회만 수행
git config --global user.name "Chinseok Lee"
git config --global user.email "me@pyhub.kr"

:: 디폴트 브랜치 지정
git config --global init.defaultBranch main
:: 한글 파일명 처리
git config --global core.quotepath false
```

## 지정 프로젝트를 git 저장소로 만들기

+ 지정 프로젝트 경로 : `C:\Work\seoul-genai-2025\`

아래 명령은 해당 프로젝트 폴더에서 1회만 수행합니다.

```
cd C:\Work\seoul-genai-2025\
git init
```
