<!-- Post: 机器学习笔记（TensorFlow 实战） | ID: 2025-026 | Created: 2025-07-25 | Tags: tech,works | Format: markdown | Source: github.com/Jankin-Bai/ClassNotes -->

# 机器学习笔记(Machine lerning)
  ## 实现机器学习的算法
  ### 1. 监督学习(supervised learning)
    有数据,有标签,例如: *神经网络算法*.
    
![](https://github.com/Jankin-Bai/Machine-learning-s-notes/blob/master/217a730548267356.png)
  ####  *人工神经网络*
    人工神经网络通过正向和反向传播更新神经元从而形成更好的神经系统,本质上是能让计算机处理和优化的数学模型  

 ##### 教程 tutorial   
[Numpy tutorial](https://docs.scipy.org/doc/numpy/user/quickstart.html)  
[TensorFlow tutorial](https://github.com/tensorflow/tensorflow)  
[Markdown tutorial](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)

##### 利用 *TensorFlow* 实现神经网络的基本架构

```Python
#利用TensorFlow
#名词解释:
#        weights:权重
#        biases:偏量
#        random:随机变量
#        loss:误差
#        optimizer:优化
#        train:训练
#        initialize:初始化
#        range:范围
#        Gradient Descent:梯度下降
#        Session:会话

import tensorflow as tf
import numpy as np

#创建数据(creat data)
 x_data = np.random.rand(100).astype(np.float32)
 y_data = x_data*0.1+0.3

#以下structure建立了神经网络的结构,并初始化变量
###create tensorflow structure start ###
 #创建模型
  Weights = tf.Variable(tf.random_uniform([1],-1.0,1.0))
  biases = tf.Variable(tf.zeros([1]))
  y = Weights*x_data+biases

 #计算误差(y和y_data的误差)
  loss = tf.reduce_mean(tf.square(y-y_data))

 #传播误差
  optimizer = tf.train.GradientDescentOptimizer(0.5)
  train = optimizer.minimize(loss) #更新

 #初始化
  init = tf.global_variables_initializer()
###create tensorflow structure end ###

#创建会话
 sess = tf.Session()
 sess.run(init)   #Very important 激活初始化,类似指针指向init

#开始训练
for step in range(201):
    sess.run(train)
    if step % 20 == 0:
        print(step,sess.run(Weights),sess.run(biases)) 
        
```

![](https://github.com/Jankin-Bai/Machine-learning-s-notes/blob/master/Screenshot%20from%202018-08-05%2017-42-23.png)
##### *TensorFlow*的基本语法
``` Python
####################################################################################
###########################TensorFlow语法集锦########################################

# Session 对话

print("Session测试结果")

import tensorflow as tf

matrix1 = tf.constant([[3,3]])
matrix2 = tf.constant([[2],
                       [2]])

#matrix mlutiply(矩阵乘法,内积) np.dot(m1,m2)
product = tf.matmul(matrix1,matrix2)  

#因为 product 不是直接计算的步骤,
#所以我们会要使用 Session 来激活 product 并得到计算结果.
#有两种形式使用会话控制 Session 

#method 1
#sess = tf.Session()
#result = sess.run(product)
#
#print(result)
#sess.close()


#method 2
#有一些任务，可能事先需要设置，事后做清理工作。
#对于这种场景，Python的with语句提供了一种非常方便的处理方式。
#一个很好的例子是文件处理，你需要获取一个文件句柄，
#从文件中读取数据，然后关闭文件句柄。
#除了有更优雅的语法，with还可以很好的处理上下文环境产生的异常。下面是with版本的代码：

with tf.Session() as sess:
    result2 = sess.run(product)
    print(result2)
#这看起来充满魔法，但不仅仅是魔法，Python对with的处理还很聪明。
#基本思想是with所求值的对象必须有一个__enter__()方法，一个__exit__()方法。
#紧跟with后面的语句被求值后，返回对象的__enter__()方法被调用，这个方法的返回值将被赋值给as后面的变量。
#当with后面的代码块全部被执行完之后，将调用前面返回对象的__exit__()方法。


####################################################################################

# Variable 变量定义
print("Variable测试结果")


state = tf.Variable(0,name='counter')

#定义常量 one
one = tf.constant(1)

#定义加法步骤(此步并未直接计算))
new_value = tf.add(state,one)

#将State更新成new_value
update = tf.assign(state,new_value)

#初始化变量<很重要>must have if define variable
init = tf.global_variables_initializer() 

#变量激活
with tf.Session() as sess:
    sess.run(init)
    for _ in range(3):
        sess.run(update)
        #将sess的指针指向state才能print
        print(sess.run(state))

####################################################################################

# plecehoder 传入值
# placeholder 是 Tensorflow 中的占位符，暂时储存变量.
# Tensorflow 如果想要从外部传入data, 那就需要用到 tf.placeholder(),
# 然后以这种形式传输数据 sess.run(***, feed_dict={input: **}).

print("plecehoder测试结果")

#给定数据类型大小及结构
#TensorFlow中需要定义placeholder的type,一般为float32形式
input1 = tf.placeholder(tf.float32) 
input2 = tf.placeholder(tf.float32)

# multiply 是input1和input2做乘法运算,并输出为output
output = tf.multiply(input1,input2)

with tf.Session() as sess:
    #传值的工作交给了 sess.run() , 
    #需要传入的值放在了feed_dict={} 
    #并一一对应每一个 input.
    # placeholder 与 feed_dict={} 是绑定在一起出现的
    print(sess.run(output,feed_dict={input1:[7.],input2:[2.]}))

```
![](https://github.com/Jankin-Bai/Machine-learning-s-notes/blob/master/Screenshot%20from%202018-08-06%2016-57-00.png)


##### 激励函数概念

##### 训练架构

```Python
import tensorflow as tf
#import matplotlib.pyplot as plt
import numpy as np


########################################################################################
# 定义一个添加层函数,包含(参数,计算方式,激励函数activation_function)

def add_layer(inputs, in_size, out_size, activation_function=None):
    #定义一个[in_size,out_size]的随机变量矩阵in_size*out_size
    Weights = tf.Variable(tf.random_normal([in_size,out_size]))
    #定义一个[1,out_size]的为0矩阵再+0.1,全为0.1
    biases = tf.Variable(tf.zeros([1, out_size]) + 0.1)
    #定义计算方式output=Weights*input+biases
    Wx_plus_b = tf.matmul(inputs, Weights) + biases
    #判断是否添加激励函数
    if activation_function is None:
        outputs = Wx_plus_b
    else:
        #output=activation_function(Weights*input+biases)
        outputs = activation_function(Wx_plus_b)
    return outputs
########################################################################################

########################################################################################
# 构建所需数据 加入noise使之看起来更像真实情况
x_data = np.linspace(-1,1,300,dtype=np.float32)[:,np.newaxis]
noise = np.random.normal(0, 0.05,x_data.shape).astype(np.float32)
y_data = np.square(x_data) - 0.5 + noise

########################################################################################

#利用占位符tf.placeholder()定义 神经网络的输入,None代表无论输入多少都可以,1表示只有1个特征
xs = tf.placeholder(tf.float32,[None, 1])
ys = tf.placeholder(tf.float32,[None, 1])

########################################################################################
#搭建网络

# 定义神经层
# 包括: 输入层(input layer) 隐藏层(hide layer) 输出层(output layer)
#            1个                    10个           1个

# 定义隐藏层 激励函数采用nn.relu
l1 = add_layer(xs,1,10,activation_function=tf.nn.relu)

# 定义输出层 输入为l1(hide layer))
prediction = add_layer(l1, 10, 1, activation_function=None)

########################################################################################

# 计算预测值prediction和真实值的误差,差的平方和取平均.
loss = tf.reduce_mean(tf.reduce_sum(tf.square(ys-prediction),reduction_indices=[1]))

# 让机器学习提升它的准确率 tf.tran.GrandientDescentOptimizer(),0.1的效率
# GradientDescent(梯度下降) Optimizer(优化)
train_step = tf.train.GradientDescentOptimizer(0.1).minimize(loss)

########################################################################################

#变量初始化
init = tf.global_variables_initializer()
#定义Session,并用Sessino来执行初始化步骤
sess = tf.Session()
sess.run(init)
########################################################################################
#     TensorFlow中只有session.run()才会执行我们的定义
########################################################################################

# 训练

for i in range(1000):
    #让机器学习1000次,内容是train_step
    sess.run(train_step, feed_dict={xs: x_data, ys: y_data})
    

    if i % 50 == 0:
        print(sess.run(loss,feed_dict={xs: x_data, ys: y_data}))

########################################################################################

```
    
![](https://github.com/Jankin-Bai/Machine-learning-s-notes/blob/master/Screenshot%20from%202018-08-09%2023-42-48.png)


##### 训练架构可视化  
*tensorboard*是tensorflow自带的可视化方式，tensorboard可以用最直观的流程图方式告诉你神经网络是长什么样子的。有助于继续学习和理解原理。

```python
import tensorflow as tf 
import numpy as np 
import matplotlib.pyplot as plt

#定义添加层函数
def add_layer(inputs, in_size, out_size, activation_function=None):
    with tf.name_scope('layer'):
        with tf.name_scope('Weight'):
          Weight = tf.Variable(tf.random_normal([in_size,out_size]),name = 'W')
        with tf.name_scope('biases'):
          biases = tf.Variable(tf.zeros([1, out_size]) + 0.1,name ='b')
        with tf.name_scope('Wx_plus_b'):

          Wx_plus_b = tf.matmul(inputs, Weight) + biases

          if activation_function is None:
              outputs = Wx_plus_b
          else:
              outputs = activation_function(Wx_plus_b)
          return outputs
#模拟输入数据（加入噪声）

#我们用 tf.Variable 来创建描述 y 的参数. 
# 我们可以把 y_data = x_data*0.1 + 0.3 想象成 y=Weights * x + biases, 
# 然后神经网络也就是学着把 Weights 变成 0.1, biases 变成 0.3.
x_data = np.linspace(-1,1,300,dtype=np.float32)[:,np.newaxis]
noise = np.random.normal(0, 0.005,x_data.shape).astype(np.float32)
y_data = np.square(x_data) - 0.5 + noise

with tf.name_scope('inputs'):
    xs = tf.placeholder(tf.float32,[None, 1],name = 'x_input')
    ys = tf.placeholder(tf.float32,[None, 1],name = 'y_input')

#搭建网络

l1 = add_layer(xs,1,10,activation_function=tf.nn.relu)

prediction = add_layer(l1, 10, 1, activation_function=None)

with tf.name_scope('loss'):
    loss = tf.reduce_mean(tf.reduce_sum(tf.square(ys-prediction),reduction_indices=[1]),name='loss')
with tf.name_scope('train'):
    train_step = tf.train.GradientDescentOptimizer(0.1).minimize(loss)
#train_step = tf.train.MomentumOptimizer(0.1).minimize(loss)
init = tf.global_variables_initializer()
sess = tf.Session()
sess.run(init)
#将框架加载到文件中
writer = tf.summary.FileWriter("logs/",sess.graph)

#构建图形，用散点图描述真实数据之间的关系
fig = plt.figure()
ax = fig.add_subplot(1,1,1)
ax.scatter(x_data,y_data)
plt.ion()   #用于连续显示
plt.show()

# 训练

for i in range(1000):
    sess.run(train_step, feed_dict={xs: x_data, ys: y_data})
    #每隔50次训练刷新一次图形，用红色、宽度为5的线来显示我们的预测数据和输入之间的关系，并暂停0.1s
    if i % 50 == 0:
        try:#移除线，因为没有定义
            ax.lines.remove(lines[0])
        except Exception:
            pass
        prediction_value = sess.run(prediction,feed_dict={xs: x_data})
        lines = ax.plot(x_data,prediction_value,'r-',lw=5)
        plt.pause(0.1)

```


##### 训练架构可可视化Tensorboard  
  本次练习采用了三层训练，并加入了对biases、weight、loss、output等参数的统计可视化

```python
import tensorflow as tf 
import numpy as np 
import matplotlib.pyplot as plt #可视化模块

#terminal type tensorboard --logdir='logs/' to make graph
#cleck the http to open.
###############################################################################
#定义添加层函数(实质上是神经元)
def add_layer(inputs,
    in_size,out_size,
    n_layer,
    activation_function=None):
    layer_name = 'layer%s'%n_layer    #标记定义当前层
    with tf.name_scope('layer_name'):   #将当前层函数显示在一个大的框架里
        with tf.name_scope('Weights'):
          Weights = tf.Variable(tf.random_normal([in_size,out_size]),
          name = 'W')
          #tf.summary.histogram(图表名称，图表要记录的变量)用来显示图表
          tf.summary.histogram(layer_name +'/Weights',Weights)
        with tf.name_scope('biases'):
          biases = tf.Variable(tf.zeros([1, out_size]) + 0.1,
          name ='b')
          tf.summary.histogram(layer_name +'/biases',biases)
        with tf.name_scope('Wx_plus_b'):

          Wx_plus_b = tf.matmul(inputs, Weights) + biases

          if activation_function is None:
              outputs = Wx_plus_b
          else:
              outputs = activation_function(Wx_plus_b)
              tf.summary.histogram(layer_name +'/output',outputs)
          return outputs

###############################################################################

#产生数据
x_data = np.linspace(-1,1,300,dtype=np.float32)[:,np.newaxis]
noise = np.random.normal(0, 0.005,x_data.shape).astype(np.float32)
y_data = np.square(x_data) - 0.5 + noise

#占位符申请变量空间

#使用with tf.name_scope('inputs')可以将xs、ys包含进来，形成一个大的图层，图层的名字就是inputs
with tf.name_scope('inputs'):
    xs = tf.placeholder(tf.float32,[None, 1],name = 'x_input')
    ys = tf.placeholder(tf.float32,[None, 1],name = 'y_input')

###############################################################################

#搭建网络

l1 = add_layer(xs,1,10,n_layer = 1,activation_function=tf.nn.relu)

l2 = add_layer(l1,10,10,n_layer = 2,activation_function=tf.nn.relu)

prediction = add_layer(l2, 10, 1,n_layer = 3, activation_function=None)

#loss区用来看神经网络训练是有效果的.
with tf.name_scope('loss'):
    loss = tf.reduce_mean(tf.reduce_sum(tf.square(ys-prediction),reduction_indices=[1]),
    name='loss')
#观看loss的变化比较重要. 当你的loss呈下降的趋势,说明你的神经网络训练是有效果的.
tf.summary.scalar('loss',loss)

with tf.name_scope('train'):
    train_step = tf.train.GradientDescentOptimizer(0.1).minimize(loss)

###############################################################################
sess = tf.Session()

#打包 tf.merge_all_summaries() 方法会对我们所有的 summaries 合并到一起
merged = tf.summary.merge_all() 
#将框架加载到文件中
writer = tf.summary.FileWriter("logs/",sess.graph)

###############################################################################

sess.run(tf.global_variables_initializer())

#构建图形，用散点图描述真实数据之间的关系
fig = plt.figure()#生成图画框
ax = fig.add_subplot(1,1,1) #
ax.scatter(x_data,y_data)   #用点的形式将真实数据打印出来
plt.ioff()   #用于连续显示

###############################################################################

# 训练

for i in range(1000):
    sess.run(train_step, feed_dict={xs: x_data, ys: y_data})
    if i % 50 == 0:
        #在图表中打印出数据
        rs = sess.run(merged,feed_dict = {xs:x_data,ys:y_data})
        writer.add_summary(rs,i)
        #
        
        #先抹除再打印，ax.lines第一次并未定义
        try:
            ax.lines.remove(lines[0])
        except Exception:
            pass
        prediction_value = sess.run(prediction,feed_dict={xs: x_data})
        lines = ax.plot(x_data,prediction_value,'r-',lw=5)#把训练值用红色宽度为5的线打印出来
        plt.pause(0.1) #暂停0.1秒
        print(sess.run(loss,feed_dict={xs: x_data, ys: y_data}))

###############################################################################
plt.show()  #只show 1次

```

  ####  *生物神经网络*
    通过刺激而产生新的连接,信号通过新的连接传递而形成反馈

   ### 2. 非监督学习(unsupervised learning)     
    有数据,没标签
   ### 3. 半监督学习(semi-supervised learning)
    结合少量有标签样本和大量无标签样本进行学习
   ### 4. 强化学习(reinforcement learning)
    从经验中中总结和提升
   ### 5. 遗传算法(genetic algorithm)
    适者生存,淘汰机制,选择更强的种子
