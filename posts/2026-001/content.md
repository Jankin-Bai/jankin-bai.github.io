<!-- Post: 小T卡 GR5526 OTA 升级测试固件 | ID: 2026-001 | Created: 2026-08-31 | Tags: tech, works, milestone | Format: markdown -->

## 开篇

本文携带小T卡 GR5526 的 OTA 升级测试固件，用于验证双区升级流程。固件采用 **Background Dual-Bank（后台双区）** 模式，Bank A 运行当前固件，Bank B 缓存新固件，bootloader 负责校验和切换。

## 固件信息

| 项目 | 值 |
|---|---|
| 版本号 | 0.0.1 |
| 编译日期 | 20260831 |
| 编译时间 | 192419 |
| Git Commit | 9a20115 |
| 完整版本 | 0.0.1_20260831_192419_git9a20115 |
| 固件类型 | release |
| 板卡型号 | TK_PAD |
| Flash 布局 | 双区（Bank A @0x240000, Bank B @0x2C0000） |
| Bootloader | @0x204000（UART DFU + 双区切换） |

## 升级流程

### 第一步：准备固件

将本文携带的 `ble_app_uart_c_ota_v0.0.1_20260831.bin` 上传到 HTTP 服务器，或放置在 Cat1 模组可访问的位置。

### 第二步：触发升级

通过 GR5526 CLI（RTT 或串口）输入升级命令：

```bash
upgrade start http://服务器IP/ble_app_uart_c_ota_v0.0.1_20260831.bin
```

### 第三步：Cat1 下载固件

Cat1 模组收到升级指令后，通过 HTTP 下载固件到本地 Flash（LFS 文件系统），然后通过 UART 发送 `+DFU: DL size=<n>` 通知 GR5526。

### 第四步：GR5526 写入 Bank B

GR5526 进入 DFU 模式，通过 UART 接收 Cat1 转发的固件数据，写入 Bank B（@0x2C0000）。每帧数据校验通过后返回 ACK。

### 第五步：校验与切换

固件写入完成后，bootloader 校验 Bank B 固件的 Image Info（pattern=0x4744, checksum, load_addr），校验通过后复制 Bank B → Bank A，更新 APP Info，复位后运行新固件。

### 第六步：验证版本

升级完成后，通过 CLI 命令验证版本号：

```bash
version
```

预期输出版本号为 `0.0.1_20260831_192419`。

## 固件下载

本文携带以下固件文件（与文章同目录）：

| 文件名 | 大小 | 说明 |
|---|---|---|
| `ble_app_uart_c_ota_v0.0.1_20260831.bin` | 214320 字节 (209.3 KB) | OTA 升级固件（带 Image Info，直接放云端） |
| `version.json` | - | 版本元数据（版本号/编译时间/Git哈希/校验和） |
| `checksums.txt` | - | MD5/SHA256/CRC32 校验和 |

## 校验和

升级前请校验固件完整性：

```
MD5:    96ddbb3bd8a0808afe212c46139ed39e
SHA256: a6effedc0b50012f1265c1058d04e846c5870c4bbb593ef47d304deb2eee255e
CRC32:  5c040d78
```

校验值见同目录 `checksums.txt`。

## Flash 分区布局

```
高地址 ─────────────────────────────────────────
0x003FFFFF ── NVR / 用户数据 (768KB)
0x00340000 ──
0x0033FFFF ── Bank B (OTA 缓存区, 512KB)
0x002C0000 ──
0x002BFFFF ── Bank A (当前运行 App, 512KB)
0x00240000 ──
0x0023FFFF ── Bootloader (240KB)
0x00204000 ──
0x00203FFF ── SCA / APP / DFU Info (16KB)
0x00200000 ── Flash 基址
低地址 ─────────────────────────────────────────
```

## 5 层防升挂校验

本固件生成时经过 5 层校验，防止升级变砖：

| 层级 | 检查内容 |
|---|---|
| Layer 1 | 编译期 `_Static_assert`（地址越界/重叠/不对齐） |
| Layer 2 | Flash 布局一致性（Bank B 地址两端匹配） |
| Layer 3 | 固件完整性（Image Info pattern/load_addr/size/4KB对齐） |
| Layer 4 | 版本号递增（防止降级） |
| Layer 5 | MD5/SHA256/CRC32 校验和 |

## 故障排查

### 升级失败：固件校验错误

- 检查固件是否完整（对比 MD5/SHA256）
- 确认固件带有 Image Info 尾部（pattern=0x4744）
- 确认 load_addr=0x00240000（Bank A 地址）

### 升级失败：Cat1 下载超时

- 检查 HTTP 服务器是否可访问
- 检查 Cat1 模组网络信号（`at+CSQ`）
- 确认固件大小不超过 Cat1 LFS 容量

### 升级后无法启动

- 通过 J-Link RTT 查看 bootloader 日志
- 确认 APP Info 区域已更新
- 必要时通过 `flash_dual_bank.py` 重新烧录 bootloader + App

### 回滚到旧版本

如果升级后固件异常，bootloader 会自动回滚到 Bank A 的旧固件（如果 Bank B 校验失败）。也可以通过 CLI 命令手动触发回滚：

```bash
upgrade rollback
```

## 测试命令清单

```bash
# 查看版本号
version

# 开始升级
upgrade start http://服务器IP/固件.bin

# 查看升级状态
upgrade status

# 取消升级
upgrade cancel

# 回滚到旧版本
upgrade rollback

# 查看 Flash 布局
flash info
```

## 结语

本文固件用于小T卡 GR5526 双区 OTA 升级测试。升级前请务必备份当前固件，并确认校验和匹配。升级过程中请勿断电，否则可能导致 bootloader 损坏。

---

**生成工具**：`build_ota_firmware.py`（5 层校验防升挂）
**生成日期**：2026-08-31
**项目**：小T卡 (XiaoT Card) GR5526 + Cat1 双模开发板
