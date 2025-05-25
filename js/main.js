//弹窗样式
iziToast.settings({
    timeout: 10000,
    progressBar: false,
    close: false,
    closeOnEscape: true,
    position: 'topCenter',
    transitionIn: 'bounceInDown',
    transitionOut: 'flipOutX',
    displayMode: 'replace',
    layout: '1',
    backgroundColor: '#00000040',
    titleColor: '#efefef',
    messageColor: '#efefef',
    iconColor: '#efefef',
});

//加载完成后执行
window.addEventListener('load', function () {

    //载入动画
    $('#loading-box').attr('class', 'loaded');
    $('#bg').css("cssText", "transform: scale(1);filter: blur(0px);transition: ease 1.5s;");
    $('.cover').css("cssText", "opacity: 1;transition: ease 1.5s;");
    $('#section').css("cssText", "transform: scale(1) !important;opacity: 1 !important;filter: blur(0px) !important");

    //用户欢迎
    setTimeout(function () {
        iziToast.show({
            timeout: 2500,
            title: hello,
            message: '欢迎来到我的主页'
        });
    }, 800);
}, false)

setTimeout(function () {
    $('#loading-text').html("字体及文件加载可能需要一定时间")
}, 3000);

//延迟加载音乐播放器
function downloadJSAtOnload() {
    var element = document.createElement("script");
    element.src = "./js/music.js";
    document.body.appendChild(element);
}
if (window.addEventListener)
    window.addEventListener("load", downloadJSAtOnload, false);
else if (window.attachEvent)
    window.attachEvent("onload", downloadJSAtOnload);
else window.onload = downloadJSAtOnload;

//新春灯笼 （ 需要时取消注释 ）
/*
new_element=document.createElement("link");
new_element.setAttribute("rel","stylesheet");
new_element.setAttribute("type","text/css");
new_element.setAttribute("href","./css/lantern.css");
document.body.appendChild(new_element);

new_element=document.createElement("script");
new_element.setAttribute("type","text/javascript");
new_element.setAttribute("src","./js/lantern.js");
document.body.appendChild(new_element);
*/

//火狐浏览器独立样式
if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.href = './css/firefox.css';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    head.appendChild(link);
    window.addEventListener('load', function () {
        iziToast.show({
            timeout: 8000,
            iconUrl: './img/icon/warn.png',
            message: '您正在使用火狐浏览器，部分功能可能不支持'
        });
    }, false)
}

//获取一言
fetch('https://v1.hitokoto.cn?max_length=24')
    .then(response => response.json())
    .then(data => {
        $('#hitokoto_text').html(data.hitokoto)
        $('#from_text').html(data.from)
    })
    .catch(console.error)

//获取天气
// ==================== 天气配置区域 ====================
const AMapKey = '0113a13c88697dcea6a445584d535837'; // 必须填写
const LOC_CONFIG = {
  myhkw: {
    enable: 'on',  // on|off
    key: 'your_myhkw_key'
  },
  vore: 'on'       // 启用vore备用服务 on|off
};
// ================================================

async function getLocation() {
  // 高德定位（主用）
  try {
    const locRes = await fetch(`https://restapi.amap.com/v3/ip?key=${AMapKey}`);
    const locData = await locRes.json();
    
    if (locData.status === '1') {
      // 新增：优先保留香港/澳门关键词
      const city = locData.city
        .replace(/特别行政区/g, '')  // 仅去除"特别行政区"
        .replace(/市$/, '')          // 去除末尾的"市"
        .trim();
      return { city, isChina: true, adcode: locData.adcode };
    }
    throw new Error('高德定位失败');
  } catch (e) {
    return await getBackupLocation();
  }
}

async function getBackupLocation() {
  // Myhkw定位（备用）
  if (LOC_CONFIG.myhkw.enable === 'on' && LOC_CONFIG.myhkw.key) {
    try {
      const ipRes = await fetch(`https://myhkw.cn/open/ip?key=${LOC_CONFIG.myhkw.key}`);
      const textData = await ipRes.text();
      
      try {
        const jsonData = JSON.parse(textData);
        if (jsonData.code === 1) {
          const isChina = jsonData.data.country === "中国";
          // 新增：保留港澳关键词
          const city = (jsonData.data.city || jsonData.data.province)
            .replace(/特别行政区/g, '')
            .replace(/市$/, '');
          return { city, isChina };
        }
      } catch {
        const isChina = textData.includes('中国');
        const cityMatch = textData.match(/中国(.*?省)?([\u4e00-\u9fa5]+市)/);
        const city = cityMatch ? 
          cityMatch[2].replace(/特别行政区/g, '').replace(/市$/, '') : 
          textData.split(' ')[0];
        return { city, isChina };
      }
    } catch {}
  }

  // Vore定位（备用）
  if (LOC_CONFIG.vore === 'on') {
    try {
      const voreRes = await fetch('https://api.vore.top/api/IPdata?ip=');
      const voreData = await voreRes.json();
      const isChina = voreData.ipinfo.cnip;
      // 新增：保留港澳关键词
      const city = isChina ? 
        voreData.ipdata.info2
          .replace(/特别行政区/g, '')
          .replace(/市$/, '') : 
        voreData.ipdata.info1;
      return { city, isChina };
    } catch {}
  }

  return { city: '北京', isChina: true }; // 最终回退
}

