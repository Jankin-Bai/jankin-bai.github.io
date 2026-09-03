<!-- Post: 【机器学习阅读导论第9篇】从感知机到深层网络：训练神经网络时你到底在调什么？ | ID: 2026-058 | Created: 2026-09-03 | Tags: books, tech, 机器学习 | Format: markdown -->

## 开篇：1986年反向传播发明后，为什么深层网络还是训不动？

1986年，Hinton等人提出了反向传播（Backpropagation）算法，解决了多层神经网络的训练问题。按理说，从那以后我们应该能训练任意深的网络了。

但事实是：接下来的近20年里，深层神经网络（超过3-4层）几乎都训不动。梯度在反向传播过程中要么越来越小（**梯度消失**），要么越来越大（**梯度爆炸**），网络学不到任何东西。

直到2006年Hinton提出"深度信念网络"的预训练方法，2010年前后Glorot初始化、ReLU激活函数、Batch Normalization等技术陆续出现，深层网络才真正变得可训练。

第10章教你用Keras搭出第一个神经网络，第11章则解决"为什么深层网络训不动"这个核心问题。这一篇我们把两章合在一起，搞清楚：训练神经网络时，你到底在调什么？

## 一、神经网络基础（第10章）

### 1.1 从生物神经元到人工神经元

生物神经元接收其他神经元的信号，达到阈值后发放电脉冲。人工神经元模拟这个过程：

$$
y = \phi(w^T x + b)
$$

其中$w$是权重，$b$是偏置，$\phi$是激活函数。

### 1.2 感知机：最简单的神经网络

感知机（Perceptron）由Frank Rosenblatt在1957年发明，是最简单的人工神经网络。它用阶跃函数作为激活函数，只能做线性可分的二分类。

> "The Perceptron is one of the simplest ANN architectures, invented in 1957 by Frank Rosenblatt."
> —— 第10章，第281页

感知机的局限：**不能解决XOR问题**（异或问题）。因为XOR不是线性可分的。

### 1.3 MLP与反向传播

把多个感知机堆叠起来，就得到了**多层感知机（Multi-Layer Perceptron, MLP）**：

- 输入层：接收数据
- 隐藏层：一层或多层，做特征变换
- 输出层：产生预测

> "An MLP is composed of one (passthrough) input layer, one or more layers of TLUs, called hidden layers, and one final layer of TLUs called the output layer."
> —— 第10章，第286页

MLP能解决XOR问题，因为隐藏层能学习非线性特征变换。

**反向传播（Backpropagation）**是训练MLP的算法：
1. 前向传播：计算预测值和损失
2. 反向传播：用链式法则从输出层往输入层算每个参数的梯度
3. 更新参数：用梯度下降更新权重

```mermaid
graph LR
    A[输入层] --> B[隐藏层1]
    B --> C[隐藏层2]
    C --> D[输出层]
    D --> E[计算损失]
    E --> F[反向传播梯度]
    F --> B
```

### 1.4 Keras三种API

Keras提供三种构建模型的方式，从简单到灵活：

**Sequential API（顺序模型）**：最简单，层按顺序堆叠。

```python
import tensorflow as tf
from tensorflow import keras

model = keras.models.Sequential([
    keras.layers.Flatten(input_shape=[28, 28]),
    keras.layers.Dense(300, activation="relu"),
    keras.layers.Dense(100, activation="relu"),
    keras.layers.Dense(10, activation="softmax")
])

model.compile(loss="sparse_categorical_crossentropy",
              optimizer="sgd",
              metrics=["accuracy"])
history = model.fit(X_train, y_train, epochs=30,
                    validation_data=(X_valid, y_valid))
```

**Functional API（函数式模型）**：可以构建复杂的非顺序结构，如Wide & Deep模型。

```python
input_ = keras.layers.Input(shape=[28, 28])
flatten = keras.layers.Flatten()(input_)
hidden1 = keras.layers.Dense(300, activation="relu")(flatten)
hidden2 = keras.layers.Dense(100, activation="relu")(hidden1)
concat = keras.layers.Concatenate()([flatten, hidden2])  # 跳跃连接
output = keras.layers.Dense(10, activation="softmax")(concat)
model = keras.Model(inputs=[input_], outputs=[output])
```

**Subclassing API（子类化模型）**：最灵活，用Python类定义模型，适合研究和自定义。

