<!-- Post: 【AC电路分析系列】RLC电路三板斧：串联、并联、串并联怎么分析？ | ID: 2026-017 | Created: 2026-09-01 | Tags: tech, books | Format: markdown -->

## 开篇：为什么一个电阻加一个电容就能滤掉高频？

你可能在很多电路里见过这个组合：一个电阻和一个电容串联，输出从电容两端取。这就是最简单的RC低通滤波器——低频信号能过去，高频信号被挡住。

但你有没有想过：**为什么是这样？** 电阻对所有频率的阻碍都一样，电容对高频的阻碍小（容抗小），那高频信号不是应该更容易通过电容吗？怎么反而被滤掉了？

答案就在串联电路的分析里。这篇文章我们就把RLC电路的三种基本结构——串联、并联、串并联——彻底讲透。学完这篇，你不仅能理解RC滤波器的原理，还能分析任何RLC组合电路的电压、电流和相位关系。

> 作者在第2章引言里说："There is much here that will be familiar from your prior studies with DC series circuits, however, there will be a few notable changes and perhaps a surprise or two lurking. The key to most of this is to remember that all computations involve vector quantities."（第44页，2.1 Introduction）
>
> 翻译：很多内容和你学过的DC串联电路很像，但有一些明显的变化，甚至可能有一两个惊喜。关键是记住：所有计算都涉及矢量（不是标量）。

---

## 一、串联RLC电路——阻抗相加，电流相同

### 1.1 基本分析方法

串联电路的特点是：**所有元件流过同一个电流**。这和DC串联电路完全一样。

分析串联RLC电路的步骤：

1. **计算每个元件的阻抗**（在给定频率下）
   - 电阻：$Z_R = R$
   - 电容：$Z_C = -jX_C = -j\frac{1}{\omega C}$
   - 电感：$Z_L = jX_L = j\omega L$

2. **总阻抗 = 各阻抗之和**（复数加法）

$$Z_{total} = Z_R + Z_L + Z_C = R + j(X_L - X_C)$$

3. **用欧姆定律算总电流**

$$I = \frac{V_{source}}{Z_{total}}$$

4. **用电压分压算各元件电压**

$$V_R = I \times Z_R, \quad V_L = I \times Z_L, \quad V_C = I \times Z_C$$

5. **验证KVL**：$V_R + V_L + V_C = V_{source}$（复数加法，不是简单的数值相加！）

> 作者说："Perhaps the first practical issue we face is determining the effective impedance of an RLC series network... the impedance in rectangular form is the sum of the individual impedances."（第46页，2.3 Series Impedance）

### 1.2 生活类比

串联RLC电路就像三个人排队推一个箱子：
- **电阻**是一个一直使劲推的人，推力和箱子速度成正比（欧姆定律）
- **电感**是一个"慢半拍"的人，箱子刚开始动的时候他使劲推，箱子速度稳定了他就不推了（感抗随频率变化）
- **电容**是一个"快半拍"的人，箱子刚开始动的时候他不推，箱子速度稳定了他使劲推（容抗随频率变化）

三个人的推力（电压）加起来等于总推力（电源电压），但三个人的推力方向可能不一样（相位不同），所以总推力不是简单的数值相加，而是矢量相加。

### 1.3 完整实例：串联RC电路

**题目**：一个1kΩ电阻和一个0.1μF电容串联，接在10V（RMS）、1kHz的交流电源上。求总阻抗、总电流、电阻电压、电容电压，并验证KVL。

**解**：

第一步：计算角频率和容抗

$$\omega = 2\pi f = 2\pi \times 1000 = 6283 \text{ rad/s}$$

$$X_C = \frac{1}{\omega C} = \frac{1}{6283 \times 0.1\times10^{-6}} = 1592 \Omega$$

第二步：各元件阻抗

$$Z_R = 1000 + j0 = 1000\Omega$$

$$Z_C = 0 - j1592 = -j1592\Omega$$

第三步：总阻抗

$$Z_{total} = Z_R + Z_C = 1000 - j1592 \Omega$$

转换成极坐标形式：

$$|Z_{total}| = \sqrt{1000^2 + 1592^2} = \sqrt{1000000 + 2534464} = \sqrt{3534464} = 1880 \Omega$$

$$\theta_Z = \arctan\left(\frac{-1592}{1000}\right) = -57.9^\circ$$

所以 $Z_{total} = 1880\angle -57.9^\circ \Omega$

第四步：总电流

