<!-- Post: 【AC电路分析系列】AC功率不只是P=UI：功率三角形、三相电和功率因数校正 | ID: 2026-019 | Created: 2026-09-01 | Tags: tech, books | Format: markdown -->

## 开篇：为什么家里的电费单上有"有功功率"和"无功功率"？

如果你看过工业用电的电费单，你会发现上面不只有"用电量"（有功电能），还有"无功电能"和"功率因数"这两项。功率因数太低的话，还要交"力调电费"（罚款）。

你可能会疑惑：无功功率是什么？它不消耗能量，为什么要管它？功率因数又是什么？为什么电力公司这么在意它？

这篇文章我们就把AC功率的概念彻底讲透：有功功率、无功功率、视在功率、功率三角形、功率因数、功率因数校正(PFC)，还有工业上为什么用三相电。学完这篇，你就能看懂电费单，也能理解开关电源里PFC电路是干什么的。

> 作者说："One of the tools we shall use is the power triangle. This is a simple trigonometric device designed to illustrate the power relations between resistive and reactive components in a complex impedance. One of its parameters is the power factor, PF. As we shall see, ordinarily we like the power factor to be unity as this implies best use of the source."（第7章，约第261页）

---

## 一、AC功率的三种形态

### 1.1 为什么AC功率不是简单的P=VI

在DC电路里，功率就是$P = V \times I$，简单直接。但在AC电路里，电压和电流都在随时间变化，而且可能不同相位。这时候瞬时功率$p(t) = v(t) \times i(t)$也是随时间变化的，一会儿正、一会儿负。

我们关心的是**平均功率**（一个周期内的平均），而不是瞬时功率。平均功率的公式是：

$$P = V_{RMS} \times I_{RMS} \times \cos(\theta)$$

其中$\theta$是电压和电流之间的相位差，$\cos(\theta)$就是**功率因数**（Power Factor，PF）。

### 1.2 三种功率的定义

| 功率类型 | 符号 | 公式 | 单位 | 一句话解释 |
|---|---|---|---|---|
| 有功功率（Real Power） | $P$ | $P = VI\cos\theta$ | 瓦特（W） | 真正消耗掉的功率，变成热量/机械能/光能 |
| 无功功率（Reactive Power） | $Q$ | $Q = VI\sin\theta$ | 乏（VAR） | 在电源和负载之间来回交换的功率，不消耗能量 |
| 视在功率（Apparent Power） | $S$ | $S = VI$ | 伏安（VA） | 电压有效值×电流有效值，"看起来"的功率 |

三者的关系：

$$S^2 = P^2 + Q^2, \quad S = \sqrt{P^2 + Q^2}$$

> 作者说："we refer to the 'power' in reactive components as reactive power. Reactive power uses the symbol Q. Further, the units are not watts, but volt-amps reactive, or more commonly, VAR. Continuing, for a complex impedance we refer to apparent power... Apparent power because it appears to be the power if you naively multiply the value of voltage and current."（第7章，约第265页）

### 1.3 生活类比

想象你在餐厅吃饭：
- **有功功率P**：你真正吃进去消化掉的食物（变成能量和营养）
- **无功功率Q**：你在盘子里拨来拨去、闻一闻又放下的食物（没吃进去，但占了盘子空间和你的时间）
- **视在功率S**：盘子里总共的食物量（吃进去的+拨来拨去的）
- **功率因数PF**：消化率 = 吃进去的 / 盘子里总共的 = P/S

电力公司就像餐厅，它给你供电（端盘子），但只按你真正吃进去的（有功功率）收费。可是如果你拨来拨去的食物（无功功率）太多，盘子就需要更大（导线需要更粗），餐厅的成本就高了。所以电力公司要求功率因数不能太低，否则就罚款。

### 1.4 三种极端情况

| 负载类型 | 相位差θ | 功率因数PF | 有功P | 无功Q | 视在S |
|---|---|---|---|---|---|
| 纯电阻 | 0° | 1.0（完美） | S | 0 | P |
| 纯电容 | -90° | 0 | 0 | -S（容性） | \|Q\| |
| 纯电感 | +90° | 0 | 0 | +S（感性） | \|Q\| |
| 实际负载（感性） | 0°~90° | 0~1 | S×cosθ | S×sinθ | √(P²+Q²) |

