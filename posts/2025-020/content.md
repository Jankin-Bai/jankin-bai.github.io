### VScode
 
#### vscode原理（居然和Chrome同源）
 

 

> 
基于`Electron`框架，使用`JavaScript`、`Node.js`、`CSS`和`HTML`技术编写。
 1.`Electron`:用于让开发者构建跨平台的桌面应用程序，允许开发者使用 web 技术（`JavaScript、HTML 和 CSS`）来构建跨平台的桌面应用程序。
 2.`Electron`=`Chromium`+`Node.js`。
 3.`Chromium`=`Web`浏览器环境
 4.`Node.js`=在`Electron`中主要用于提供本地系统访问的功能，在`Electron`中可以使用`Node.js`来访问`文件系统、网络服务和其他系统功能`。`Node.js`还可以提供一些`JavaScript模块`，使得开发者可以更加快速地开发应用程序

 

##### Chromium(Chrome开源版)
 
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/ae9f482bba67682cf7235822494eb8b5.png)

 

> 
`Chromium`的架构包括：`内核`（Kernel）、`渲染器`（Renderer）、`多媒体框架`（Multimedia Framework）、`浏览器引擎`（Browser Engine）、`插件`（Plugins）、`数据存储`（Data Storage）以及其他组件。
 1`Kernel`主要负责管理`Chromium`的运行，
 2.`Renderer`负责渲染`HTML和JavaScript`，（**多个进程（页面）**）
 3.`Multimedia Framework`负责提供音频和视频播放功能，
 4.`Browser Engine`负责处理网页请求，（ **主进程** ）
 5.`Plugins`负责为`Chromium`提供插件，
 6.`Data Storage`负责存储数据。

 

##### [node.js](http://dev.nodejs.cn/learn/introduction-to-nodejs):让JavaScript可以运行在wab之外的环境
 
#### 配置文件
 

 
文件名作用settings.jsonIDE编辑器的一些特性c_cpp_properties.jsonc/c++编译器、包含路径等特性compile_commands.json生成编译数据库，快速编译launch.json调试的一些特性tasks.jsongcc编译汇总

##### setting.jesn
 

 

```
{
 "idf.gitPathWin": "c:\\Users\\janki\\esp\\TOOLS\\tools\\idf-git\\2.30.1\\cmd\\git.exe",
 "idf.espIdfPathWin": "C:\\Users\\janki\\esp\\esp-idf",
 "idf.pythonBinPathWin": "C:\\Users\\janki\\esp\\tools\\python_env\\idf4.4_py3.8_env\\Scripts\\python.exe",
 "idf.toolsPathWin": "C:\\Users\\janki\\esp\\tools",
 "idf.customExtraPaths": "C:\\Users\\janki\\esp\\tools\\tools\\xtensa-esp32-elf\\esp-2021r2-patch3-8.4.0\\xtensa-esp32-elf\\bin;C:\\Users\\janki\\esp\\tools\\tools\\xtensa-esp32s2-elf\\esp-2021r2-patch3-8.4.0\\xtensa-esp32s2-elf\\bin;C:\\Users\\janki\\esp\\tools\\tools\\xtensa-esp32s3-elf\\esp-2021r2-patch3-8.4.0\\xtensa-esp32s3-elf\\bin;C:\\Users\\janki\\esp\\tools\\tools\\riscv32-esp-elf\\esp-2021r2-patch3-8.4.0\\riscv32-esp-elf\\bin;C:\\Users\\janki\\esp\\tools\\tools\\esp32ulp-elf\\2.28.51-esp-20191205\\esp32ulp-elf-binutils\\bin;C:\\Users\\janki\\esp\\tools\\tools\\esp32s2ulp-elf\\2.28.51-esp-20191205\\esp32s2ulp-elf-binutils\\bin;C:\\Users\\janki\\esp\\tools\\tools\\cmake\\3.20.3\\bin;C:\\Users\\janki\\esp\\tools\\tools\\openocd-esp32\\v0.11.0-esp32-20211220\\openocd-esp32\\bin;C:\\Users\\janki\\esp\\tools\\tools\\ninja\\1.10.2;C:\\Users\\janki\\esp\\tools\\tools\\idf-exe\\1.0.3;C:\\Users\\janki\\esp\\tools\\tools\\ccache\\4.3\\ccache-4.3-windows-64;C:\\Users\\janki\\esp\\tools\\tools\\dfu-util\\0.9\\dfu-util-0.9-win64",
 "idf.customExtraVars": "{\"OPENOCD_SCRIPTS\":\"C:\\\\Users\\\\janki\\\\esp\\\\tools\\\\tools\\\\openocd-esp32\\\\v0.11.0-esp32-20211220/openocd-esp32/share/openocd/scripts\",\"IDF_CCACHE_ENABLE\":\"1\"}"
}

```
 

