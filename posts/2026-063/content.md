<!-- Post: 从零搭建在线 SDR 电台完全指南 | ID: 2026-063 | Created: 2026-09-08 | Tags: tech, works | Format: markdown -->

## 开篇：为什么要自己搭一个在线 SDR？

你可能已经用过别人的在线 SDR（Software Defined Radio，软件定义无线电）——打开浏览器，就能操作一台远在荷兰或新西兰的接收器，收听全世界的电波。但用别人的总有各种限制：用户满了要排队、节点突然下线、你所在的地区没有好节点。

**自己搭一个**，其实没有想象中那么难。最便宜的方案只要一个树莓派（Raspberry Pi，约 300 元人民币）+ 一个 RTL-SDR 电视棒（约 80 元）+ 一根电线做天线，就能让全世界的人通过浏览器操作你的接收器。

这篇文章会从零开始，讲清楚四种主流方案的优劣、硬件怎么选、天线怎么做、软件怎么装、网络怎么配，最后把你的节点发布到全球目录里。

---

## 一、四种主流方案对比

目前搭建在线 SDR 服务器主要有四条技术路线，各有取舍：

| 方案 | 难度 | 成本 | 同时用户数 | 频率范围 | 适合人群 |
|------|------|------|-----------|----------|----------|
| **KiwiSDR** | ⭐ 最简单 | ￥1500-2500 | 4-8 人 | 0-30 MHz | 不想折腾，买了插电即用 |
| **OpenWebRX / OpenWebRX+** | ⭐⭐ 中等 | ￥400-800 | 数人-数十人 | 取决于硬件 | 有一点 Linux 基础，想灵活搭配硬件 |
| **WebSDR** | ⭐⭐⭐ 较难 | ￥1000+ | 数十人 | 取决于硬件 | 有 Linux 运维经验，追求大用户容量 |
| **SpyServer** | ⭐⭐ 中等 | ￥500-1500 | 数人 | 取决于硬件 | 已有 SDR# 客户端，追求最高音质 |

### 用一个类比理解

把在线 SDR 想象成一个**网络电台直播间**：
- **KiwiSDR** = 买一台现成的直播一体机，插上网线和麦克风就能开播，画质固定但省心
- **OpenWebRX** = 自己用电脑 + OBS 软件直播，设备可以自由搭配，需要稍微配置
- **WebSDR** = 搭建专业直播间，需要服务器级设备，但能同时容纳大量观众
- **SpyServer** = 用专业推流协议，观众需要装专用播放器才能看，但画质最好

> **新手推荐：OpenWebRX + Raspberry Pi + RTL-SDR**。总成本不到 500 元，社区资料最多，出了问题好搜答案。

---

## 二、硬件选择

### 2.1 SDR 接收器（核心设备）

SDR 接收器的作用是把天线收到的无线电信号转换成电脑能处理的数字信号。就像声卡把麦克风的模拟声音转换成数字音频一样。

| 设备 | 价格(约) | 采样率 | 频率范围 | ADC 精度 | 推荐度 |
|------|---------|--------|----------|----------|--------|
| **RTL-SDR Blog V4** | ￥80-120 | 3.2 MSPS | 0.5-1700 MHz | 8 bit | ⭐⭐⭐⭐⭐ 入门首选 |
| **SDRplay RSP1A** | ￥500-700 | 10 MSPS | 1kHz-2GHz | 14 bit | ⭐⭐⭐⭐ 进阶首选 |
| **AirSpy Mini** | ￥800-1000 | 6 MSPS | 24-1700 MHz | 12 bit | ⭐⭐⭐ |
| **AirSpy R2** | ￥1200-1500 | 10 MSPS | 24-1700 MHz | 12 bit | ⭐⭐⭐ |
| **KiwiSDR cape** | ￥1000-1500 | （专用） | 0-30 MHz | 14 bit | ⭐⭐⭐⭐ 配 BeagleBone |
| **HackRF One** | ￥2000+ | 20 MSPS | 1MHz-6GHz | 8 bit | ⭐⭐ 可收发，但接收一般 |