**对硬件开发者的意义**：你设计的开关电源，如果没有PFC电路，输入电流是脉冲状的（不是正弦波），功率因数可能只有0.5-0.6。这意味着电源从电网取的视在功率是有功功率的2倍，导线和保险丝都要按2倍来选。大功率电源（>75W）通常要求PFC，把功率因数提高到0.9以上。

---

## 二、功率三角形和功率因数

### 2.1 功率三角形

有功功率P、无功功率Q、视在功率S构成一个直角三角形——**功率三角形**：

- 水平边（邻边）：有功功率P
- 垂直边（对边）：无功功率Q（感性向上，容性向下）
- 斜边：视在功率S
- P和S的夹角：功率因数角θ

$$\cos\theta = \frac{P}{S} = PF, \quad \sin\theta = \frac{Q}{S}, \quad \tan\theta = \frac{Q}{P}$$

### 2.2 功率因数的意义

功率因数$PF = \cos\theta = P/S$，衡量的是"有功功率占视在功率的比例"。

- PF=1.0：完美，所有功率都是有功功率，没有无功
- PF=0.8：80%是有功功率，20%是无功功率（感性或容性）
- PF=0：全是无功功率，没有有功（纯电容或纯电感）

**为什么功率因数重要**：
1. **电力公司的角度**：PF低意味着同样的有功功率需要更大的电流，导线、变压器、发电机都要更大，成本更高
2. **用户的角度**：PF低会被电力公司罚款（力调电费），而且线路损耗更大（$P_{loss} = I^2R$，电流大损耗大）
3. **设备设计的角度**：PF低意味着同样输出功率需要更大的输入电流，保险丝、整流桥、EMI滤波器都要选更大的规格

### 2.3 完整实例：计算功率和功率因数

**题目**：一个负载接在120V（RMS）、60Hz的交流电源上，测得电流为2.252A（RMS），电流滞后电压30度。求有功功率、无功功率、视在功率和功率因数。

**解**：

视在功率：

$$S = V \times I = 120 \times 2.252 = 270.2 \text{ VA}$$

有功功率：

$$P = S \times \cos(30^\circ) = 270.2 \times 0.866 = 234.0 \text{ W}$$

无功功率：

$$Q = S \times \sin(30^\circ) = 270.2 \times 0.5 = 135.1 \text{ VAR（感性）}$$

功率因数：

$$PF = \cos(30^\circ) = 0.866 \text{（滞后，因为电流滞后电压）}$$

验证：$S = \sqrt{P^2 + Q^2} = \sqrt{234^2 + 135.1^2} = \sqrt{54756 + 18252} = \sqrt{73008} = 270.2$ VA ✓

**结果**：有功234W，无功135VAR（感性），视在270VA，功率因数0.866滞后。

> 这个例子和书中的例题类似。作者说："The apparent power is the product of the magnitudes of circuit voltage and current. S = 120 V × 2.252 A"（第7章，约第270页，Figure 7.17附近）

---

## 三、功率因数校正（PFC）

### 3.1 什么是功率因数校正

功率因数校正（Power Factor Correction，PFC）就是通过添加额外的元件，把负载的功率因数提高到接近1.0。

最常见的情况是：负载是感性的（如电机、变压器、电感镇流器），电流滞后电压。我们可以**并联一个电容**，电容的容性无功抵消负载的感性无功，让总无功接近0，功率因数接近1。

### 3.2 并联电容校正的计算

目标：把功率因数从$PF_1 = \cos\theta_1$提高到$PF_2 = \cos\theta_2$。

需要并联的电容值：

$$C = \frac{P}{\omega V^2} (\tan\theta_1 - \tan\theta_2)$$

其中P是有功功率，$\omega = 2\pi f$是角频率，V是电压有效值。

### 3.3 完整实例：PFC电容计算

**题目**：一个感性负载，有功功率500W，接在220V、50Hz电源上，功率因数0.6滞后。要把功率因数提高到0.95滞后，需要并联多大的电容？

**解**：

第一步：算原来的功率因数角

$$\theta_1 = \arccos(0.6) = 53.13^\circ, \quad \tan\theta_1 = \tan(53.13^\circ) = 1.333$$

第二步：算目标的功率因数角

$$\theta_2 = \arccos(0.95) = 18.19^\circ, \quad \tan\theta_2 = \tan(18.19^\circ) = 0.329$$

第三步：算需要的电容

