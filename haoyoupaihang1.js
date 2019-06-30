var haoyoupaihang1 = {};//好友排行
var is_help_energy = false;

haoyoupaihang1.list_info = [];
haoyoupaihang1.white_list = {
    "安琪儿": false
};

function recycle_image(img) {
    try {
        if (img != null)
            img.recycle();
    } catch (error) {
        print("图片回收失败:", error);
    }
}

haoyoupaihang1.find_target = function (fun_operation) {
    print("进入好友排行");
    var storage = storages.create("alipay_mayi");
    haoyoupaihang1.list_info = storage.get("collect_list_info", []);
    var index = 0;
    var img = captureScreen();
    var scroll_res = scroll_to_item(index);
    var find_type = -1;
    var find_desc = null;
    var find_desc_time = 0;
    print("开始搜索");
    while (scroll_res[0]) {
        //滑动了屏幕需要重新截图
        if (scroll_res[1]) {
            recycle_image(img);
            img = captureScreen();
            //print("截图");
        }
        var uiobject = find_friend_list().child(index);
        find_desc = get_item_desc(uiobject);
        find_desc_time = find_desc[1];
        find_desc = find_desc[0];
        find_type = detect_item(uiobject, img);
        upload_myself(find_desc);
        if (skip_white_list(find_desc)) {
            console.warn(find_desc);
            console.warn("白名单用户，牛逼");
            find_type = -1;
        }
        if (find_type == 1 || (find_type == 0 && is_help_energy)) {
            haoyoupaihang1.list_info[index] = null;
            fun_operation(index, find_type, uiobject, find_desc);
            recycle_image(img);
            //收能量返回 img会被回收
            img = captureScreen();
        } else if (find_type == 2) {
            //即将收取能量 需要记录
            if (find_desc_time != 0 && need_click(find_desc, index)) {
                var name = NaN;
                //前三名没有序号 desc 
                if (index < 3) {
                    name = find_desc[0];
                } else {
                    name = find_desc[1];
                }
                collect_info = {};
                collect_info.name = name;
                collect_info.time = [];
                var myDate = new Date();
                myDate.setTime(myDate.getTime() + find_desc_time * 60 * 1000);
                print('下次收取时间：' + myDate.toLocaleString());
                collect_info.time.push(myDate.getTime());
                haoyoupaihang1.list_info[index] = collect_info;
            }
            //改进代码 获取即将收取的时间，不点击
            fun_operation(index, null, null, haoyoupaihang1.list_info[index]);
        } else {
            haoyoupaihang1.list_info[index] = null;
        }
        if (uiobject.findOne(textContains("邀请")) != null) {
            print("好友列表结束");
            fun_operation(index, null, null, null);
            break;
        }
        index++;
        scroll_res = scroll_to_item(index);
    }
    var storage = storages.create("alipay_mayi");
    storage.put("collect_list_info", haoyoupaihang1.list_info);
    recycle_image(img);
    return uiobject.childCount();
}

function skip_white_list(descInfo) {
    //print("检测白名单");
    var name = "";
    if (descInfo.length > 1) {
        name = descInfo[1].trim();
        //print(name);
        if (haoyoupaihang1.white_list[name])
            return true;
        name = descInfo[0].trim()
        //print(name);
        if (haoyoupaihang1.white_list[name])
            return true;
    }
    return false;
}

function upload_myself(descInfo) {
    if (descInfo.length > 1) {
        //上传自己
        if (descInfo[1].indexOf("小明") != -1) {
            //upload_sql(descInfo);
        }
        //上传自己
        else if (descInfo[0].indexOf("小明") != -1) {
            //upload_sql(descInfo);
        }
    }

}

function upload_sql(info1) {
    var url = "https://www.baidu.com";
    var sql_data = ['Unknow', 0, 0, 0, 0, 0, 0];
    var j = 0;
    //print("上传自己：" + info1);
    for (var i = 0; i < info1.length; i++) {
        info1[i] = info1[i].trim();
        if (j == 0 && isNaN(Number(info1[i]))) {
            sql_data[0] = String(info1[i]);
            j = 1;
        }

        if (info1[i].indexOf("环保证书") != -1) {
            var match_txt = info1[i].match(/\d+/);
            if (match_txt != null && match_txt.length == 1) {
                sql_data[6] = parseInt(match_txt[0]);
            }
        }


        if (/\d+kg/g.test(info1[i])) {
            sql_data[1] = parseInt(parseFloat(info1[i]) * 1000);
        } else if (/\d+g/g.test(info1[i])) {
            sql_data[1] = parseInt(info1[i]);
        }
    }
    print("上传中：" + sql_data);
    r = http.postJson(url, sql_data);
    if (r.statusCode == 200) {
        print("上传数据库成功");
    } else {
        console.error("上传失败：" + r);;
    }
}

