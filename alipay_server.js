alipay_service = {};
importPackage(android.content);
alipay_service.intent = null;

function start_service(json) {
    if (alipay_service.intent == null) {
        var intent = android.content.Intent();
        intent.setClassName("com.alipay.mayi",
            "com.alipay.mayi.server.AlipayService");
            alipay_service.intent = intent;
    }
    var intent = alipay_service.intent;
    var jsonStr = JSON.stringify(json);
    intent.putExtra("json", jsonStr);
    context.startForegroundService(intent);
}

alipay_service.start = start_service;
module.exports = alipay_service;