$$C = \frac{P}{\omega V^2} (\tan\theta_1 - \tan\theta_2) = \frac{500}{2\pi \times 50 \times 220^2} (1.333 - 0.329)$$

$$= \frac{500}{314.16 \times 48400} \times 1.004 = \frac{500}{15205344} \times 1.004 = 3.29\times10^{-5} \times 1.004 = 33.0 \mu F$$

**结果**：需要并联约33μF的电容。

**验证**：并联电容后，电容提供的容性无功$Q_C = \omega C V^2 = 314.16 \times 33\times10^{-6} \times 220^2 = 502$ VAR。原来的感性无功$Q_1 = P \times \tan\theta_1 = 500 \times 1.333 = 667$ VAR。校正后总无功$Q_2 = 667 - 502 = 165$ VAR。新的功率因数角$\theta_2 = \arctan(Q_2/P) = \arctan(165/500) = 18.3^\circ$，$PF = \cos(18.3^\circ) = 0.95$ ✓

### 3.4 开关电源中的主动PFC

上面讲的是被动PFC（并联电容），适用于线性负载（电机、变压器）。但开关电源的输入电流是脉冲状的（不是正弦波），被动PFC效果不好，需要用**主动PFC**（Active PFC）。

主动PFC是一个DC-DC变换电路（通常是Boost升压电路），放在整流桥和主电容之间，它控制输入电流跟随输入电压的波形，让输入电流近似正弦波且和电压同相位，从而把功率因数提高到0.95以上。

> 作者说："we shall investigate a simple means of compensating or shifting the power factor back to unity. This is known as power factor correction."（第7章，约第261页）

---

## 四、三相电系统

### 4.1 为什么用三相电

> 作者说："Polyphase systems can be visualized as a group of individual sources of the same magnitude that are separated by a certain phase angle such that they are evenly divided across a single period... By dividing the sources, the application of power can be much more smooth. Further, for the same total load power, the current delivered by each phase is reduced."（第338页，9.1 Introduction）

三相电的优势：
1. **功率更平稳**：单相电的瞬时功率一会儿大一会儿小（频率是电源的2倍），三相电的瞬时功率是恒定的（三个相的功率波动互相抵消）
2. **传输效率更高**：同样的总功率，三相电每根导线的电流更小，导线可以更细，节省材料
3. **电机性能更好**：三相异步电机结构简单、启动方便、运行平稳，是工业上最常用的电机
4. **可以得到两种电压**：三相四线制可以同时提供相电压（220V）和线电压（380V），照明用220V，动力用380V

### 4.2 三相电的基本概念

三相电有三个电压源，幅值相同，频率相同，相位互差120度：

$$v_a(t) = V_p \sin(\omega t)$$
$$v_b(t) = V_p \sin(\omega t - 120^\circ)$$
$$v_c(t) = V_p \sin(\omega t - 240^\circ) = V_p \sin(\omega t + 120^\circ)$$

### 4.3 两种连接方式：Y（星形）和Δ（三角形）

| 连接方式 | Y（星形/Wye） | Δ（三角形/Delta） |
|---|---|---|
| 结构 | 三个源的一端连在一起（中性点），另一端输出 | 三个源首尾相连成三角形，三个连接点输出 |
| 线电压 vs 相电压 | $V_{line} = \sqrt{3} \times V_{phase}$ | $V_{line} = V_{phase}$ |
| 线电流 vs 相电流 | $I_{line} = I_{phase}$ | $I_{line} = \sqrt{3} \times I_{phase}$ |
| 优点 | 可以得到两种电压（相电压和线电压），有中性线 | 没有中性线，适合大功率平衡负载 |
| 典型应用 | 三相四线制配电（220V/380V） | 三相电机、大功率变压器 |

**生活类比**：
- Y连接就像三个人手拉手围成一圈，手拉的地方是中性点，三个人的脚是三个输出端
- Δ连接就像三个人头脚相连围成三角形，三个连接点是输出端

### 4.4 三相功率计算

三相平衡负载的总功率：

$$P_{total} = \sqrt{3} \times V_{line} \times I_{line} \times PF$$

其中$V_{line}$是线电压，$I_{line}$是线电流，PF是功率因数。

**例子**：一个三相电机，线电压380V，线电流10A，功率因数0.85，总功率是多少？

$$P = \sqrt{3} \times 380 \times 10 \times 0.85 = 1.732 \times 380 \times 10 \times 0.85 = 5594 \text{ W} \approx 5.6 \text{ kW}$$

