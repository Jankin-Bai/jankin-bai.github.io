<!-- Post: 【AC电路分析系列】交流电的数学语言：正弦波、复数和相量到底怎么用？ | ID: 2026-016 | Created: 2026-09-01 | Tags: tech, books | Format: markdown -->

## 开篇：为什么AC电路不能直接用欧姆定律？

学过DC电路的人都知道欧姆定律：$I = V/R$，电流等于电压除以电阻。简单、直接、好用。

但当你第一次面对一个AC电路时，你会发现事情不对劲了：一个电容，在DC下相当于开路（电流为0），但在AC下却能通过电流；一个电感，在DC下相当于短路（电压为0），但在AC下却有阻碍作用。更麻烦的是，电容上的电压和电流**不同相位**——电流达到最大值的时候，电压却是0；电压达到最大值的时候，电流却是0。

这时候你再用$I = V/R$，发现算出来的结果完全不对。问题出在哪？

答案是：**AC里的电压和电流不是标量（只有大小），而是矢量（有大小还有相位）。** 标量的加法是$1+1=2$，但矢量的加法是$1+1$可能等于$0$（方向相反时），也可能等于$2$（方向相同时）。

所以要分析AC电路，我们首先要学会AC的"数学语言"：用正弦波描述信号，用复数表示矢量，用相量图可视化相位关系。这篇文章就把这三个基础概念彻底讲透。

---

## 一、正弦波形——AC信号的基本形态

### 1.1 什么是正弦波

> 作者在第1章引言里说："We start with the mathematical description of the most simple AC waveform, the sine wave. This includes parameters such as amplitude, frequency, period, phase and DC offset."（第10页，1.1 Introduction）

正弦波是最基本的AC波形。为什么是正弦波而不是方波或三角波？因为：
1. 自然界的很多周期性现象（声波、光波、水波）本质上都是正弦波
2. 任何复杂的周期性波形都可以分解成一系列正弦波的叠加（傅里叶分析，第1章1.3节）
3. 线性电路对正弦波的响应仍然是正弦波（只是幅值和相位变了），分析起来最简单

**生活类比**：正弦波就像荡秋千。秋千从最高点荡到最低点，再荡到对面的最高点，然后又荡回来——这个来回摆动的轨迹，画在坐标纸上就是一个完美的正弦波。

### 1.2 正弦波的5个参数

一个正弦波可以用5个参数完全描述：

| 参数 | 符号 | 一句话解释 | 荡秋千类比 |
|---|---|---|---|
| 幅值 | $V_p$ 或 $A$ | 正弦波的最大偏离值，即波峰到0点的距离 | 秋千荡到最高点时离最低点的高度 |
| 峰峰值 | $V_{pp}$ | 波峰到波谷的距离，等于$2 \times V_p$ | 秋千从最高点到对面最高点的总高度 |
| 频率 | $f$ | 每秒振荡的次数，单位Hz（赫兹） | 秋千每秒来回荡几次 |
| 周期 | $T$ | 振荡一次需要的时间，$T = 1/f$，单位秒 | 秋千来回荡一次需要几秒 |
| 相位 | $\theta$ 或 $\phi$ | 正弦波在时间轴上的偏移，单位度或弧度 | 秋千开始荡的时候在什么位置 |
| 直流偏移 | $V_{DC}$ | 整个正弦波上下平移的量 | 秋千的悬挂点比地面高多少 |

正弦波的数学表达式：

$$v(t) = V_p \sin(2\pi f t + \theta) + V_{DC}$$

翻译成人话：在时刻$t$，电压等于幅值乘以（角频率乘以时间加相位的正弦值），再加上直流偏移。

**对嵌入式开发者的意义**：你用单片机DAC生成正弦波的时候，就是在不断计算这个公式，把结果输出到DAC。角频率$\omega = 2\pi f$，所以你也可以写成$v(t) = V_p \sin(\omega t + \theta)$。用查表法生成正弦波的时候，表的长度就是一个周期的采样点数。

### 1.3 RMS值——为什么功率计算必须用RMS

