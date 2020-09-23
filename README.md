# ClickMusic

##功能介绍
可点击切换音乐
切换的同时改变背景图片

下半部分可实现水平排列的音乐列表
点击可以实现滚动

实现暂停和收藏的功能

实现播放的时候可以拖动的进度条

实现歌词的有样式的出现

##项目技术介绍
音乐api 的学习： 问题：项目之前的api已经失效了 找到了新的api（但是实在是不好用，导致无法实现自动轮播歌曲） nodejs学习之后再来改进

页面的布局(vh的使用)

css 的使用

自定义函数的使用
```
var EventCenter = {
    on: function(type, data){
        $(document).on(type,data)
    },
    fire: function(type,data){
        $(document).trigger(type,data)
    }
}
```
localStorage的使用（后端暂时不会，但是能实现差不多的效果）

歌词的动态效果animatecss

## 遇到的困难和收获
api失效
代码的调试（console.log()）


##技术栈关键字
jQuery、CSS3、响应式、animatecss(https://animate.style)