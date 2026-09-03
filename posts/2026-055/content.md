<!-- Post: 【机器学习阅读导论第6篇】SVM的核技巧与决策树的CART算法：两种截然不同的建模哲学 | ID: 2026-055 | Created: 2026-09-03 | Tags: books, tech, 机器学习 | Format: markdown -->

## 开篇：数据线性不可分，两种算法的不同回答

想象你面前有一堆红点和蓝点，它们在二维平面上交错分布，画不出一条直线把它们分开。

面对这个问题，两种算法给出了截然不同的回答：

- **SVM（支持向量机）**说："把数据扔到更高维的空间里去！在三维空间里，这些点也许就能用一个平面分开了。"——这就是**核技巧**。
- **决策树**说："不用升维，我用一连串'if-else'问题把空间切成一个个小方块，每个方块里只放一种颜色。"——这就是**递归分裂**。

这一篇我们就来拆解这两种风格迥异的算法。SVM代表了"最大间隔"的优雅数学思想，决策树代表了"规则可解释"的工程实用主义。

## 一、SVM：最大间隔分类器（第5章）

### 1.1 核心思想：找到最宽的那条街

线性可分的情况下，能把两类分开的直线有无数条。SVM要找的是**间隔（margin）最大**的那条——也就是离两类样本都最远的决策边界。

```mermaid
graph LR
    A[两类样本点] --> B[找最大间隔超平面]
    B --> C[间隔边界上的点=支持向量]
    C --> D[决策边界只由支持向量决定]
```

落在间隔边界上的样本点叫做**支持向量（Support Vectors）**——决策边界完全由它们决定，其他样本点不影响结果。这就是"支持向量机"名字的由来。

### 1.2 硬间隔 vs 软间隔

**硬间隔分类（Hard Margin）**：要求所有样本都严格在间隔两侧。问题：
1. 只在数据线性可分时存在
2. 对异常值极其敏感——一个离群点可能彻底改变决策边界

**软间隔分类（Soft Margin）**：允许一些样本"违规"（落在间隔内或错误一侧），但要付出代价。用超参数$C$控制：

- $C$大 → 违规代价高 → 间隔窄 → 过拟合风险高
- $C$小 → 违规代价低 → 间隔宽 → 欠拟合风险高

> "If we strictly impose that all instances be off the street and on the right side, this is called hard margin classification... The objective is to find a good balance between keeping the street as large as possible and limiting the margin violations."
> —— 第5章，第156页

```python
from sklearn.svm import SVC

# C越大，间隔越窄，对违规惩罚越重
svm_clf = SVC(kernel="linear", C=1.0)
svm_clf.fit(X_scaled, y)
```

**重要**：SVM对特征缩放敏感！使用前必须做StandardScaler标准化。

### 1.3 核技巧：不用真的升维

数据线性不可分时，一个思路是增加多项式特征（如$x^2, x_1 x_2$），让数据在高维空间变得线性可分。但这样会导致特征数量爆炸。

**核技巧（Kernel Trick）**用一个数学技巧，在不真正增加特征的情况下，达到和升维相同的效果：

> "The kernel trick makes it possible to get the same result as if you added many polynomial features, even with very high-degree polynomials, without actually having to add them."
> —— 第5章，第160页

常用核函数：

| 核函数 | 公式/形式 | 适用场景 |
|--------|----------|---------|
| **线性核** | $K(a,b) = a \cdot b$ | 特征多、样本少时 |
| **多项式核** | $K(a,b) = (\gamma a \cdot b + r)^d$ | 数据有多项式结构 |
| **高斯RBF核** | $K(a,b) = \exp(-\gamma \|a-b\|^2)$ | 最通用，默认选择 |
| **Sigmoid核** | $K(a,b) = \tanh(\gamma a \cdot b + r)$ | 类似神经网络 |

高斯RBF核最常用。它的直觉是：**每个样本点都是一个"地标"，新特征衡量样本到各地标的距离**。距离近的特征值接近1，远的接近0。

$$
\phi_\gamma(x, \ell) = \exp(-\gamma \|x - \ell\|^2)
$$

> "Equation 5-1. Gaussian RBF: φγ(x, ℓ) = exp(−γ‖x − ℓ‖²). It is a bell-shaped function varying from 0 (very far away from the landmark) to 1 (at the landmark)."
> —— 第5章，第162页

