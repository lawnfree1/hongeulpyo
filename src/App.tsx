import { useState, useEffect } from 'react';
import QuickConsultForm from './components/QuickConsultForm';
import DetailConsultForm from './components/DetailConsultForm';

// Image URLs from local assets
const imgImage11 = "/images/hero-bg.png";
const imgLogo2 = "/images/logo.png";
const imgHeadlineWithDots = "/images/headline-group-1.png";
const imgIcons = "/images/phone-icon.png";
const imgVector = "/images/arrow-down.png";
const imgTi289A3900404 = "/images/phone-icon-large.png";
const imgTi381A3380701 = "/images/kakao-icon.png";
const imgTi122A19102031 = "/images/icon-target.png";
const imgTi323A20607061 = "/images/icon-method.png";
const imgTi122A19402031 = "/images/icon-asset.png";
const imgTi436A46213061 = "/images/icon-result.png";
const imgTica1010009752011 = "/images/lawyer-profile.png";
const imgGroup2 = "/images/arrow-cta.png";
const imgIconsConsultation = "/images/phone-icon.png";
const img1 = "/images/arrow-right-white.png";
const img2 = "/images/arrow-right-dark.png";
const imgFrame44 = "/images/frame-background.png";
const imgBankruptcyTarget = "/images/bankruptcy-target.png";
const imgBankruptcyMethod = "/images/bankruptcy-method.png";
const imgBankruptcyAsset = "/images/bankruptcy-asset.png";
const imgBankruptcyResult = "/images/bankruptcy-result.png";

interface CaseComparisonProps {
  before: string;
  afterAmount: string;
  beforePayment: string;
  afterPayment: string;
  isAfterGreen?: boolean;
}

interface ProcedureItem {
  label: string;
  value: string;
  img: string;
}

interface ProcedureTabProps {
  quote: string;
  items: ProcedureItem[];
}

function CaseComparison({ before, afterAmount, beforePayment, afterPayment }: CaseComparisonProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-[8px] bg-[rgba(255,255,255,0.1)] text-white font-['Pretendard'] font-normal text-[14px] md:text-[20px] tracking-[-1px] px-[16px] md:px-[24px] py-[12px]">
        <div>회생 전</div>
        <div>{before}</div>
        <div>{beforePayment}</div>
      </div>
      <div className="text-center py-2">
        <img src={imgVector} alt="Arrow" className="w-10 h-12 mx-auto" />
      </div>
      <div className="grid grid-cols-3 gap-[8px] bg-[#e14140] text-white font-['Pretendard'] font-semibold text-[14px] md:text-[20px] tracking-[-1px] px-[24px] py-[12px]">
        <div>회생 후</div>
        <div className="text-[#fc0]">{afterAmount}</div>
        <div className="text-[#fc0]">{afterPayment}</div>
      </div>
    </div>
  );
}

