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