**关键概念解释：**
- **采样率（Sample Rate）**：每秒采集多少个数据点，越高越能同时看更宽的频段。就像相机的像素，像素越高照片越清晰。
- **ADC 精度（Analog-to-Digital Converter，模数转换器位数）**：8 bit 只有 256 级信号强度，14 bit 有 16384 级。精度越高，弱信号越不容易被噪声淹没。
- **频率范围**：RTL-SDR 最低只能到 0.5 MHz，想听长波（LW）和中波（MW）广播需要加升频器（Upconverter）；SDRplay 和 KiwiSDR 可以直接从 1kHz 开始。

> **新手建议**：先买 RTL-SDR Blog V4（注意买正版，盗版有频率偏差问题）。等玩熟了再升级 SDRplay RSP1A。

### 2.2 主机（运行软件的电脑）

| 方案 | 价格(约) | 功耗 | 推荐度 |
|------|---------|------|--------|
| **Raspberry Pi 4 / 5** | ￥300-500 | 5-15W | ⭐⭐⭐⭐⭐ 首选，低功耗可 24 小时运行 |
| **旧笔记本/迷你主机** | ￥0-500 | 15-40W | ⭐⭐⭐⭐ 有闲置设备时首选 |
| **BeagleBone Black/Green** | ￥300-400 | 5W | ⭐⭐⭐ 仅配合 KiwiSDR cape 使用 |
| **台式机** | ￥1000+ | 100W+ | ⭐⭐ 不推荐，电费贵 |

> **重要**：在线 SDR 需要 24 小时不关机，所以**低功耗的 ARM 开发板（树莓派等）是最佳选择**。一台树莓派 5 一年电费不到 20 元，而台式机可能要 200 元以上。

### 2.3 天线

天线是最容易被忽视但对接收质量影响最大的部分。一个好天线 + 便宜 SDR，远胜一个差天线 + 贵 SDR。

| 天线类型 | 价格(约) | 覆盖频段 | 优缺点 |
|----------|---------|----------|--------|
| **随机电线（10-20m 长线）** | ￥0 | 全 HF 波段 | 免费但效果一般，需配巴伦（Balun） |
| **Mini-Whip 有源天线** | ￥50-150 | 10kHz-30MHz | 体积小、宽带、效果好，**新手首选** |
| **YouLoop 磁环天线** | ￥100-200 | 10kHz-30MHz | 抗干扰强，城市环境首选 |
| **T2FD 宽带天线** | ￥100-300 | 3-30MHz | 经典宽带天线，需架设空间 |
| **偶极天线（Dipole）** | ￥50 | 单波段 | 针对特定波段效果最好 |
| **室外八木天线（Yagi）** | ￥200+ | VHF/UHF | 方向性强，适合航空波段/卫星 |

**天线架设要点：**
1. **越高越好**：天线离地面越高，接收效果越好。如果只能放室内，尽量靠近窗户。
2. **远离干扰源**：电脑屏幕、USB3.0 设备、开关电源都是强干扰源，天线要尽量远离。
3. **接地很重要**：有源天线需要良好的接地，否则噪声会很大。可以用一根导线接到自来水管或专门的接地棒。
4. **Mini-Whip 是新手最佳选择**：只有火柴盒大小，5V 供电，覆盖整个 HF 波段，室内窗外就能用。

---

## 三、方案 A：KiwiSDR —— 开箱即用（最简单）

如果你完全不想折腾软件配置，KiwiSDR 是最省心的方案。

### 需要买的东西

| 物品 | 价格(约) | 说明 |
|------|---------|------|
| KiwiSDR cape（扩展板） | ￥1000-1500 | 核心 SDR 板，含 14-bit ADC + FPGA + GPS |
| BeagleBone Black 或 Green | ￥300-400 | 主机，KiwiSDR cape 插在上面 |
| 5V 电源（2A 以上） | ￥30 | 供电 |
| 网线 | ￥10 | 必须有线，WiFi 不稳定 |
| HF 天线（Mini-Whip 等） | ￥50-150 | SMA 接口 |
| 8GB+ microSD 卡 | ￥30 | 系统盘（部分套件已含） |

### 搭建步骤

