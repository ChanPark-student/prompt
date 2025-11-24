// 1. 프롬프트 타입 정의 (dislikes 추가)
export interface Prompt {
  id: number
  title: string
  author: string
  school: string
  subject: string
  date: string
  views: number
  likes: number
  dislikes: number // ★★★ '싫어요' 항목 추가 ★★★
  bookmarks: number
  content: string
}

// 2. 프롬프트 데이터 (★★★ 모든 프롬프트에 'dislikes' 값 추가 ★★★)
export const mockPrompts: Record<string, Prompt[]> = {
  "1": [
    {
      id: 1,
      title: "이승열 프롬프트",
      author: "이승열",
      school: "전남대학교",
      subject: "산업공학입문",
      date: "2025-09-16",
      views: 20,
      likes: 10,
      dislikes: 1, // ★
      bookmarks: 5,
      content: `
### 역할
당신은 고대 그리스 철학 전문가이며, 특히 아리스토텔레스와 플라톤의 사상을 명확하게 비교 분석하는 학자입니다.

### 임무
산업공학입문 수업을 듣는 학생들을 위해, 아리스토텔레스의 핵심 사상(형이상학, 윤리학)을 플라톤의 이데아론과 비교하여 설명하는 보고서를 작성합니다.

### 지침
1. '이데아'와 '실재론'의 차이점을 중심으로 설명하세요.
2. 두 철학자의 윤리학(예: 니코마코스 윤리학 vs. 국가론의 정의)을 비교하세요.
3. 학생들이 이해하기 쉽도록 평이한 언어를 사용하되, 핵심 용어는 정확하게 정의하세요.

### 핵심 키워드
아리스토텔레스, 플라톤, 이데아, 실재론, 형이상학, 니코마코스 윤리학, 국가론, 정의, 선
      `
    },
    {
      id: 2,
      title: "산공입 프롬프트",
      author: "규리빈",
      school: "전남대학교",
      subject: "산업공학입문",
      date: "2025-10-01",
      views: 15,
      likes: 5,
      dislikes: 2, // ★
      bookmarks: 8,
      content: `
### 역할
당신은 로마 제국의 사회 기반 시설과 공학 기술을 전문으로 다루는 역사학자입니다.

### 임무
'팍스 로마나(Pax Romana)'가 어떻게 로마의 공학 기술(도로, 수도)에 의해 유지될 수 있었는지 분석하는 에세이를 작성합니다.

### 지침
1. 로마의 도로망(예: 아피아 가도)이 군사 및 경제에 미친 영향을 설명하세요.
2. 수로(수도교)가 도시 유지와 공중 보건에 기여한 바를 서술하세요.
3. 이러한 공학 기술이 제국의 통치력 강화에 어떻게 직결되었는지 논하세요.

### 핵심 키워드
팍스 로마나, 로마 도로, 수도교, 로마 공학, 제국 통치, 콜로세움, 공중 보건
      `
    },
    {
      id: 3,
      title: "user의 A+ 프롬프트", 
      author: "user", 
      school: "전남대학교",
      subject: "산업공학입문",
      date: "2025-10-02",
      views: 11,
      likes: 6,
      dislikes: 0, // ★
      bookmarks: 4,
      content: `
### 역할
당신은 중세 유럽의 사회 구조와 경제 시스템을 분석하는 경제사학자입니다.

### 임무
중세 유럽의 '봉건제(Feudalism)'와 '길드(Guild)' 시스템이 당시 사회 안정과 경제 발전에 각각 어떤 순기능과 역기능을 했는지 분석하는 자료를 생성합니다.

### 지침
1. 봉건제의 주군-봉신 관계와 장원제(농노)를 설명하세요.
2. 길드 시스템이 품질 유지와 기술 독점에 미친 영향을 설명하세요.
3. 흑사병(Black Death)이 이 두 시스템에 어떤 변화를 초래했는지 간략하게 언급하세요.

### 핵심 키워드
봉건제, 길드, 장원제, 농노, 흑사병, 중세 도시, 스콜라 철학
      `
    },
  ],
  "2": [ // 경제성공학 (ID: 2)
    {
      id: 4,
      title: "경제성공학 샘플 프롬프트",
      author: "김경제",
      school: "전남대학교",
      subject: "경제성공학",
      date: "2025-10-01",
      views: 10,
      likes: 2,
      dislikes: 0, // ★
      bookmarks: 1,
      content: `
### 역할
당신은 경제성공학 전문가로서, 특정 프로젝트의 경제적 타당성을 평가하는 분석가입니다.

### 임무
새로운 스마트팩토리 도입 프로젝트의 경제성을 평가하기 위해 '순현재가치(NPV)'와 '내부수익률(IRR)'을 계산하고, 그 의미를 해석하는 보고서를 작성합니다.

### 지침
1. NPV 계산의 기본 공식을 제시하고, 할인율(discount rate)의 중요성을 설명하세요.
2. IRR이 무엇이며, IRR이 NPV와 어떻게 다른 관점을 제공하는지 설명하세요.
3. 프로젝트의 투자 결정 기준(예: NPV > 0)을 명확히 제시하세요.

### 핵심 키워드
경제성공학, 순현재가치(NPV), 내부수익률(IRR), 할인율, 타당성 분석, 감가상각, 현금 흐름
      `
    }
  ],
  "3": [ // 확률통계 (ID: 3)
     {
      id: 5,
      title: "확률통계 기본",
      author: "박통계",
      school: "전남대학교",
      subject: "확률통계",
      date: "2025-09-25",
      views: 25,
      likes: 12,
      dislikes: 3, // ★
      bookmarks: 3,
      content: `
### 역할
당신은 데이터 분석을 위한 기초 통계학을 가르치는 교수입니다.

### 임무
'중심극한정리(Central Limit Theorem, CLT)'가 왜 통계적 추론(가설 검정)에서 중요한지 설명하는 강의 자료를 작성합니다.

### 지침
1. 중심극한정리의 개념을 "표본 평균의 분포"라는 키워드를 사용하여 정의하세요.
2. 모집단이 정규분포가 아닐 때도 CLT가 어떻게 적용될 수 있는지 설명하세요.
3. CLT가 신뢰구간 추정이나 Z-검정에 어떻게 활용되는지 간단한 예를 들어 설명하세요.

### 핵심 키워드
중심극한정리(CLT), 표본 평균, 정규분포, 가설 검정, 신뢰구간, 통계적 추론
      `
    }
  ],
}

// 3. 모든 mockPrompts에서 ID로 프롬프트 1개를 찾는 함수
export function findPromptById(id: string): Prompt | undefined {
  for (const key in mockPrompts) {
    const prompt = mockPrompts[key].find(p => p.id.toString() === id);
    if (prompt) {
      return prompt;
    }
  }
  return undefined;
}