function ProcedureTab({ quote, items }: ProcedureTabProps) {
  const quoteLines = quote.split('받아 ');

  const imageConfigs = [
    { h: 120, right: 20, top: 20, w: 116 },
    { h: 100, right: 20, top: 20, w: 109 },
    { h: 65, right: 20, top: 20, w: 100 },
    { h: 100, right: 20, top: 20, w: 83 }
  ];

  return (
    <div className="flex flex-col gap-[24px] items-center w-full">
      {/* Quote Section */}
      <div className="[word-break:break-word] content-stretch flex flex-col md:flex-row gap-[8px] md:gap-[47px] items-center md:items-start not-italic overflow-clip relative shrink-0">
        <p className="font-['SCoreDream'] font-extrabold text-[60px] text-[#e14140] text-center leading-[60px] md:leading-[80px] tracking-[-3px] relative shrink-0 w-[33px]">
          "
        </p>
        <div className="flex flex-col font-['Pretendard'] font-normal justify-center leading-[0] relative shrink-0 text-[16px] md:text-[20px] xl:text-[24px] text-white tracking-[-1.2px] whitespace-normal md:whitespace-normal xl:whitespace-nowrap">
          <p className="leading-[26px] md:leading-[30px] xl:leading-[34px] mb-0">{quoteLines[0]}받아</p>
          <p className="leading-[26px] md:leading-[30px] xl:leading-[34px]">{quoteLines[1]}</p>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-4 gap-[20px] w-full auto-cols-fr">
        {items.map((item: ProcedureItem, idx: number) => {
          const config = imageConfigs[idx];
          return (
            <div key={idx} className="flex-1 overflow-clip rounded-[12px] relative">
              {/* Header */}
              <div className="bg-[#e14140] h-[100px] flex items-start p-[24px]">
                <h4 className="font-['Pretendard'] font-semibold text-white text-[16px] tracking-[-0.8px] leading-[26px]">{item.label}</h4>
              </div>
              {/* Content */}
              <div className="bg-white h-[150px] flex items-end p-[24px] overflow-clip">
                <div className="flex flex-col font-['Pretendard'] font-semibold text-[#333] text-[20px] tracking-[-1.2px] leading-[34px] whitespace-nowrap">
                  {item.value.split('\n').map((line, i) => (
                    <p key={i} className={i === 0 ? 'mb-0' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
              <div
                className="absolute flex items-center justify-center"
                style={{
                  width: '120px',
                  height: '120px',
                  right: `${config.right}px`,
                  top: '20px',
                  overflow: 'visible'
                }}
              >
                <img
                  src={item.img}
                  alt={item.label}
                  className="pointer-events-none object-contain"
                  style={{
                    width: '100%',
                    height: '100%'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [tabActive, setTabActive] = useState('recovery');
  const [activeBorderCard, setActiveBorderCard] = useState(0);
  const [displayedRowIndex, setDisplayedRowIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBorderCard((prev) => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedRowIndex((prev) => (prev + 1) % 9);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const allStatusRows = [
    { name: '강ㅇㅇ', job: '프리랜서', case: '개인파산', status: '진행 중', color: '#0051ff', note: '' },
    { name: '민ㅇㅇ', job: '직장인', case: '개인회생', status: '상담 중', color: '#969696', note: '' },
    { name: '정ㅇㅇ', job: '직장인', case: '개인회생', status: '상담 중', color: '#969696', note: '' },
    { name: '김ㅇㅇ', job: '직장인', case: '개인회생', status: '진행 중', color: '#0051ff', note: '' },
    { name: '정ㅇㅇ', job: '무직', case: '개인파산', status: '사건 종료', color: '#08c41e', note: '면책 결정' },
    { name: '이ㅇㅇ', job: '자영업자', case: '개인회생', status: '상담 완료', color: '#f3a600', note: '' },
    { name: '박ㅇㅇ', job: '프리랜서', case: '개인회생', status: '사건 종료', color: '#08c41e', note: '약 78% 탕감' },
    { name: '최ㅇㅇ', job: '일용직', case: '개인파산', status: '사건 종료', color: '#08c41e', note: '면책 결정' },
    { name: '허ㅇㅇ', job: '건축사', case: '개인회생', status: '상담 완료', color: '#f3a600', note: '' }
  ];


  return (
    <div className="bg-black">
      {/* Container with responsive width */}
      <div className="mx-auto max-w-[1200px] w-full shadow-[0px_0px_9.25px_rgba(255,255,255,0.53)]">

        {/* ===== SECTION 1: HERO ===== */}
        <section className="relative h-[600px] md:h-[800px] xl:h-[1150px] bg-white overflow-hidden flex flex-col items-center justify-start pt-[40px] md:pt-[60px] xl:pt-[90px]">
          <img alt="Hero Background" className="absolute inset-0 h-full w-full object-cover" src={imgImage11} />

          {/* Content Wrapper */}
          <div className="relative flex flex-col items-center px-[20px] md:px-[60px]">
            {/* Logo */}
            <div className="w-[120px] md:w-[254px] h-auto mb-[60px] md:mb-[120px]" style={{ aspectRatio: '254/35' }}>
              <img alt="Logo" className="h-full w-full object-contain" src={imgLogo2} />
            </div>

            {/* Text Group */}
            <div className="text-center">
              {/* Sub Headline */}
              <div className="mb-6">
                <h2 className="font-['Pretendard'] text-[20px] md:text-[30px] text-white whitespace-normal">
                  <span className="font-bold">부산 법원 앞</span>
                  <span className="font-normal"> 개인회생·파산</span>
                  <br className="md:hidden" />
                  <span className="font-normal">전문 법무사</span>
                </h2>
              </div>

              {/* Main Headline - Image */}
              <div className="mb-6 w-full px-4 md:px-0">
                <img src={imgHeadlineWithDots} alt="빚 문제, 법으로 해결됩니다" className="h-auto w-full" style={{ mixBlendMode: 'lighten' }} />
              </div>

              {/* Description */}
              <p className="font-['Pretendard'] font-normal text-[20px] md:text-[22px] xl:text-[30px] text-white leading-[30px] md:leading-[35px] xl:leading-[40px]">
                <span className="block md:block xl:inline">오랜 실무 경험으로 개인회생·개인파산을</span>
                <span className="block md:block xl:inline"> 신속·정확하게 처리해 드립니다</span>
              </p>
            </div>
          </div>
        </section>

        {/* ===== SECTION 2: CONSULTATION FORM (BLACK) ===== */}
        <section className="bg-black px-4 md:px-6 xl:px-[60px] py-[40px] md:py-[60px] flex flex-col items-center">
          <div className="flex flex-col lg:flex-row gap-[40px] items-start lg:items-center w-full max-w-[1080px]">
            {/* Left Section */}
            <div className="flex flex-col md:flex-row lg:flex-col gap-[8px] md:gap-[24px] lg:gap-[8px] flex-shrink-0 md:items-center lg:items-start">
              <div className="flex gap-[12px] items-center">
                <img alt="Phone" className="w-[40px] h-[39px]" src={imgIcons} />
                <h3 className="font-['SCoreDream'] text-[30px] md:text-[40px] font-bold text-white leading-[50px] whitespace-nowrap">친절 전화상담</h3>
              </div>
              <p className="font-['SCoreDream'] text-[40px] md:text-[50px] font-bold text-[#fc0] leading-[60px]">
                <span>166</span>
                <span className="tracking-[1.6px]">0</span>
                <span>-1518</span>
              </p>
            </div>

            {/* Right Section */}
            <QuickConsultForm source="hero" variant="red" />
          </div>
        </section>

        {/* ===== SECTION 3: CASE EXAMPLES ===== */}
        <section className="px-4 md:px-6 xl:px-[60px] pt-[80px] md:pt-[120px] xl:pt-[150px] pb-[80px] md:pb-[100px] xl:pb-[120px] flex flex-col gap-[40px] md:gap-[48px] xl:gap-[56px] items-center" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1200 1420' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='0.5'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(4.3912e-14 43.741 -109.55 6.1579e-14 600 1455.6)'><stop stop-color='rgba(255,255,255,1)' offset='0'/><stop stop-color='rgba(255,255,255,0)' offset='1'/></radialGradient></defs></svg>\"), linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%)" }}>
          {/* Header */}
          <div className="flex flex-col gap-[8px] md:gap-6 items-center">
            <div className="bg-[#e14140] px-3 py-2 text-white font-['Pretendard'] text-[14px] md:text-xl">
              사안에 맞는 최적의 방향 설계
            </div>
            <h2 className="font-['SCoreDream'] text-[28px] md:text-[40px] xl:text-[50px] font-bold text-white text-center tracking-[-2.5px]">
              <p className="leading-[50px] md:leading-[60px] xl:leading-[70px] mb-0">실제 진행</p>
              <p className="leading-[50px] md:leading-[60px] xl:leading-[70px]">사례로 확인하세요</p>
            </h2>
          </div>

          {/* Cases + Disclaimer Wrapper */}
          <div className="flex flex-col gap-[16px] w-full">
            {/* Cases Grid */}
            <div className="space-y-5 w-full">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-5">
              {/* Case 1 */}
              <div className={`border ${activeBorderCard === 0 ? 'border-[#fc0]' : 'border-white'} bg-[rgba(255,255,255,0.3)] rounded-lg px-[16px] md:px-[32px] py-[24px] md:py-[40px] space-y-6`}>
                <div className="flex gap-[8px] items-end">
                  <div className="flex-1">
                    <p className="text-white text-base mb-2">사례 1</p>
                    <h3 className="font-['SCoreDream'] text-[18px] md:text-3xl font-bold text-white leading-[28px] md:leading-[40px]">
                      주식 및 가상화폐 투자<br />실패로 인한 개인회생 탕감
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-[70px] h-[70px] md:w-[90px] md:h-[90px] rounded-full bg-[#e14140] flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-['SCoreDream'] text-[18px] md:text-[24px] font-bold text-[#fc0] leading-[30px] tracking-[-1.2px]">78%</div>
                        <div className="font-['SCoreDream'] text-[18px] md:text-[24px] font-bold text-[#fc0] leading-[30px] tracking-[-1.2px]">탕감</div>
                      </div>
                    </div>
                  </div>
                </div>
                <CaseComparison before="6,500만원" afterAmount="1,400만원" beforePayment="월 185만원 납부" afterPayment="월 39만원 납부" />
                <div className="flex gap-2 flex-wrap">
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#20대남성</div>
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#급여소득자</div>
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#투자실패</div>
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#카드돌려막기</div>
                </div>
              </div>

              {/* Case 2 */}
              <div className={`border ${activeBorderCard === 1 ? 'border-[#fc0]' : 'border-white'} bg-[rgba(255,255,255,0.3)] rounded-lg px-[16px] md:px-[32px] py-[24px] md:py-[40px] space-y-6`}>
                <div className="flex gap-[8px] items-end">
                  <div className="flex-1">
                    <p className="text-white text-base mb-2">사례 2</p>
                    <h3 className="font-['SCoreDream'] text-[18px] md:text-3xl font-bold text-white leading-[28px] md:leading-[40px]">
                      경기 불황으로 인한<br />사업 실패, 개인파산 면책
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-[70px] h-[70px] md:w-[90px] md:h-[90px] rounded-full bg-[#e14140] flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-['SCoreDream'] text-[18px] md:text-[24px] font-bold text-[#fc0] leading-[30px] tracking-[-1.2px]">면책</div>
                      </div>
                    </div>
                  </div>
                </div>
                <CaseComparison before="2억 4,000만원" afterAmount="0원(면책)" beforePayment="월 420만원 납부" afterPayment="0원(면책)" />
                <div className="flex gap-2 flex-wrap">
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#40대남성</div>
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#자영업자_폐업</div>
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#사업자금대출</div>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-5">
              {/* Case 3 */}
              <div className={`border ${activeBorderCard === 2 ? 'border-[#fc0]' : 'border-white'} bg-[rgba(255,255,255,0.3)] rounded-lg px-[16px] md:px-[32px] py-[24px] md:py-[40px] space-y-6`}>
                <div className="flex gap-[8px] items-end">
                  <div className="flex-1">
                    <p className="text-white text-base mb-2">사례 3</p>
                    <h3 className="font-['SCoreDream'] text-[18px] md:text-3xl font-bold text-white leading-[28px] md:leading-[40px]">
                      눈덩이처럼 불어난<br />생활비 대출, 개인회생 탕감
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-[70px] h-[70px] md:w-[90px] md:h-[90px] rounded-full bg-[#e14140] flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-['SCoreDream'] text-[18px] md:text-[24px] font-bold text-[#fc0] leading-[30px] tracking-[-1.2px]">85%</div>
                        <div className="font-['SCoreDream'] text-[18px] md:text-[24px] font-bold text-[#fc0] leading-[30px] tracking-[-1.2px]">탕감</div>
                      </div>
                    </div>
                  </div>
                </div>
                <CaseComparison before="8,800만원" afterAmount="1,300만원" beforePayment="월 210만원 납부" afterPayment="월 36만원 납부" />
                <div className="flex gap-2 flex-wrap">
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#40대여성</div>
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#급여소득자</div>
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#생활비</div>
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#다중채무</div>
                </div>
              </div>

              {/* Case 4 */}
              <div className={`border ${activeBorderCard === 3 ? 'border-[#fc0]' : 'border-white'} bg-[rgba(255,255,255,0.3)] rounded-lg px-[16px] md:px-[32px] py-[24px] md:py-[40px] space-y-6`}>
                <div className="flex gap-[8px] items-end">
                  <div className="flex-1">
                    <p className="text-white text-base mb-2">사례 4</p>
                    <h3 className="font-['SCoreDream'] text-[18px] md:text-3xl font-bold text-white leading-[28px] md:leading-[40px]">
                      보이스피싱 및 전세사기<br />피해로 인한 개인회생 탕감
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-[70px] h-[70px] md:w-[90px] md:h-[90px] rounded-full bg-[#e14140] flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-['SCoreDream'] text-[18px] md:text-[24px] font-bold text-[#fc0] leading-[30px] tracking-[-1.2px]">90%</div>
                        <div className="font-['SCoreDream'] text-[18px] md:text-[24px] font-bold text-[#fc0] leading-[30px] tracking-[-1.2px]">탕감</div>
                      </div>
                    </div>
                  </div>
                </div>
                <CaseComparison before="1억 5,000만원" afterAmount="1,500만원" beforePayment="월 310만원 납부" afterPayment="월 41만원 납부" />
                <div className="flex gap-2 flex-wrap">
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#30대남성</div>
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#급여소득자</div>
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#금융사기피해</div>
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] py-[4px] text-white text-[12px] md:text-[16px] font-['Pretendard'] font-normal leading-[24px]">#청년회생</div>
                </div>
              </div>
            </div>
          </div>

            <p className="[word-break:break-word] font-['Pretendard'] font-normal leading-[24px] opacity-50 text-[12px] md:text-[14px] text-right text-white w-full">
              위 사례는 실제 진행 사건을 바탕으로 재구성한 것이며, 탕감 범위와 면책 여부는 개인의 소득·재산·채무 상황에 따라 달라질 수 있습니다.
            </p>
          </div>
        </section>

        {/* ===== SECTION 4: DECISION PROCEDURE ===== */}
        <section className="bg-black px-4 md:px-6 xl:px-[60px] pt-[80px] md:pt-[100px] xl:pt-[120px] pb-[60px] md:pb-[70px] xl:pb-[80px] flex flex-col gap-[40px] md:gap-[48px] xl:gap-[56px] items-center">
          {/* Title */}
          <div className="text-center">
            <h2 className="font-['SCoreDream'] font-bold text-[28px] md:text-[40px] xl:text-[50px] text-white tracking-[-2.5px]">
              <p className="leading-[50px] md:leading-[60px] xl:leading-[70px] mb-0">복잡한 절차,</p>
              <p className="leading-[50px] md:leading-[60px] xl:leading-[70px]">나는 어떤 방법을 선택해야 할까?</p>
            </h2>
          </div>

          {/* Tabs and Content */}
          <div className="flex flex-col gap-[40px] items-center w-full px-0">
            {/* Tabs */}
            <div className="border-b border-[rgba(255,255,255,0.3)] border-solid w-full xl:w-[1080px] flex items-center justify-center">
              <div className={`flex items-center justify-center p-[12px] border-b-[3px] border-solid transition-colors ${
                tabActive === 'recovery' ? 'border-[#e14140]' : 'border-transparent'
              }`}>
                <button
                  onClick={() => setTabActive('recovery')}
                  className={`flex flex-col font-['Pretendard'] font-semibold justify-center text-[18px] md:text-[20px] tracking-[-1px] leading-[30px] whitespace-nowrap transition-colors ${
                    tabActive === 'recovery' ? 'text-[#e14140]' : 'text-white'
                  }`}
                >
                  <p className="leading-[30px]">개인회생</p>
                </button>
              </div>
              <div className={`flex items-center justify-center p-[12px] border-b-[3px] border-solid transition-colors ${
                tabActive === 'bankruptcy' ? 'border-[#e14140]' : 'border-transparent'
              }`}>
                <button
                  onClick={() => setTabActive('bankruptcy')}
                  className={`flex flex-col font-['Pretendard'] font-semibold justify-center text-[18px] md:text-[20px] tracking-[-1px] leading-[30px] whitespace-nowrap transition-colors ${
                    tabActive === 'bankruptcy' ? 'text-[#e14140]' : 'text-white'
                  }`}
                >
                  <p className="leading-[30px]">개인파산·면책</p>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {tabActive === 'recovery' && (
              <ProcedureTab
                quote="꾸준한 소득이 있으나 빚을 정상적으로 갚기 어려운 분이 법원 인가를 받아 일정 기간 동안 형편에 맞게 나누어 갚고, 남은 채무를 조정/감면받는 제도"
                items={[
                  { label: '대상', value: '소득이 있는 분', img: imgTi122A19102031 },
                  { label: '방식', value: '일정 기간 나누어\n변제 후 잔여 채무 감면', img: imgTi323A20607061 },
                  { label: '재산', value: '원칙적으로\n유지하며 조정', img: imgTi122A19402031 },
                  { label: '결과', value: '성실 변제 완료 시 면책', img: imgTi436A46213061 }
                ]}
              />
            )}

            {tabActive === 'bankruptcy' && (
              <ProcedureTab
                quote="경제적으로 재생할 수 있도록 법원의 도움을 받아 채무를 정리하고 새로운 시작을 준비하는 제도"
                items={[
                  { label: '대상', value: '변제 능력\n없는 분', img: imgBankruptcyTarget },
                  { label: '방식', value: '파산선고 후 면책으로\n채무 책임에서 벗어남', img: imgBankruptcyMethod },
                  { label: '재산', value: '일정 기준 초과\n재산은 환가 대상', img: imgBankruptcyAsset },
                  { label: '결과', value: '면책 결정 시\n상환 의무 소멸', img: imgBankruptcyResult }
                ]}
              />
            )}
          </div>
        </section>

        {/* ===== SECTION 4-1: CONSULTATION CTA ===== */}
        <section className="bg-black px-4 md:px-6 xl:px-[60px] pt-[24px] pb-[60px] md:pb-[70px] xl:pb-[80px] flex flex-col items-center">
          {/* 화살표 - 최상단 중앙 */}
          <div className="w-[24px] h-[64px] mb-8">
            <img src={imgGroup2} alt="Arrow" className="w-full h-full" />
          </div>

          {/* 프로필 이미지 + 텍스트 박스 */}
          <div className="relative w-full border-[7px] border-[#e14140] px-6 md:px-8 xl:px-[64px] py-8 md:py-12 xl:py-[56px] min-h-auto flex flex-col md:flex-col xl:flex-row gap-8">
            {/* 텍스트 콘텐츠 */}
            <div className="flex-1 text-center md:text-center xl:text-right order-1 md:order-1 xl:order-2">
              <div className="text-white font-['Pretendard'] font-normal text-[16px] md:text-[22px] xl:text-[26px] tracking-[-1.3px] leading-[28px] md:leading-[32px] xl:leading-[36px] mb-[8px]">
                <p className="mb-0">겪고 계신 어떤 어려움도 <span className="font-semibold">법적 절차</span>로 해결할 수 있습니다</p>
              </div>
              <div>
                <p className="text-white font-['SCoreDream'] font-bold text-[26px] md:text-[40px] xl:text-[45px] tracking-[-2.25px] leading-[40px] md:leading-[48px] xl:leading-[55px] mb-0">
                  지금 <span className="text-[#fc0]">법무사 홍을표</span>와 상담하세요
                </p>
              </div>
            </div>

            {/* 프로필 이미지 */}
            <div className="hidden md:hidden xl:block w-auto h-[327px] flex-shrink-0 absolute bottom-0 left-[64px] w-[274px]">
              <img src={imgTica1010009752011} alt="법무사 홍을표" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* ===== SECTION 4-2: CONSULTATION FORM (RED) ===== */}
        <section className="bg-[#e14140] px-4 md:px-6 xl:px-[60px] py-[40px] md:py-[60px] flex flex-col items-center">
          <div className="flex flex-col lg:flex-row gap-[40px] items-start lg:items-center w-full max-w-[1080px]">
            {/* Left Section */}
            <div className="flex flex-col md:flex-row lg:flex-col gap-[8px] md:gap-[24px] lg:gap-[8px] flex-shrink-0 md:items-center lg:items-start">
              <div className="flex gap-[12px] items-center">
                <img alt="Phone" className="w-[40px] h-[39px]" src={imgIconsConsultation} />
                <h3 className="font-['SCoreDream'] text-[30px] md:text-[40px] font-bold text-white leading-[50px] whitespace-nowrap">친절 전화상담</h3>
              </div>
              <p className="font-['SCoreDream'] text-[40px] md:text-[50px] font-bold text-[#fc0] leading-[60px]">
                <span>166</span>
                <span className="tracking-[1.6px]">0</span>
                <span>-1518</span>
              </p>
            </div>

            {/* Right Section */}
            <QuickConsultForm source="mid" variant="yellow" />
          </div>
        </section>

        {/* ===== SECTION 5: REAL-TIME STATUS ===== */}
        <section className="bg-black px-4 md:px-6 xl:px-[60px] py-16 md:py-24 xl:py-32" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1200 880' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='0.5'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(4.3912e-14 27.107 -109.55 3.8162e-14 600 902.06)'><stop stop-color='rgba(255,255,255,1)' offset='0'/><stop stop-color='rgba(255,255,255,0)' offset='1'/></radialGradient></defs></svg>\"), linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%)" }}>
          <div className="flex flex-col gap-[8px] md:gap-6 items-center mb-[56px]">
            <div className="bg-[#e14140] px-3 py-2 text-white font-['Pretendard'] text-[14px] md:text-xl">
              실시간 현황
            </div>
            <h2 className="font-['SCoreDream'] text-[28px] md:text-[40px] xl:text-5xl font-bold text-white text-center leading-[50px] md:leading-[60px] xl:leading-[70px]">
              지금 이 순간에도 많은 분들이<br />새로운 시작을 준비하고 계십니다
            </h2>
          </div>

          {/* Table */}
          <div className="w-full">
            {/* Header */}
            <div className="grid grid-cols-5 gap-[8px] bg-[#e14140] text-white font-['Pretendard'] font-semibold text-[12px] md:text-[20px] px-[16px] md:px-[24px] py-[12px]">
              <div>성함</div>
              <div>직업</div>
              <div>사건명</div>
              <div>진행 상태</div>
              <div>비고</div>
            </div>

            {/* Rows */}
            {Array.from({ length: 4 }).map((_, idx) => {
              const rowData = allStatusRows[(4 - displayedRowIndex + idx + allStatusRows.length) % allStatusRows.length];
              return (
                <div key={idx} className="grid grid-cols-5 gap-[8px] bg-[rgba(255,255,255,0.1)] border-b border-white text-white font-['Pretendard'] text-[12px] md:text-[20px] px-[16px] md:px-[24px] py-[12px] items-center">
                  <div>{rowData.name}</div>
                  <div>{rowData.job}</div>
                  <div>{rowData.case}</div>
                  <div className="flex">
                    <div className="px-[12px] py-[8px] rounded-[999px] text-white text-[12px] md:text-[20px] font-['Pretendard']" style={{backgroundColor: rowData.color}}>
                      {rowData.status}
                    </div>
                  </div>
                  <div className={rowData.note ? 'text-[#fc0] font-semibold' : 'opacity-0'}>{rowData.note}</div>
                </div>
              );
            })}
          </div>

          <p className="text-right text-white text-[12px] md:text-[14px] opacity-50 font-['Pretendard'] leading-[24px] mt-[16px]">
            결과는 개인별 채무·소득·재산 상황에 따라 달라지며, 수치를 보장하지 않습니다.
          </p>
        </section>

        {/* ===== SECTION 6: CTA + FORM ===== */}
        <section className="bg-black px-4 md:px-6 xl:px-[60px] py-[100px] md:py-[150px] xl:py-[200px] relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute bg-black inset-0" />
            <div className="absolute inset-0 opacity-20 overflow-hidden">
              <img alt="" className="absolute h-[85.94%] left-[-20.05%] max-w-none top-[18.27%] w-[122.03%]" src={imgFrame44} />
            </div>
            <div className="absolute bg-gradient-to-b from-black inset-0 to-transparent" style={{ backgroundImage: 'linear-gradient(to bottom, black 0%, black 39.965%, transparent 59.067%)' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 xl:gap-6 items-stretch relative z-10">
            {/* Left Content */}
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="font-['SCoreDream'] text-[28px] md:text-[40px] xl:text-5xl font-bold text-white leading-[50px] md:leading-[60px] xl:leading-[70px]">
                  빚의 무게에서 벗어나<br />
                  <span className="text-[#e14140]">다시 일어서는 길</span>을<br />
                  함께하겠습니다
                </h2>
                <p className="text-white text-[14px] md:text-[18px] leading-relaxed font-['Pretendard']">
                  누구나 빚의 어려움에 처할 수 있습니다.<br/>
                  중요한 것은 그 상황을 혼자 감당하며 미루는 것이 아니라,<br/>
                  제도를 바로 알고 제때 올바른 절차를 밟는 것입니다.<br/>
                  작은 고민이라도 편하게 문의해 주십시오.<br/>
                  <span className="font-semibold">성실히 상담해 드리겠습니다.</span>
                </p>
              </div>

              <div className="space-y-2">
                {/* Phone Box */}
                <div className="bg-[#e14140] rounded-[20px] px-[24px] md:px-[40px] py-[16px] h-[128px] flex items-center justify-between">
                  <div className="flex gap-[35px] items-center">
                    <img src={imgTi289A3900404} alt="Phone" className="hidden md:block w-[48px] h-[80px]" />
                    <div>
                      <p className="text-white font-['Pretendard'] text-[16px] md:text-[18px] tracking-[-0.9px] mb-2 leading-[28px]">전화 상담 및 문의</p>
                      <p className="font-['SCoreDream'] text-[30px] md:text-[40px] font-bold text-[#fc0] leading-[50px]">
                        1660-1518
                      </p>
                    </div>
                  </div>
                  <img src={img1} alt="Arrow" className="block w-[18px] h-[33px]" />
                </div>

                {/* Kakao Box */}
                <div className="bg-[#fc0] rounded-[20px] pl-[24px] md:pl-[25px] pr-[24px] md:pr-[32px] py-[21px] h-[128px] flex items-center justify-between">
                  <div className="flex gap-[20px] items-center">
                    <img src={imgTi381A3380701} alt="Kakao" className="hidden md:block w-[78px] h-[80px]" />
                    <div>
                      <p className="text-[#333] font-['Pretendard'] text-[16px] md:text-[18px] tracking-[-0.9px] mb-2 leading-[28px]">카카오톡 상담 및 문의</p>
                      <p className="font-['SCoreDream'] text-[30px] md:text-[40px] font-bold text-[#e14140] leading-[50px]">
                        카카오톡 상담
                      </p>
                    </div>
                  </div>
                  <img src={img2} alt="Arrow" className="block w-[18px] h-[33px]" />
                </div>
              </div>
            </div>

            {/* Right Form */}
            <DetailConsultForm />
          </div>
        </section>

        {/* ===== SECTION 7: FOOTER ===== */}
        <section className="bg-black px-4 md:px-6 xl:px-[60px] py-16 md:py-24 xl:py-32 space-y-8 text-white font-['Pretendard']">
          <h3 className="font-semibold text-[16px]">법무사 홍을표 사무소</h3>
          <p className="text-[12px]">사업자등록번호 : 371-10-03529</p>
          <div className="space-y-2 text-[12px]">
            <p><span className="font-semibold">TEL.</span> 1660-1518</p>
            <p><span className="font-semibold">FAX.</span> 051-717-0592</p>
            <p><span className="font-semibold">E-Mail.</span> ssii1611@naver.com</p>
          </div>
          <p className="text-[12px]">
            부산광역시 연제구 법원로 34, 701호 (거제동, 정림빌딩)
            <span className="font-semibold"> 부산지방법원 바로 앞 위치</span>
          </p>
          <p className="text-[12px]">Copyright©법무사홍을표사무소. All rights reserved.</p>
        </section>
      </div>
    </div>
  );
}
