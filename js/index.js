console.log('hello')
var EventCenter = {
    on: function(type, data){
        $(document).on(type,data)
    },
    fire: function(type,data){
        $(document).trigger(type,data)
    }
}

var Footer = {
    init: function(){
        this.$footer = $('footer')
        this.$ul = this.$footer.find('ul')
        this.$box = this.$footer.find('.box')
        this.$leftBtn = this.$footer.find('.icon-left')
        this.$rightBtn = this.$footer.find('.icon-right')
        this.isToEnd = false
        this.isToStart = true
        this.isAnimate = false
        this.bind()
        this.render()
        
    },
 bind: function(){
    var _this = this
    this.$rightBtn.on('click', function(){
      if(_this.isAnimate) return

      var itemWidth = _this.$box.find('li').outerWidth(true)
      var rowCount = Math.floor(_this.$box.width()/itemWidth)
      if(!_this.isToEnd){
        _this.isAnimate = true
        _this.$ul.animate({
          left: '-='+rowCount*itemWidth
        },300,function(){
            // console.log(_this.$ul.css('left'))
            // console.log(_this.$box.width())
            // console.log(_this.$ul.css('width'))
          _this.isAnimate = false
          _this.isToStart = false
          if(parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width')) ){
            _this.isToEnd = true
            
          }
        })
      }
    })

    this.$leftBtn.on('click', function(){
      if(_this.isAnimate) return
      var itemWidth = _this.$box.find('li').outerWidth(true)
      var rowCount = Math.floor(_this.$box.width()/itemWidth)
      if(!_this.isToStart) {
        _this.isAnimate = true
        _this.$ul.animate({
          left: '+='+rowCount*itemWidth
        }, 300,function(){
            console.log(_this.$ul.css('left'))
          _this.isToEnd = false
          _this.isAnimate = false
          if(parseFloat(_this.$ul.css('left')) >= -1 ){
            _this.isToStart = true
          }
        })
      }     
    })

    this.$footer.on('click', 'li', function(){
      $(this).addClass('active')
        .siblings().removeClass('active')

      EventCenter.fire('tracks', {
        tracksId: $(this).attr('data-tracks-id'),
        tracksName: $(this).attr('data-tracks-name'),
        tracksidx: $(this).attr('idx')
      })
      
    //   console.log($(this).attr('idx'))
    })
  },
    render(){
        var _this = this
        $.getJSON('//v1.hitokoto.cn/nm/playlist/5240258960')
            .done(function(ret){
                 console.log(ret)
                _this.renderFooter(ret.playlist)
                
            }).fail(function(){
                console.log('error')
            })
    },
    renderFooter: function(playlist){
        var idx = -1
        var html = ''
        playlist.tracks.forEach(function(tracks){
            idx++
            // console.log(idx)
            html += '<li data-tracks-id='+tracks.id+' data-tracks-name='+tracks.name+' idx='+idx+'>'
                 + '  <div class="cover" style="background-image:url('+tracks.al.picUrl+')"></div>'
                 + '  <h3>'+tracks.name+'</h3>'
                 +'</li>'
            
        })
        
        this.$ul.html(html)
        this.setStyle()
    },
    setStyle: function(){
        var count = this.$footer.find('li').length
        var width = this.$footer.find('li').outerWidth(true)
        // console.log(count,width)
        this.$ul.css({
            width: count*width + 'px'
            
        })
        // console.log(this.$ul.width())
    }
}
var App = {
    init: function(){
        this.playlistId = '1'
        this.playlistName = ''
        this.$container = $('#page-music main')
        this.audio = new Audio()
        this.audio.autoplay = true
        this.currentSong = null
        this.Object = []
        this.clock = null
        this.collections = this.loadFormLocal()
        this.bind()
        EventCenter.fire('plalist-tracks',{
            playlistId: '0',
            playlistName: ''
        })
        
    },
    bind: function(){
        var _this = this
        EventCenter.on('tracks',function(e,tracks){
            _this.tracksId  = tracks.tracksId
            _this.tracksName = tracks.tracksName
            _this.tracksidx = tracks.tracksidx
            // console.log(_this.tracksId)
            _this.loadSong(_this.tracksId)
        })
        this.$container.find('.btn-play').on('click',function(){
            if($(this).hasClass('icon-play')){
                $(this).removeClass('icon-play').addClass('icon-pause')
                _this.audio.play()
                // console.log('pause')
            }else{
                // console.log('play')
                $(this).removeClass('icon-pause').addClass('icon-play')
                _this.audio.pause()
            }
        })
        this.$container.find('.btn-next').on('click',function(){
            _this.loadSong()
            _this.tracksidx++
            console.log(_this.tracksidx)
            
            
        })
        this.audio.addEventListener('play',function(){
            clearInterval(_this.clock)
            _this.clock = setInterval(function(){
                _this.updateState()
                _this.setLyric()
            },1000)
            

        })
        this.audio.addEventListener('pause',function(){
            clearInterval(_this.clock)
            
        })
        this.audio.addEventListener('end',function(){
            _this.loadSong()
        })
        this.$container.find('.btn-collect').on('click',function(){
            var $btn = $(this)
            
            if($(this).hasClass('active')){
                $(this).removeClass('active')
                delete localStorage[_this.tracksId]
            }else{
                $(this).addClass('active') 
                _this.saveToLocal()
                _this.loadCollection()
            }
            
        })
    },
    loadSong: function(){
        var _this = this
        // console.log(this.tracksId)
        if(this.tracksId === '0'){
            _this.loadCollection()
         }else{
            $.getJSON('//v1.hitokoto.cn/nm/url/'+ this.tracksId).done(function(ret){
                //   console.log(ret.data[0].url)
                 _this.play(ret.data[0].url)
            })
        }
    
        
    //     var _this = this
    //     if(this.channelId === '0'){
    //         _this.loadCollection()
    //     }else {
    //         $.getJSON('//v1.hitokoto.cn/nm/playlist/5240258960', {tracks: this.tracksId})
    //             .done(function(ret){
    //                 console.log(ret)
    //                 // _this.play(ret.song[0]||null)
    //     })
    // }
        
        
    },
    loadImg: function(){
        $.getJSON('//v1.hitokoto.cn/nm/detail/'+ this.tracksId).done(function(ret){
            // console.log(ret.songs[0])
             $('.bg').css('background','url('+ret.songs[0].al.picUrl+') center center no-repeat')
             $('.aside>figure').css('background','url('+ret.songs[0].al.picUrl+') center center no-repeat')
             $('.detail h1').text(ret.songs[0].al.name)
             $('.author').text(ret.songs[0].ar[0].name)
        })
        
    },
    loadLyric(){
        var _this = this
        $.getJSON('//v1.hitokoto.cn/nm/lyric/'+ this.tracksId).done(function(ret){
            // console.log(ret.lrc.lyric.split('\n'))
            var lyricObj = {}
            ret.lrc.lyric.split('\n').forEach(function(line){
              var timeArr = line.match(/\d{2}:\d{2}/g)
              if(timeArr){
                timeArr.forEach(function(time){
                  lyricObj[time] = line.replace(/\[.+?\]/g, '')
                })
              }
            })  
            _this.lyricObj = lyricObj
        })
    },
    play: function(url){
        var _this = this
        console.log(this.tracksidx)
        console.log(this.Object)
        if(this.Object.includes(this.tracksidx)){
            $('.btn-collect').addClass('active')
            console.log('true')
        }else{
            $('.btn-collect').removeClass('active') 
            console.log('false')
        }
        this.audio.src = url
        this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
        this.loadImg()
        this.loadLyric()

    },
    updateState: function(){
        var _this = this
        var timeStr = Math.floor(this.audio.currentTime/60)+':'
          + (Math.floor(this.audio.currentTime)%60/100).toFixed(2).substr(2)
        //   console.log(this.audio.currentTime)
          this.$container.find('.current-time').text(timeStr)
          this.$container.find('.bar-progress').css('width', this.audio.currentTime/this.audio.duration * 100 + '%')
          $('.bar').on('click',function(e){
            var percent = e.offsetX / parseInt(getComputedStyle(this).width)
            // console.log(_this.audio.currentTime)
            _this.audio.currentTime = percent * _this.audio.duration
            $('bar-progress').css('width ', percent * 100 + '%')
        })
       
      },
    //   loadLyric: function(sid){
    //     var _this = this
    //     $.getJSON('https://v1.hitokoto.cn/nm/lyric/'+ this.tracksId, {lyric: lyric})
    //       .done(function(ret){

    //       })
    //   },
      setLyric: function(){
        var timeStr = '0'+Math.floor(this.audio.currentTime/60)+':'
          + (Math.floor(this.audio.currentTime)%60/100).toFixed(2).substr(2)
        if(this.lyricObj && this.lyricObj[timeStr]){
         // var styles = ['slideInUp','zoomIn','rollIn', 'rotateIn', 'flipInX','fadeIn', 'bounceIn','swing', 'pulse']
         // var style = styles[Math.floor(Math.random()*styles.length)]
          this.$container.find('.lyric p').text(this.lyricObj[timeStr])
           .boomText()
    
        }
        // console.log(timeStr)
      },
    loadFormLocal: function(){
        return JSON.parse(localStorage[this.tracksidx]||'{}')
    },

    saveToLocal: function(){
        var _this =this
        $.getJSON('//v1.hitokoto.cn/nm/url/'+ this.tracksId).done(function(ret){
            //   console.log(ret.data[0].url)
             localStorage[_this.tracksidx] = JSON.stringify(ret.data[0].url)
             console.log( JSON.stringify(ret.data[0].url))
        })
        
        
    },

    loadCollection: function(){
        var _this = this
        this.Object.push(this.tracksidx)
        // for(i = 0;i<localStorage.length;i++){
        //     this.Object.push(localStorage.setItem(i))
        // }
        console.log(this.tracksidx)
        console.log(this.Object)
         if(this.Object.length === 0) return
         var randomIndex = Math.floor(Math.random()* this.Object.length)
         var randomSid = this.Object[randomIndex]

        // this.play(this.collections[randomSid])
        }     
    }
    $.fn.boomText = function(type){
        type = type || 'fadeIn'
        // console.log(type)
        this.html(function(){
          var arr = $(this).text()
          .split('').map(function(word){
              return '<span class="boomText">'+ word + '</span>'
          })
          return arr.join('')
        })
        
        var index = 0
        var $boomTexts = $(this).find('span')
        var clock = setInterval(function(){
          $boomTexts.eq(index).addClass('animated ' + type)
          index++
          if(index >= $boomTexts.length){
            clearInterval(clock)
          }
        }, 300)
      }
Footer.init()
App.init()
