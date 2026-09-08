<!-- Post: 全球在线 SDR 电台巡礼 | ID: 2026-063 | Created: 2026-09-08 | Tags: tech, works | Format: markdown -->

## 开篇：什么是在线 SDR？

SDR（Software Defined Radio，软件定义无线电）的核心思想是：把传统收音机里用硬件电路完成的调制解调、滤波、混频等工作，全部搬到软件里来做。天线接收到的射频信号经过 ADC（模数转换）采样后，直接变成数字信号，后续所有处理都由 CPU/GPU 完成。

**在线 SDR** 则更进一步：有人把自己的 SDR 接收器连上互联网，开放一个网页界面，让全世界任何人都能通过浏览器远程调谐、收听、看频谱瀑布图。你不需要拥有任何无线电硬件，只要有网，就能操作一台位于荷兰、新西兰、日本或南极的接收器。

> 这是业余无线电精神的极致体现：**搭建、共享、探索**。

---

## 四大在线 SDR 体系

目前全球公开的在线 SDR 主要分为四大技术体系，各有优劣：

| 体系 | 开发者 | 典型硬件 | 频率范围 | 同时用户数 | 访问方式 |
|------|--------|----------|----------|-----------|----------|
| **WebSDR** | Pieter-Tjerk de Boer (PA3FWM) | 声卡/SDR 设备 | LF~UHF 不等 | 数十人 | 纯浏览器 |
| **KiwiSDR** | John Seamons (ZL/KF6VO) | BeagleBone + KiwiSDR  cape | 0~30 MHz（部分扩展到 VHF） | 4~8 人 | 纯浏览器 |
| **OpenWebRX / OpenWebRX+** | Andras Retzler / Marat Fayzullin | RTL-SDR、SDRplay、AirSpy 等 | 取决于硬件 | 数人~数十人 | 纯浏览器 |
| **SpyServer** | AirSpy / SDR# | Airspy、RTL-SDR | 取决于硬件 | 数人 | 需 SDR# 客户端 |

### WebSDR — 最经典的老牌体系

WebSDR 是在线 SDR 概念的开创者，2008 年由荷兰特文特大学（University of Twente）的 PA3FWM 发起。它的特点是带宽大、用户容量高，经典节点通常覆盖整个 HF 频段（0~30 MHz），可以同时让几十人独立调谐。

**代表节点：** 特文特大学 WebSDR 是全球最著名的节点，运行超过 15 年，天线是 Mini-Whip 有源天线，底噪极低。

### KiwiSDR — 最精致的分布式网络

KiwiSDR 是一个树莓派大小的设备（BeagleBone Black + 专用 SDR cape），14-bit ADC，覆盖 0~30 MHz，支持 4~8 个用户同时使用。全球目前有 **800+ 台** KiwiSDR 公开运行，形成了最庞大的分布式接收网络。

KiwiSDR 的杀手锏是内置 **WSPR 解码**和 **TDoA（到达时间差）测向**功能，可以在浏览器里直接对信号进行定位。

### OpenWebRX — 最开放的开源方案

OpenWebRX 是完全开源的项目，支持几乎所有主流 SDR 硬件（RTL-SDR、SDRplay、AirSpy、HackRF 等）。OpenWebRX+ 是其增强分支，增加了更多数字模式解码（DMR、YSF、NXDN、P25 等）。

### SpyServer — 最高音质的远程流

SpyServer 是 AirSpy 推出的远程 SDR 流协议，传输的是压缩后的 I/Q 数据，需要在本地用 SDR# 软件接收。优点是音质和灵活性最高，缺点是不能直接用浏览器访问。

---

## 全球 SDR 聚合平台

不要一个个记节点地址，以下平台会自动汇总所有在线节点：

### 1. ReceiverBook — 最全面的目录

**地址：** https://www.receiverbook.de

目前最好用的 SDR 接收器目录，汇总了 WebSDR、KiwiSDR、OpenWebRX 三大体系。支持按频段、国家、接收器类型筛选，每个节点显示在线状态、用户数、信噪比。

