<!-- Post: TinyML 入门：为什么一毛钱的芯片也能跑人工智能？ | ID: 2026-002 | Created: 2026-09-01 | Tags: books, tech | Format: markdown -->

## 开篇：你手机里藏着一个"永远醒着"的小东西

想象一下：你的手机放在桌上，屏幕黑着，CPU在睡觉。但你轻轻说一句"OK Google"，它立刻就醒了。

它是怎么听到的？难道手机一直在录音吗？

当然不是。在你手机的某个角落，有一块比指甲盖还小的芯片，正在用**几乎可以忽略不计的电量**，持续不断地分析着麦克风传来的声音。它不认识你说的话，它只在等一个特定的声音模式——"OK Google"。一旦听到，它才会叫醒正在睡觉的主CPU。

这块芯片，就是 **DSP（Digital Signal Processor，数字信号处理器）**。而运行在它上面的，是一个只有 **14KB** 的神经网络。

14KB是什么概念？你手机里随便一张自拍都有几MB。14KB连一张表情包都装不下。但就是这么小的一个神经网络，就能听懂"OK Google"这两个词。

这个发现，让本书作者 Pete Warden 震惊了。

> "When I first joined Google in 2014, I discovered a lot of internal projects that I had no idea existed, but the most exciting was the work that the OK Google team were doing. They were running neural networks that were just 14 kilobytes (KB) in size!"
>
> ——第1章 Introduction，第1页

这个14KB的神经网络，就是 TinyML 的起点。

---

## 一、1mW：一个改变世界的魔法数字

要理解 TinyML，你只需要记住一个数字：**1mW（毫瓦）**。

这是本书作者 Pete Warden 和整个行业达成的一个" rough consensus（粗略共识）"：

> "If you can run a neural network model at an energy cost of below 1 mW, it makes a lot of entirely new applications possible."
>
> ——第1章 Introduction，第2页

为什么是1mW？这个数字看起来很随意，但它背后有非常实际的物理意义。

### 用电池续航来理解1mW

我们来做一道简单的算术题。一颗常见的 **CR2032 纽扣电池**（就是电脑主板、汽车钥匙里用的那种），容量大约是 **220mAh（毫安时）**，电压3V。

它总共能提供的能量是：220mAh × 3V = 660mWh（毫瓦时）。

如果你的设备功耗是 **1mW**，那么这颗纽扣电池能让它运行多久？

660mWh ÷ 1mW = **660小时 ≈ 27.5天**。

等等，这不是一年啊？

别着急。实际产品不会让芯片一直满负荷运行。它大部分时间在**休眠**，每隔几毫秒醒过来做一次推理，然后继续睡。这种 **Duty Cycling（占空比工作）** 模式下，平均功耗可以远低于1mW。

所以作者说的"below 1mW"，指的是**推理时的瞬时功耗**。加上休眠时间，平均功耗可能只有几十微瓦（μW），这样一颗纽扣电池用一年完全没问题。

> "This might seem like a somewhat arbitrary number, but if you translate it into concrete terms, it means a device running on a coin battery has a lifetime of a year."
>
> ——第1章 Introduction，第2页

### 为什么"本地计算"比"传到云端"更省电？

你可能会问：为什么不把传感器数据传到手机或云端去算？那样芯片不就不用跑神经网络了吗？

答案很简单：**无线传输数据比本地计算耗电得多**。

想象一下：你有一个温度传感器，每秒测一次温度。如果你每次都通过蓝牙把温度发到手机，蓝牙模块每次发射都要消耗能量。一天下来，蓝牙发射消耗的电量，可能比本地芯片跑一万次推理还多。

作者在书中明确指出了这一点：

> "Making these products real required ways to turn raw sensor data into actionable information locally, on the device itself, since the energy costs of transmitting streams anywhere have proved to be inherently too high to be practical."
>
> ——第1章 Introduction，第2页

翻译过来就是：要让这些产品成为现实，必须在**设备本地**把原始传感器数据变成有用的信息，因为把数据流传输到任何地方的能耗，都高到不切实际。

这就是 TinyML 的核心逻辑：**不是因为芯片变强了所以能跑AI，而是因为传输数据太费电，所以必须在本地算。**

---

## 二、TinyML 不是什么：和树莓派、Jetson 的本质区别

很多人第一次听到"在嵌入式设备上跑机器学习"，第一反应是："哦，就是在树莓派上跑 TensorFlow 对吧？"

不对。完全不对。

作者在第1章专门花了一大段篇幅，解释 TinyML 和树莓派、NVIDIA Jetson 这些平台的本质区别。

### 功耗对比：三个数量级的差距

| 平台 | 典型功耗 | 电池续航 | 能做什么 |
|------|---------|---------|---------|
| **微控制器（TinyML目标）** | **< 1mW（推理时）** | 纽扣电池用一年 | 永远在线的传感器、唤醒词、简单分类 |
| 树莓派 Zero | 数百 mW | 需要手机大小的电池，几天 | 跑完整 Linux、图像处理、简单视频 |
| NVIDIA Jetson | 最高 12W | 需要外接电源或大电池 | 实时视频分析、机器人、自动驾驶 |