async function getWeather() {
  const location = await getLocation();
  
  // 香港/澳门关键词修复
  let displayCity = location.city;
  if (location.city.includes('香港')) displayCity = '香港';
  if (location.city.includes('澳门')) displayCity = '澳门';

  // 国外处理
  if (!location.isChina) {
    $('#city_text').html(displayCity);
    $('#wea_text').html('');
    $('.temp').hide();
    return;
  }
  $('.temp').show();

  // 构建查询参数
  const queryParam = location.adcode ? 
    `city=${location.adcode}` : 
    `city=${encodeURIComponent(displayCity)}`;

  // 获取实时天气
  fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${AMapKey}&${queryParam}&extensions=base`)
    .then(res => res.json())
    .then(data => {
      if (data.status === '1' && data.lives?.length > 0) {
        const live = data.lives[0];
        $('#city_text').html(displayCity); // 直接使用处理后的显示名称
        $('#wea_text').html(live.weather);
        $('#tem_day').html(live.temperature);
      }
    })
    .catch(() => $('#wea_text').html('获取失败'));

  // 获取三日预报
  fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${AMapKey}&${queryParam}&extensions=all`)
    .then(res => res.json())
    .then(data => {
      if (data.status === '1' && data.forecasts?.[0]?.casts?.[0]) {
        const today = data.forecasts[0].casts[0];
        $('#tem_night').html(today.nighttemp);
        $('#tem_day').html(today.daytemp);
      }
    })
    .catch(() => $('#tem_night, #tem_day').html('-'));
}

getWeather();


//获取时间
var t = null;
t = setTimeout(time, 1000);

function time() {
    clearTimeout(t);
    dt = new Date();
    var y = dt.getYear() + 1900;
    var mm = dt.getMonth() + 1;
    var d = dt.getDate();
    var weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    var day = dt.getDay();
    var h = dt.getHours();
    var m = dt.getMinutes();
    var s = dt.getSeconds();
    if (h < 10) {
        h = "0" + h;
    }
    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }
    //document.getElementById("time").innerHTML = y + "&nbsp;年&nbsp;" + mm + "&nbsp;月&nbsp;" + d + "&nbsp;日&nbsp;" + "<span class='weekday'>" + weekday[day] + "</span><br>" + "<span class='time-text'>" + h + ":" + m + ":" + s + "</span>";
    $("#time").html(y + "&nbsp;年&nbsp;" + mm + "&nbsp;月&nbsp;" + d + "&nbsp;日&nbsp;" + "<span class='weekday'>" + weekday[day] + "</span><br>" + "<span class='time-text'>" + h + ":" + m + ":" + s + "</span>");
    t = setTimeout(time, 1000);
}

//链接提示文字
$("#social").mouseover(function () {
    $("#social").css({
        "background": "rgb(0 0 0 / 25%)",
        'border-radius': '6px',
        "backdrop-filter": "blur(5px)"
    });
    $("#link-text").css({
        "display": "block",
    });
}).mouseout(function () {
    $("#social").css({
        "background": "none",
        "border-radius": "6px",
        "backdrop-filter": "none"
    });
    $("#link-text").css({
        "display": "none"
    });
});

$("#github").mouseover(function () {
    $("#link-text").html("去 Github 看看");
}).mouseout(function () {
    $("#link-text").html("通过这里联系我");
});
$("#qq").mouseover(function () {
    $("#link-text").html("有什么事吗");
}).mouseout(function () {
    $("#link-text").html("通过这里联系我");
});
$("#email").mouseover(function () {
    $("#link-text").html("来封 Email");
}).mouseout(function () {
    $("#link-text").html("通过这里联系我");
});
$("#telegram").mouseover(function () {
    $("#link-text").html("你懂的 ~");
}).mouseout(function () {
    $("#link-text").html("通过这里联系我");
});
$("#twitter").mouseover(function () {
    $("#link-text").html("你懂的 ~");
}).mouseout(function () {
    $("#link-text").html("通过这里联系我");
});

