<!-- Post: Linux Ubuntu 学习笔记 | ID: 2025-025 | Created: 2025-07-20 | Tags: tech | Format: markdown | Source: github.com/Jankin-Bai/ClassNotes -->

# Linux-Ubuntu-Learning
記錄日常解決的問題。
## Ubuntu常见问题解决
  * [Linux学习](http://billie66.github.io/TLCL/book/index.html)
  * [github中README.md文件写法解析](https://blog.csdn.net/u012234115/article/details/41778701)

##### 輸入法		                          2018.5.20.17:46

vim配置文件（用root用戶）

`vim /etc/vim/vimrc
:wq!`
##### ubuntu声音设置

`sudo apt-add-repository ppa:yktooo/ppa`  
`sudo apt-get update`
`sudo apt-get install indicator-sound-switcher`

注销可以免于重启，经常用su模式。
記錄，今天將vim亂碼問題堅決了		                        2018.5.23.20:26
## 开发环境搭建  
### STCmcu在Ubuntu上的开发过程  (vim+sdcc+stcflash)  

##### * 安装sdcc（编译器）  

`sudo apt-get  install sdcc sdcc-doc`

##### * 编写代码  
  
##### * 生成.hex或.bin  

`sdcc main.c && packihx main.ihx > main.hex`  

`sdcc main.c && makebin  -p  main.ihx  main.bin`        2018.6.1.15:40
##### * 烧录到单片机  

 * [stcflash](https://github.com/laborer/stcflash)  
                                                    2018.5.30.10:59
  
  ![](https://raw.githubusercontent.com/Jankin-Bai/Linux-Ubuntu-/master/Screenshot%20from%202018-06-09%2017-22-34.png)

## Linux命令收集
### 增
```
touch : 创建空文件，或者刷新已有文件的时间标签touch filename
echo : 创建带内容的文件 echo 内容 > 文件echo shmily > jirengu
mkdir : 创建文件夹mkdir foldername
```
### 删
```
rm : 删除文件rm filename.txt
-r : 递归的删除文件夹中每一项rm -r jirengu
-f : 忽略不存在的文件rm -fr jirengu
```
### 查
```
pwd : 显示当前路径pwd
ls : 显示文件目录ls
-l : 显示详细信息ls -l
-a : 显示所有的文件（增加一个./和../）ls -la
find： 在指定目录下查找文件 find /foldername -name "filename.txt"
```
### 改
```
cd : 切换目录cd jirengu
cp : 复制文件cp 1.txt 2.txt
-r : 复制文件夹cp -r 2 3
mv : （两个路径都存在）移动，（目标路径不存在）重命名mv 1 2
vim : 使用vim编辑器编辑文件内容vim jirengu.txt
```
