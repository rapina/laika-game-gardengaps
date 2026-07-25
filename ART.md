# Art & Audio Provenance

모든 생성은 2026-07-25 내장 `image_gen`(gpt-image-2 경로)로 수행했다. 원본 PNG는 후가공 없이 저장했다.

| 파일 | SHA-256 | 용도 |
|---|---|---|
| `design/targets/first-play.png` | `c0b551bcb9669547202eaccba312276b365b5dc869dff2c80254d5f7e92cadcc` | 첫 판 목표 화면 |
| `design/targets/verb-success.png` | `06454286dc97069abb9782788dc10ae1290c9fd263beaceb4f7864bb6ade26a8` | 핵심 동사 성공 목표 |
| `design/targets/game-over.png` | `8ff0e353cff299ee3c3a59c18da7686054921f78ebd8ef08b8df9b1c885f59e9` | 종료 목표 |
| `public/art/title-key.png` | `9bc472b0f2db4273043049a71b84ae3946f814dfbc65e74aebe23b05d49370b5` | 타이틀과 게임 저채도 배경 |

## 프롬프트

- first-play: 390×844 밤 습지 퍼즐 UI, 장식 청록 마디와 실제 잡는 점 일치, 딱정벌레·젖은 잎·8구간·행동 상태, 벡터와 마른 섬유, 점수/재화/파티클 제외.
- verb-success: 놓은 직후 연결 갈대가 옆으로 휘어 통로를 만들고 딱정벌레가 자동 통과, `지나가는 중 / Let it pass`, 숫자 없는 잎 진행.
- game-over: 잎 아래 숨은 딱정벌레, 닫힌 갈대 뒤 가는 청록 경로, 한영 종료와 화면 탭 재시작.
- title-key: 글자 없는 세로 컷페이퍼/스크린프린트, 작은 무광 딱정벌레와 마른 갈대, 중앙 청록 틈, 위쪽 젖은 잎.

후가공은 경로 이동만 했다. 런타임 갈대·잎·딱정벌레는 Pixi 벡터로 자체 제작했다. 오디오는 외부 파일 없이 WebAudio oscillator로 첫 입력 뒤 합성한다.

## 공개 제작자 일러스트

- 대표 행동: 라이카가 마른 갈대 매듭을 앞발로 살며시 벌려 작은 딱정벌레가 젖은 잎으로 지날 길을 만든다.
- 참조: `brand/art/laika-base.png`, `laika-base-v1`, SHA-256 `820e6d43e915c4e9e32ddcd3cc14d0f2537d99f6d8d397bbd40fc416137a6712`.
- 생성: Codex 내장 `image_gen`에 베이스 PNG를 실제 이미지 참조로 전달했다. 프롬프트는 `art/prompts/laika-gardengaps.md`에 보존했다.
- 원본: `art/source/laika-gardengaps.png`, 1536×1024, SHA-256 `97604fe5e0a55f8ca3bb88acba28106d0cff512ce7c830a7ce457fb93beb33cf`. 원본 PNG는 릴리스에 포함하지 않는다.
- 후가공: `sips`로 너비를 축소하고 JPEG로 변환했다. 1280px는 품질 86, 640px는 품질 84다. 자르기, 합성, 색 변경은 하지 않았다.

| 웹 파일 | 크기 | SHA-256 |
|---|---:|---|
| `public/art/laika-gardengaps-640.jpg` | 640×426 | `0aa3302abc40ee39966bba38d285883a8203b454046b66c2e4e61989f843bba0` |
| `public/art/laika-gardengaps-1280.jpg` | 1280×853 | `c83c7f86f50d5cf772beef55a1a5d71af77d538d2f3a1954a3b3f87c9f8e8df3` |

시각 검수에서 베이스의 얼굴 무늬, 뾰족 귀, 흰 가슴과 앞발, 크림색 하네스, 주황 연결구를 확인했다. 네 발과 관절은 자연스럽고 여분의 발이나 사람 손이 없다. 마른 갈대 묶음, 딱정벌레, 젖은 잎 외에 다른 도구가 없으며 문자, 로고, 서명, 가짜 기록 표식도 없다. 중앙 모바일 크롭에서도 얼굴, 하네스, 갈대를 벌리는 앞발, 딱정벌레와 젖은 잎이 함께 읽힌다. 세부 검수는 `art/provenance/laika-gardengaps.json`에 남겼다.