```python
class WideAndDeepModel(keras.Model):
    def __init__(self, units=300, activation="relu", **kwargs):
        super().__init__(**kwargs)
        self.hidden1 = keras.layers.Dense(units, activation=activation)
        self.hidden2 = keras.layers.Dense(100, activation=activation)
        self.output_ = keras.layers.Dense(10, activation="softmax")
    
    def call(self, inputs):
        flatten = keras.layers.Flatten()(inputs)
        hidden1 = self.hidden1(flatten)
        hidden2 = self.hidden2(hidden1)
        concat = keras.layers.Concatenate()([flatten, hidden2])
        return self.output_(concat)
```

| API | 灵活性 | 调试难度 | 适用场景 |
|-----|--------|---------|---------|
| Sequential | 低 | 简单 | 普通的顺序模型 |
| Functional | 中 | 中等 | 多输入/输出、跳跃连接 |
| Subclassing | 高 | 难 | 研究、自定义前向逻辑 |

### 1.5 回调函数与TensorBoard

训练时用回调（Callbacks）实现早停、保存模型、动态调整学习率：

```python
checkpoint_cb = keras.callbacks.ModelCheckpoint("my_model.h5", save_best_only=True)
early_stopping_cb = keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True)
tensorboard_cb = keras.callbacks.TensorBoard("logs")

history = model.fit(X_train, y_train, epochs=100,
                    validation_data=(X_valid, y_valid),
                    callbacks=[checkpoint_cb, early_stopping_cb, tensorboard_cb])
```

## 二、训练深水区：为什么深层网络训不动（第11章）

### 2.1 梯度消失/爆炸问题

反向传播时，梯度从输出层一层层往回传。每经过一层，梯度都要乘以权重矩阵和激活函数的导数。

- **Sigmoid导数**最大只有0.25，连乘多层后梯度指数级衰减 → **梯度消失**
- 权重初始化太大时，梯度连乘后指数级增长 → **梯度爆炸**

> "The backpropagation algorithm works by going from the output layer to the input layer, propagating the error gradient on the way. Once the algorithm has computed the gradient of the cost function with regards to each parameter, it uses these gradients to update each parameter with a Gradient Descent step."
> —— 第11章，第326页

### 2.2 初始化：Glorot vs He

好的初始化能让信号在前向和反向传播时都保持稳定。

**Glorot初始化（Xavier初始化）**：适用于tanh、sigmoid等激活函数。权重从均匀或正态分布中采样，方差为$1/fan_{avg}$。

**He初始化**：适用于ReLU及其变体。方差为$2/fan_{in}$。

> "Glorot and Bengio found a few suspects, including the combination of the popular logistic sigmoid activation function and the weight initialization technique that was most popular at the time."
> —— 第11章，第327页

```python
keras.layers.Dense(100, activation="relu", kernel_initializer="he_normal")
```

| 初始化 | 适用激活函数 | 公式 |
|--------|------------|------|
| Glorot | tanh, sigmoid, softmax | $\text{Var}(W) = 1/fan_{avg}$ |
| He | ReLU, Leaky ReLU | $\text{Var}(W) = 2/fan_{in}$ |
| LeCun | SELU | $\text{Var}(W) = 1/fan_{in}$ |

### 2.3 激活函数进化史

```mermaid
graph LR
    A[Sigmoid<br/>0~1, 梯度消失] --> B[tanh<br/>-1~1, 仍有梯度消失]
    B --> C[ReLU<br/>正区间梯度=1, 死亡ReLU]
    C --> D[Leaky ReLU<br/>负区间小斜率]
    D --> E[ELU<br/>平滑, 负区间有梯度]
    E --> F[SELU<br/>自归一化]
    F --> G[GELU/Swish<br/>平滑, 现代网络常用]
```

**ReLU**的问题：负区间梯度为0，神经元可能"死亡"（一旦输出负数，永远不更新）。

**Leaky ReLU**：$f(z) = \max(\alpha z, z)$，负区间有小斜率$\alpha$（通常0.01）。

**ELU**：负区间平滑，有梯度，输出均值接近0。

**SELU**：自归一化激活函数，配合LeCun初始化和特定网络结构，能让各层输出自动归一化。

### 2.4 Batch Normalization：内部协变量偏移的解药

Batch Normalization（BN）在每一层的激活函数之前，对输入做归一化（减均值除标准差），然后用可学习的缩放和平移参数调整。