function need_click(find_desc, index) {
    try {
        if (find_desc.length < 2)
            return false;

        if (haoyoupaihang1.list_info[index] == null) {
            //print("list info null");
            return true;
        }

        if (find_desc[1].indexOf(haoyoupaihang1.list_info[index].name) == -1 &&
            find_desc[0].indexOf(haoyoupaihang1.list_info[index].name) == -1
        ) {
            //print("list name not found");
            return true;
        }
        if (haoyoupaihang1.list_info[index].time.length == 0) {
            //print("list time not found");
            return true;
        }
        var now_time = new Date().getTime();
        if (haoyoupaihang1.list_info[index].time[0] <= now_time - 500) {
            haoyoupaihang1.list_info[index] = null;
            //print("list name ok");
            return true;
        } else {
            console.info(haoyoupaihang1.list_info[index].name + " 时间未到");
            now_time = (haoyoupaihang1.list_info[index].time[0] - now_time) / 1000;
            console.info("还有 %d:%d", parseInt(now_time / 60), parseInt(now_time % 60));
            return false;
        }
    } catch (error) {
        console.warn("need_click:" + error);
    }
    return true;
}

function find_by_path(ui_path)
{
    var m_object = className("android.webkit.WebView").findOne(2000);
    if (m_object == null) {
        console.trace("未找到控件");
        throw "未找到控件";
    } else {
        //print("找到控件");
        for (var i = 0; i < ui_path.length; i++) {
            if (m_object.childCount() > ui_path[i]) {
                m_object = m_object.child(ui_path[i]);
            } else {
                console.trace("寻找好友列表：", i);
                throw "寻找好友列表：" + i;
            }
        }
    }
    return m_object;
}

//寻找好友列表
function find_friend_list() {
    var ui_path = [1, 1, 0];
    return find_by_path(ui_path);
}

//没有更多了
function find_end_item()
{
    var ui_path = [1, 1, 1];
    return find_by_path(ui_path);
}

function get_img_template() {
    var ok_template = null;
    var help_template = null;
    if (ok_template == null)
        ok_template = images.read("./res/ok1.jpg");
    if (help_template == null)
        help_template = images.read("./res/help1.jpg")
    return [ok_template, help_template];
}

function get_icon_type(img, img_template) {
    var ok_template = img_template[0];
    //console.log("ok_template %d %d", ok_template.getWidth(), ok_template.getHeight());
    //console.log("img %d %d", img.getWidth(), img.getHeight());
    var result = images.matchTemplate(img, ok_template, {
        threshold: 0.5,
        max: 1
    });
    if (result.matches.length > 0) {
        if (result.matches[0].similarity >= 0.9)
            return 1;
        if (result.matches[0].similarity >= 0.5)
            return 2;
    }
    var help_template = img_template[1];
    var result = images.matchTemplate(img, help_template, {
        threshold: 0.5,
        max: 1
    });
    if (result.matches.length > 0)
        return 0;
    return -1;
}

function detect_item(obj_item, img) {
    var pos = obj_item.bounds();
    var x = pos.left;
    var y = pos.top;
    var w = pos.right - x;
    var h = pos.bottom - y;

    var hh = parseInt(h * 0.378378) + 1;
    var ww = hh;
    var yy = y;
    var xx = w - ww - 1;

    var img2 = images.clip(img, xx, yy, ww, hh);
    var img_template = get_img_template();
    var img_type = get_icon_type(img2, img_template);
    //print("img type:", img_type);
    if (img_type == 0) {
        print("帮助收取能量");
    }
    if (img_type == 1) {
        print("可以收取能量");
    }
    if (img_type == 2) {
        print("将要收取能量");
    }
    recycle_image(img2);
    recycle_image(img_template[0]);
    recycle_image(img_template[1]);
    /*
    var current_time = null;
    const log_path = "/sdcard/auto.js/log/";
    if (img_type != -1) {
        current_time = new Date().getTime();
        images.save(img2, log_path + current_time + "-" + img_type + ".jpg", "jpg", 50);

    }
    */
    return img_type;
    //return 1;
}