作者原文是这样描述的：

> "Even the smallest Pi is similar to a mobile phone's main CPU and so draws hundreds of milliwatts. Keeping one running even for a few days requires a battery similar to a smartphone's... NVIDIA's Jetson is based on a powerful GPU, and we've seen it use up to 12 watts of power when running at full speed."
>
> ——第1章 Introduction，第2页

看到了吗？树莓派的功耗是**数百mW**，Jetson是**12W（12000mW）**，而 TinyML 的目标是**低于1mW**。

这不是"更轻量"的区别，这是**三个数量级**的差距。就像自行车和飞机的区别——它们都能"移动"，但适用场景完全不同。

### 资源约束：不是"缩水版电脑"，是另一种物种

微控制器上的资源有多紧张？作者在第1章"Embedded Devices"一节给出了具体数字：

> "They often have only a few hundred kilobytes of RAM, or sometimes much less than that, and have similar amounts of flash memory for persistent program and data storage. A clock speed of just tens of megahertz is not unusual."
>
> ——第1章 Introduction，第3页

翻译一下：
- **RAM（内存）**：只有几百KB，甚至更少。你的电脑有16GB，是它的几万倍。
- **Flash（闪存）**：和RAM差不多，几百KB。用来存程序和模型。
- **时钟频率**：几十MHz。你的电脑CPU是几GHz，是它的上百倍。

而且，它们**没有完整的 Linux 系统**，因为 Linux 至少需要1MB RAM和内存控制器。它们甚至可能**没有标准C库**，没有 `malloc()` 动态内存分配（因为内存碎片会导致系统不稳定），没有你熟悉的调试器。

> "Many embedded systems avoid using dynamic memory allocation functions like new or malloc() because they're designed to be reliable and long-running, and it's extremely difficult to ensure that if you have a heap that can be fragmented."
>
> ——第1章 Introduction，第3页

这就是为什么 TinyML 不是"把 TensorFlow 缩小一下放到单片机上"。你需要一个**全新的推理框架**，从零开始设计，专门为这种极端资源约束的环境而优化。这个框架就是 **TensorFlow Lite for Microcontrollers（TFLM）**，也是本书的核心工具。

---

## 三、一毛钱的野心："贴上去就忘"的传感器

除了功耗，TinyML 还有一个杀手锏：**便宜**。

作者在第1章做了一个成本对比：

> "The cheapest Raspberry Pi Zero is $5 for makers, but it is extremely difficult to buy that class of chip in large numbers at that price... By contrast, the cheapest 32-bit microcontrollers cost much less than a dollar each."
>
> ——第1章 Introduction，第3页

树莓派 Zero 看起来只要5美元，但那是给爱好者的零售价，大批量采购根本拿不到这个价。而32位微控制器，大批量采购**不到一美元一颗**，换算成人民币就是**几毛钱**。

几毛钱一颗的芯片，能跑人工智能，能用纽扣电池用一年。这意味着什么？

作者提出了一个非常有想象力的概念：**"Peel-and-stick sensors"（撕一贴传感器）**。

> "One term I heard repeatedly was 'peel-and-stick sensors,' for devices that required no battery changes and could be applied anywhere in an environment and forgotten."
>
> ——第1章 Introduction，第2页

想象一下：
- 你在工厂的每台机器上贴一个几毛钱的传感器，它能通过振动和声音预测机器什么时候会坏，不需要布线、不需要换电池，贴上去就忘。
- 你在农田里撒一堆传感器，它们能监测土壤湿度和病虫害，用能量收集（energy harvesting）从阳光或振动中获取电力，永远不用管。
- 你在家里的每个角落贴一个，它们能听懂异常声音（玻璃破碎、老人摔倒），但永远不会把录音传到云端，因为所有计算都在本地完成。

这就是 TinyML 的野心：**让人工智能变得像贴纸一样便宜、方便、无处不在**。

---

## 四、这本书能让你学会什么

现在你可能会问：这本书475页，我读完能得到什么？

作者在第2章"What Do We Hope You'll Learn?"一节给出了明确的答案。

### 四个完整项目，从简单到复杂

本书不是一本纯理论的书，它是**项目驱动**的。全书有四个完整的实战项目，难度递进：

| 项目 | 章节 | 输入 | 输出 | 难度 |
|------|------|------|------|------|
| **Hello World** | 第4-6章 | 手动输入数字 | 预测正弦波值 | ★☆☆☆☆ |
| **唤醒词检测** | 第7-8章 | 麦克风音频 | 识别"yes"/"no" | ★★★☆☆ |
| **人体检测** | 第9-10章 | 摄像头图像 | 判断画面中有没有人 | ★★★★☆ |
| **魔法棒手势** | 第11-12章 | 加速度计数据 | 识别手势（画圈/挥/斜划） | ★★★☆☆ |

每个项目都遵循同样的流程：**训练模型 → 构建应用 → 部署到开发板**。你会跟着书一步步把代码跑起来，然后理解每一部分在做什么。