> 作者说："RMS is a special calculation used for finding equivalent DC power... In other words, if we are interested in finding the power in a resistor, the calculation must be performed using RMS values for voltage or current, not peak or peak-to-peak values. Failure to do so will result in erroneous powers."（第1章1.2节，约第15页）

RMS（Root Mean Square，均方根值）是正弦波的"等效直流值"。意思是：一个幅值为$V_p$的正弦波，在一个电阻上产生的功率，和一个多大的直流电压产生的功率一样大？

答案是：

$$V_{RMS} = \frac{V_p}{\sqrt{2}} \approx 0.707 \times V_p$$

反过来，$V_p = \sqrt{2} \times V_{RMS} \approx 1.414 \times V_{RMS}$。

**生活类比**：想象你用一个交流电源给一个电热毯加热。电热毯的功率只和产生的热量有关，而热量是电压的平方在时间上的平均值。正弦波的电压一会儿高一会儿低，平均下来的"等效加热能力"就是RMS值。我们说家里的插座是220V，指的就是RMS值，它的峰值其实是$220 \times 1.414 \approx 311V$。

**常见误区**：很多初学者算功率的时候直接用峰值算，得到$P = V_p^2/R$，结果是正确值的2倍。记住：**算功率必须用RMS值**。

### 1.4 实践：用DAC生成正弦波

用单片机的DAC（或PWM+滤波）生成一个1kHz、幅值1V、无直流偏移的正弦波：

```c
#include <math.h>

#define SAMPLE_RATE  48000.0f   // 采样率 48kHz
#define FREQ         1000.0f    // 正弦波频率 1kHz
#define AMPLITUDE    1.0f        // 幅值 1V
#define DC_OFFSET    0.0f        // 直流偏移 0V
#define PI           3.14159265f

// 生成一个采样点的正弦波值
float generate_sine_sample(uint32_t sample_index)
{
    float t = (float)sample_index / SAMPLE_RATE;  // 时间（秒）
    float omega = 2.0f * PI * FREQ;                // 角频率（弧度/秒）
    float value = AMPLITUDE * sinf(omega * t) + DC_OFFSET;
    return value;
}

// 在DAC中断中调用，输出到DAC
void dac_isr_handler(uint32_t sample_index)
{
    float v = generate_sine_sample(sample_index);
    // 假设DAC是12位，参考电压3.3V
    uint16_t dac_code = (uint16_t)((v / 3.3f) * 4095.0f);
    dac_write(dac_code);
}
```

> 实际项目中为了提高效率，通常用查表法代替实时计算sinf()：预先生成一个周期的正弦波表（如256或512个点），然后用相位累加器查表输出。这就是DDS（直接数字频率合成）的基本原理。

---

## 二、复数与相量——AC电路的"矢量运算工具"

### 2.1 为什么需要复数

> 作者说："In AC circuits, parameters such as voltage and current are vectors, that is, they have both a magnitude and a phase shift or angle. For example, a voltage might be '12 volts at an angle of 30 degrees'... This is known as polar form or magnitude-angle form. Alternately, a vector can be broken into rectangular form, that is, its right angle components."（第1章1.4节，约第29页）

AC电路里的电压和电流都是矢量——有大小，还有相位。要对矢量进行加减乘除运算，最方便的数学工具就是**复数**。

复数有两种表示形式：
- **极坐标形式**（polar form）：大小 + 角度，如 $12\angle 30^\circ$（12V，相位30度）
- **直角坐标形式**（rectangular form）：实部 + 虚部，如 $10.4 + j6.0$（实部10.4，虚部6.0）

**生活类比**：复数就像地图上的坐标。极坐标形式是"从原点出发，往东北30度方向走12公里"；直角坐标形式是"往东走10.4公里，再往北走6公里"。两种方式描述的是同一个点，只是表达方式不同。

### 2.2 极坐标和直角坐标的转换

极坐标转直角坐标：

$$a = M \cos(\theta), \quad b = M \sin(\theta)$$

直角坐标转极坐标：

$$M = \sqrt{a^2 + b^2}, \quad \theta = \arctan\left(\frac{b}{a}\right)$$

