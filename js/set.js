// 背景图片 Cookies
function setBgImg(bg_img) {
    if (bg_img) {
        Cookies.set('bg_img', JSON.stringify(bg_img), {
            expires: 36500
        });
        return true;
    }
    return false;
}

// 获取背景图片 Cookies
function getBgImg() {
    var bg_img_local = Cookies.get('bg_img');
    if (bg_img_local && bg_img_local !== "{}") {
        return JSON.parse(bg_img_local);
    } else {
        const defaultBg = {
            type: "1",
            path: getRandomDefaultImage()
        };
        setBgImg(defaultBg);
        return defaultBg;
    }
}

// 获取随机默认壁纸
function getRandomDefaultImage() {
    const pictures = [
        './img/background1.webp',
        './img/background2.webp',
        './img/background3.webp',
        './img/background4.webp',
        './img/background5.webp',
        './img/background6.webp',
        './img/background7.webp',
        './img/background8.webp',
        './img/background9.webp',
        './img/background10.webp'
    ];
    const rd = Math.floor(Math.random() * 10);
    return pictures[rd];
}

// 初始化背景图片
function setBgImgInit() {
    const bg_img = getBgImg();
    
    // 设置选中状态
    $("input[name='wallpaper-type'][value='" + bg_img.type + "']").prop('checked', true);
    
    // 设置背景图片
    $('#bg').attr('src', bg_img.path);
}

$(document).ready(function () {
    // 壁纸数据加载
    setBgImgInit();
    
    // 设置背景图片
    $("#wallpaper").on("click", ".set-wallpaper", function () {
        const type = $(this).val();
        const bg_img = { type: type };
        
        // 根据类型获取并设置图片
        switch (type) {
            case "1":
                bg_img.path = getRandomDefaultImage();
                break;
            case "2":
                bg_img.path = 'https://api.dujin.org/bing/1920.php';
                break;
            case "3":
                bg_img.path = 'https://api.btstu.cn/sjbz/api.php?lx=fengjing&format=images';
                break;
            case "4":
                bg_img.path = 'https://www.dmoe.cc/random.php';
                break;
        }
        
        // 保存设置并更新UI
        setBgImg(bg_img);
        $('#bg').attr('src', bg_img.path);
        
        // 显示提示
        iziToast.show({
            message: '壁纸设置成功',
        });
    });
});