#### vscode快捷键万事不求人（Ctrl +K,Ctrl +S）
 
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/c0545ac80089d4e10baa3bc3e00abf58.png)

 
#### vscode修改光标所在行的背景色
 

 

```
 "workbench.colorCustomizations": {
 "editor.lineHighlightBackground": "#008c8c5f",//修改光标所在行的背景色
 "editor.lineHighlightBorder": "#ffffff30" //修改光标所在行的边框色
 }

```
 

#### Generate Doxygen Comments
 

 

```
{
 // Doxygen documentation generator set
 // 文件注释：版权信息模板
 "doxdocgen.file.copyrightTag": [
 "@copyright Copyright (c) {year} XX通信公司"
 ],
 // 文件注释：自定义模块，这里我添加一个修改日志
 "doxdocgen.file.customTag": [
 "@par 修改日志:",
 "",
 "Date Version Author Description",
 "{date} 1.0 wangh 内容",
 "",
 ],
 // 文件注释的组成及其排序
 "doxdocgen.file.fileOrder": [
 "file", // @file
 "brief", // @brief 简介
 "author", // 作者
 "version", // 版本
 "date", // 日期
 "empty", // 空行
 "copyright",// 版权
 "empty",
 "custom" // 自定义
 ],
 // 下面时设置上面标签tag的具体信息
 "doxdocgen.file.fileTemplate": "@file {name}",
 "doxdocgen.file.versionTag": "@version 1.0",
 "doxdocgen.generic.authorEmail": "wanghuan3037@fiberhome.com",
 "doxdocgen.generic.authorName": "wangh",
 "doxdocgen.generic.authorTag": "@author {author} ({email})",
 // 日期格式与模板
 "doxdocgen.generic.dateFormat": "YYYY-MM-DD",
 "doxdocgen.generic.dateTemplate": "@date {date}",
 
 // 根据自动生成的注释模板（目前主要体现在函数注释上）
 "doxdocgen.generic.order": [
 "brief",
 "tparam",
 "param",
 "return"
 ],
 "doxdocgen.generic.paramTemplate": "@param{indent:8}{param}{indent:25}My Param doc",
 "doxdocgen.generic.returnTemplate": "@return {type} ",
 "doxdocgen.generic.splitCasingSmartText": true,
}

```
 

> 
当在文件头部输入 `/**`后回车、在函数上面 `/**` 后回车

 

```
/**
 * @brief @param @return @author @date @version是代码书写的一种规范
 * @brief ：简介，简单介绍函数作用
 * @param ：介绍函数参数
 * @return：函数返回类型说明
 * @exception NSException 可能抛出的异常.
 * @author zhangsan： 作者
 * @date 2011-07-27 22:30:00 ：时间
 * @version 1.0 ：版本 
 * @property ：属性介绍
 * */

```
 

#### 让Arduino或者其他三方库可以在vscode中自由穿行
 

 

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/e1cc5754bb764e0993a7792decbd0971.png)

 

```
"C_Cpp.default.includePath": [
 "C:\\Users\\admin\\AppData\\Local\\Arduino15\\**",
 "C:\\Users\\admin\\Documents\\Arduino\\libraries\\**"
]

```
 

#### Terminal中文乱码问题
 

 

```
"terminal.integrated.profiles.windows": {
 "PowerShell": {
 "source": "PowerShell",
 "icon": "terminal-powershell"
 },
 "Command Prompt": {
 "path": [
 "${env:windir}\\Sysnative\\cmd.exe",
 "${env:windir}\\System32\\cmd.exe"
 ],
 "args": [
 "/K",
 "chcp 65001" //936 :gb2312 ,65001:utf-8
 ],
 "icon": "terminal-cmd"
 },
 "Git Bash": {
 "source": "Git Bash"
 }

```
 

参考：[VSCode终端和Windows Terminal中文UTF-8乱码解决方案](http://t.csdn.cn/mxbG2)
 

#### 标签换行
 

 

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/91b46ce7915c5cca54fff2d0c5099c0d.png)

 

```
 workbench.editor.wrapTabs

```
 

