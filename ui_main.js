"ui";

var open_app = require("./open_app.js");
var shouqu = require("./shounengliang.js");
var more = require("./more_friends.js");
var paihang = require("./haoyoupaihang1.js");

var jsonQueue = new java.util.concurrent.LinkedBlockingQueue();
var toast_text = [];

sendBroadcast = function (jsonObj) {
    var intent = new android.content.Intent();
    intent.setAction("test_action");
    intent.putExtra("txt", JSON.stringify(jsonObj));
    context.sendBroadcast(intent);
}

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
    //console.log("Toast内容: " + toast.getText() + " 包名: " + toast.getPackageName());
    record_toast(toast)
    //device.vibrate(10);
}

function initToast()
{
    events.observeToast();
    events.onToast(toast_fun);
}

function onReceive1(context, intent) {
    jsonStr = intent.getStringExtra("json");
    jsonObj = JSON.parse(jsonStr);
    jsonQueue.offer(jsonObj);
}

function initReceiver() {
    var intentFilter = new android.content.IntentFilter();
    intentFilter.addAction("panpan_autojs");
    context.registerReceiver(new android.content.BroadcastReceiver({
        onReceive: onReceive1
    }), intentFilter);
}

initReceiver();

//threads.start(run);
ui.layout(
    <vertical>
        <appbar>
            <toolbar id="toolbar" title="自动收能量助手"/>
        </appbar>
        <TextView text="本周战况" textColor="#000000" padding="16 16 0 0" textSize="18sp" />
        <View h="1px" bg="#000000"/>
        <TextView id="collect_txt1" text="收取能量：0g" padding="16 8 0 0" textSize="16sp"/>
        <TextView id="collect_txt2" text="被收能量：0g" padding="16 8 0 0" textSize="16sp"/>
        <TextView id="collect_txt3" text="帮助能量：0g" padding="16 8 0 8" textSize="16sp" />
        <View h="1px" bg="#000000"/>
        <TextView id="time" text="下一位：无" textColor="#000000" padding="16 16 0 16" textSize="18sp" />
        <View h="1px" bg="#000000"/>
        <TextView id="list_text" text="可收取能量列表：0" textColor="#000000" padding="16 8 0 8" textSize="18sp" />
        <list id="mlist" h="0dp" padding="16 0 16 8" layout_weight="1">
            <horizontal>
                <text id="name" textSize="16sp" textColor="#000000" text="{{item_text}}"/>
            </horizontal>
        </list>
        <View h="1px" bg="#000000"/>
        <button id="start" text="开始运行" padding="8 8 8 8"/>
    </vertical>
);

ui.emitter.on("create_options_menu", menu => {
    menu.add("设置");
    menu.add("调试");
});

ui.emitter.on("options_item_selected", (e, item) => {
    switch(item.getTitle())
    {
        case "设置":
            app.startActivity("settings");
            break;
        case "调试":
            app.startActivity("console");
            break;
    }
});
activity.setSupportActionBar(ui.toolbar);

function formatStr()
{
    /**字典转数组函数 */
    let params = [].slice.call(arguments)
    return java.lang.String.format(params[0], params.slice(1));
}

function getItem(index,name,time)
{
    return {item_text:formatStr("%-6.0f 姓名：%-10s 时间：%s", index, name, time)}
}

var listItems = [];
ui.mlist.setDataSource(listItems);

ui.mlist.on("item_click", function(item, i, itemView, listView){
    //toast("被点击的人名字为: " + item.name + "，年龄为: " + item.age);
});

// 当用户回到本界面时，resume事件会被触发
ui.emitter.on("resume", function() {

});

// 返回按钮
ui.emitter.on("back_pressed", e => {
    confirm("退出吗？").then(value=>{
        if(value)
        {
            ui.finish();
        }
    });
    e.consumed = true;
});

ui.start.on("click", function(){
    //程序开始运行之前判断无障碍服务
    main();
});

function autoServer()
{
    if (auto.service == null) {
        try {
            var value = confirm("Hello，需要你去", "进入设置里面，打开无障碍服务，实现自动操作，安全使用，确定吗？");
            //当点击确定后会执行这里, value为true或false, 表示点击"确定"或"取消"
            if (value) {
                auto();
            } else {
                toast("拜拜啦，下次再见");
                exit();
            }
            return;
        } catch (error) {
            toast("请打开相关权限后，重新打开哦。");
        }
    }
}

var screenCaptureInit = false;

function returnHome()
{
     //返回桌面
     for (var i = 0; i < 3; i++) {
        back();
        sleep(200);
    }
    //home();
}

function arraySort(collect_all_info)
{
    for (var item in collect_all_info) {
        //按时间升序排列
        collect_all_info[item].time.sort(function(a, b) {
            return a - b;
        });
    }
}

