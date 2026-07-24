# 프로젝트 컨텍스트

## 프로젝트 개요
- **목표**: Figma 디자인 기반 원페이지 랜딩 페이지 구현
- **Figma 링크**: https://www.figma.com/design/5fnR9WC0SA7IQ9S1zP7Ptl/%ED%99%8D%EC%9D%84%ED%91%9C%EC%82%AC%EB%AC%B4%EC%86%8C-%EC%99%B8%EC%A3%BC?node-id=8-10&m=dev
- **방식**: Figma MCP를 활용한 설계 참고 및 퍼블리싱

## 작업 방식
### 제작 시 주의사항
1. **Figma 파일 수정 금지**: Figma 파일은 참고용으로만 사용하고 수정하지 않을 것
2. **효율적인 컨텍스트 관리**: 새로운 채팅 시작 시 아래 순서로 진행
   - **첫 번째**: `src/app.tsx` 파일만 먼저 살펴보기
   - **이후**: 필요한 경우에만 다른 폴더/파일 탐색
   - **목적**: 컨텍스트 낭비 방지 및 효율적인 작업 진행

### 프로젝트 구조
```
src/
├── app.tsx          # 메인 애플리케이션 (초기 확인 필수)
└── [다른 컴포넌트 및 파일들]
```

## 기술 스택
- React + TypeScript
- Tailwind CSS
- Vite
- Figma MCP 통합