#### Outline Map
 

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/fe64d2079b8a7ae350c390e9f1836de8.png)

 
#### GitLens
 

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/3e0e5bb3093a8f7e232f5e4d5d9a6b9e.png)

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/16eb134afb326814c99db635caeb7f35.png)

 
#### GNU Linker Map files
 

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/6697ebad9bd9f3aa76dc3bbaa710c3a3.png)

 
#### Hex Editor
 

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/dc2925f8ea8f69672d5c0af10691f378.png)

 
#### LinkerScript
 

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/bb3f821c8ac6e71240eabea0c50fff90.png)

 
#### highlight words
 

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/2fd21279c2c2f5e29509a1d609e90b3e.png)

 
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/948250cf157142e5e4c22c70d2287978.png)

 
#### Bookmarks
 

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/2593499045284e349096935fb193e926.png)

 

 

可以对代码行进行标记，对标记的行进行跳转
 
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/a2637d9d1005436cb281a8e5badbe71e.png)

 

#### Blockman
 
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/d7792d3438e04c0081bce5b38dda2ba3.png)

 效果如下，可以将代码层次结构显示出来
 
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/dd414c043d564caca84a106a180e4dbb.png)

### WinMerge（windows中BeyondCompare代替）
 [官网：https://winmerge.org](https://winmerge.org/) 👈
 
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/cb2bc446750d4763adce4fe72842e3e3.png)

 
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/c98236f72544444faa440c6fffd16193.png)

 

### Ghidra
 

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/cecccf9b5c6643e2809cbcd6d475cf63.png)

 由NSA发布的类似于IDA的软件基于Java
 参考👉[NSA开源逆向工具Ghidra入门使用教程](https://www.secrss.com/articles/8829)
 笔者学习汇编时开发一个插件在：[Ghidra comment add script](https://blog.csdn.net/sinat_36912383/article/details/140409236?fromshare=blogdetail&sharetype=blogdetail&sharerId=140409236&sharerefer=PC&sharesource=sinat_36912383&sharefrom=from_link)
 

### Snipaste
 
[👉](https://zh.snipaste.com/)
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/9a07a5bdc519470a96ac2f4553e4cb25.png)
：`F1`截图，`F3`贴图
 
### Windows系统在鼠标右键添加CMD命令
 
#### 1.手动方式添加
 
 
##### a.WIN+R，输入regedit，
 依次展开HKEY_CLASSES_ROOT\DesktopBackground\Shell\cmd，添加cmd项，修改默认值为 cmd.exe /s /k pushd “%V”
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/32ebc30fbd3b493094c3f92a731f43e6.png)

##### b.右键目录时菜单显示进入命令行选项
 依次展开 HKEY_CLASSES_ROOT\Directory\shell\cmd\command,添加cmd-command，修改默认值
 
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/e6d427c6ca1840cbb754dbff2ff0f517.png)

 
#### 2.脚本方式添加
 
 
##### 基础版
 

 
添加CMD到右键菜单脚本
 准备context-batch.bat、运行to_Right_Click_menu.reg
 
```
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\*\shell\Run script]
@="&Run Script"

[HKEY_CLASSES_ROOT\*\shell\Run script\command]
@="\"H:\\BATCH_FILE_PATH\\context-batch.bat\" \"%1\""

```
 
参考:[Windows: How to add batch-script action to Right Click menu](https://superuser.com/questions/444726/windows-how-to-add-batch-script-action-to-right-click-menu)
 
 
##### 层级式
 

 

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/dfba92ff98064e35895e822942932494.png)

 
```
 #########################
 ### Registry file text follows ###
 #########################
 Windows Registry Editor Version 5.00
 ; Created by: jschlie70
 ; Created on: 2023-12-26
 
 [HKEY_CLASSES_ROOT\Directory\shell\CmdShell]
 "ExtendedSubCommandsKey"="Directory\\ContextMenus\\CmdShell"
 "Icon"="C:\\Windows\\System32\\cmd.exe"
 "MUIVerb"="&CMD"

 [HKEY_CLASSES_ROOT\Directory\ContextMenus\CmdShell]

 [HKEY_CLASSES_ROOT\Directory\ContextMenus\CmdShell\shell]

 [HKEY_CLASSES_ROOT\Directory\ContextMenus\CmdShell\shell\opencmd]
 "Icon"="C:\\Windows\\System32\\cmd.exe"
 "MUIVerb"="Open &Here"

 [HKEY_CLASSES_ROOT\Directory\ContextMenus\CmdShell\shell\opencmd\command]
 @="cmd.exe /s /k pushd "%V""

 [HKEY_CLASSES_ROOT\Directory\ContextMenus\CmdShell\shell\runas]
 "HasLUAShield"=""
 "Icon"="C:\\Windows\\System32\\cmd.exe"
 "MUIVerb"="Open here as &Administrator"

 [HKEY_CLASSES_ROOT\Directory\ContextMenus\CmdShell\shell\runas\command]
 @="cmd.exe /s /k pushd "%V""

 [HKEY_CLASSES_ROOT\Drive\shell\CmdShell]
 "ExtendedSubCommandsKey"="Directory\\ContextMenus\\CmdShell"
 "Icon"="C:\\Windows\\System32\\cmd.exe"
 "MUIVerb"="&CMD"

```
 
