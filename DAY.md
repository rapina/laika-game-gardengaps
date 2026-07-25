# PRODUCTION LOG / 2026-07-25 / 틈의 정원

## 범위와 학습

잠긴 콘셉트 그대로 8구간 퍼즐을 제작했다. 최근 학습은 두 개만 채택했다: 상태 문구가 행동/대기를 방향까지 구분하고, 장식 마디 중심과 실제 잡기점을 일치시킨다. 검증은 문구를 읽지 않고도 화면의 마디 위치·갈대 휨·상태 리듬만으로 조작과 대기를 판별한 뒤 문구와 대조한다.

프로필은 `puzzle`. 순서·공간 선택이 굳는 갈대와 이후 선택지를 바꾸며, 실제 스텝 모듈로 목표 도달과 다른 결과를 검사한다.

## 감산

1. 랭킹, 광고, 점수, 별도 메뉴, 장식 파티클과 반복 설명을 제거했다. 확보한 시간은 갈대 베지어 변형과 50px 마디에 썼다.
2. 통로 게이지·숫자 제한시간·실패 배지를 제거했다. 갈대 형상, 여덟 잎눈금, 굳은 재료만 남겼다. 마지막 장면의 가는 청록 경로는 유지했다.

## 검증

- `npm test`: 4 files, 24 tests passed.
- `npx tsc -b`: 오류 0.
- `npm run build:web`: 779 modules, main JS 499.33KB / gzip 160.49KB.
- `node scripts/playability-sim.mjs`: puzzle pass, meaningful actions 8, distinct outcomes 3, reachable goal/reset/choice change true. `verification/playability-result.json`.
- `npm run smoke`: mounted/finished/resultDelivered/restartVerified true, console/page errors 0. `smoke-result.json`, `smoke.png`.
- `node scripts/viewport-smoke.mjs`: 8 geometry combinations and ko/en × standalone/portal game-over 4 combinations all pass. 390×844 backing ratio 3.359, 430×932 ratio 3.047+, 900×760 aspect error under 0.01. `verification/viewport-result.json`과 PNG 12장.
- 실제 브라우저 관측: 장식 마디를 오른쪽으로 끌 때 선택 갈대와 양옆 두 단계가 서로 다른 비율로 휘었고, 놓은 뒤 행동 문구가 대기 문구로 전환됐다. 실패 종료는 일반 화면과 구분되는 어두운 결과면과 화면 탭 재시작 문구가 보였고 실제 탭으로 초기 상태가 복원됐다.
- 첫 입력 전 AudioContext가 없고, 첫 마디 입력 뒤 생성된다. hidden에서 suspend, 키보드 M에서 mute/suspend를 확인하는 코드 경로를 유지한다.

## 상태

- 제작 코드 완료, 잠금·WHY·공개 작업은 수행하지 않음.
- 목표 화면과 실제 화면의 의도적 차이: 생성 목표의 사실적 다발 수를 줄이고 일곱 개 굵은 관절 갈대로 단순화해 움직임과 잡기점을 더 읽기 쉽게 했다.
- 남은 위험: 자동 검증은 마디 제스처와 실패/재시작 경로를 실제 브라우저에서 확인했지만, 2–3분 완주를 독립 사람이 반복 플레이한 분포는 아직 없다. 기존 lockfile 설치 감사에서 48개 취약점(critical 4/high 24)이 보고됐고 Sonatype 연결은 인증 토큰 부재로 확인하지 못했다.

## 잠금 전 포털 수정

첫 잠금 시 제작 검증 안내에 없던 포털 CSP 증거가 요구되었다. `npm run build:arcade && npm run csp`의 첫 실행은 런타임이 `/art/title-key.png`를 직접 읽어 포털의 불변 자산 경로를 놓쳤고 404 한 건으로 실패했다. 아케이드 엔트리가 전달받은 `assetBaseUrl`을 게임 런타임까지 넘기고, CSP 하네스의 `/` 값은 엔트리 모듈 기준 URL로 해석하도록 고쳤다. 이후 테스트 24/24, TypeScript, 웹/아케이드 빌드, puzzle 시뮬레이션, smoke, 뷰포트, CSP를 모두 다시 실행했으며 CSP 위반·누락·콘솔 오류는 각각 0이었다. 증거는 `verification/csp-portal-result.json`과 `verification/csp-portal-play.png`에 남겼다.

## 첫 독립 검토 뒤 소스 보완

독립 검토는 화면에 구간별 목표 방향·허용 폭이 없고 실패 뒤 교정이 없어서 자연 제스처 3판이 모두 section 0에 머문 점, 핵심 잡기점이 장식 마디가 아니라 빈 판정 원으로 보인 점을 차단 사유로 기록했다. 관측 분포는 intuitive 5/0/5, skilled 0/0/0, natural 0/0/0, 포인터 완주 0이었다. 규칙과 잠긴 시청각 재료는 유지하고 판정식의 `target ±30`을 각 갈대에 붙은 두 장의 청록 젖은 잎눈으로 렌더했다. 마디가 잎눈 사이에 들면 잎맥이 밝아지며, 첫 실패 뒤에는 잎눈과 현재 방향 문구가 강해져 같은 화면에서 교정할 수 있다. 50px 실제 hit target은 유지하되 보이는 중심은 꽃눈 모양의 갈대 매듭으로 바꿨다. 긴 드래그가 마디 밖에서 끝나도 놓기가 결손되지 않도록 global pointer-up을 처리하고, 굳은 마디는 다른 마디 입력을 가로채지 않는다.