$$I = \frac{V_{source}}{Z_{total}} = \frac{10\angle 0^\circ}{1880\angle -57.9^\circ} = 0.00532\angle 57.9^\circ \text{ A} = 5.32\angle 57.9^\circ \text{ mA}$$

注意：电流的相位是+57.9度，超前于电源电压（0度）。这是因为电路呈容性（电容占主导），电流超前电压。

第五步：各元件电压

$$V_R = I \times Z_R = 5.32\angle 57.9^\circ \text{ mA} \times 1000\Omega = 5.32\angle 57.9^\circ \text{ V}$$

$$V_C = I \times Z_C = 5.32\angle 57.9^\circ \text{ mA} \times 1592\angle -90^\circ \Omega = 8.47\angle -32.1^\circ \text{ V}$$

第六步：验证KVL（复数加法）

把$V_R$和$V_C$转成直角坐标：

$$V_R = 5.32\cos(57.9^\circ) + j5.32\sin(57.9^\circ) = 2.82 + j4.51 \text{ V}$$

$$V_C = 8.47\cos(-32.1^\circ) + j8.47\sin(-32.1^\circ) = 7.17 - j4.50 \text{ V}$$

相加：

$$V_R + V_C = (2.82+7.17) + j(4.51-4.50) = 9.99 + j0.01 \approx 10\angle 0^\circ \text{ V}$$

和电源电压一致，验证通过！

**关键洞察**：$V_R$的幅值是5.32V，$V_C$的幅值是8.47V，加起来是13.79V，比电源电压10V还大！这就是AC电路的"惊喜"——因为两个电压相位不同，矢量相加后反而可能比单个电压小。这在DC电路里是不可能的。

### 1.4 实际电感器的非理想性

> 作者在第2章2.5节专门讲了实际电感器的非理想性："Real inductors are not ideal. They include a certain amount of winding resistance, and at high frequencies, inter-winding capacitance can become significant."（约第65页）

一个实际的电感器不是理想的$jX_L$，而是：
- **串联电阻**（$R_s$）：导线的电阻，低频时明显
- **并联电容**（$C_p$）：线圈匝间的寄生电容，高频时明显
- **磁芯损耗**：磁芯材料的涡流和磁滞损耗，等效为并联电阻

所以实际电感的等效电路是：$R_s$串联$L$，再并联$C_p$和损耗电阻。在分析实际电路时，必须考虑这些非理想因素，特别是在高频（>100kHz）时。

**对无线电爱好者的意义**：你做的LC谐振电路，Q值上不去，很可能就是因为电感的串联电阻太大。选电感时要注意看datasheet里的DCR（直流电阻）和Q值曲线。

---

## 二、并联RLC电路——导纳相加，电压相同

### 2.1 为什么并联要用导纳

并联电路的特点是：**所有元件两端的电压相同**。这和DC并联电路一样。

但并联电路用阻抗来算比较麻烦——因为并联阻抗的公式是$\frac{1}{Z_{total}} = \frac{1}{Z_1} + \frac{1}{Z_2} + ...$，涉及复数的倒数运算。

所以分析并联电路时，我们引入一个新概念：**导纳**（Admittance，$Y$），它是阻抗的倒数：

$$Y = \frac{1}{Z}$$

导纳的单位是西门子（S），以前叫姆欧（℧，就是把Ω倒过来写）。

导纳也分成两部分：
- **电导**（Conductance，$G$）：实部，对应电阻的倒数，$G = 1/R$
- **电纳**（Susceptance，$B$）：虚部，对应电抗的倒数

$$Y = G + jB$$

各元件的导纳：
- 电阻：$Y_R = \frac{1}{R} = G$（纯电导）
- 电容：$Y_C = j\omega C = jB_C$（容性电纳，正虚部）
- 电感：$Y_L = \frac{1}{j\omega L} = -j\frac{1}{\omega L} = -jB_L$（感性电纳，负虚部）

> 注意符号：在阻抗里，电容是$-jX_C$（负虚部），电感是$+jX_L$（正虚部）；在导纳里反过来，电容是$+jB_C$（正虚部），电感是$-jB_L$（负虚部）。这是因为取倒数时$j$变成了$-j$。

### 2.2 并联电路分析步骤

1. **计算每个元件的导纳**（在给定频率下）
2. **总导纳 = 各导纳之和**（复数加法，比并联阻抗公式简单多了）

$$Y_{total} = Y_R + Y_L + Y_C = G + j(B_C - B_L)$$

3. **总阻抗 = 总导纳的倒数**