1. **组装硬件**：把 KiwiSDR cape 对准 BeagleBone 的排针插上去（注意 Pin 1 对齐），插上网线、天线、电源。
2. **获取 IP 地址**：登录路由器管理页面，找到名为 "kiwisdr" 或 "beaglebone" 的设备，记下它的 IP 地址。
3. **访问管理界面**：浏览器打开 `http://<IP地址>:8073`，就能看到 KiwiSDR 的接收界面了。
4. **修改管理员密码**：首次登录后进入 admin 页面，设置管理员密码。
5. **配置网络**：在 admin 页面的 network 标签页，可以设置静态 IP、端口等。
6. **发布到公共列表**：KiwiSDR 会自动注册到 `rx.kiwisdr.com`，全世界的人就能搜到你的节点了。

> KiwiSDR 的固件是预装在 SD 卡或 eMMC 里的，**不需要手动安装任何软件**，插电就能用。这也是它最贵但最省心的原因。

### KiwiSDR 的优势
- 内置 GPS（Global Positioning System，全球定位系统），频率精度极高（误差 < 0.1 Hz）
- 支持 4 个用户同时使用，每人可独立调谐
- 内置 WSPR（Weak Signal Propagation Reporter，弱信号传播报告）解码和 TDoA（Time Difference of Arrival，到达时间差）测向
- 自动注册到全球列表，不需要手动配置端口映射（用 KiwiSDR 的代理服务）

---

## 四、方案 B：OpenWebRX + 树莓派 —— 最通用（推荐新手）

OpenWebRX 是完全开源的项目，支持几乎所有主流 SDR 硬件。OpenWebRX+ 是其增强分支，增加了更多数字模式解码。

### 需要的硬件

| 物品 | 价格(约) |
|------|---------|
| Raspberry Pi 4（4GB 推荐）或 Pi 5 | ￥300-500 |
| RTL-SDR Blog V4 | ￥80-120 |
| 16GB+ microSD 卡 | ￥40 |
| 5V 3A USB-C 电源 | ￥30 |
| 网线 | ￥10 |
| Mini-Whip 有源天线 | ￥50-150 |

**总成本：约 ￥500-850**

### 方法一：烧录现成镜像（最简单）

OpenWebRX+ 官方提供了预配置的 Raspberry Pi 镜像，烧录到 SD 卡就能用。

1. **下载镜像**：访问 OpenWebRX+ 官网 `https://fms.komkon.org/OWRX/`，下载最新的 Raspberry Pi 镜像（.img 或 .img.xz 文件）。
2. **烧录 SD 卡**：用 Raspberry Pi Imager 或 balenaEtcher 把镜像写入 SD 卡。
3. **组装**：把 RTL-SDR 插入树莓派的 USB 口，插上网线、天线、电源。
4. **获取 IP**：在路由器管理页面找到树莓派的 IP 地址。
5. **访问界面**：浏览器打开 `http://<IP地址>:8073`，就能看到 OpenWebRX 界面了。
6. **管理配置**：访问 `http://<IP地址>:8073/settings`，默认用户名 `admin`，密码需要首次设置。

### 方法二：在现有 Debian/Ubuntu 上安装（适合有闲置电脑）

如果你有一台运行 Debian Bookworm 或 Ubuntu 的电脑/迷你主机，可以直接通过 apt 安装：

```bash
# 添加 OpenWebRX+ 软件源（以 Debian Bookworm 为例）
wget -O - https://repo.openwebrx.de/debian/key.gpg.txt | gpg --dearmor -o /usr/share/keyrings/openwebrx.gpg
echo "deb [signed-by=/usr/share/keyrings/openwebrx.gpg] https://repo.openwebrx.de/debian/ bookworm main" > /etc/apt/sources.list.d/openwebrx.list

# 安装
apt update
apt install openwebrx

# 添加管理员用户
openwebrx admin adduser 你的用户名

# 启动服务
systemctl enable --now openwebrx
```

> 以上命令适用于 Debian Bookworm / Ubuntu 22.04+。如果你用的是其他发行版，请参考 OpenWebRX+ 官网的安装说明。安装前请确认你的系统版本和架构（x86_64 / ARM64）。

### 配置 SDR 设备