/**
 * 递归获取所有子控件的描述
 */
function get_item_desc_recursion(descInfo, obj_item) {
    var itemChildCount = obj_item.childCount();
    if (itemChildCount == 0) {
        var descText = obj_item.desc();
        if(descText == null)
            descText = obj_item.text();
        descText = descText.trim();
        if (descText.length > 0) {
            descInfo.push(descText);
        }
        return;
    }
    for (var j = 0; j < itemChildCount; j++) {
        get_item_desc_recursion(descInfo, obj_item.child(j));
    }
}

function get_item_desc(obj_item) {
    var descInfo = [];
    get_item_desc_recursion(descInfo, obj_item);
    var reg = /\d+’/
    var energy_time = 0;
    var last_item = descInfo[descInfo.length - 1];
    if (reg.test(last_item))
        energy_time = parseInt(last_item)
    print(descInfo);
    return [descInfo, energy_time];
}

function scroll_to_item(index) {
    var uiobject = find_friend_list();
    var pre_count = 0;
    var all_count = uiobject.childCount();
    var timeout_num = 0;
    var is_screen_change = false;
    var result_ui_obj = null;
    while (index > all_count - 1) {
        var temp = find_end_item();
        print("scroll to " + index + "/" + all_count);
        temp_desc = temp.desc();
        if(temp_desc == null)
            temp_desc = temp.text();
        if (temp_desc.indexOf("没有更多了") != -1) {
            return [false, is_screen_change, temp];
        } else if (temp_desc.indexOf("正在加载") != -1) {
            //等待加载
            sleep(100);
        } else {
            //下滑加载更多
            scrollDown();
            sleep(50);
        }
        uiobject = find_friend_list();
        all_count = uiobject.childCount();
        if (pre_count != all_count) {
            pre_count = all_count;
            timeout_num = 0;
        } else {
            timeout_num++;
            if (timeout_num > 10 * 3) {
                console.warn("等待好友列表加载超时");
                throw "等待好友列表加载超时";
            }
        }
        is_screen_change = true;
    }

    var timeout_num = 0;
    var up_temp = -1;
    var bottom_temp = -1;
    while (true) {
        var uiobject = find_friend_list();
        var pos0 = uiobject.bounds();
        var obj_item = uiobject.child(index);
        var pos = obj_item.bounds();
        if (pos0.bottom > pos.bottom && pos0.top < pos.top) {
            //print("可见");
            result_ui_obj = obj_item;
            break;
        } else {
            is_screen_change = true;
            //上面不可见
            if (pos.top == pos0.top) {
                //print(index + " 不可见 上滑")
                scrollUp();
                up_temp = -1;
                if (bottom_temp != pos.bottom) {
                    bottom_temp = pos.bottom;
                    timeout_num = 0;
                } else {
                    //上滑 滑不动
                    if (index == 0 && pos.bottom - pos.top > 0) {
                        print("可见 " + index);
                        result_ui_obj = obj_item;
                        break;
                    }
                    timeout_num++;
                }
            } else { //下面不可见
                //print(index + " 不可见 下滑")
                scrollDown();
                bottom_temp = -1;
                if (up_temp != pos.top) {
                    up_temp = pos.top;
                    timeout_num = 0;
                } else {
                    //下滑 滑不动
                    if (index == uiobject.childCount() - 1 && pos.bottom - pos.top > 0) {
                        print("可见 " + index);
                        result_ui_obj = obj_item;
                        break;
                    }
                    timeout_num++;
                }
            }
        }
        sleep(200);
        if (timeout_num > 3) {
            console.warn("滑动好友列表界面超时");
            throw "滑动好友列表界面超时";
        }
    }
    return [true, is_screen_change, result_ui_obj];
}

module.exports = haoyoupaihang1;

//------------------------for test------------------------------------
// requestScreenCapture(false);
// sleep(500);
// haoyoupaihang1.find_target(function(id, type, uiobject, descInfo) {
// });
//------------------------for test------------------------------------