function updateUi()
{
    let storage = storages.create("alipay_mayi");
    let energy_data_analyze = storage.get("energy_data_analyze", []);
    let collect_data_analyze = storage.get("collect_data_analyze", {});
    /*
    let collect_all_info = storage.get("collect_all_info", null);
    var collect_data_analyze = storage.get("collect_data_analyze", {});
    print(collect_data_analyze);
    for(var i in collect_all_info)
    {
        let item = collect_all_info[i];
        collect_data_analyze[item.name] = item.data;
    }
    storage.put("collect_data_analyze", collect_data_analyze);
    */
    print(collect_data_analyze);
    print(energy_data_analyze);
    var data = [0, 0, 0, 0];
    for(i in collect_data_analyze)
    {
        let temp = collect_data_analyze[i];
        if(temp)
        {
            data[0] += temp[0];
            data[1] += temp[1];
            data[2] += temp[2];
            data[3] += temp[3];
        }
    }
    print(data);
    ui.collect_txt1.text = formatStr("收取能量：%.0fg", data[1]);
    ui.collect_txt2.text = formatStr("被收能量：%.0fg", data[0]);
    ui.collect_txt3.text = formatStr("帮助能量：%.0fg", data[3]);
    listItems.length = 0;
    for(i in energy_data_analyze)
    {
        if (energy_data_analyze[i][1].length == 0)
            energy_data_analyze[i][1] = "自己";
        let time = new Date(energy_data_analyze[i][0]).toLocaleTimeString();
        time = time.split(" ")[1]
        let name = energy_data_analyze[i][1];
        listItems.push(getItem(parseInt(i) + 1, name, time));
    }
    ui.list_text.text = "可收取能量列表：" + listItems.length;
    startCountDownTime();
}

var is_init_ok = false;

function beginWork()
{
    var collect_all_info = [];
    let num = -1;
    stopCountDownTime();
    startFloatWindow("正在打开支付宝...");
    open_app.open();
    startFloatWindow("正在收取个人能量...");
    collect_all_info.push(shouqu.detect_energy(null, toast_text));
    more.click_more();
    startFloatWindow("正在搜索好友...");
    sleep(1000);
    paihang.find_target(function(id, type, uiobject, descInfo) {
        if (type == null || num >= id) {
            if (descInfo) {
                if (descInfo.time.length > 0)
                {
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
    print(collect_all_info);
    returnHome();
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
    for(var i in collect_all_info)
    {
        let item = collect_all_info[i];
        collect_data_analyze[item.name] = item.data;
    }
    storage.put("collect_data_analyze", collect_data_analyze);
    updateUi();
}

var restartDialog = null;
var restartId = -1;
var restartTime = 5;
function showRestart()
{
    print("showRestart Dialog");
    var contentText = arguments[0] ? arguments[0] : "收能量被终止，是否重新开始？\n(%.0fs 后自动重新开始)";//设置第一个参数的默认值
    restartDialog = dialogs.build({
        title: "提示",
        //对话框内容
        content: formatStr(contentText, 5),
        //确定键内容
        positive: "好哒",
        //取消键内容
        negative: "哼",
        cancelable: false
    }).on("positive", ()=>{
        //监听确定键
        toast("请稍后....");
        restartTime = 0;
    }).on("negative", ()=>{
        toast("嘤嘤嘤...");
        clearInterval(restartId);
        restartDialog = null;
    }).show();
    restartId = setInterval(function(){
        restartTime--;
        if(restartTime <= 0)
        {
            restartTime = 5;
            restartDialog.dismiss();
            restartDialog = null;
            clearInterval(restartId);
            ui.post(main);
            return;
        }
        restartDialog.setContent(formatStr(contentText, restartTime));
    }, 1000);
}

var energy_data_analyze = null;
var countdownTimerId = -1;
function startCountDownTime()
{
    let storage = storages.create("alipay_mayi");
    energy_data_analyze = storage.get("energy_data_analyze", null);
    if(energy_data_analyze == null || energy_data_analyze.length == 0)
    {
        ui.time.text = "下一位：无";
        clearInterval(countdownTimerId);
        return;
    }
    countdownTimerId = setInterval(function(){
        var now_time = new Date().getTime();
        var next_time = energy_data_analyze[0][0];
        var next_name = energy_data_analyze[0][1];
        if (next_time > now_time) {
            ui.time.text = "下一位：" + next_name;
            ui.time.text += "    倒计时：" + parseInt((next_time - now_time) / 1000 / 60) + ":" +
                formatStr("%02.0f",parseInt((next_time - now_time) / 1000 % 60));
        }
        else
        {
            clearInterval(countdownTimerId);
            ui.post(function(){
                showRestart("%.0f秒后，自动开始...");
            });
        }
    }, 1000);
}

function stopCountDownTime()
{
    clearInterval(countdownTimerId);
}

var mFloatWindow = null;
function startFloatWindow()
{
    if(mFloatWindow == null)
    {
        mFloatWindow = floaty.rawWindow(
            <frame gravity="center" bg="#000000">
                <text id="text" textColor="#FFFF00" >智能助手</text>
            </frame>
        );
        mFloatWindow.setPosition(50, 50);
    }
    var text = arguments[0];
    if(text)
    {
        ui.run(function(){
            mFloatWindow.text.setText("蚂蚁森林小助手：" + text);
        });
    }
}
function stopFloatWindow()
{
    if(mFloatWindow)
        mFloatWindow.close();
    mFloatWindow = null;
}
function main() {
    // 这里写脚本的主逻辑
    if (auto.service == null)
    {
        autoServer();
        return;
    }
    if(is_init_ok == false)
    {
        console.log("init toast");
        initToast();
        is_init_ok = true;
    }
    if(screenCaptureInit == false)
    {
        threads.start(function () { 
            //confirm("Hello，需要你同意使用屏幕权限，实现智能识别，请确认");
            screenCaptureInit = requestScreenCapture(false)
            if(screenCaptureInit)
            {
                toast("恭喜，操作成功");
                ui.post(main);
            }
            else
                toast("很遗憾，操作失败");
        });
        return;
    }
    threads.start(function () {
        startFloatWindow();
        try {
            print("开始运行");
            beginWork();
        } catch (error) {
            console.trace(error);
            showRestart();
        }
        stopFloatWindow();
    });
}
updateUi();
device.keepScreenDim();