在 settings 页面中：
1. **添加 SDR 设备**：选择你的设备类型（RTL-SDR / SDRplay / AirSpy 等），设置设备序列号。
2. **设置配置文件（Profile）**：每个配置文件定义一个频段和采样率。例如：
   - Profile 1：HF 波段，中心频率 14 MHz，采样率 2.4 MSPS
   - Profile 2：VHF 航空波段，中心频率 125 MHz，采样率 2.4 MSPS
3. **设置解调模式**：启用 AM、SSB（Single Side Band，单边带）、CW（Continuous Wave，等幅报）、FM 等模式。
4. **可选：启用数字语音解码**：安装 `codecserver` 和 `mbelib`，可以解码 DMR（Digital Mobile Radio，数字移动无线电）、D-Star、YSF 等数字语音。

### OpenWebRX 的优势
- 完全开源免费
- 支持硬件最多（RTL-SDR、SDRplay、AirSpy、HackRF、LimeSDR 等）
- OpenWebRX+ 支持大量数字模式解码
- 社区活跃，教程多
- 可以同时运行多个 SDR 设备，覆盖不同频段

---

## 五、方案 C：WebSDR —— 最经典（大用户容量）

WebSDR 是在线 SDR 概念的开创者，由荷兰特文特大学的 Pieter-Tjerk de Boer（呼号 PA3FWM）开发。它的特点是用户容量大，一台服务器可以同时让几十人独立调谐。

### 重要前提

WebSDR 的**服务器软件不公开下载**。作者通过邮件免费分发，但要求你满足以下条件：
- 有合适的 SDR 硬件（通常是专用的宽带 SDR 板卡）
- 有一台运行 Linux 的电脑
- 有快速的上行带宽（至少 10 Mbps）
- 愿意搭建**公开可访问**的服务器（会列在 websdr.org 上）

如果你满足条件，可以发邮件给 `pa3fwm@websdr.org` 申请，邮件中说明你的硬件配置、网络条件和架设地点。

### 替代方案

如果你不想申请，有几个开源的 WebSDR 兼容实现：

| 项目 | 地址 | 特点 |
|------|------|------|
| **raspberry-websdr** | github.com/reynico/raspberry-websdr | 树莓派 + RTL-SDR 的 WebSDR 实现 |
| **PhantomSDR-Plus** | github.com/sv1btl/PhantomSDR-Plus | 支持 GPU 加速，高性能 |
| **dj0abr/WebSDR** | github.com/dj0abr/WebSDR | 支持 SDRplay RSP1A/B |

### WebSDR 的硬件要求

WebSDR 通常需要**宽带 SDR**（能同时采样整个 HF 波段 0-30 MHz），常见的有：
- 专用的 WebSDR 接收板（如 PA3FWM 设计的自制板）
- RX-888 / Web-888（基于 ADC 的宽带接收器，采样率 64 MSPS）
- 高性能 SDR 如 USRP

普通的 RTL-SDR 带宽只有 3.2 MHz，不能覆盖整个 HF 波段，所以不适合做经典 WebSDR。

---

## 六、方案 D：SpyServer —— 最高音质（需要客户端）

SpyServer 是 AirSpy 推出的远程 SDR 流协议。它传输的是压缩后的 I/Q（In-phase/Quadrature，同相/正交）数据，而不是解调后的音频，所以用户可以在本地用 SDR# 软件做任意处理，音质和灵活性最高。

### 搭建方法

1. **下载 SpyServer**：从 AirSpy 官网 `https://airspy.com/download/` 下载 SpyServer。
2. **编辑配置文件** `spyserver.config`：
   - 设置监听端口（默认 5555）
   - 设置设备类型（AirSpy 或 RTL-SDR）
   - 设置最大客户端数量
3. **运行**：`./spyserver spyserver.config`
4. **发布到目录**：在配置中设置 `list_in_directory=1`，节点会出现在 `airspy.com/directory/`。

### 注意

SpyServer 的用户**不能用浏览器直接访问**，需要在电脑上安装 SDR#（SDR Sharp）软件，然后在软件里连接你的服务器。所以它更适合有一定基础的无线电爱好者，不适合面向普通大众。