超参数$\gamma$：
- $\gamma$大 → 钟形曲线窄 → 每个样本影响范围小 → 模型复杂 → 过拟合
- $\gamma$小 → 钟形曲线宽 → 影响范围大 → 模型简单 → 欠拟合

```python
from sklearn.svm import SVC

# RBF核SVM，gamma和C是关键超参数
rbf_kernel_svm_clf = SVC(kernel="rbf", gamma=5, C=0.001)
rbf_kernel_svm_clf.fit(X_scaled, y)
```

### 1.4 对偶问题：SVM的数学之美

SVM的原始优化问题（primal）可以转化为**对偶问题（dual）**来求解。对偶问题的解和原问题相同，但形式更适合用核技巧。

> "The solution to the dual problem typically gives a lower bound to the solution of the primal problem, but under some conditions it can even have the same solutions as the primal problem. Luckily, the SVM problem happens to meet these conditions."
> —— 第5章，第170页

对偶问题的解中，只有支持向量对应的系数非零——这再次印证了"决策边界只由支持向量决定"。

**什么时候用SVM？**
- 样本量中等（几千到几万）、特征数适中
- 需要精确的决策边界
- 数据在高维空间可能线性可分

**什么时候不用？**
- 大数据集（训练复杂度$O(m^2)$到$O(m^3)$）
- 特征数远大于样本数（用线性核或逻辑回归更好）

## 二、决策树：if-else规则的自动化（第6章）

### 2.1 核心思想：递归地切分空间

决策树通过一系列"是/否"问题来做预测。比如预测鸢尾花种类：
1. 花瓣长度 ≤ 2.45cm？→ 是 → Setosa
2. 否 → 花瓣宽度 ≤ 1.75cm？→ 是 → Versicolor
3. 否 → Virginica

> "One of the many qualities of Decision Trees is that they require very little data preparation. In particular, they don't require feature scaling or centering at all."
> —— 第6章，第179页

决策树的优点：**不需要特征缩放**、**可解释性强**（白盒模型）、**能处理数值和类别特征**。

### 2.2 CART训练算法

Scikit-Learn用的是**CART（Classification And Regression Tree）**算法。它的思路很简单：

1. 遍历所有特征和所有可能的阈值，找到一个分裂$(k, t_k)$，使分裂后的子节点"最纯"
2. 对左右子节点递归重复，直到达到停止条件

CART的成本函数：

$$
J(k, t_k) = \frac{m_{left}}{m} G_{left} + \frac{m_{right}}{m} G_{right}
$$

其中$G$是节点的不纯度（Gini或熵），$m$是样本数。

### 2.3 Gini不纯度 vs 熵

衡量节点"纯度"的两种指标：

**Gini不纯度**：

$$
G_i = 1 - \sum_{k=1}^{n} p_{i,k}^2
$$

其中$p_{i,k}$是节点$i$中类别$k$的比例。Gini=0表示节点中只有一个类别（最纯）。

> "Equation 6-1. Gini impurity: Gi = 1 − Σpᵢ,ₖ². pᵢ,ₖ is the ratio of class k instances among the training instances in the ith node."
> —— 第6章，第183页

**熵（Entropy）**：

$$
H_i = -\sum_{k=1, p_{i,k}\neq 0}^{n} p_{i,k} \log_2(p_{i,k})
$$

两者实际效果差不多，Gini计算稍快。**默认用Gini即可**，想换熵就设`criterion="entropy"`。

### 2.4 正则化：防止决策树长太疯

决策树如果不加限制，会一直分裂直到每个叶节点都纯——这几乎必然过拟合。常用正则化参数：

| 参数 | 作用 |
|------|------|
| `max_depth` | 树的最大深度 |
| `min_samples_split` | 节点分裂所需的最小样本数 |
| `min_samples_leaf` | 叶节点必须有的最小样本数 |
| `max_leaf_nodes` | 最多叶节点数 |
| `max_features` | 分裂时考虑的最大特征数 |

```python
from sklearn.tree import DecisionTreeClassifier

# 限制深度和叶节点最小样本数，防止过拟合
tree_clf = DecisionTreeClassifier(max_depth=3, min_samples_leaf=4)
tree_clf.fit(X, y)
```

### 2.5 回归树

决策树也能做回归。分裂时不再最小化Gini，而是最小化MSE；叶节点的预测值是该节点所有样本的**平均值**。