参考：[Add CMD Sub-Menu to Context Menu - With Run as Administrator
 ](https://www.tenforums.com/customization/210043-add-cmd-sub-menu-context-menu-run-administrator.html)
 
 
##### 作用域
 
添加到 Windows 注册表：
 
 对于文件夹上下文菜单：（在资源管理器窗口中右键单击文件夹）
```
powershell -WindowStyle Hidden "start cmd \"/k cd /d %1\" -v runAs"

```
 
- 对于背景上下文菜单：（右键单击资源管理器窗口的背景）：
```
powershell -WindowStyle Hidden "start cmd \"/k cd /d %V\" -v runAs"

```
 
- 对于文件上下文菜单：（在资源管理器窗口中右键单击文件）：
```
powershell -WindowStyle Hidden "start cmd \"/k cd /d %w\" -v runAs"

```
 

 
参考：[Which special variables are available when writing a shell command for a context menu](https://stackoverflow.com/questions/49404561/hotkey-to-open-cmd-with-administration-rights-in-current-folder-from-explorer)
 - 
##### 变量(一)
 
`I`每次尝试都返回一组不同的数字。`H`始终为 0，`S`始终为 1。`D`、`L`和`V`均为目标文件夹。`W`是目标文件夹的父文件夹。```是分隔符.
 
```
 [HKEY_CLASSES_ROOT\Directory\shell\testcmd]
 @="Test Command Window Directory"
 [HKEY_CLASSES_ROOT\Directory\shell\testcmd\command]
 @="cmd.exe /k \"echo %A`%B`%C`%D`%E`%F`%G`%H`%I`%J`%K`%L`%M`%N`%O`%P`%Q`%R`%S`%T`%U`%V`%W`%X`%Y`%Z\""

```
 
在`C:\iso`下执行的结果：
 
```
D = C:\iso
H = 0
I = :115057472:7932
L = C:\iso
S = 1
V = C:\iso
W = C:\

```
 
?:Did you right click in the folder, or on the folder?
 【您是在文件夹中单击鼠标右键，还是在文件夹上单击鼠标右键？】
 【`%V`如果您想要目录名称，则应该使用它，即当您单击背景时想要在上下文菜单上添加命令，而不是在单个文件或目录名称上添加命令。`%L`在这种情况下将不起作用。】
 参考：[Which special variables are available when writing a shell command for a context menu](https://superuser.com/questions/136838/which-special-variables-are-available-when-writing-a-shell-command-for-a-context)
 
##### 变量(二)
 
other command line variables
 // %* - replace with all parameters
 // %~ - replace with all parmaters starting with and following the second parameter
 // %0 or %1 the first file parameter. For example “C:\Users\Eric\Destop\New Text Document.txt”. Generally this should be in quotes and the applications command line parsing should accept quotes to disambiguate files with spaces in the name and different command line parameters (this is a security best practice and I believe mentioned in MSDN).
 // % (where N is 2 - 9), replace with the nth parameter
 // %s – show command
 // %h – hotkey value
 // %i – IDList stored in a shared memory handle is passed here.
 // %l – long file name form of the first parameter. Note win32 applications will be passed the long file name, win16 applications get the short file name. Specifying %L is preferred as it avoids the need to probe for the application type.
 // %d – desktop absolute parsing name of the first parameter (for items that don’t have file system paths)
 // %v – for verbs that are none implies all, if there is no parameter passed this is the working directory【空点背景时获取工作目录？】
 // %w – the working directory
 参考：
 [Extending Shortcut Menus](https://web.archive.org/web/20111002101214/http://msdn.microsoft.com/en-us/library/windows/desktop/cc144101%28v=vs.85%29.aspx)
 [Windows NT 4/Windows 2000 Syntax](https://www.robvanderwoude.com/ntstart.php)
 
 

### 常用unix命令
 

- 统计头文件中的函数在目标路径中被调用次数并排序
```
grep -oP '\w+\s+\**\K\w+(?=\s*\()' 头文件路径 | xargs -I {} sh -c 'echo -n "{}: "; grep -Rw {} 目标路径 | wc -l' | sort -t: -k2,2n

```
 用于找到合适的函数去加上被调用处的flag

 

### grep + xargs 用法详解：函数引用统计器
 

该命令组合实现以下功能：
 

> 
**提取头文件中的所有函数名，并统计它们在指定路径中被调用的次数，最后按调用次数升序排序。**

 

---
 

#### 🧩 完整命令结构
 

```
grep -oP '\\w+\\s+\\**\\K\\w+(?=\\s*\\()' 头文件路径 \\
| xargs -I {} sh -c 'echo -n "{}: "; grep -Rw {} 目标路径 | wc -l' \\
| sort -t: -k2,2n

```
 

---
 

#### 🧠 各部分详解
 

##### grep -oP
 
参数 / 表达式含义`-o`仅输出匹配内容，而非整行`-P`启用 Perl 正则（支持高级语法）`\\w+\\s+\\**`匹配函数返回类型（如 `int *`）`\\K`清除之前匹配的内容，从这里开始保留`\\w+`匹配函数名本身`(?=\\s*\\()`正向预查：后面是 `(`，但不包含在结果中

##### ✅ 结果：提取出头文件中所有函数名。
 

---
 

##### xargs -I {}
 

```
xargs -I {} sh -c 'echo -n "{}: "; grep -Rw {} 目标路径 | wc -l'

```
 
部分说明`xargs -I {}`对每个函数名，执行一次包含 `{}` 的命令`sh -c '...'`调用 shell 子命令`echo -n "{}: "`打印函数名，不换行`grep -Rw {}`在目标路径中递归搜索函数名`-R`递归搜索目录`-w`精确匹配整词，避免误匹配`wc -l`统计匹配行数，即调用次数

---
 

##### >sort 排序
 

```
| sort -t: -k2,2n

```
 
参数说明`-t:`使用冒号作为字段分隔符`-k2,2n`对第 2 列（数字）进行**数值升序排序**

---
 

### grep
 

#### 常用参数
 
编号命令语法功能说明示例1`grep "关键词" 文件`基本搜索`grep "error" log.txt`2`grep -i "关键词" 文件`忽略大小写`grep -i "warning" log.txt`3`grep -n "关键词" 文件`显示行号`grep -n "TODO" main.c`4`grep -r "关键词" 目录`递归查找`grep -r "config" ./etc`5`grep -v "关键词" 文件`排除匹配内容`grep -v "DEBUG" log.txt`6`grep -E "正则表达式" 文件`使用扩展正则`grep -E "warn|error" log.txt`7`grep -l "关键词" 文件*`列出匹配文件名`grep -l "main" *.c`8`grep -L "关键词" 文件*`列出不含关键词的文件`grep -L "main" *.c`9`grep -c "关键词" 文件`统计匹配行数`grep -c "error" log.txt`10`grep --color=auto "关键词" 文件`高亮匹配内容`grep --color=auto "failed" log.txt`11`grep -w "关键词" 文件`精确匹配整个单词`grep -w "init" code.c`12`grep -A N "关键词" 文件`匹配行及后N行`grep -A 3 "error" log.txt`13`grep -B N "关键词" 文件`匹配行及前N行`grep -B 2 "failed" log.txt`14`grep -C N "关键词" 文件`匹配行及前后N行`grep -C 2 "404" access.log`15`grep "^关键词" 文件`匹配以关键词开头的行`grep "^ERROR" log.txt`16`grep "关键词$" 文件`匹配以关键词结尾的行`grep "done$" job.log`17`ps aux |grep "关键词"`查找进程名`ps aux | grep nginx`18`dmesg | grep -i "usb"`查找内核日志`dmesg | grep -i usb`19`grep -e "关键词1" -e "关键词2"`多关键词匹配`grep -e "err" -e "fail" log.txt`20`cat 文件 | grep "关键词"`管道组合使用`cat log.txt | grep "timeout"`

 
 

### awk
 

#### 常用参数
 
编号命令语法功能说明示例1`awk '{print $1}' 文件`打印第一列`awk '{print $1}' data.txt`2`awk '{print $1, $3}' 文件`打印第1和第3列`awk '{print $1, $3}' data.txt`3`awk -F ":" '{print $1}' 文件`自定义分隔符`awk -F ":" '{print $1}' /etc/passwd`4`awk 'NR==1' 文件`打印第一行`awk 'NR==1' data.txt`5`awk 'NR>1' 文件`跳过第一行`awk 'NR>1' data.csv`6`awk '{sum += $1} END {print sum}' 文件`求第一列的总和`awk '{sum+=$1} END {print sum}' data.txt`7`awk '{if ($2 > 90) print $1, $2}' 文件`条件判断`awk '{if ($2 > 90) print $1, $2}' scores.txt`8`awk '$2 > 90' 文件`条件简写形式`awk '$2 > 90' scores.txt`9`awk 'BEGIN {print "Header"} {print $1} END {print "Done"}' 文件`添加开始和结尾处理`awk 'BEGIN{print "Start"} {print $1} END{print "End"}' file.txt`10`awk '{print NR, $0}' 文件`打印行号和整行内容`awk '{print NR, $0}' data.txt`11`awk '!a[$0]++' 文件`去重输出`awk '!a[$0]++' data.txt`12`awk '{count[$1]++} END{for(i in count) print i, count[i]}' 文件`统计第一列出现频次`awk '{count[$1]++} END{for(i in count) print i, count[i]}' data.txt`13`awk 'length($0) > 20' 文件`输出长度大于20的行`awk 'length($0) > 20' file.txt`14`awk '$1 ~ /正则/' 文件`匹配正则`awk '$1 ~ /abc/' data.txt`15`awk '$1 !~ /正则/' 文件`反向正则匹配`awk '$1 !~ /abc/' data.txt`16`awk '{gsub("旧","新"); print}' 文件`全文替换`awk '{gsub("foo","bar"); print}' data.txt`17`awk 'NR%2==1' 文件`打印奇数行`awk 'NR%2==1' data.txt`18`awk 'NR%2==0' 文件`打印偶数行`awk 'NR%2==0' data.txt`19`awk 'NF > 0' 文件`跳过空行`awk 'NF > 0' data.txt`20`awk '{print tolower($0)}' 文件`转为小写输出`awk '{print tolower($0)}' data.txt`

#### 一、核心变量：`NF` 和 `NR`
 
变量含义示例`NF`Number of Fields（字段数）当前行的字段总数（根据分隔符）`NR`Number of Records（记录数）当前处理的是第几行（全局行号）`$0`整行内容当前整行字符串`$1` ~ `$NF`各字段内容第1个字段到最后字段

示例：
 

```
# 文件内容（data.txt）：
apple red 100
banana yellow 200

awk '{print NR, NF, $1, $NF}' data.txt

```
 

输出：
 

```
1 3 apple 100
2 3 banana 200

```
 

---
 

#### 二、执行流程（3阶段）
 

 
 

##### 示例：
 

```
awk 'BEGIN{print "Start"} {print $1} END{print "Done"}' data.txt

```
 

执行顺序：
 

- 输出 `Start`
- 对每行执行 `{print $1}`
- 全部处理完后输出 `Done`

 

---
 

#### 三、awk 的底层逻辑
 

##### 1. 输入分割：
 

默认按空格（或 TAB）分割行成字段，可用 `-F` 指定其他分隔符：
 

```
awk -F ":" '{print $1}' /etc/passwd

```
 

##### 2. 模式匹配：
 

每一行先与 `模式` 匹配，匹配成功才执行 `{动作}`：
 

```
awk '$3 > 80 {print $1, $3}' scores.txt

```
 

##### 3. 模式为空时默认匹配所有行：
 

```
awk '{print $1}' file.txt

```
 

等价于：
 

```
awk '1 {print $1}' file.txt

```
 

##### 4. 内置函数丰富：
 

- `length()`：字符串长度
- `gsub("a", "b")`：替换
- `tolower()` / `toupper()`：大小写转换
- `substr()`：子串
- `match()`：正则匹配位置

 

---
 

#### 四、常用结构块
 
构造用法示例`BEGIN {}`程序开始前执行初始化变量、打印表头等`{}`对每行执行`awk '{print $1}'``END {}`程序结束后执行累计、平均值统计输出条件判断if / else / 三元表达式`awk '{if ($3>100) print $1}'`正则匹配`$1 ~ /abc/`匹配包含 abc 的第1字段正则不匹配`$1 !~ /abc/`不包含 abc 的行

---
 

### sed
 

`sed` 是一种强大的流编辑器，适用于文本替换、插入、删除、打印等操作。
 

---
 

#### 常用参数
 
编号命令含义说明1️⃣`sed 's/foo/bar/' file`将每行第一个 `foo` 替换为 `bar`2️⃣`sed 's/foo/bar/g' file`将每行所有 `foo` 替换为 `bar`3️⃣`sed '2s/foo/bar/' file`仅替换第2行中的第一个 `foo`4️⃣`sed -n '2p' file`仅打印第2行5️⃣`sed -n '2,4p' file`打印第2到4行6️⃣`sed -n '/pattern/p' file`匹配 pattern 的行才打印7️⃣`sed '/pattern/d' file`删除匹配 pattern 的行8️⃣`sed '1d' file`删除第一行9️⃣`sed '$d' file`删除最后一行🔟`sed '/^$/d' file`删除所有空行1️⃣1️⃣`sed 's/[0-9]//g' file`删除所有数字1️⃣2️⃣`sed 's/^[ \t]*//' file`删除每行前导空格或 tab1️⃣3️⃣`sed 's/[ \t]*$//' file`删除每行尾部空格1️⃣4️⃣`sed -i 's/foo/bar/g' file`原地修改文件内容（慎用）1️⃣5️⃣`sed '3i\new line' file`在第3行前插入一行1️⃣6️⃣`sed '3a\append line' file`在第3行后追加一行1️⃣7️⃣`sed '3c\changed line' file`替换第3行为指定内容1️⃣8️⃣`sed -n '1~2p' file`每隔一行打印（从第1行开始）1️⃣9️⃣`sed -e 's/a/A/g' -e 's/b/B/g' file`连续执行多个替换命令2️⃣0️⃣`sed ':a;N;$!ba;s/\n/ /g' file`把所有行合并为一行（删除换行符）

---
 

 
 

#### 使用建议
 

- 🧪 调试时先不要加 `-i`，确保输出正确后再修改原文件。
- 🧵 多个 `-e` 可组合使用，也可写入脚本文件中批处理。
- 💡 可结合 `find`/`xargs` 批量处理多个文件。

 

---
 

### xargs
 
编号命令说明1`echo 'a b c' | xargs`将空格分隔的字符串传递给命令2`ls *.log | xargs rm`批量删除所有 `.log` 文件3`find . -type f | xargs wc -l`统计所有文件的行数4`find . -name "*.txt" | xargs grep "TODO"`查找包含 “TODO” 的 `.txt` 文件5`find . -type f -print0 | xargs -0 rm`安全删除包含空格的文件6`cat filelist.txt | xargs md5sum`批量计算文件 MD5 值7`cat files.txt | xargs -n 1 cp -t /tmp/`每次复制一个文件到目标目录8`seq 1 5 | xargs -n 1 echo Line`每行加上前缀 Line9`echo file1 file2 | xargs -n 1 basename`提取文件名（去路径）10`cat urls.txt | xargs -n 1 curl -O`批量下载文件11`cat list.txt | xargs -I {} echo "File is {}"`使用占位符 {} 替换输入12`find . -name "*.c" | xargs -n 2 echo`每次输出 2 个 `.c` 文件名13`cat files.txt | xargs -I {} mv {} {}.bak`批量添加 `.bak` 后缀14`echo 'a b c' | xargs -d ' '`指定空格为分隔符15`ls | xargs -I {} sh -c 'echo {} \&\& wc -l {}'`每个文件统计行数16`grep -rl "error" . | xargs sed -i 's/error/ERROR/g'`替换匹配内容为大写17`cat paths.txt | xargs -P 4 -n 1 cp -t backup/`多进程并发复制文件18`cat biglist.txt | xargs -L 10 echo`每 10 行一组处理一次19`find . -name "*.log" | xargs -r rm`输入为空时不执行命令（安全）20`find . -name "*.zip" | xargs -n 1 unzip`批量解压 `.zip` 文件

---
 

#### 常用参数
 
参数含义`-n N`每次传递 N 个参数给目标命令`-d CHAR`指定输入的分隔符`-I {}`自定义占位符模板`-0`输入为 null 分隔（与 `-print0` 配合）`-P N`并行执行 N 个进程`-r`无输入则不执行命令（防误删）`-L N`每 N 行输入组成一组

#### xargs 的体系与底层逻辑详解
 

`xargs` 是 Unix/Linux 下用于构建参数列表并传递给其他命令的工具，尤其适用于标准输入与命令行参数之间的桥接。
 

---
 

#### 一、xargs 的核心作用
 

> 
**将标准输入转为命令参数**，解决命令行参数数量限制问题。

 

通常与 `find`、`echo`、`cat` 等命令搭配，用于批量执行操作。
 

---
 

#### 二、xargs 的执行模型
 

 
 

##### 工作流程
 

- **读取标准输入（stdin）**
- **按照空格（或指定分隔符）将输入切分为参数**
- **每次提取 `-n` 个参数拼接到目标命令后**
- **执行命令，重复直到耗尽输入**

 

例如：
 

```
echo "a b c d" | xargs -n 2 echo

```
 

执行过程等价于：
 

```
echo a b
echo c d

```
 

---
 

#### 三、核心参数控制逻辑
 
参数作用举例`-n N`每次传递 N 个参数`xargs -n 2``-d DELIM`指定分隔符`xargs -d '\n'``-0`支持 null 分隔（与 `find -print0` 配合）`xargs -0``-I {}`使用占位符 {} 指定参数插入位置`xargs -I {}``-P N`并发执行 N 个子进程`xargs -P 4``-r`输入为空时不执行命令`xargs -r``-L N`每 N 行作为一组输入`xargs -L 3`

---
 

#### 四、系统限制的解决方案
 

##### 传统 shell 的问题：
 

```
rm file1 file2 ... file9999999 # 参数列表过长，"Argument list too long"

```
 

##### xargs 的解决：
 

```
find . -name "*.log" | xargs rm

```
 

xargs 会自动**分批传参**，避开系统参数限制（如 ARG_MAX）。
 

---
 

#### 五、常见安全风险与对策
 
风险示例安全方案空格或特殊字符文件名`my file.txt`使用 `-0` 搭配 `find -print0`输入为空误删`xargs rm`加上 `-r`命令中需要特定格式`mv a b`使用 `-I {}` 替换占位符

示例：
 

```
find . -type f -print0 | xargs -0 rm -f # 安全删除
cat files.txt | xargs -I {} cp {} {}.bak # 批量备份

```
 

---
 

#### 七、与管道符号区别（与 `xargs` 的关系）
 
特性管道 `|``xargs`用法连接两个命令将输出当作参数缺点无法应对参数限制可自动分批、并发示例`cat a.txt | grep foo``cat a.txt | xargs grep`

---
 

#### 八、延伸资源
 

- 官方文档：[https://man7.org/linux/man-pages/man1/xargs.1.html](https://man7.org/linux/man-pages/man1/xargs.1.html)
- ARG_MAX 限制解释：[https://unix.stackexchange.com/a/120642](https://unix.stackexchange.com/a/120642)
- xargs vs. for vs. while：[https://unix.stackexchange.com/questions/103920](https://unix.stackexchange.com/questions/103920)

 

### Regex Basics
 

#### 常用参数
 
序号表达式说明1`.`匹配任意一个字符（换行符除外）2`^`匹配行首3`$`匹配行尾4`*`匹配前面的字符零次或多次5`+`匹配前面的字符一次或多次6`?`匹配前面的字符零次或一次7`{n}`匹配前面的字符刚好 n 次8`{n,}`匹配前面的字符至少 n 次9`{n,m}`匹配前面的字符 n 到 m 次10`[...]`匹配括号内的任意一个字符11`[^...]`匹配不在括号内的任意字符12`|`或操作，例如 `cat|dog` 匹配 cat 或 dog13`(pattern)`分组，捕获组14`(?:...)`分组但不捕获15`\d`匹配数字，等价于 `[0-9]`16`\D`匹配非数字17`\w`匹配字母/数字/下划线，等价于 `[A-Za-z0-9_]`18`\W`匹配非 `\w` 的字符19`\s`匹配空白字符（空格、Tab、换行）20`\S`匹配非空白字符

---
 

#### 正则表达式执行逻辑流程图（Mermaid）
 

 
 

### Mermaid Flowchart
 

#### Mermaid `flowchart` 语法速查表
 
语法结构说明示例`st=>start: 文本`定义一个开始节点`st=>start: 开始``e=>end: 文本`定义一个结束节点`e=>end: 结束``op=>operation: 文本`定义一个操作节点`op=>operation: 处理数据``cond=>condition: 条件?`定义条件判断节点`cond=>condition: 是否继续？``st->op`节点之间的连接箭头从开始节点连接到操作节点`cond(yes)->op`条件判断的“是”路径条件成立时走的路径`cond(no)->e`条件判断的“否”路径条件不成立时跳转到结束

---
 

#### 通用结构示例（最小流程模板）
 

```
```mermaid
flowchat
st=>start: 开始
op=>operation: 执行操作
cond=>condition: 判断是否继续？
e=>end: 结束

st->op->cond
cond(yes)->e
cond(no)->op
```

```
 

---
 

#### 节点类型与样式说明
 
节点类型Mermaid 定义符号图形渲染样式`start``st=>start: 文本`圆角矩形`end``e=>end: 文本`圆角矩形`operation``op=>operation: 文本`长方形`condition``cond=>condition: 文本`菱形判断

---
 

#### 高级技巧建议（可选）
 
用法说明示例`op(left)->next`设置箭头方向为从左连接`cond(no,left)->retry``subgraph`分组多个节点（支持 TD/LR）`subgraph loop\nop->op2\nend``linkStyle`, `style`自定义线条颜色和样式`linkStyle 0 stroke:red,stroke-width:2px`

---
 

#### 推荐结构套模板
 

```
```mermaid
flowchat
st=>start: 程序启动
parse=>operation: 解析命令参数
exec=>operation: 执行核心操作
cond=>condition: 是否成功？
ok=>operation: 输出成功结果
fail=>operation: 错误处理
e=>end: 结束

st->parse->exec->cond
cond(yes)->ok->e
cond(no)->fail->e
```

```
 

---
