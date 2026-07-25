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
