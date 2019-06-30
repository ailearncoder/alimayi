var unlock = {};
var pwd = [1, 2, 3, 4, ];
var y_pos = [1308, 1509, 1710, 1893];
var x_pos = [241, 538, 835];
var num_pos = [
[x_pos[1],y_pos[3]],//0
[x_pos[0],y_pos[0]],//1
[x_pos[1],y_pos[0]],//2
[x_pos[2],y_pos[0]],//3
[x_pos[0],y_pos[1]],//4
[x_pos[1],y_pos[1]],//5
[x_pos[2],y_pos[1]],//6
[x_pos[0],y_pos[2]],//7
[x_pos[1],y_pos[2]],//8
[x_pos[2],y_pos[2]]];//9

function lock_swip() {
    setScreenMetrics(1080, 2160);
    swipe(500, 1600, 500, 700, 502);
    sleep(500);
    setScreenMetrics(1080, 2220);
    for(var i in pwd)
    {
        var pos = num_pos[pwd[i]]
        press(pos[0], pos[1], 200);
        sleep(200);
    }
    setScreenMetrics(1080, 2160);
}
function open_app()
{
    var obj2 = id("com.alipay.mayi:id/textList").findOne(200);
    if(obj2 != null)
    {
        return true;
    }
    swipe(500, 10, 500, device.height*3/4, 100);
    var obj = text("蚂蚁森林助手").findOne(3000);
    if(obj != null)
    {
        var b= obj.bounds();
        click(b.centerX(), b.centerY());
        log("打开蚂蚁森林助手")
    }
    var obj2 = id("com.alipay.mayi:id/textList").findOne(1000);
    if(obj2 != null)
    {
        return true;
    }
    if(currentPackage() != "com.alipay.mayi")
    {
        return false;
    }
    return true;
}

unlock.unlock_password = function() {
	var times = 0;
	while(context.isLocked())
	{
		log("设备已锁定，正在解锁");
		device.wakeUpIfNeeded();
		sleep(2000);
		lock_swip();
		times++;
		if(times > 3)
			throw "设备未能解锁"
		sleep(1000);
	}
	log("设备解锁完成");
	times = 0;
	while(open_app() == false)
	{
	    times++;
	    if(times > 2)
            throw "打开app失败"
        sleep(1000);
	}
}

module.exports = unlock;