---

## 五、常见误区和坑

| 误区 | 正确理解 |
|---|---|
| AC功率就是P=VI | 必须乘功率因数：P=VI×cosθ，而且要用RMS值 |
| 无功功率消耗能量 | 无功功率不消耗能量，只是在电源和负载之间来回交换，但会增加线路电流和损耗 |
| 功率因数越高越好 | 对电网来说PF接近1最好，但过补偿（容性无功>感性无功）也不好，会导致电压升高 |
| PFC就是并联一个电容 | 被动PFC是并联电容（适用于线性负载），开关电源需要主动PFC（Boost电路） |
| 三相电的线电压=相电压 | Y连接时线电压=√3×相电压，Δ连接时才相等 |
| 三相功率=3×单相功率 | 只对平衡负载成立，不平衡负载要分别算每相再加起来 |
| 功率因数滞后/超前搞反 | 电流滞后电压=感性负载（电机、变压器），电流超前电压=容性负载（电容、过补偿） |

---

## 小结

这篇文章我们深入拆解了AC功率和电力系统的核心概念：

1. **三种功率**：有功功率P（真正消耗，单位W）、无功功率Q（来回交换，单位VAR）、视在功率S（电压×电流，单位VA）。关系：$S = \sqrt{P^2+Q^2}$。
2. **功率三角形和功率因数**：P、Q、S构成直角三角形，功率因数$PF = \cos\theta = P/S$。PF=1是完美，PF低会被电力公司罚款。
3. **功率因数校正(PFC)**：感性负载并联电容抵消感性无功，把PF提高到接近1。开关电源用主动PFC（Boost电路）让输入电流跟随电压波形。
4. **三相电**：三个相位互差120度的电源，功率更平稳、传输效率更高、电机性能更好。Y连接（线电压=√3×相电压）和Δ连接（线电压=相电压）两种方式。三相总功率$P = \sqrt{3} V_{line} I_{line} PF$。

这些概念是电源设计、电力应用、电机控制的基础。做硬件的人要理解PFC，做电力的人要理解三相电，做嵌入式的人要理解功率和效率的关系。

下一篇（第8篇），我们进入主题5的深度拆解：谐振——无线电选频、滤波器和振荡器背后的核心原理。我们会讲串联谐振和并联谐振的特性、品质因数Q、带宽、谐振选频电路的设计，还有实际电感的非理想性对谐振电路的影响。

---

## 系列导航

**【AC电路分析系列】共11篇，基于 James M. Fiore《AC Electrical Circuit Analysis: A Practical Approach》(Version 1.1.13, 2025)**

| 序号 | 文章 | 状态 |
|---|---|---|
| 第1篇 | 交流电到底是什么？——从DC到AC的思维跃迁 | ✅ 已发布 |
| 第2篇 | 一图读懂AC电路分析：10章学习路径图 | ✅ 已发布 |
| 第3篇 | AC电路分析的6大核心主题：从数学到实践的学习路线 | ✅ 已发布 |
| 第4篇 | 交流电的数学语言：正弦波、复数和相量到底怎么用？ | ✅ 已发布 |
| 第5篇 | RLC电路三板斧：串联、并联、串并联怎么分析？ | ✅ 已发布 |
| 第6篇 | 复杂电路怎么解？叠加定理、戴维南、节点分析的实战用法 | ✅ 已发布 |
| 第7篇 | AC功率不只是P=UI：功率三角形、三相电和功率因数校正 | ✅ 本篇 |
| 第8篇 | 谐振：无线电选频、滤波器和振荡器背后的核心原理 | ⏳ 即将发布 |
| 第9篇 | 电路的频率性格：分贝、伯德图和滤波器设计入门 | ⏳ 即将发布 |
| 第10篇 | AC电路分析在硬件/嵌入式/无线电生态中的位置：横向对比 | ⏳ 即将发布 |
| 第11篇 | 读完AC电路分析之后：独立思考、实践路线图和进一步学习 | ⏳ 即将发布 |

> 本书为开源教育资源（Creative Commons BY-NC-SA），可免费下载：[www.mvcc.edu/jfiore](https://www.mvcc.edu/jfiore) 或 [www.dissidents.com](https://www.dissidents.com)
> 作者YouTube频道：Electronics with Professor Fiore
