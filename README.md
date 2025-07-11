# 한국어 교육 데이터 뷰어

Supabase에서 가져온 데이터를 웹에서 편리하게 확인할 수 있는 애플리케이션입니다.

## 기능

- Supabase API에서 데이터 자동 로드
- 깔끔하고 현대적인 UI
- 반응형 디자인
- 실시간 데이터 새로고침
- 한국어 교육 서비스에 최적화된 디자인

## 기술 스택

- Next.js 14
- TypeScript
- Tailwind CSS
- Vercel 배포

## 로컬 개발

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm run dev
```

3. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## Vercel 배포

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 새 프로젝트 생성
3. GitHub 저장소 연결
4. 자동 배포 완료

## 환경 변수

현재 Supabase API 키가 코드에 하드코딩되어 있습니다. 프로덕션에서는 환경 변수로 관리하는 것을 권장합니다.

## 라이센스

MIT 