其中$M$是幅值（magnitude），$\theta$是相位角（phase angle），$a$是实部（real part），$b$是虚部（imaginary part）。

**注意**：在电子工程中，虚数单位用$j$而不是$i$（因为$i$已经被电流占用了），所以复数写成$a + jb$。

### 2.3 复数的四则运算

| 运算 | 直角坐标形式 | 极坐标形式 |
|---|---|---|
| 加法 | $(a+jb) + (c+jd) = (a+c) + j(b+d)$ | 先转直角坐标再加 |
| 减法 | $(a+jb) - (c+jd) = (a-c) + j(b-d)$ | 先转直角坐标再减 |
| 乘法 | $(a+jb)(c+jd) = (ac-bd) + j(ad+bc)$ | 幅值相乘，角度相加：$M_1 M_2 \angle(\theta_1+\theta_2)$ |
| 除法 | 分子分母同乘分母的共轭 | 幅值相除，角度相减：$\frac{M_1}{M_2} \angle(\theta_1-\theta_2)$ |

**记忆口诀**：加减用直角坐标（实部加实部，虚部加虚部），乘除用极坐标（幅值乘除，角度加减）。

### 2.4 相量图——把复数画出来

相量图（Phasor Diagram）就是把复数矢量画在坐标系里：横轴是实部，纵轴是虚部，一个带箭头的线段表示一个相量，线段长度是幅值，线段与横轴的夹角是相位。

相量图的作用是**可视化相位关系**。比如在一个串联RL电路里：
- 电阻上的电压和电流同相位（相量方向相同）
- 电感上的电压超前电流90度（相量方向垂直向上）
- 总电压是电阻电压和电感电压的相量和（用平行四边形法则相加）

> 作者说："Phasor diagrams are vector plots and can be used to show the relationships between various voltages in a circuit, as well as between currents or resistive/reactive values."（第10页，1.1 Introduction）

**生活类比**：相量图就像拔河比赛的受力分析图。每个人的拉力是一个矢量（有大小有方向），总拉力是所有矢量的和。用图一画，谁和谁方向一致、谁和谁方向相反，一目了然。

### 2.5 实践：用C语言实现复数运算库

```c
#include <math.h>

#ifndef PI
#define PI 3.14159265358979f
#endif

// 复数结构体（直角坐标形式）
typedef struct {
    float real;   // 实部
    float imag;   // 虚部
} complex_t;

// 极坐标形式
typedef struct {
    float mag;    // 幅值
    float angle;  // 相位（度）
} polar_t;

// 直角坐标转极坐标
polar_t complex_to_polar(complex_t c)
{
    polar_t p;
    p.mag = sqrtf(c.real * c.real + c.imag * c.imag);
    p.angle = atan2f(c.imag, c.real) * 180.0f / PI;  // 弧度转度
    return p;
}

// 极坐标转直角坐标
complex_t polar_to_complex(polar_t p)
{
    complex_t c;
    float rad = p.angle * PI / 180.0f;  // 度转弧度
    c.real = p.mag * cosf(rad);
    c.imag = p.mag * sinf(rad);
    return c;
}

// 复数加法
complex_t complex_add(complex_t a, complex_t b)
{
    complex_t result;
    result.real = a.real + b.real;
    result.imag = a.imag + b.imag;
    return result;
}

// 复数乘法（用极坐标更方便：幅值相乘，角度相加）
complex_t complex_mul(complex_t a, complex_t b)
{
    polar_t pa = complex_to_polar(a);
    polar_t pb = complex_to_polar(b);
    polar_t pr;
    pr.mag = pa.mag * pb.mag;
    pr.angle = pa.angle + pb.angle;
    return polar_to_complex(pr);
}

// 复数除法（幅值相除，角度相减）
complex_t complex_div(complex_t a, complex_t b)
{
    polar_t pa = complex_to_polar(a);
    polar_t pb = complex_to_polar(b);
    polar_t pr;
    pr.mag = pa.mag / pb.mag;
    pr.angle = pa.angle - pb.angle;
    return polar_to_complex(pr);
}
```

> 这个复数运算库是AC电路分析的基础。后面分析串联/并联RLC电路、计算戴维南等效、做节点分析，本质上都是在做复数运算。你甚至可以基于这个库写一个简单的电路仿真器。

