# GEMINI Project Context: seoul-genai-2025

## Directory Overview

This directory, `seoul-genai-2025`, serves as the central planning and documentation hub for a project focused on developing Supabase Edge Functions for Seoul's public administration. The primary goal is to leverage public data to automate tasks and enhance citizen services. The project emphasizes a structured, validation-first development process using Deno for the runtime environment. This is a non-code repository containing requirements, setup guides, and instructional materials, not the application source code itself.

## Key Files

*   **`PRD.md`**: This is the core Product Requirements Document. It details the project's objectives, target users (Seoul city public servants), and the standard 3-Layer architecture (`lib.ts` for business logic, `index.ts` for the HTTP wrapper, `cli.ts` for testing). It specifies six key functions to be developed, such as a Naver news crawler and various public data API clients (e.g., population, air quality, public Wi-Fi). The document also mandates a strict development workflow, including a multi-phase validation process and technical constraints like a 10-second execution limit.

*   **`notes/01-setup.md`**: This file provides the initial environment setup instructions for developers. It lists commands to install necessary tools like Node.js, Deno, Git, and Visual Studio Code using `winget`. It also includes commands for global Git configuration.

*   **`GPTs/복지규정도우미.md`**: Contains the configuration and instructions for a specialized GPT model named "Welfare Regulation Helper." This assistant is designed to help employees of a welfare foundation by answering questions based on the official Seoul Welfare Foundation rulebook.

*   **`GPTs/업무상 법령 검색 가이드.md`**: Provides instructions for a GPT model that acts as a legal search assistant. It is designed to search for Korean laws exclusively on the official National Law Information Center website (`law.go.kr`) and provide practical guidance based on the retrieved legal texts.

## Usage

This repository is the single source of truth for the "seoul-genai-2025" project's planning and architecture.

*   Use the **`PRD.md`** to understand the project's goals, technical specifications, and the required development and validation procedures before starting any implementation.
*   Refer to **`notes/01-setup.md`** to configure a new development machine.
*   The files in the **`GPTs/`** directory should be used as context to create or configure specialized AI assistants that support the project's domain.