//更多页面切换
var shoemore = false;
$('#switchmore').on('click', function () {
    shoemore = !shoemore;
    if (shoemore && $(document).width() >= 990) {
        $('#container').attr('class', 'container mores');
        $("#change").html("Oops&nbsp;!");
        $("#change1").html("哎呀，这都被你发现了（ 再点击一次可关闭 ）");
    } else {
        $('#container').attr('class', 'container');
        $("#change").html("Hello&nbsp;World&nbsp;!");
        $("#change1").html("一个建立于 21 世纪的小站，存活于互联网的边缘");
    }
});

//更多页面关闭按钮
$('#close').on('click', function () {
    $('#switchmore').click();
});

//移动端菜单栏切换
var switchmenu = false;
$('#switchmenu').on('click', function () {
    switchmenu = !switchmenu;
    if (switchmenu) {
        $('#row').attr('class', 'row menus');
        $("#menu").html("<i class='iconfont icon-times'></i>");
    } else {
        $('#row').attr('class', 'row');
        $("#menu").html("<i class='iconfont icon-bars'>");
    }
});

//更多弹窗页面
$('#openmore').on('click', function () {
    $('#box').css("display", "block");
    $('#row').css("display", "none");
    $('#more').css("cssText", "display:none !important");
});
$('#closemore').on('click', function () {
    $('#box').css("display", "none");
    $('#row').css("display", "flex");
    $('#more').css("display", "flex");
});

//监听网页宽度
window.addEventListener('load', function () {
    window.addEventListener('resize', function () {
        //关闭移动端样式
        if (window.innerWidth >= 600) {
            $('#row').attr('class', 'row');
            $("#menu").html("<i class='iconfont icon-bars'>");
            //移除移动端切换功能区
            $('#rightone').attr('class', 'row rightone');
        }

        if (window.innerWidth <= 990) {
            //移动端隐藏更多页面
            $('#container').attr('class', 'container');
            $("#change").html("Hello&nbsp;World&nbsp;!");
            $("#change1").html("一个建立于 21 世纪的小站，存活于互联网的边缘");

            //移动端隐藏弹窗页面
            $('#box').css("display", "none");
            $('#row').css("display", "flex");
            $('#more').css("display", "flex");
        }
    })
})

//移动端切换功能区
var changemore = false;
$('#changemore').on('click', function () {
    changemore = !changemore;
    if (changemore) {
        $('#rightone').attr('class', 'row menus mobile');
    } else {
        $('#rightone').attr('class', 'row menus');
    }
});

//更多页面显示关闭按钮
$("#more").hover(function () {
    $('#close').css("display", "block");
}, function () {
    $('#close').css("display", "none");
})

//屏蔽右键
document.oncontextmenu = function () {
    iziToast.show({
        timeout: 2000,
        iconUrl: './img/icon/warn.png',
        message: '为了浏览体验，本站禁用右键'
    });
    return false;
}

//自动变灰
var myDate = new Date;
var mon = myDate.getMonth() + 1;
var date = myDate.getDate();
var days = ['4.4', '5.12', '7.7', '9.9', '9.18', '12.13'];
for (var day of days) {
    var d = day.split('.');
    if (mon == d[0] && date == d[1]) {
        document.write(
            '<style>html{-webkit-filter:grayscale(100%);-moz-filter:grayscale(100%);-ms-filter:grayscale(100%);-o-filter:grayscale(100%);filter:progid:DXImageTransform.Microsoft.BasicImage(grayscale=1);_filter:none}</style>'
        )
        $("#change").html("Silence&nbsp;in&nbsp;silence");
        $("#change1").html("今天是中国国家纪念日，全站已切换为黑白模式");
        window.addEventListener('load', function () {
            iziToast.show({
                timeout: 14000,
                iconUrl: './img/icon/candle.png',
                message: '今天是中国国家纪念日'
            });
        }, false);
    }
}

//控制台输出
var styleTitle1 = `
font-size: 20px;
font-weight: 600;
color: rgb(244,167,89);
`
var styleTitle2 = `
font-size:12px;
color: rgb(244,167,89);
`
var styleContent = `
color: rgb(30,152,255);
`
var title1 = '無名の主页'
var title2 = `
 _____ __  __  _______     ____     __
|_   _|  \\/  |/ ____\\ \\   / /\\ \\   / /
  | | | \\  / | (___  \\ \\_/ /  \\ \\_/ / 
  | | | |\\/| |\\___ \\  \\   /    \\   /  
 _| |_| |  | |____) |  | |      | |   
|_____|_|  |_|_____/   |_|      |_|                                                     
`
var content = `
版 本 号：2.2
更新日期：2022-04-12

更新说明：
1. 新增 壁纸个性化设置
2. 新增 音乐播放器支持音量控制
3. 优化 部分动画及细节
4. 优化 页面加载缓慢
5. 优化 音乐延迟加载

主页:  https://www.imsyy.top
Github:  https://github.com/imsyy/home
`
console.log(`%c${title1} %c${title2}
%c${content}`, styleTitle1, styleTitle2, styleContent)