---

## 三、电抗与阻抗——电容和电感对交流电的"阻碍"

### 3.1 什么是电抗

> 作者说："Unlike a resistor, the voltage and current will not be in phase for an ideal capacitor or for an ideal inductor. For the capacitor, the current leads the voltage across the capacitor by 90 degrees... For an inductor, the voltage leads the current by 90 degrees... While ideal capacitors and inductors do not exhibit resistance, the voltage does react to the current. Unsurprisingly, we call this characteristic reactance and denote it with the letter X."（第1章1.5节，约第31页）

电阻对电流的阻碍叫**电阻**（Resistance，$R$），电容和电感对交流电的阻碍叫**电抗**（Reactance，$X$）。两者的区别是：
- 电阻：电压和电流同相位，消耗功率（变成热量）
- 电抗：电压和电流相位差90度，不消耗功率（能量在电源和元件之间来回交换）

**生活类比**：电阻就像摩擦力，你推它它就发热，能量真的消耗掉了。电抗就像推一个弹簧——你推它它储能，你拉它它放能，一个周期下来净消耗为零，但推的过程中确实需要用力（有阻碍）。

### 3.2 容抗和感抗

**容抗**（Capacitive Reactance，$X_C$）：电容对交流电的阻碍。

$$X_C = \frac{1}{2\pi f C} = \frac{1}{\omega C}$$

特点：频率越高，容抗越小（高频容易通过电容）；直流下容抗无穷大（电容隔直）。

**感抗**（Inductive Reactance，$X_L$）：电感对交流电的阻碍。

$$X_L = 2\pi f L = \omega L$$

特点：频率越高，感抗越大（高频难以通过电感）；直流下感抗为0（电感通直）。

**相位关系**（必须记住）：
- 电容：**电流超前电压90度**（因为$i = C \frac{dv}{dt}$，电压变化最快的时候电流最大）
- 电感：**电压超前电流90度**（因为$v = L \frac{di}{dt}$，电流变化最快的时候电压最大）

**记忆口诀**："电容电流超前，电感电压超前"，或者用英文缩写"ELI the ICE man"：E（电压）在L（电感）中超前I（电流），I（电流）在C（电容）中超前E（电压）。

### 3.3 阻抗——电阻和电抗的"合力"

**阻抗**（Impedance，$Z$）是电阻和电抗的矢量和，用复数表示：

$$Z = R + jX$$

其中$R$是实部（电阻），$X$是虚部（电抗）。

- 纯电阻：$Z = R + j0 = R$
- 纯电容：$Z = 0 - jX_C = -jX_C$（容抗是负虚部）
- 纯电感：$Z = 0 + jX_L = jX_L$（感抗是正虚部）
- RLC串联：$Z = R + j(X_L - X_C)$

阻抗的幅值和相位：

$$|Z| = \sqrt{R^2 + X^2}, \quad \theta_Z = \arctan\left(\frac{X}{R}\right)$$

有了阻抗，AC电路的欧姆定律就变成了：

$$I = \frac{V}{Z}$$

这里的$V$、$I$、$Z$都是复数（相量），运算遵循复数规则。

### 3.4 实践：测量电容的容抗随频率变化

用信号发生器+示波器+已知电阻，测量一个0.1μF电容在不同频率下的容抗：

```
电路：信号发生器 → 电阻R(1kΩ) → 电容C(0.1μF) → 地
测量：示波器CH1测信号发生器输出电压V_in，CH2测电容两端电压V_C
计算：电流 I = (V_in - V_C) / R，容抗 X_C = V_C / I
```

理论值：
- f=1kHz时，$X_C = 1/(2\pi \times 1000 \times 0.1\times10^{-6}) \approx 1592\Omega$
- f=10kHz时，$X_C \approx 159\Omega$
- f=100kHz时，$X_C \approx 16\Omega$

你会发现实测值和理论值非常吻合，而且频率每增加10倍，容抗减小10倍（反比关系）。

---

## 四、常见误区和坑