> "Batch Normalization consists of adding an operation in the model just before or after the activation function of each hidden layer. This operation simply zero-centers and normalizes each input, then scales and shifts the result using two new parameter vectors per layer."
> —— 第11章，第333页

BN的好处：
- 允许更大的学习率（训练更快）
- 减少对初始化的敏感
- 有轻微的正则化效果
- 缓解梯度消失

```python
model = keras.models.Sequential([
    keras.layers.Flatten(input_shape=[28, 28]),
    keras.layers.BatchNormalization(),
    keras.layers.Dense(300, use_bias=False),
    keras.layers.BatchNormalization(),
    keras.layers.Activation("relu"),
    keras.layers.Dense(100, use_bias=False),
    keras.layers.BatchNormalization(),
    keras.layers.Activation("relu"),
    keras.layers.Dense(10, activation="softmax")
])
```

### 2.5 梯度裁剪（Gradient Clipping）

缓解梯度爆炸的简单方法：反向传播时把梯度限制在某个阈值内。

```python
optimizer = keras.optimizers.SGD(clipvalue=1.0)  # 按值裁剪
# 或
optimizer = keras.optimizers.SGD(clipnorm=1.0)   # 按范数裁剪
```

### 2.6 优化器进化史

普通SGD只有一个学习率，所有参数用同一个步长。优化器的进化方向是：**给每个参数自适应学习率**。

```mermaid
graph LR
    A[SGD<br/>固定学习率] --> B[Momentum<br/>加动量, 加速收敛]
    B --> C[Nesterov<br/>动量改进版]
    C --> D[AdaGrad<br/>自适应学习率, 早期好]
    D --> E[RMSProp<br/>解决AdaGrad学习率过早衰减]
    E --> F[Adam<br/>Momentum + RMSProp]
    F --> G[Nadam<br/>Nesterov + Adam]
```

**Momentum（动量）**：像保龄球滚下山坡，积累动量，加速收敛，能冲出局部最优。

**Adam**：目前最常用的优化器。结合了Momentum（一阶矩估计）和RMSProp（二阶矩估计），自适应每个参数的学习率。

```python
optimizer = keras.optimizers.Adam(learning_rate=0.001, beta_1=0.9, beta_2=0.999)
```

| 优化器 | 特点 | 适用场景 |
|--------|------|---------|
| SGD | 简单，泛化好，但收敛慢 | 有足够时间调参，追求最佳泛化 |
| Momentum | 加速收敛，减少震荡 | 大多数场景 |
| RMSProp | 自适应学习率 | 非平稳目标、RNN |
| Adam | 自适应+动量，收敛快 | 默认选择，大多数场景 |
| Nadam | Adam + Nesterov | 比Adam稍好 |

### 2.7 正则化：防止过拟合

**L1/L2正则化**：在损失函数中加权重的惩罚项。

```python
keras.layers.Dense(100, activation="relu",
                   kernel_regularizer=keras.regularizers.l2(0.01))
```

**Dropout**：训练时随机"关掉"一部分神经元（通常20%-50%），迫使网络不依赖任何单个神经元。

> "Dropout is one of the most popular regularization techniques for deep neural networks. It was proposed by Geoffrey Hinton in 2012."
> —— 第11章，第357页

```python
model = keras.models.Sequential([
    keras.layers.Flatten(input_shape=[28, 28]),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(300, activation="relu"),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(100, activation="relu"),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(10, activation="softmax")
])
```

**MC Dropout**：测试时也开Dropout，多次预测取平均，得到不确定性估计。

**Max-Norm正则化**：限制每个神经元的权重范数不超过某个阈值。

### 2.8 学习率调度

固定学习率不是最优的——训练初期可以大一些（快速下降），后期要小一些（精细调整）。

常见调度策略：
- **指数衰减**：每轮乘以一个因子
- **性能调度**：验证损失不下降时降低学习率（ReduceLROnPlateau）
- **1cycle**：先增大学习率到最大值，再逐渐减小

```python
lr_scheduler = keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=5)
model.fit(X_train, y_train, epochs=100, callbacks=[lr_scheduler])
```

## 三、超参数调优优先级速查表

当你的神经网络效果不好时，按这个顺序排查：

