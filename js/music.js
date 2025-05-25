/* 
音乐信息
感谢 @武恩赐 提供的 MetingAPI
https://api.wuenci.com/meting/api/

作者: imsyy
主页：https://www.imsyy.top/
GitHub：https://github.com/imsyy/home
版权所有，请勿删除
*/

// 配置参数（保持原mu2sic.js的按键和设置）
const server = "netease"; // 音乐平台
const type = "playlist";  // 歌单类型
const id = "8454965941";  // 歌单ID

$.ajax({
    url: `https://api.injahow.cn/meting/?server=${server}&type=${type}&id=${id}`,
    type: "GET",
    dataType: "JSON",
    success: function (data) {
        // 初始化APlayer（保留原mu2sic.js的配置）
        const ap = new APlayer({
            container: document.getElementById('aplayer'),
            order: 'random',
            preload: 'auto',
            listMaxHeight: '336px',
            volume: '0.5',
            mutex: true,
            lrcType: 3,
            audio: data, // 使用API返回的歌曲数据
        });

        /* ---------- 保留原mu2sic.js的所有控制逻辑 ---------- */
        /* 底栏歌词 */
        setInterval(function () {
            $("#lrc").html("<span class='lrc-show'><i class='iconfont icon-music'></i> " + $(".aplayer-lrc-current").text() + " <i class='iconfont icon-music'></i></span>");
        }, 500);

        /* 音乐通知及控制 */
        ap.on('play', function () {
            music = $(".aplayer-title").text() + $(".aplayer-author").text();
            iziToast.info({
                timeout: 8000,
                iconUrl: './img/icon/music.png',
                displayMode: 'replace',
                message: music
            });
            $("#play").html("<i class='iconfont icon-pause'>");
            $("#music-name").html($(".aplayer-title").text() + $(".aplayer-author").text());
            if ($(document).width() >= 990) {
                $('.power').css("cssText", "display:none");
                $('#lrc').css("cssText", "display:block !important");
            }
        });

        ap.on('pause', function () {
            $("#play").html("<i class='iconfont icon-play'>");
            if ($(document).width() >= 990) {
                $('#lrc').css("cssText", "display:none !important");
                $('.power').css("cssText", "display:block");
            }
        });

        // 音量调节（保留原函数逻辑）
        function changevolume() {
            var x = $("#volume").val();
            ap.volume(x, true);
            if (x == 0) {
                $("#volume-ico").html("<i class='iconfont icon-volume-x'></i>");
            } else if (x > 0 && x <= 0.3) {
                $("#volume-ico").html("<i class='iconfont icon-volume'></i>");
            } else if (x > 0.3 && x <= 0.6) {
                $("#volume-ico").html("<i class='iconfont icon-volume-1'></i>");
            } else {
                $("#volume-ico").html("<i class='iconfont icon-volume-2'></i>");
            }
        }

        // 新增：将changevolume函数绑定到音量输入框的input事件上
        $("#volume").on('input', changevolume);

        // 保留其他UI交互
        $("#music").hover(function () {
            $('.music-text').css("display", "none");
            $('.music-volume').css("display", "flex");
        }, function () {
            $('.music-text').css("display", "block");
            $('.music-volume').css("display", "none");
        });

        /* 一言与音乐切换 */
        $('#open-music').on('click', function () {
            $('#hitokoto').css("display", "none");
            $('#music').css("display", "flex");
        });

        $("#hitokoto").hover(function () {
            $('#open-music').css("display", "flex");
        }, function () {
            $('#open-music').css("display", "none");
        });

        $('#music-close').on('click', function () {
            $('#music').css("display", "none");
            $('#hitokoto').css("display", "flex");
        });

        /* 上下曲控制 */
        $('#play').on('click', function () {
            ap.toggle();
            $("#music-name").html($(".aplayer-title").text() + $(".aplayer-author").text());
        });

        $('#last').on('click', function () {
            ap.skipBack();
            $("#music-name").html($(".aplayer-title").text() + $(".aplayer-author").text());
        });

        $('#next').on('click', function () {
            ap.skipForward();
            $("#music-name").html($(".aplayer-title").text() + $(".aplayer-author").text());
        });

        /* 打开音乐列表 */
        $('#music-open').on('click', function () {
            if ($(document).width() >= 990) {
                $('#box').css("display", "block");
                $('#row').css("display", "none");
                $('#more').css("cssText", "display:none !important");
            }
        });
    },
    error: function () {
        // 错误处理（保留原提示逻辑）
        setTimeout(function () {
            iziToast.info({
                timeout: 8000,
                icon: "fa-solid fa-circle-exclamation",
                displayMode: 'replace',
                message: '音乐播放器加载失败'
            });
        }, 3800);
    }
});