| 误区 | 正确理解 |
|---|---|
| 算功率用峰值 | 算功率必须用RMS值，$P = V_{RMS} \times I_{RMS}$ |
| 复数加减用极坐标 | 加减必须转直角坐标（实部加实部，虚部加虚部） |
| 电容和电感的相位搞反 | 电容电流超前电压90度，电感电压超前电流90度（ELI the ICE man） |
| 容抗是正的 | 容抗在阻抗中是负虚部：$Z_C = -jX_C$ |
| 阻抗的幅值就是R+X | 阻抗幅值是$\sqrt{R^2+X^2}$（勾股定理），不是R+X |
| 直流下电容有电流 | 直流稳态下电容相当于开路，电流为0（只有充放电瞬间有电流） |
| 所有AC量都是复数 | 只有需要考虑相位关系的电压、电流、阻抗才用相量/复数表示；功率、能量等标量不用 |

---

## 小结

这篇文章我们深入拆解了AC电路分析的三个数学基础：

1. **正弦波**：AC信号的基本形态，5个参数（幅值、频率、周期、相位、直流偏移）+ RMS值（算功率必须用）。正弦波的数学表达式是$v(t) = V_p \sin(2\pi f t + \theta) + V_{DC}$。

2. **复数与相量**：AC电路的矢量运算工具。极坐标形式（幅值+角度）适合乘除，直角坐标形式（实部+虚部）适合加减。相量图把复数可视化，直观展示相位关系。附了C语言复数运算库的完整代码。

3. **电抗与阻抗**：电容和电感对交流电的阻碍叫电抗（容抗$X_C = 1/(\omega C)$，感抗$X_L = \omega L$）。阻抗是电阻和电抗的矢量和$Z = R + jX$，AC欧姆定律是$I = V/Z$（都是复数运算）。

这三个概念是后面所有章节的基础——串联RLC分析、戴维南等效、节点分析、谐振、频率响应，本质上都是在做复数运算。学懂了这三个概念，后面的内容就只是"套用公式+练习"了。

下一篇（第5篇），我们进入主题2的深度拆解：RLC电路三板斧——串联、并联、串并联怎么分析？我们会用大量实例和相量图，把三种基本电路结构的分析方法彻底讲透，还有实际电感器的非理想性分析。

---

## 系列导航

**【AC电路分析系列】共11篇，基于 James M. Fiore《AC Electrical Circuit Analysis: A Practical Approach》(Version 1.1.13, 2025)**

| 序号 | 文章 | 状态 |
|---|---|---|
| 第1篇 | 交流电到底是什么？——从DC到AC的思维跃迁 | ✅ 已发布 |
| 第2篇 | 一图读懂AC电路分析：10章学习路径图 | ✅ 已发布 |
| 第3篇 | AC电路分析的6大核心主题：从数学到实践的学习路线 | ✅ 已发布 |
| 第4篇 | 交流电的数学语言：正弦波、复数和相量到底怎么用？ | ✅ 本篇 |
| 第5篇 | RLC电路三板斧：串联、并联、串并联怎么分析？ | ⏳ 即将发布 |
| 第6篇 | 复杂电路怎么解？叠加定理、戴维南、节点分析的实战用法 | ⏳ 即将发布 |
| 第7篇 | AC功率不只是P=UI：功率三角形、三相电和功率因数校正 | ⏳ 即将发布 |
| 第8篇 | 谐振：无线电选频、滤波器和振荡器背后的核心原理 | ⏳ 即将发布 |
| 第9篇 | 电路的频率性格：分贝、伯德图和滤波器设计入门 | ⏳ 即将发布 |
| 第10篇 | AC电路分析在硬件/嵌入式/无线电生态中的位置：横向对比 | ⏳ 即将发布 |
| 第11篇 | 读完AC电路分析之后：独立思考、实践路线图和进一步学习 | ⏳ 即将发布 |

> 本书为开源教育资源（Creative Commons BY-NC-SA），可免费下载：[www.mvcc.edu/jfiore](https://www.mvcc.edu/jfiore) 或 [www.dissidents.com](https://www.dissidents.com)
> 作者YouTube频道：Electronics with Professor Fiore