$$Z_{total} = \frac{1}{Y_{total}}$$

4. **用欧姆定律算总电流**

$$I_{total} = V_{source} \times Y_{total} = \frac{V_{source}}{Z_{total}}$$

5. **用电流分流算各元件电流**

$$I_R = V \times Y_R, \quad I_L = V \times Y_L, \quad I_C = V \times Y_C$$

6. **验证KCL**：$I_R + I_L + I_C = I_{total}$（复数加法）

### 2.3 生活类比

并联RLC电路就像三条水管并联：
- **电阻**是一个一直流水的水管，流量和水压成正比（欧姆定律）
- **电容**是一个"存水"的水管，水压变化快的时候流量大，水压稳定的时候流量为0（容性电纳随频率变化）
- **电感**是一个"惯性"水管，水压变化快的时候流量小，水压稳定的时候流量大（感性电纳随频率变化）

三条水管的总流量（总电流）是各条流量（各元件电流）之和，但各条流量的"相位"可能不同（电容电流超前电压，电感电流滞后电压），所以总流量不是简单的数值相加，而是矢量相加。

### 2.4 完整实例：并联RLC电路

**题目**：一个1kΩ电阻、一个10mH电感、一个0.1μF电容并联，接在10V（RMS）、1kHz的交流电源上。求总导纳、总阻抗、总电流、各元件电流，并验证KCL。

**解**：

第一步：计算角频率和各元件的导纳

$$\omega = 2\pi \times 1000 = 6283 \text{ rad/s}$$

$$Y_R = \frac{1}{1000} = 0.001 \text{ S} = 1 \text{ mS}$$

$$Y_L = \frac{1}{j\omega L} = \frac{1}{j \times 6283 \times 0.01} = \frac{1}{j62.83} = -j0.0159 \text{ S} = -j15.9 \text{ mS}$$

$$Y_C = j\omega C = j \times 6283 \times 0.1\times10^{-6} = j0.000628 \text{ S} = j0.628 \text{ mS}$$

第二步：总导纳

$$Y_{total} = Y_R + Y_L + Y_C = 1 + j(0.628 - 15.9) = 1 - j15.27 \text{ mS}$$

转换成极坐标：

$$|Y_{total}| = \sqrt{1^2 + 15.27^2} = 15.30 \text{ mS}$$

$$\theta_Y = \arctan\left(\frac{-15.27}{1}\right) = -86.3^\circ$$

所以 $Y_{total} = 15.30\angle -86.3^\circ \text{ mS}$

第三步：总阻抗

$$Z_{total} = \frac{1}{Y_{total}} = \frac{1}{15.30\angle -86.3^\circ \text{ mS}} = 65.4\angle 86.3^\circ \Omega$$

注意：总阻抗的相位是+86.3度，呈感性（因为在1kHz下，电感的电纳比电容的电纳大，电路整体呈感性）。

第四步：总电流

$$I_{total} = V \times Y_{total} = 10\angle 0^\circ \times 15.30\angle -86.3^\circ \text{ mS} = 153\angle -86.3^\circ \text{ mA}$$

第五步：各元件电流

$$I_R = V \times Y_R = 10\angle 0^\circ \times 1\angle 0^\circ \text{ mS} = 10\angle 0^\circ \text{ mA}$$

$$I_L = V \times Y_L = 10\angle 0^\circ \times 15.9\angle -90^\circ \text{ mS} = 159\angle -90^\circ \text{ mA}$$

$$I_C = V \times Y_C = 10\angle 0^\circ \times 0.628\angle 90^\circ \text{ mS} = 6.28\angle 90^\circ \text{ mA}$$

第六步：验证KCL

把各电流转成直角坐标：

$$I_R = 10 + j0 \text{ mA}$$

$$I_L = 0 - j159 \text{ mA}$$

$$I_C = 0 + j6.28 \text{ mA}$$

相加：

$$I_R + I_L + I_C = 10 + j(0 - 159 + 6.28) = 10 - j152.7 \text{ mA}$$

转换成极坐标：

$$|I| = \sqrt{10^2 + 152.7^2} = 153 \text{ mA}, \quad \theta = \arctan\left(\frac{-152.7}{10}\right) = -86.3^\circ$$

和总电流一致，验证通过！

**关键洞察**：电感电流159mA，电容电流6.28mA，两者相位差180度（一个-90度，一个+90度），所以大部分互相抵消了，净无功电流只有159-6.28=152.7mA。这就是并联谐振的原理——在谐振频率下，$I_L$和$I_C$大小相等、相位相反，完全抵消，总电流只有电阻电流（最小）。