```python
from sklearn.tree import DecisionTreeRegressor

tree_reg = DecisionTreeRegressor(max_depth=2)
tree_reg.fit(X, y)
```

### 2.6 决策树的局限

1. **对训练数据的小变化极其敏感**——删一个样本，树的结构可能完全不同
2. **决策边界是轴对齐的**——对数据旋转敏感
3. **容易过拟合**——必须正则化
4. **类别不平衡时偏向多数类**

这些局限正是第7章**集成学习**要解决的问题——把很多棵决策树组合起来，就能克服单棵树的不稳定性。

## 三、SVM vs 决策树：对比表

| 对比维度 | SVM | 决策树 |
|---------|-----|--------|
| 建模哲学 | 最大间隔，数学优雅 | if-else规则，工程实用 |
| 可解释性 | 低（黑盒，核方法后更难解释） | 高（白盒，能画出树状图） |
| 特征缩放 | **必须**标准化 | 不需要 |
| 非线性能力 | 核技巧（RBF等） | 递归分裂（轴对齐边界） |
| 训练复杂度 | $O(m^2)$~$O(m^3)$，大数据慢 | $O(n \times m \log m)$，较快 |
| 预测速度 | 快（只算支持向量） | 快（$O(\log m)$次比较） |
| 过拟合倾向 | 中（C和gamma控制） | 高（必须正则化） |
| 对异常值 | 软间隔下较鲁棒 | 敏感 |
| 典型应用 | 文本分类、生物信息学 | 特征选择、规则提取、集成学习基模型 |

## 四、代码示例

### SVM分类（RBF核）

```python
from sklearn.datasets import make_moons
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X, y = make_moons(n_samples=100, noise=0.15)

# SVM必须标准化！
rbf_kernel_svm_clf = Pipeline([
    ("scaler", StandardScaler()),
    ("svm_clf", SVC(kernel="rbf", gamma=5, C=0.001))
])
rbf_kernel_svm_clf.fit(X, y)
```

### 决策树分类与可视化

```python
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier, export_graphviz
import graphviz

iris = load_iris()
X = iris.data[:, 2:]  # 花瓣长度和宽度
y = iris.target

tree_clf = DecisionTreeClassifier(max_depth=2, random_state=42)
tree_clf.fit(X, y)

# 导出为DOT格式，用graphviz渲染
dot_data = export_graphviz(
    tree_clf,
    feature_names=iris.feature_names[2:],
    class_names=iris.target_names,
    rounded=True,
    filled=True
)
graph = graphviz.Source(dot_data)
graph.render("iris_tree")  # 生成PDF/PNG
```

## 五、原书图表索引

| 图表编号 | 内容 | 所在位置 |
|---------|------|---------|
| Figure 5-1 | 最大间隔分类 | 第5章，第155页 |
| Figure 5-3 | 软间隔分类 | 第5章，第157页 |
| Figure 5-7 | RBF核决策边界 | 第5章，第163页 |
| Figure 5-9 | SVM回归 | 第5章，第165页 |
| Figure 6-1 | 鸢尾花决策树可视化 | 第6章，第178页 |
| Figure 6-2 | 决策树的决策边界 | 第6章，第180页 |
| Figure 6-7 | 正则化对比 | 第6章，第185页 |

## 六、小结

这一篇我们对比了两种截然不同的建模哲学：

1. **SVM**：追求最大间隔的优雅数学解，核技巧让它能处理非线性问题，但训练复杂度高、可解释性差
2. **决策树**：用if-else规则递归切分空间，可解释性强、不需要特征缩放，但不稳定、容易过拟合

记住一个关键联系：**决策树的不稳定性正是集成学习的出发点**。下一篇我们将看到，把几百棵决策树随机组合起来，就能得到工业界最强大的模型之一——随机森林和梯度提升树。

## 下一篇预告

第7篇我们将深入**主题4：集成学习与降维**。为什么"三个臭皮匠"能赢过"一个诸葛亮"？Bagging和Boosting的区别是什么？随机森林为什么强大？高维数据的"维度灾难"怎么破？PCA的数学原理是什么？

> 系列导航：第1篇入门导引 → 第2篇全书地图 → 第3篇深度阅读导引 → 第4篇ML全局观与项目流水线 → 第5篇经典监督学习算法族 → 第6篇核方法与树模型 → **第7篇集成学习与降维** → 第8-10篇核心主题 → 第11篇主题阅读 → 第12篇研究式阅读