---

## 七、网络配置：让全世界都能访问

SDR 服务器跑起来后，默认只能在你的局域网内访问。要让全世界的人都能用上，需要配置外网访问。

### 7.1 端口映射（Port Forwarding）

你的家庭路由器就像一个小区门卫，外面的人想进来找你的 SDR 服务器，需要门卫知道把请求转到哪台设备。

**操作步骤：**
1. 登录路由器管理页面（通常是 `192.168.1.1` 或 `192.168.0.1`）。
2. 找到"端口转发"或"虚拟服务器"设置。
3. 添加规则：
   - 外部端口：8073（KiwiSDR/OpenWebRX 默认）或 8901（WebSDR 默认）
   - 内部 IP：你的 SDR 服务器的局域网 IP
   - 内部端口：同上
   - 协议：TCP
4. 保存设置。

> 不同品牌路由器的设置界面不同，但原理一样。如果找不到，可以搜索你的路由器品牌 + "端口转发"。

### 7.2 动态域名（DDNS，Dynamic Domain Name System）

大多数家庭宽带的公网 IP 是动态的，每隔几天就会变。你需要一个动态域名服务，让域名自动指向最新的 IP。

| 服务 | 价格 | 说明 |
|------|------|------|
| **No-IP** | 免费（需每月确认） | 最常用，提供 `xxx.ddns.net` 域名 |
| **DuckDNS** | 免费 | 简洁，支持 `xxx.duckdns.org` |
| **花生壳** | 免费/付费 | 国内服务，但可能需要实名认证 |
| **Cloudflare** | 免费（需自有域名） | 最稳定，但需要自己有域名 |

大多数路由器内置了 DDNS 客户端，在路由器设置里填入账号密码即可。如果路由器不支持，可以在树莓派上运行 DDNS 客户端脚本。

### 7.3 关于 IPv6

如果你的宽带运营商提供了公网 IPv6 地址，那就**不需要端口映射**了！直接用 IPv6 地址就能访问。可以在 `ip.sb` 或 `ipv6-test.com` 检查你是否有公网 IPv6。

### 7.4 发布到全球目录

服务器能外网访问后，把它注册到全球目录，别人才能搜到：

| 目录 | 注册方式 | 覆盖类型 |
|------|----------|----------|
| **ReceiverBook** | receiverbook.de 注册账号，添加你的服务器 | WebSDR / KiwiSDR / OpenWebRX |
| **KiwiSDR 列表** | KiwiSDR 自动注册；手动在 admin 页面开启 | 仅 KiwiSDR |
| **WebSDR 列表** | 服务器自动注册到 websdr.org | 仅 WebSDR |
| **AirSpy 目录** | SpyServer 配置中开启 | 仅 SpyServer |

---

## 八、优化与维护

### 8.1 降低噪声

- **用屏蔽良好的 USB 线**连接 SDR 设备，减少电脑干扰
- **加铁氧体磁环**（Ferrite Bead）在 USB 线和天线馈线上
- **天线尽量架设在室外**，远离建筑物
- **使用线性电源**代替开关电源给 SDR 和有源天线供电
- **RTL-SDR 可以用 USB 延长线**把设备移到离电脑远的地方

### 8.2 带宽估算

在线 SDR 的上行带宽消耗取决于同时用户数和音频编码：

| 用户数 | 上行带宽需求 |
|--------|-------------|
| 1-2 人 | 0.5 Mbps |
| 5 人 | 1.5 Mbps |
| 10 人 | 3 Mbps |
| 20 人 | 6 Mbps |

大多数家庭宽带上行只有 10-30 Mbps，所以同时支持 10-20 人是比较合理的。KiwiSDR 硬件限制最多 4-8 人，不会超出带宽。

### 8.3 定期维护

- **每月检查一次**：服务器是否在线、天线是否完好、SD 卡是否有损坏
- **关注温度**：树莓派在夏天可能过热，可以加个小散热风扇
- **备份配置**：定期导出 OpenWebRX/KiwiSDR 的配置文件，SD 卡损坏时可以快速恢复
- **关注社区**：OpenWebRX 和 KiwiSDR 都有活跃的社区，有问题可以在 GitHub Issues 或业余无线电论坛提问

