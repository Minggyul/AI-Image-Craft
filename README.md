# AI Image Craft

AI 기반 이미지 생성 웹 애플리케이션입니다. OpenAI의 GPT-4를 사용하여 프롬프트를 개선하고, Stability AI를 통해 고품질 이미지를 생성합니다.

## 주요 기능

- 텍스트 프롬프트를 통한 이미지 생성
- 다국어 프롬프트 지원 (영어로 자동 변환)
- 실시간 채팅 인터페이스
- 생성된 이미지 저장 및 표시

## 기술 스택

- Frontend: React + TypeScript, TailwindCSS
- Backend: Node.js + Express
- API: OpenAI GPT-4, Stability AI
- 상태 관리: TanStack Query

## 시작하기

1. 레포지토리 클론
```bash
git clone [your-repo-url]
cd [your-repo-name]
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
- `.env.example` 파일을 `.env`로 복사
- OpenAI와 Stability AI API 키 설정
```bash
cp .env.example .env
```

4. 개발 서버 실행
```bash
npm run dev
```

## 환경 변수

- `OPENAI_API_KEY`: OpenAI API 키
- `STABILITY_API_KEY`: Stability AI API 키

## 라이선스

MIT License
