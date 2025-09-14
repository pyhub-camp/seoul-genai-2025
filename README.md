
# seoul-genai-2025

## 프로젝트 개요

이 프로젝트는 2025년 서울시 생성AI 챌린지 참여를 위한 PoC(Proof of Concept)입니다. 국가법령정보 API를 활용하여 법령 및 행정규칙 정보를 조회하는 웹 API를 구축하고, 이를 기반으로 한 생성AI 서비스를 개발하는 것을 목표로 합니다.

## 주요 구성 요소

- **`samples/api_openlaw`**: 국가법령정보 API를 테스트하고 데이터를 조회하기 위해 Deno로 작성된 커맨드라인 인터페이스(CLI) 프로토타입입니다.

- **`supabase/functions/api_openlaw`**: `samples`의 CLI 로직을 Supabase Edge Function으로 포팅한 웹 API입니다. GPTs Action 등 외부 서비스에서 법령 정보를 실시간으로 조회할 수 있는 엔드포인트를 제공합니다.

- **`notes`**: 개발 과정에서 필요한 가이드, 팁, 회의록 등을 정리한 문서가 위치합니다. (`notes/supabase.md` 등)

- **`specs`**: 연동하는 외부 API(국가법령정보)의 명세를 정리한 문서가 위치합니다.

- **`PRD.md`**: 서비스의 요구사항을 정의하는 제품 요구사항 문서입니다.

## 개발 목표

- 생성AI 모델(예: GPT)이 법령 정보를 정확하게 참조하고 답변할 수 있도록 안정적인 백엔드 API를 제공합니다.
- API 응답 크기 등 생성AI 연동 시 발생하는 제약사항을 Supabase Storage 연동을 통해 해결합니다.

## 시작하기

- **CLI 테스트**: `samples/api_openlaw/README.md` 문서를 참고하여 Deno CLI를 실행할 수 있습니다.
- **Edge Function 배포**: `notes/supabase.md` 문서의 가이드에 따라 Supabase Edge Function을 배포하고 테스트할 수 있습니다.
