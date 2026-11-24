# 怎么让所有人都能访问

`dji-expo/` 是纯静态站点，没有后端、没有构建步骤，把整个文件夹原样传上去就能跑。已打包：`D:\DSHfile\dji-expo-site.zip`（7.9 MB）。

下面三条路，按省事程度排序。

---

## 一、Netlify Drop（最快，约 1 分钟）

1. 打开 <https://app.netlify.com/drop>
2. 把 `dji-expo` 文件夹（不是 zip）直接拖进页面
3. 等十几秒，会得到一个 `https://随机名.netlify.app` 的公开地址
4. 登录后可在 Site settings → Change site name 改成 `dji-go-global.netlify.app` 这种好记的

免费额度对课程展示完全够用，不需要绑卡。

---

## 二、Cloudflare Pages（免费、国内访问相对稳）

1. 打开 <https://dash.cloudflare.com/> 注册
2. Workers & Pages → Create → Pages → **Upload assets**
3. 把 `dji-expo` 文件夹拖进去，Deploy
4. 得到 `https://项目名.pages.dev`

---

## 三、GitHub Pages（要 Git，但最"永久"）

```bash
cd D:\DSHfile\dji-expo
git init
git add .
git commit -m "大疆出海 · 课程项目成果展"
git branch -M main
git remote add origin https://github.com/<你的用户名>/dji-expo.git
git push -u origin main
```

推上去之后：仓库 → Settings → Pages → Source 选 `main` / `root` → Save。
等 1 分钟，地址是 `https://<用户名>.github.io/dji-expo/`。

⚠️ 404 页里的首页链接写的是 `/`，在项目子路径下会跳到域名根，不影响正常浏览；要用 404 的话把 `404.html` 里的 `href="/"` 改成 `href="./"`。

---

## 想让我直接发布？

上面三个平台都要登录。把下面任意一个给我，我就能在这台机器上直接推上去：

- **GitHub**：Personal access token（勾 `repo` 权限），或者你先 `git push` 一次让凭据进 Windows 凭据管理器
- **Netlify**：User settings → Applications → Personal access tokens
- **Cloudflare**：API Token（Pages:Edit 权限）+ Account ID

拿到后我会建仓库／建站点、上传、开启 Pages，然后把正式地址回给你。

---

## 先在本机/教室局域网看

本机：<http://127.0.0.1:8080>
同一 Wi-Fi 下的手机、电脑：<http://10.66.83.57:8080>

命令（在 `dji-expo` 目录下）：

```bash
python -m http.server 8080 --bind 0.0.0.0
```

别的设备打不开时，是 Windows 防火墙拦了入站 8080：控制面板 → Windows Defender 防火墙 → 允许应用通过防火墙 → 勾选 Python；或者用管理员 PowerShell 执行：

```powershell
netsh advfirewall firewall add rule name="static-8080" dir=in action=allow protocol=TCP localport=8080
```

想临时给外网看（关掉电脑就失效）：

```powershell
winget install --id Cloudflare.cloudflared
cloudflared tunnel --url http://localhost:8080
```

命令会打印一个 `https://xxx.trycloudflare.com` 的地址，把它发给别人即可。

---

## 上线后自查

- [ ] 首屏海报、标题正常
- [ ] 01 地图六个点落在对应国家
- [ ] 02 竖屏视频能播（H.264）、15 秒广告片能播
- [ ] 手机竖屏打开没有横向滚动条
- [ ] 页脚组员名单、出处完整

所有资源都是相对路径（`assets/...`），放在域名根目录或子目录都能正常加载。