---

## 九、成本估算汇总

| 方案 | 硬件成本 | 年费（电费+域名） | 总拥有成本（首年） |
|------|---------|------------------|-------------------|
| **OpenWebRX + Pi4 + RTL-SDR** | ￥550 | ￥50 | **￥600** |
| **OpenWebRX + 旧电脑 + RTL-SDR** | ￥100 | ￥150 | **￥250** |
| **KiwiSDR 全套** | ￥1800 | ￥50 | **￥1850** |
| **WebSDR + 宽带 SDR** | ￥2000+ | ￥200 | **￥2200+** |
| **SpyServer + AirSpy Mini** | ￥1200 | ￥100 | **￥1300** |

> 最省钱的方案：找一台闲置的旧笔记本 + 一个 RTL-SDR（￥100），装 OpenWebRX，总成本不到 200 元。旧笔记本的电池还能当 UPS（Uninterruptible Power Supply，不间断电源），停电了也能撑一会儿。

---

## 十、常见问题

**Q：没有公网 IP 怎么办？**
A：可以用内网穿透服务（如 frp、ngrok、Cloudflare Tunnel），把本地服务暴露到公网。但免费版通常有带宽和连接数限制。也可以考虑用支持 IPv6 的网络。

**Q：RTL-SDR 能收到 FM 广播吗？**
A：可以！FM 广播在 88-108 MHz，RTL-SDR 完全覆盖。但注意 RTL-SDR 的带宽只有 3.2 MHz，不能同时看所有 FM 电台，只能选一个 3.2 MHz 宽的窗口。

**Q：可以同时接多个 SDR 设备吗？**
A：OpenWebRX 支持同时运行多个 SDR，每个覆盖不同频段。比如一个 RTL-SDR 覆盖 HF（需要升频器），另一个覆盖 VHF 航空波段。

**Q：需要业余无线电执照吗？**
A：**只接收不需要执照**。任何公民都可以接收无线电信号。但如果要发射信号（比如用 HackRF 发射），就需要考取业余无线电操作证书并申请呼号。

**Q：SD 卡容易坏吗？**
A：树莓派的 SD 卡在 24 小时运行下确实有一定损坏概率，通常 1-3 年。建议用工业级 SD 卡，或者把系统装在 USB 固态硬盘（SSD）上，更可靠。

---

## 参考资源

- [OpenWebRX+ 官方网站](https://fms.komkon.org/OWRX/) — 下载镜像和安装文档
- [OpenWebRX 原版 GitHub](https://github.com/jketterl/openwebrx) — 源代码和 Wiki
- [KiwiSDR 官方网站](http://kiwisdr.com/) — 购买和快速入门指南
- [KiwiSDR 快速入门 PDF](http://kiwisdr.com/quickstart/quickstart.pdf) — 官方组装说明
- [WebSDR 官方 FAQ](https://websdr.org/faq.html) — 申请 WebSDR 软件的说明
- [AirSpy 下载页](https://airspy.com/download/) — SpyServer 下载
- [ReceiverBook 全球目录](https://www.receiverbook.de) — 注册你的服务器
- [RTL-SDR 博客教程](https://www.rtl-sdr.com/) — 大量 SDR 入门教程
- [Mini-Whip 天线制作教程](https://www.pa0rdt.com/) — PA0RDT 原版 Mini-Whip 设计

---

## 结语

搭建一个在线 SDR 服务器，本质上就是做了四件事：**接收到信号 → 数字化处理 → 通过网络传输出去 → 让别人能搜到你**。

最便宜的方案不到 600 元，一个下午就能搭好。当你看到 `rx.kiwisdr.com` 上出现自己的节点，有来自世界各地的人在使用你的接收器时，那种成就感是无与伦比的——你为全球无线电爱好者社区贡献了一个"耳朵"。

从 RTL-SDR + 树莓派 + OpenWebRX 开始吧，这是最稳妥的第一步。等玩熟了，再考虑升级天线和硬件，甚至搭建多频段的专业节点。

祝你架设顺利，73！（业余无线电祝福用语，意为 "Best Regards"）
