# 도메인 · Firebase 승인

## 공개 URL

| 용도 | URL |
|------|-----|
| **커스텀 (로그인교실)** | https://pixel-bakery.xn--9d0blmm1xg2knrf.com/ |
| 한글 표기 | https://pixel-bakery.로그인교실.com/ (동일, punycode) |
| Workers 기본 | https://bakery.iirii.workers.dev |

## Firebase — 승인된 도메인 (필수)

[Authentication → Settings → Authorized domains](https://console.firebase.google.com/project/pixelbakery-a3ffb/authentication/settings)

아래 호스트를 **Add domain** 으로 추가 (없을 때만):

1. `pixel-bakery.xn--9d0blmm1xg2knrf.com`
2. `bakery.iirii.workers.dev`

> 익명 로그인·이어하기가 **승인 도메인에 없으면** 커스텀 URL에서만 클라우드 저장이 실패합니다.

## Cloudflare Workers

`wrangler.toml` 에 커스텀 도메인 라우트가 있습니다. DNS는 로그인교실 존에서 이미 연결된 경우 `npm run deploy` 만으로 동기화됩니다.
