var open_app = require("./open_app.js");
var shouqu = require("./shounengliang.js");
var more = require("./more_friends.js");
var paihang = require("./haoyoupaihang1.js");
var unlock = require("./unlock.js");

var toast_text = [];
var collect_all_info = [];

function record_toast(toast) {
    var pkg = toast.getPackageName()
    var text = toast.getText();
    if (pkg == "com.eg.android.AlipayGphone") {
        if (text != null && text.indexOf("后才能收取") != -1) {
            toast_text.push(text);
        }
    }
}

function toast_fun(toast) {
    console.log("Toast内容: " + toast.getText() + " 包名: " + toast.getPackageName());
    record_toast(toast)
    //device.vibrate(5);
}

function initToast() {
    events.observeToast();
    events.onToast(toast_fun);
}

function returnHome() {
    //返回桌面
    for (var i = 0; i < 5; i++) {
        back();
        sleep(600);
    }
    //app.launch('com.alipay.mayi');
    //home();
}

function arraySort(collect_all_info) {
    for (var item in collect_all_info) {
        //按时间升序排列
        collect_all_info[item].time.sort(function(a, b) {
            return a - b;
        });
    }
}

function formatStr() {
    /**字典转数组函数 */
    let params = [].slice.call(arguments)
    return java.lang.String.format(params[0], params.slice(1));
}

function analyze_data() {
    if (collect_all_info.length == 0)
        return;
    print(collect_all_info);
    arraySort(collect_all_info);
    var energy_data_analyze = []
    for (i in collect_all_info) {
        for (j in collect_all_info[i].time) {
            energy_data_analyze.push([collect_all_info[i].time[j], collect_all_info[i].name]);
        }
    }
    //从小到大时间排序
    energy_data_analyze.sort(function(a, b) {
        return a[0] - b[0];
    });
    let storage = storages.create("alipay_mayi");
    storage.put("collect_all_info", collect_all_info);
    storage.put("energy_data_analyze", energy_data_analyze);
    var collect_data_analyze = storage.get("collect_data_analyze", {});
    for (var i in collect_all_info) {
        let item = collect_all_info[i];
        collect_data_analyze[item.name] = item.data;
    }
    storage.put("collect_data_analyze", collect_data_analyze);
}

function beginWork() {
    let num = -1;
    collect_all_info.length = 0;
    startFloatWindow("正在打开蚂蚁森林...");
    open_app.open();
    startFloatWindow("正在收取个人能量...");
    collect_all_info.push(shouqu.detect_energy(null, toast_text));
    more.click_more();
    startFloatWindow("正在搜索好友...");
    sleep(1000);
    paihang.find_target(function(id, type, uiobject, descInfo) {
        if (type == null || num >= id) {
            if (descInfo) {
                if (descInfo.time.length > 0) {
                    let now_time = new Date().getTime();
                    startFloatWindow(formatStr("%s 有能量%.0f分后收取",
                        descInfo.name,
                        (descInfo.time - now_time) / 1000 / 60));
                    collect_all_info.push(descInfo);
                }
            }
            return;
        }
        num = id;
        let b = uiobject.bounds();
        print(click(b.centerX(), b.centerY()));
        let titleObj = null;
        if ((titleObj = textContains("的蚂蚁森林").findOne(2000)) != null) {
            startFloatWindow(formatStr("正在收取 %s", titleObj.text()));
            collect_all_info.push(shouqu.detect_energy(descInfo, toast_text));
            print("能量收集结束");
            back();
            sleep(500);
        } else {
            //点击无效
        }
        if (!textContains("好友排行榜").exists()) {
            back();
            sleep(500);
        }
        startFloatWindow("正在搜索好友...");
    });
    startFloatWindow("能量收取完成，即将返回...");
}

var mFloatWindow = null;

function startFloatWindow() {
    if (mFloatWindow == null) {
        mFloatWindow = floaty.rawWindow(
            <frame gravity="center" bg="#000000">
                <text id="text" textColor="#FFFF00" >智能助手</text>
            </frame>
        );
        mFloatWindow.setPosition(50, 50);
    }
    var text = arguments[0];
    if (text) {
        ui.run(function() {
            mFloatWindow.text.setText("蚂蚁森林小助手：" + text);
        });
    }
}

function stopFloatWindow() {
    if (mFloatWindow)
        mFloatWindow.close();
    mFloatWindow = null;
}

function main() {
	device.vibrate(2);
	toast("5s 后开始收能量，按音量上键取消");
	sleep(5000);
	let storage = storages.create("alipay_mayi");
    storage.put("main_run_error", {});
    unlock.unlock_password();
    startFloatWindow();
    // 这里写脚本的主逻辑
    if (auto.service == null) {
        console.error("auto service null");
        throw "auto service null";
    }
    auto.waitFor();
    log("begin requestScreenCapture")
    if (!requestScreenCapture(false)) {
        console.error("can't requestScreenCapture");
        let storage = storages.create("alipay_mayi");
        storage.put("main_run_error", {error:"can't requestScreenCapture"});
        exit();
    }
    log("end requestScreenCapture")
    console.log("init toast");
    initToast();
    sleep(100);
    threads.start(function() {
		print("开始运行");
		try {
            beginWork();
            returnHome();
        } catch (error) {
            let storage = storages.create("alipay_mayi");
            storage.put("main_run_error", error);
            console.trace(error);
        }
        exit();
    });
}

events.on("exit", function() {
    try {
        stopFloatWindow();
        events.removeAllListeners();
        analyze_data();
        log("main 结束运行");
    } catch (error) {
        log("main 异常：" + error);
    }
});

main();
setInterval(function(){}, 5000);
