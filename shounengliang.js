//收能量
var shounengliang = {};
var toast_text = [];
const toast_pkg = "com.eg.android.AlipayGphone";

shounengliang.user_info = null;

function get_next_time(time_str) {
    var patt1 = /\d+/g;
    var temp = time_str.match(patt1);
    if (temp.length == 2) {
        var hour = Number(temp[0]);
        var min = Number(temp[1]);
        min = hour * 60 + min;
        var myDate = new Date();
        myDate.setTime(myDate.getTime() + min * 60 * 1000);
        print(myDate.toLocaleString());
        return myDate;
    }
    return null;
}

function upload_sql(info1, info2) {
    var url = "https://www.baidu.com";
    var sql_data = ['Unknow', 0, 0, 0, 0, 0, 0];
    var j = 0;
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

    sql_data[2] = info2[1];
    sql_data[3] = info2[0];
    sql_data[4] = info2[2];
    sql_data[5] = info2[3];
    /*
        r = http.postJson(url, sql_data);
        if (r.statusCode == 200) {
            print("上传数据库成功");
        } else {
            console.trace("上传数据库失败");
            throw "" + r.statusCode;
        }
    */
}

//寻找能量收取信息，并上传
function find_energy_info() {
    var m_object = className("android.webkit.WebView").findOnce();
    if (m_object == null) {
        console.trace("未找到控件");
        throw "未找到 WebView";
    }
    var ui_path = [0, 1, 0];
    for (var i = 0; i < ui_path.length; i++) {
        if (m_object.childCount() > ui_path[i]) {
            m_object = m_object.child(ui_path[i]);
        } else {
            console.trace("寻找能量收取信息错误：", i);
            throw "寻找能量收取信息错误：" + i;
        }
    }
    result_num = [];
    result = m_object.find(descMatches("\\d+g"));
    if(result == null || result.size() == 0)
    {
        result = m_object.find(textMatches("\\d+g"));
    }
    for (var i = 0; i < result.size(); i++) {
        var item_desc = result.get(i).desc();
        if(item_desc == null)
            item_desc = result.get(i).text();
        result_num.push(parseInt(item_desc.trim()));
    }
    if (result_num.length == 4) {
        print(shounengliang.user_info);
        log("TA收取你:" + result_num[0] + " 你收取TA:" + result_num[1]);
        log("TA给你助力:" + result_num[2] + " 你给TA助力:" + result_num[3]);
        if (shounengliang.user_info != null)
            upload_sql(shounengliang.user_info, result_num);
        return result_num;
    }
    return null;
}

//寻找能量球
function find_energy_ball() {
    var m_object = className("android.webkit.WebView").findOne(2000);
    var ui_path = [0, 0, 2];
    if (m_object == null) {
        console.trace("未找到控件");
        throw "未找到控件";
    } else {
        //print("找到控件");
        for (var i = 0; i < ui_path.length; i++) {
            if (m_object.childCount() > ui_path[i]) {
                m_object = m_object.child(ui_path[i]);
            } else {
                console.trace("寻找能量球错误：", i);
                throw "寻找能量球错误：" + i;
            }
        }
    }
    return m_object;
}

//获取收取能量的标题
function get_h5_title_name() {
    //等待能量球加载
    var titleObj = id("com.alipay.mobile.nebula:id/h5_tv_title").findOne(2000);
    if (titleObj != null) {
        if (titleObj.text().indexOf("蚂蚁森林") != -1) {
            var index = titleObj.text().indexOf("的蚂蚁森林");
            if (index != -1) {
                var name = titleObj.text().substring(0, index);
                return name;
            }
            return "";
        } else {
            console.trace("当前页面不是蚂蚁森林->", titleObj.text());
            throw "当前页面不是蚂蚁森林->" + titleObj.text();
        }
    } else {
        console.trace("未找到 h5_tv_title");
        throw "未找到 h5_tv_title";
    }
}

shounengliang.detect_energy = function(user_info, toast_text) {
    shounengliang.user_info = user_info;
    var collect_info = {};
    collect_info.name = get_h5_title_name();
    collect_info.time = [];
    collect_info.data = null;

    toast_text.length = 0; //清空数组

    print("等待3s开始收集");
    sleep(3000);
    print("开始收集");

    var m_object = find_energy_ball();
    var num = m_object.childCount();

    while (num == 0) {
        sleep(100);
        m_object = find_energy_ball();
        num = m_object.childCount();
    }

    var size = 0;
    if (num >= 5) {
        print("继续进行", m_object.childCount());
        //倒序 优先收取能量成熟的
        for (var i = m_object.childCount() - 1; i >= 0; i--) {
            var m_obj = m_object.child(i);
            var desc = m_obj.desc();
            if(desc == null)
                desc = m_obj.text();
            if(desc == null)
                desc = "";
            /*
            if (user_info == null) //个人首页收能量
            {
                if (m_obj.indexInParent() == 0) {
                    continue;
                }
            }
            */
            if (desc.trim().length == 0) {
                var b = m_obj.bounds();
                print("点击 " + i + click(b.centerX(), b.centerY()));
                sleep(300);
                //save_clip_img("-ball-0.jpg", b);
            } else if (desc.indexOf("收集能量") != -1) {
                size++;
                var b = m_obj.bounds();
                click(b.centerX(), b.centerY());
                sleep(300);
                //save_clip_img("-ball-1.jpg", b);
                print("收集：", size);
            } else {
                //print(desc);
            }
        }

        if (size > 0) {
            log("有%d个能量，已收集！", size);
        } else {
            print("没有能量能够收取!");
        }
        var num2 = find_energy_ball().childCount();
        if (num2 == num) {
            print("没有可以帮助收取的能量!");
        }

        //能量数据发生变化
        if (size > 0 || num2 != num) {
        }
        if(user_info != null)
            collect_info.data = find_energy_info();
    } else {
        console.trace("num error", num);
        throw "num error" + num;
    }
    //等待toast1s
    sleep(1000);
    console.info("采集时间分析中～");
    for (i in toast_text) {
        print(toast_text[i]);
        var next_date = get_next_time(toast_text[i]);
        if (next_date != null) {
            collect_info.time.push(next_date.getTime());
        }
    }
    //时间从小到大排序
    collect_info.time.sort(function (a, b) {
        return a - b;
    });
    console.info("采集时间分析结束～");
    return collect_info;
}

module.exports = shounengliang;

//------------------------for test------------------------------------
//------------------------for test------------------------------------