### 三种开发板，覆盖主流平台

书中的项目支持三种开发板：

- **Arduino Nano 33 BLE Sense**（推荐初学者）
- **SparkFun Edge**（Ambiq Apollo3，超低功耗）
- **STM32F746G Discovery Kit**（ARM Cortex-M7，性能强）

所有软件免费，开发板不到30美元。

> "All the software is free, and the hardware development kits are available for less than $30, so the biggest challenge is likely to be the unfamiliarity of the development environment."
>
> ——第2章 Getting Started，第5页

### 你将获得的核心能力

作者希望你读完这本书后能够：

1. **了解当前嵌入式机器学习能做什么、不能做什么**，以及未来几年的发展趋势
2. **能够构建和修改实际项目**，处理时序数据（音频、加速度计）和低功耗视觉
3. **理解整个系统**，能够参与新产品的设计讨论，甚至自己做出原型
4. **掌握全系统视角**——不是只看芯片功耗，而是看传感器、处理器、无线通信整体的功耗预算

关于最后一点，作者举了一个非常好的例子：

> "For example, if you have a microcontroller that consumes only 1 mW, but the only camera sensor it works with takes 10 mW to operate, any vision-based product you use it on won't be able to take advantage of the processor's low energy consumption."
>
> ——第2章 Getting Started，第8页

翻译：如果你的微控制器只耗1mW，但它能用的摄像头传感器要耗10mW，那么任何基于视觉的产品都无法享受到处理器低功耗的好处。

这就是**全系统思维**——只看一个组件的参数没有意义，你要看整个产品的功耗预算。这种思维方式，比任何具体技术都更有价值。

---

## 五、常见误区与避坑指南

在开始深入学习之前，先澄清几个最常见的误解：

### 误区1："TinyML 就是在单片机上跑 TensorFlow"

**不对。** TensorFlow 本身需要 Linux、GB级内存、动态内存分配，根本不可能在单片机上运行。TinyML 用的是 **TensorFlow Lite for Microcontrollers（TFLM）**——一个从零开始重写的推理框架，专门为几百KB内存的环境设计。它只支持推理（inference），不支持训练。

### 误区2："模型越小精度越低，所以没什么用"

**不一定。** TinyML 的目标不是跑 GPT-4 这种大模型，而是解决**特定的、简单的分类问题**。对于"有没有人""这是什么手势""有没有说唤醒词"这类问题，一个几十KB的小模型就能达到90%以上的精度。关键是**选对问题**，而不是追求大模型。

### 误区3："这本书是2019年的，现在已经过时了"

**部分正确，但核心价值仍在。** 作者自己在第1章就承认：

> "This book is a based on a snapshot of the world as it existed in 2019, which in this area means some parts were out of date before we'd even finished writing the last chapter."
>
> ——第1章 Introduction，第4页

TFLM 的 API 确实有变化，新的硬件（如 RP2040、ESP32-S3、Cortex-M55 + Ethos-U NPU）也层出不穷。但本书教你的**核心技能**——调试方法、模型创建流程、对深度学习工作原理的理解——这些不会过时。作者明确说：

> "We also aim to focus on skills like debugging, model creation, and developing an understanding of how deep learning works, which will remain useful even as the infrastructure you're using changes."
>
> ——第1章 Introduction，第4页

---

## 小结：从"14KB的震惊"开始

让我们回到开头的那个故事。

2014年，Pete Warden 在 Google 发现了一个只有14KB的神经网络，它能在手机的 DSP 上持续监听"OK Google"，功耗只有几毫瓦。这个发现让他意识到：**人工智能不一定需要庞大的数据中心和昂贵的GPU，它可以小到装进一颗纽扣电池供电的芯片里，便宜到可以像贴纸一样到处贴。**

这就是 TinyML。

它不是"缩水版的AI"，而是一种**全新的计算范式**——在极端资源约束下，用本地计算代替数据传输，用几毛钱的成本解决具体的感知问题。

这本书会带你从一个最简单的正弦波预测开始，一步步走到语音唤醒、视觉检测、手势识别。你会学到的不只是怎么调用 API，而是**如何在一个连 malloc 都没有的环境里，让神经网络跑起来**。

下一篇，我们将进入洋葱阅读法的第二层：**快速阅读**——用一张完整的知识地图，带你看清这475页书的全貌，知道哪些章节必须精读，哪些可以跳过。

---

**延伸阅读**：
- 本书配套代码：https://tinymlbook.com/supplemental
- TensorFlow Lite for Microcontrollers：https://www.tensorflow.org/lite/microcontrollers
- TinyML Foundation：https://www.tinyml.org/

*本文是《TinyML 洋葱阅读系列》第1篇，基于 Pete Warden & Daniel Situnayake《TinyML: Machine Learning with TensorFlow Lite on Arduino and Ultra-Low-Power Microcontrollers》（O'Reilly, 2019, ISBN 9781492052043）第1-2章内容创作。所有原文引用均标注章节和页码。*