---

## 三、串并联RLC电路——逐步化简，等效阻抗

### 3.1 分析思路

实际电路几乎都是串并联混合的。分析方法和DC串并联电路一样：**从最内层开始，逐步化简，最后得到整个电路的等效阻抗**。

步骤：
1. **识别串联组和并联组**：从离电源最远的地方开始
2. **化简并联组**：用导纳相加，得到等效阻抗
3. **化简串联组**：用阻抗相加，得到等效阻抗
4. **重复2-3**，直到整个电路化简为一个等效阻抗
5. **算总电流**，然后反向展开，用电压分压和电流分流算各元件的电压和电流

> 作者在第4章引言里说："Having completed our examination of strictly series and strictly parallel AC circuits, we are now ready to examine circuits that combine these two configurations."（第110页，4.1 Introduction）

### 3.2 生活类比

串并联电路就像一个公司的组织架构：
- 串联组是"流水线"——一个人干完传给下一个人，每个人的工作量（电流）相同
- 并联组是"团队"——几个人同时干同一件事，每个人的任务（电压）相同
- 串并联混合就是"公司"——有团队也有流水线，分析的时候从最基层的小组开始，一层一层往上合并，最后得到整个公司的"等效人力"（等效阻抗）

### 3.3 完整实例：二阶RC低通滤波器

**题目**：一个二阶RC低通滤波器，结构是：第一级R1(1kΩ)和C1(0.1μF)串联，输出从C1两端取；第二级R2(1kΩ)和C2(0.1μF)串联，接在C1两端，输出从C2两端取。电源10V、1kHz。求C2两端的输出电压。

**解**：

这个电路的结构是：R1串联（C1并联（R2串联C2））。

第一步：从最内层开始，算R2和C2的串联阻抗

$$Z_{R2C2} = R2 - jX_{C2} = 1000 - j1592 \Omega$$

（和前面串联RC实例一样，$X_C = 1592\Omega$）

第二步：算C1和$Z_{R2C2}$的并联阻抗

先算导纳：

$$Y_{C1} = j\omega C1 = j0.628 \text{ mS}$$

$$Y_{R2C2} = \frac{1}{Z_{R2C2}} = \frac{1}{1880\angle -57.9^\circ} = 0.532\angle 57.9^\circ \text{ mS} = 0.282 + j0.451 \text{ mS}$$

并联总导纳：

$$Y_{parallel} = Y_{C1} + Y_{R2C2} = 0.282 + j(0.628 + 0.451) = 0.282 + j1.079 \text{ mS}$$

并联等效阻抗：

$$Z_{parallel} = \frac{1}{Y_{parallel}} = \frac{1}{1.115\angle 75.3^\circ \text{ mS}} = 897\angle -75.3^\circ \Omega = 227 - j867 \Omega$$

第三步：算总阻抗（R1串联$Z_{parallel}$）

$$Z_{total} = R1 + Z_{parallel} = 1000 + 227 - j867 = 1227 - j867 \Omega$$

$$|Z_{total}| = \sqrt{1227^2 + 867^2} = 1503 \Omega, \quad \theta_Z = \arctan\left(\frac{-867}{1227}\right) = -35.3^\circ$$

第四步：算总电流

$$I_{total} = \frac{10\angle 0^\circ}{1503\angle -35.3^\circ} = 6.65\angle 35.3^\circ \text{ mA}$$

第五步：算C1两端电压（即并联组电压）

$$V_{C1} = I_{total} \times Z_{parallel} = 6.65\angle 35.3^\circ \text{ mA} \times 897\angle -75.3^\circ \Omega = 5.97\angle -40.0^\circ \text{ V}$$

第六步：算C2两端电压（第二级的输出，用电压分压）

在第二级里，$V_{C1}$是输入电压，C2两端电压是输出：

$$V_{C2} = V_{C1} \times \frac{Z_{C2}}{Z_{R2C2}} = 5.97\angle -40.0^\circ \times \frac{1592\angle -90^\circ}{1880\angle -57.9^\circ}$$

$$= 5.97\angle -40.0^\circ \times 0.847\angle -32.1^\circ = 5.06\angle -72.1^\circ \text{ V}$$

**结果**：输出电压幅值5.06V，相位-72.1度。和输入10V相比，衰减了约一半（-6dB），相位滞后了72度。