키보드는 숨은 정답값을 화살표 한 번으로 제출하던 경로를 제거했다. 이제 화살표마다 가운데 마디를 12씩 움직여 포인터와 같은 실시간 잎눈 대역을 보고, Enter/Space로 놓아 같은 `commit` 판정을 받는다. 따라서 두 입력 모두 방향·형상·허용 오차를 스스로 맞춰야 한다.

재현 가능한 실기 모델 `node scripts/pointer-cue-play.mjs`는 규칙의 `TARGETS`나 내부 목표값을 읽지 않고 캔버스의 청록 픽셀과 보이는 마디 중심에 실제 Playwright 포인터 이벤트를 보낸다. 자연스러운 짧은 첫 제스처는 section 0 / failure 1이었고, 강화된 단서를 다시 읽은 다음 제스처에서 section 1 / failure 1로 회복했다. 이후 실패 추가 없이 section 8을 완주했다. 세부 9개 관측은 `verification/pointer-cue-result.json`에 있으며 `firstFailureImproved`와 `completed`가 모두 true다.

최종 소스 해시 `a5eadae48f841a4196f73d55ed632e9c9eb353c5dd9b951128cf727082bab63d`에서 다음을 다시 실행했다.

- `npm test`: 4 files, 25 tests passed.
- `npx tsc -b`: 오류 0.
- `npm run build:web`: 779 modules, main JS 500.97KB / gzip 161.07KB.
- `node scripts/playability-sim.mjs`: puzzle pass, meaningful actions 8, distinct outcomes 3, reachable goal/reset/choice change true. `verification/playability-result.json`.
- `npm run smoke`: mounted/finished/resultDelivered/restartVerified true, console/page errors 0. `smoke-result.json`, `smoke.png`.
- `node scripts/viewport-smoke.mjs`: geometry 8/8 및 ko/en × standalone/portal game-over 4/4 pass, 오류 0. `verification/viewport-result.json`.
- `npm run build:arcade`: 16 immutable files, 5,311,954 bytes, JS gzip 285,315 bytes; release 검증 통과.
- `npm run csp`: stylesheet/canvas/assets/CSP 전 항목 pass, 위반·누락·오류 0. `verification/csp-portal-result.json`.

남은 위험은 픽셀 기반 사람 모델이 방향과 허용 폭을 읽는 경로를 재현하지만 다양한 실제 사람의 손가락 가림·색각·학습 분포까지 대체하지는 못한다는 점이다. 기존 의존성 감사 위험은 이번 범위에서 변경하지 않았다. 이 보완은 relock이나 공개 서사 수정을 수행하지 않았다.

## 공개 서사 산출물

- `WHY.md`에 한국어와 영어로 같은 조작, 감각, 감산 이유를 적었다.
- `brand/art/laika-base.png`를 실제 참조로 Codex 내장 `image_gen`을 사용해 `art/source/laika-gardengaps.png`를 생성했다.
- 프롬프트는 `art/prompts/laika-gardengaps.md`, 해시와 얼굴·발·문자·모바일 크롭 검수는 `art/provenance/laika-gardengaps.json`에 기록했다.
- 웹 파생본은 `public/art/laika-gardengaps-640.jpg`와 `public/art/laika-gardengaps-1280.jpg`다. 생성 원본 PNG는 릴리스 경로에 넣지 않았다.
- manifest에는 잠긴 필드를 유지하고 `credits`, `whyCreated`, `media.makerIllustration`만 추가했다. 실제 제작 모델은 `gpt-5.6-sol`로 기록했다.

## 공개 전 호스트 수명주기 보완

로컬 아케이드 등록 중 포털이 전달하는 언어·일시정지·음소거·재시작 명령을 엔트리는 받지만 게임 런타임이 구현하지 않은 점을 확인했다. 독립 실행의 URL 언어만 읽던 경로를 런타임 `locale` 상태로 바꾸고, 호스트의 `setLocale`이 제목·상태·가이드·결과 문구를 현재 판을 유지한 채 갱신하게 했다. `pause`는 Pixi ticker와 오디오를 함께 멈추고, `mute`는 첫 입력 전 무음 계약을 유지하며 오디오만 제어한다. 호스트 재시작도 첫 구간 상태를 복원한다. `__gameState`에는 포털 검증이 결과 측정에만 쓸 locale·paused·muted를 노출했다.

수정 뒤 `npm test` 25/25, TypeScript, 웹 빌드, puzzle 시뮬레이션, smoke, 뷰포트 8/8과 게임오버 4/4, 아케이드 빌드, CSP, 실제 포인터 화면 단서 완주를 모두 다시 실행했다. 최종 증거 sourceHash는 `1d99599cd34f96144bc62d2948c01671d9bf5961522bb0a7883ba198f1ca732f`이며 포인터는 첫 실패 뒤 회복해 추가 실패 없이 8구간을 완주했다.