| 优先级 | 超参数 | 建议 |
|--------|--------|------|
| 1 | **学习率** | 最重要！用学习率查找法找最优范围 |
| 2 | **优化器** | 默认Adam，追求泛化试SGD+Momentum |
| 3 | **初始化** | ReLU用He，tanh用Glorot |
| 4 | **激活函数** | 默认ReLU，试Leaky ReLU/ELU |
| 5 | **BatchNorm** | 深层网络几乎必加 |
| 6 | **网络结构** | 层数、每层神经元数 |
| 7 | **正则化** | Dropout、L2、早停 |
| 8 | **学习率调度** | 后期精细调整 |

## 四、代码示例：Fashion MNIST完整训练

```python
import tensorflow as tf
from tensorflow import keras

# 加载数据
fashion_mnist = keras.datasets.fashion_mnist
(X_train_full, y_train_full), (X_test, y_test) = fashion_mnist.load_data()
X_valid, X_train = X_train_full[:5000] / 255.0, X_train_full[5000:] / 255.0
y_valid, y_train = y_train_full[:5000], y_train_full[5000:]

# 构建模型
model = keras.models.Sequential([
    keras.layers.Flatten(input_shape=[28, 28]),
    keras.layers.BatchNormalization(),
    keras.layers.Dense(300, activation="relu", kernel_initializer="he_normal"),
    keras.layers.BatchNormalization(),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(100, activation="relu", kernel_initializer="he_normal"),
    keras.layers.BatchNormalization(),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(10, activation="softmax")
])

# 编译
model.compile(loss="sparse_categorical_crossentropy",
              optimizer=keras.optimizers.Adam(learning_rate=0.001),
              metrics=["accuracy"])

# 回调
checkpoint_cb = keras.callbacks.ModelCheckpoint("fashion_mnist.h5", save_best_only=True)
early_stopping_cb = keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True)

# 训练
history = model.fit(X_train, y_train, epochs=100,
                    validation_data=(X_valid, y_valid),
                    callbacks=[checkpoint_cb, early_stopping_cb])

# 评估
model.evaluate(X_test / 255.0, y_test)
```

## 五、原书图表索引

| 图表编号 | 内容 | 所在位置 |
|---------|------|---------|
| Figure 10-1 | 生物神经元 | 第10章，第278页 |
| Figure 10-4 | 感知机 | 第10章，第281页 |
| Figure 10-7 | MLP架构 | 第10章，第286页 |
| Figure 10-12 | Keras模型训练曲线 | 第10章，第298页 |
| Figure 11-1 | 梯度消失问题 | 第11章，第326页 |
| Figure 11-9 | 激活函数对比 | 第11章，第330页 |
| Figure 11-11 | Batch Normalization | 第11章，第334页 |
| Figure 11-15 | 优化器对比 | 第11章，第350页 |
| Figure 11-18 | Dropout | 第11章，第358页 |

## 六、小结

这一篇我们深入了主题6——神经网络的基础与训练：

1. **基础**：感知机→MLP→反向传播，Keras三种API（Sequential/Functional/Subclassing）
2. **梯度消失/爆炸**：深层网络训练的核心障碍，由激活函数导数和初始化共同导致
3. **解决方案**：
   - 初始化：Glorot（tanh）/ He（ReLU）
   - 激活函数：ReLU→Leaky ReLU→ELU→SELU
   - Batch Normalization：每层归一化，允许大学习率
   - 优化器：Adam是默认选择，SGD+Momentum追求泛化
   - 正则化：Dropout、L2、早停
   - 学习率调度：先大后小

记住一个核心原则：**训练神经网络是一个"系统工程"**，不是调一个参数就能解决的。学习率、初始化、激活函数、优化器、正则化之间相互影响，需要系统性地调试。

## 下一篇预告

第10篇我们将深入**主题7：TensorFlow工程化与CNN视觉**。第12章教你跳出Keras的舒适区，用TF底层API自定义损失、层、训练循环；第13章构建高效数据管道；第14章讲CNN——从卷积运算到LeNet→AlexNet→ResNet的架构进化史，以及迁移学习和目标检测。

> 系列导航：第1篇入门导引 → 第2篇全书地图 → 第3篇深度阅读导引 → 第4篇ML全局观与项目流水线 → 第5篇经典监督学习算法族 → 第6篇核方法与树模型 → 第7篇集成学习与降维 → 第8篇无监督学习 → 第9篇神经网络基础与训练深水区 → **第10篇TF工程化与CNN视觉** → 第11篇主题阅读 → 第12篇研究式阅读
