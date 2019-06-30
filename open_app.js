var open_app = {};

function click_main_page() {
    console.info("点击首页");
    var result = click("首页");
    if (result) {
        sleep(500);
        var result = click('蚂蚁森林');
        if (result) {
            print('点击蚂蚁森林成功');
        } else {
            console.error('点击蚂蚁森林失败');
            throw '点击蚂蚁森林失败';
        }
    } else {
        console.error("点击支付宝首页失败");
        throw "点击支付宝首页失败";
    }
}

function launchApp(packageName)
{
    try {
        /*
        let packageManager = context.getPackageManager();
        let intent = packageManager.getLaunchIntentForPackage(packageName);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        print(intent);
        context.startActivity(intent);
        */
        ui.run(function(){
            var intent = new android.content.Intent();  
            var comp = new android.content.ComponentName("com.eg.android.AlipayGphone", "com.eg.android.AlipayGphone.AlipayLogin");  
            intent.setComponent(comp);  
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);  
            context.startActivity(intent);
        });
        return true;
    } catch (error) {
        return false;
    }
}

function restartActivity(){
        var intent = new android.content.Intent();
        intent.setClass(activity, activity.getClass());
        activity.startActivity(intent);
        activity.overridePendingTransition(0,0);
        activity.finish();
}

function open_app_alipay() {
    print('打开支付宝');
    let times = 0;
    while (true) {
        //var result = app.launch('com.alipay.mayi');
        let pkgName = currentPackage();
        //sleep(500)
        /*
        print(pkgName);
        if(pkgName != "org.autojs.autojspro")
        {
            launchPackage("org.autojs.autojspro");
            print("等待打开");
            sleep(2000);
        }
        */
        let result = launchApp("com.eg.android.AlipayGphone");
        print("等待打开");
        var obj = text('蚂蚁森林').findOne(3000);
        pkgName = currentPackage();
        print(pkgName);
        if (result == true && pkgName == 'com.eg.android.AlipayGphone' || obj.clickable()) {
            print('打开支付宝成功');
            sleep(500);
            return;
        } else {
            times++;
            if (times > 3)
                break;
        }
    }
    //context.startActivity(context, com.stardust.autojs.execution.ScriptExecuteActivity.class);
    console.trace('打开支付宝失败');
    //restartActivity();
    throw "打开支付宝失败";
}


function return_to_main_page() {
    console.info("返回支付宝主界面");
    var main_page = id("com.alipay.android.phone.openplatform:id/tab_description").findOne(2000);
    var pkgName = currentPackage();
    var times = 0;
    console.info(pkgName);
    while (pkgName.indexOf('AlipayGphone') != -1) {
        if (main_page != null) {
            return ;
        } else {
            times++;
            print("press times", times);
            back();
            pkgName = currentPackage();
            main_page = id("com.alipay.android.phone.openplatform:id/tab_description").findOne(500);
            if (times > 10) {
                console.trace("未能返回支付宝界面");
                throw "未能返回支付宝界面";
                break;
            }
        }
    }
    console.trace("未能返回支付宝界面");
    throw "未能返回支付宝界面";
}

function return_to_destop() {
    console.info("返回主屏幕");
    for (var i = 0; i < 10; i++) {
        var find_ui = id(open_app.home_id).findOne(200);
        if (find_ui != null) {
            break;
        }
        back();
    }
}

open_app.open = function () {
    open_app_alipay();
    return_to_main_page();
    console.info("当前支付宝主界面");
    click_main_page();
}

module.exports = open_app;
