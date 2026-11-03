export function gamePage(title: string, accent: string, body: string, script: string, extraCss = ''): string {
  return `<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:">
<style>
:root{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:#213645;background:#f4f8f8;--accent:${accent}}
*{box-sizing:border-box}body{margin:0;min-height:100dvh;padding:22px 19px 38px;overflow-x:hidden}
main{max-width:500px;margin:0 auto}.eyebrow{font-size:11px;font-weight:800;letter-spacing:2.5px;color:var(--accent);margin:12px 0 8px}h1{font-size:30px;line-height:1.18;margin:0 0 7px;letter-spacing:-.5px}p{line-height:1.5} .intro{font-size:14px;color:#758a95;margin:0 0 20px}
.panel{background:white;border-radius:27px;box-shadow:0 10px 35px #183b4410;padding:24px 19px;margin:15px 0 20px;min-height:370px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.status{font-size:18px;font-weight:800;text-align:center;min-height:30px;margin:12px 0;color:#284252}.hint{font-size:13px;color:#81949d;text-align:center;margin:5px 0 0}
button{font:inherit;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}button:focus-visible{outline:3px solid #162f44;outline-offset:3px}
.primary{border:0;border-radius:17px;background:var(--accent);color:white;font-size:18px;font-weight:800;min-height:56px;padding:0 25px;width:100%;max-width:300px;box-shadow:0 8px 20px #1b3e4524}
.result{color:#284252;font-weight:700;text-align:center;min-height:24px}.stats{display:flex;gap:10px;justify-content:center;margin:14px 0}.stat{background:#eaf1f2;border-radius:12px;padding:8px 12px;font-size:12px;color:#59717d}
${extraCss}
</style></head><body><main><div class="eyebrow">JOYBIT · MINI GAME</div><h1>${title}</h1>${body}</main><script>${script}</script></body></html>`;
}