### 2. KiwiSDR 官方列表

**列表：** http://rx.kiwisdr.com
**地图：** http://map.kiwisdr.com（链接到 rx.linkfanel.net）

只列 KiwiSDR 节点，但信息最详细——包括当前用户数、SNR（信噪比）、GPS 锁定状态、天线类型。支持按 SNR 排序，帮你找到接收条件最好的节点。

### 3. WebSDR 官方列表

**地址：** http://www.websdr.org

WebSDR 体系的官方目录，服务器自动注册。可以按频段和地区筛选。

### 4. AirSpy SpyServer 目录

**地址：** https://airspy.com/directory/

SpyServer 节点的地图，需要 SDR# 客户端连接。

### 5. AB9IL 最佳 SDR 列表

**地址：** https://www.ab9il.net/software-defined-radio/best-sdrservers.html

人工维护的精选列表，按 SNR 排序，标注了每个节点的特点和天线配置。

---

## 精选全球 SDR 电台

以下是经过实际连通性测试的精选节点，按地区分类。标注 ✅ 的为本次测试时可直接访问的节点。

### 欧洲

| 名称 | 位置 | 类型 | 频率范围 | 地址 | 状态 |
|------|------|------|----------|------|------|
| University of Twente | 荷兰 Enschede | WebSDR | 0~29.16 MHz | [websdr.ewi.utwente.nl:8901](http://websdr.ewi.utwente.nl:8901/) | ✅ |
| KiwiSDR Almere | 荷兰 Almere | KiwiSDR | 0~30 MHz | [kiwisdr.pa7ey.nl:8073](http://kiwisdr.pa7ey.nl:8073/) | ✅ |
| PI4UTR WebSDR | 荷兰 | WebSDR | HF | [sdr.pi4utr.nl:8073](http://sdr.pi4utr.nl:8073/) | — |
| DK0TE WebSDR | 德国 Friedrichshafen | WebSDR | HF | [dk0te.dhbw-ravensburg.de:8901](http://dk0te.dhbw-ravensburg.de:8901/) | ⚠️ |
| DK0TE KiwiSDR | 德国 Friedrichshafen | KiwiSDR | 0~30 MHz | [kiwisdr.inf.dhbw-ravensburg.de:8073](http://kiwisdr.inf.dhbw-ravensburg.de:8073/) | — |
| DD5JFK OpenWebRX | 德国 | OpenWebRX | HF | [sdr2.justjakob.de](http://sdr2.justjakob.de/) | ✅ |
| DB0HAL Halle | 德国 Halle | KiwiSDR | 0~30 MHz | [db0hal.dyndns.org:8073](http://db0hal.dyndns.org:8073/) | — |
| DL8LAS Trent | 德国 | KiwiSDR | 0~30 MHz | [dl8las.dyndns.org:8073](http://dl8las.dyndns.org:8073/) | — |
| EDDC2 Dresden | 德国 Dresden | KiwiSDR ×2 | 0~30 MHz | — | — |
| Hack Green | 英国 Nantwich | WebSDR | HF | [hackgreensdr.org:8901](http://hackgreensdr.org:8901/) | ❌ |
| Hasenberg AG | 瑞士 | KiwiSDR ×5 + AirBand | 0~30 MHz / 110~142 MHz | — | — |
| OE4XLC | 奥地利 | WebSDR | HF | — | — |
| OH5LIZ | 芬兰 | KiwiSDR | 0~30 MHz（NDB 专用） | [oh5liz.proxy.kiwisdr.com:8073](http://oh5liz.proxy.kiwisdr.com:8073/) | — |
| OH5AE | 芬兰 Elimäki | KiwiSDR | 0~30 MHz | [oh5ae.dyndns.org:8073](http://oh5ae.dyndns.org:8073/) | — |
| SDR-PAL-1 | 芬兰 Lapland | KiwiSDR | 0~30 MHz | — | — |

### 北美

| 名称 | 位置 | 类型 | 频率范围 | 地址 | 状态 |
|------|------|------|----------|------|------|
| Northern Utah WebSDR | 美国 Utah | WebSDR ×2 | 30m~6m 业余波段 | [websdr1.sdrutah.org](http://websdr1.sdrutah.org/) | ✅ |
| N1NTE-1 | 美国 MA/CT | KiwiSDR | 0~30 MHz | [sigmasdr.ddns.net:8073](http://sigmasdr.ddns.net:8073/) | ⚠️ |
| WPC4ALP | 美国 Tennessee | KiwiSDR | 0~30 MHz | [midtn.dynu.net:8073](http://midtn.dynu.net:8073/) | — |
| KJ6EO | 美国 California | WebSDR | HF | [kj6eo.com:8901](http://kj6eo.com:8901/) | — |
| VE6JY | 加拿大 Alberta | KiwiSDR | 0~30 MHz | [kiwisdr.ve6slp.ca:8173](http://kiwisdr.ve6slp.ca:8173/) | ⚠️ |

### 亚太地区（对中国用户延迟最低）

| 名称 | 位置 | 类型 | 频率范围 | 地址 | 状态 |
|------|------|------|----------|------|------|
| Marahau SDR ×5 | 新西兰 Tasman | KiwiSDR ×5 | 0.5~30 MHz | [kiwisdr.owdjim.gen.nz:8073](http://kiwisdr.owdjim.gen.nz:8073/) | ✅ |
| ZL2P H6 | 新西兰 Masterton | KiwiSDR | 0~30 MHz | [h6.proxy.kiwisdr.com](http://h6.proxy.kiwisdr.com/) | — |
| ZL2DAA | 新西兰 Ohau | KiwiSDR | 0~30 MHz | [kiwisdr.annett.co.nz:8073](http://kiwisdr.annett.co.nz:8073/) | — |
| VK2ATZ | 澳洲 NSW | KiwiSDR | 0~30 MHz | [vk2atz.proxy.kiwisdr.com:8073](http://vk2atz.proxy.kiwisdr.com:8073/) | ⚠️ |
| VK3KHZ ×6 | 澳洲 Victoria | KiwiSDR ×6 | 0~30 MHz | — | — |
| JH1PGF ×2 | 日本东京 | KiwiSDR ×2 | 0~30 MHz | [kiwisdr.hirokinet.com:8073](http://kiwisdr.hirokinet.com:8073/) | ⚠️ |
| Shibuya SDR | 日本东京涩谷 | KiwiSDR | 0~30 MHz | [shibuya.proxy.kiwisdr.com:8073](http://shibuya.proxy.kiwisdr.com:8073/) | — |
| Web-888 Nagano | 日本长野 | WebSDR | HF | — | — |
| Web-888 Tokyo | 日本东京 | WebSDR | HF | — | — |
| GNSS Tokyo | 日本东京 | KiwiSDR | 0~30 MHz | [gnss.0am.jp:8073](http://gnss.0am.jp:8073/) | ⚠️ |

### 中国地区

> **注意：** 中国大陆的公开 SDR 节点非常稀少且不稳定，多数已下线。以下为历史上曾存在的节点，当前可用性不保证。台湾、香港地区节点相对较多。

| 名称 | 位置 | 类型 | 地址 | 备注 |
|------|------|------|------|------|
| railgun | 重庆 | KiwiSDR | [railgun.proxy.kiwisdr.com:8073](http://railgun.proxy.kiwisdr.com:8073/) | 代理重定向，不稳定 |
| szsdr | 广东深圳 | KiwiSDR | [szsdr.ddns.net:8073](http://szsdr.ddns.net:8073/) | 502，疑似下线 |
| 21599 | 江苏无锡 | KiwiSDR | [21599.proxy.kiwisdr.com:8073](http://21599.proxy.kiwisdr.com:8073/) | 代理重定向 |
| czsdr | 河北沧州 | KiwiSDR | [czsdr.proxy.kiwisdr.com:8073](http://czsdr.proxy.kiwisdr.com:8073/) | 代理重定向 |

**建议：** 中国用户优先使用日本、新西兰、澳洲节点，延迟通常在 100~200ms，体验良好。

---

## 怎么玩：快速上手指南

### 第一步：选一个节点

打开 [ReceiverBook](https://www.receiverbook.de) 或 [KiwiSDR 地图](http://map.kiwisdr.com)，找一个用户数没满、SNR 高的节点。

**选节点技巧：**
- **用户数**：KiwiSDR 通常 4~8 人上限，满了就要排队
- **SNR（信噪比）**：越高越好，20dB 以上算优秀，10dB 以下底噪大
- **地理位置**：听哪个地区的广播就选哪个地区的节点（短波有天波传播，但本地节点接收本地电台最强）
- **天线**：同地区下，环形天线（Loop）抗干扰好，长线天线灵敏度高

### 第二步：调谐收听

进入网页界面后：
- **频谱图**：上方是实时频谱，下方是瀑布图（历史频谱的时间轴）
- **调谐**：点击频谱图上的任意位置即可调谐到该频率
- **模式**：选择解调模式——AM（调幅广播）、USB/LSB（单边带，业余电台）、CW（摩尔斯电码）、FM（调频）
- **带宽**：调整滤波器带宽，AM 广播用 6~10 kHz，CW 用 200~500 Hz

### 第三步：推荐收听频率

| 频率 | 内容 | 最佳时段 |
|------|------|----------|
| 5.0 MHz | 全球标准时间发播（WWV/WWVH/BPM） | 全天 |
| 9.5~9.9 MHz | 国际广播（BBC、VOA、Radio Japan 等） | 夜间 |
| 11.5~12.0 MHz | 国际广播 | 白天 |
| 13.5~13.9 MHz | 国际广播 | 白天 |
| 15.1~15.6 MHz | 国际广播 | 白天 |
| 17.5~17.9 MHz | 国际广播 | 白天 |
| 21.0~21.45 MHz | 国际广播 + 业余 15m 波段 | 白天 |
| 14.0~14.35 MHz | 业余 20m 波段（最热闹） | 全天 |
| 7.0~7.3 MHz | 业余 40m 波段 | 夜间 |
| 3.5~4.0 MHz | 业余 80m 波段 | 夜间 |

---

## 项目方案：怎么做一个 SDR 电台展示页面

基于之前 3D 地球电台项目的经验，SDR 电台展示页面可以采用类似的架构，但有几个关键差异：

### 架构设计

```
用户浏览器
    │
    ├── 3D 地球（three-globe）── 显示全球 SDR 节点位置
    │
    ├── 节点信息面板 ── 点击节点显示详情（类型/频率/用户数/SNR）
    │
    └── 内嵌收听 ── iframe 嵌入 SDR 网页界面，或弹出新窗口
```

### 数据来源

有三种方式获取 SDR 节点数据：

**方案 A：手动维护 JSON 列表**
- 从 ReceiverBook / KiwiSDR 列表手动整理
- 优点：完全可控，可添加中文标注和推荐等级
- 缺点：需要定期更新，节点上下线频繁

**方案 B：抓取 KiwiSDR 官方 JS 数据**
- KiwiSDR 提供可解析的 JS 格式列表：`http://rx.linkfanel.net/kiwisdr_com.js`
- 包含所有在线 KiwiSDR 的位置、URL、用户数、SNR
- 可写一个定时脚本抓取并转换为 GeoJSON

**方案 C：调用 ReceiverBook API**
- ReceiverBook 可能有 API 接口（需探查）
- 覆盖 WebSDR + KiwiSDR + OpenWebRX 三种类型

### 关键技术点

| 技术点 | 方案 | 注意事项 |
|--------|------|----------|
| 节点定位 | 经纬度坐标，KiwiSDR 数据自带 | 部分节点位置模糊到城市级 |
| 节点类型区分 | 不同颜色/图标：WebSDR=蓝、KiwiSDR=绿、OpenWebRX=橙 | 与之前广播电台的青色区分 |
| 在线状态 | 定时 ping 检测，或依赖数据源的在线字段 | KiwiSDR 列表自带用户数，0 用户可能离线 |
| 收听方式 | 点击节点弹出 iframe 或新标签页 | 部分 SDR 页面禁止 iframe 嵌入（X-Frame-Options），需用新窗口 |
| 频谱预览 | 无法实时获取，可用截图或静态图 | KiwiSDR 有 `/status` 接口返回基本信息 |
| 用户容量 | 显示当前用户/最大用户 | KiwiSDR `/status` 接口可获取 |

### 与之前广播电台项目的区别

| 维度 | 广播电台项目 | SDR 电台项目 |
|------|-------------|-------------|
| 内容 | 预定义的音频流（固定电台） | 实时可调谐的频谱（用户自己选频率） |
| 交互 | 点击即播放 | 点击进入 SDR 界面，需手动调谐 |
| 数据量 | 数百家电台 | 800+ KiwiSDR + 数百家 WebSDR/OpenWebRX |
| 可用性 | 流地址可能失效 | 节点可能下线，需实时检测 |
| 嵌入难度 | 音频流可直接播放 | SDR 网页界面可能禁止 iframe |

### 实施步骤建议

1. **第一阶段**：手动整理 30~50 个精选节点（按地区分类，标注类型和推荐等级），做成 3D 地球展示
2. **第二阶段**：添加 KiwiSDR 自动抓取脚本，定时更新节点列表和在线状态
3. **第三阶段**：集成 ReceiverBook 数据，覆盖全部三种类型
4. **第四阶段**：添加频率快捷预设（点击节点后可一键跳到常用频率）

---

## 进阶玩法

### 1. 多节点三角定位

KiwiSDR 内置 TDoA（到达时间差）功能，可以用多个 KiwiSDR 节点对同一个信号进行定位。适合寻找未知信号源、干扰源。

### 2. WSPR 信号监测

WSPR（Weak Signal Propagation Reporter）是一种微弱信号传播报告模式。KiwiSDR 可以自动解码 WSPR 信号，帮你实时观测全球短波传播状况。

### 3. 航空波段收听

部分 KiwiSDR 扩展到了 VHF 航空波段（118~136 MHz），可以收听机场管制通话。瑞士 Hasenberg 节点就有专门的 AirBand KiwiSDR。

### 4. 数字模式解码

OpenWebRX+ 支持在浏览器里直接解码 DMR、D-Star、YSF、NXDN、P25 等数字语音模式，以及 POCSAG 寻呼、AX.25 数据包等。

---

## 参考资源

- [ReceiverBook — 全球 SDR 接收器目录](https://www.receiverbook.de)
- [KiwiSDR 官方网站](http://kiwisdr.com/)
- [KiwiSDR 接收器列表](http://rx.kiwisdr.com)
- [KiwiSDR 世界地图](http://map.kiwisdr.com)
- [WebSDR 官方网站](http://www.websdr.org)
- [OpenWebRX 官方网站](https://www.openwebrx.de/)
- [OpenWebRX+ 增强版](https://fms.komkon.org/OWRX/)
- [AirSpy SpyServer 目录](https://airspy.com/directory/)
- [AB9IL 最佳互联网 SDR 列表](https://www.ab9il.net/software-defined-radio/best-sdrservers.html)
- [Skywave Linux — SDR 专用 Linux 发行版](https://skywavelinux.com/)

---

## 结语

在线 SDR 是一个被严重低估的宝藏。不需要花一分钱买硬件，你就能用浏览器操作一台远在地球另一端的专业接收器，收听来自全世界的电波——从国际广播到业余电台通联，从航空管到摩尔斯电码，从标准时间发播到卫星下行信号。

对于无线电爱好者来说，这是最好的时代；对于好奇的普通人来说，这是一扇通往电磁频谱世界的免费大门。

下一步，我打算基于 3D 地球的架构，做一个全球 SDR 节点的可视化展示页面。如果你也感兴趣，欢迎一起探讨。