**对滤波器设计的意义**：这就是二阶RC低通滤波器的分析方法。每增加一级RC，衰减斜率增加20dB/十倍频，相位滞后增加。两级就是40dB/十倍频，最大相位滞后180度。实际设计中，两级之间通常加一个电压跟随器（运放缓冲）来隔离，避免两级之间的负载效应（就是我们这里$Z_{R2C2}$对C1的负载效应）。

---

## 四、常见误区和坑

| 误区 | 正确理解 |
|---|---|
| 串联电路总电压等于各元件电压数值相加 | 必须用复数（相量）相加，因为相位不同 |
| 并联电路总电流等于各元件电流数值相加 | 必须用复数相加，电容电流和电感电流相位差180度，可能互相抵消 |
| 容抗和感抗符号搞反 | 阻抗中：电容是$-jX_C$，电感是$+jX_L$；导纳中反过来 |
| 并联电路还用阻抗公式算 | 并联用导纳相加更简单，$Y_{total} = Y_1 + Y_2 + ...$ |
| 忽略实际电感的非理想性 | 实际电感有串联电阻和寄生电容，高频时影响很大 |
| 串并联电路从电源端开始化简 | 应该从最内层（离电源最远）开始，一层一层往外化简 |
| 算功率用电压电流幅值直接相乘 | 必须用RMS值，而且要考虑功率因数（相位差的余弦） |

---

## 小结

这篇文章我们深入拆解了RLC电路的三种基本结构：

1. **串联RLC**：电流相同，阻抗相加（$Z_{total} = Z_1 + Z_2 + ...$），用KVL和电压分压分析。关键是记住所有运算都是复数运算，电压幅值之和可能大于电源电压。

2. **并联RLC**：电压相同，导纳相加（$Y_{total} = Y_1 + Y_2 + ...$），用KCL和电流分流分析。导纳$Y = 1/Z = G + jB$，电容电纳是正虚部，电感电纳是负虚部。并联谐振时，电感电流和电容电流大小相等、相位相反，完全抵消。

3. **串并联RLC**：从最内层开始，逐步化简，先算并联组的等效阻抗（用导纳），再和串联组相加（用阻抗），最后得到整个电路的等效阻抗。然后反向展开，用电压分压和电流分流算各元件的电压和电流。

这三种结构是所有实际电路的基本 building block——滤波器、匹配网络、振荡器、电源滤波，本质上都是这三种结构的组合。学懂了这三板斧，你就能分析绝大多数AC电路。

下一篇（第6篇），我们进入主题3的深度拆解：复杂电路怎么解？——叠加定理、戴维南、节点分析的实战用法。我们会讲怎么用这些系统化的方法分析多电源、多节点的复杂电路，还有SPICE仿真器的底层原理。

---

## 系列导航

**【AC电路分析系列】共11篇，基于 James M. Fiore《AC Electrical Circuit Analysis: A Practical Approach》(Version 1.1.13, 2025)**

| 序号 | 文章 | 状态 |
|---|---|---|
| 第1篇 | 交流电到底是什么？——从DC到AC的思维跃迁 | ✅ 已发布 |
| 第2篇 | 一图读懂AC电路分析：10章学习路径图 | ✅ 已发布 |
| 第3篇 | AC电路分析的6大核心主题：从数学到实践的学习路线 | ✅ 已发布 |
| 第4篇 | 交流电的数学语言：正弦波、复数和相量到底怎么用？ | ✅ 已发布 |
| 第5篇 | RLC电路三板斧：串联、并联、串并联怎么分析？ | ✅ 本篇 |
| 第6篇 | 复杂电路怎么解？叠加定理、戴维南、节点分析的实战用法 | ⏳ 即将发布 |
| 第7篇 | AC功率不只是P=UI：功率三角形、三相电和功率因数校正 | ⏳ 即将发布 |
| 第8篇 | 谐振：无线电选频、滤波器和振荡器背后的核心原理 | ⏳ 即将发布 |
| 第9篇 | 电路的频率性格：分贝、伯德图和滤波器设计入门 | ⏳ 即将发布 |
| 第10篇 | AC电路分析在硬件/嵌入式/无线电生态中的位置：横向对比 | ⏳ 即将发布 |
| 第11篇 | 读完AC电路分析之后：独立思考、实践路线图和进一步学习 | ⏳ 即将发布 |

> 本书为开源教育资源（Creative Commons BY-NC-SA），可免费下载：[www.mvcc.edu/jfiore](https://www.mvcc.edu/jfiore) 或 [www.dissidents.com](https://www.dissidents.com)
> 作者YouTube频道：Electronics with Professor Fiore
