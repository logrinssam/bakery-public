# 도메인 · Firebase 승인

## 공개 URL

| 용도 | URL |
|------|-----|
| **커스텀 (로그인교실)** | https://pixel-bakery.xn--9d0blmm1xg2knrf.com/ |
| 한글 표기 | https://pixel-bakery.로그인교실.com/ (동일, punycode) |
| **GitHub Pages (백업)** | https://logrinssam.github.io/bakery-public/ |

## Firebase — 승인된 도메인 (필수)

[Authentication → Settings → Authorized domains](https://console.firebase.google.com/project/pixelbakery-a3ffb/authentication/settings)

아래 호스트를 **Add domain** 으로 추가 (없을 때만):

1. `pixel-bakery.xn--9d0blmm1xg2knrf.com`
2. `bakery.iirii.workers.dev`
3. `logrinssam.github.io` (GitHub Pages — PIN·클라우드 저장용)

> 익명 로그인·이어하기가 **승인 도메인에 없으면** 해당 URL에서 클라우드 저장이 실패합니다.
> 명예의 전당 **목록 조회**는 Firestore 공개 읽기지만, GitHub Pages 빌드에 `VITE_FIREBASE_*` 가 없으면 앱이 Firebase를 켜지 않아 **로컬 캐시만** 보입니다 (`.github/workflows/pages.yml` secrets).

## Cloudflare Workers

`wrangler.toml` 에 커스텀 도메인 라우트가 있습니다. DNS는 로그인교실 존에서 이미 연결된 경우 `npm run deploy` 만으로 동기화됩니다.
