var more_friends = {};

function get_ui_list(index)
{
    var uiobject = className("android.webkit.WebView").findOnce();
    if(uiobject!= null && uiobject.childCount() == 2)
    {
        //print("继续");
    }
    else
    {
        console.trace("错误",uiobject);
        throw "WebView错误";
    }
    uiobject = uiobject.child(index);
    //print("找到",uiobject.childCount(),"个人");
    return uiobject;
}

more_friends.click_more = function()
{
    var childNum = 0;
    var timeout  = 0;
    while(true)
    {
        var uiobject = className("android.webkit.WebView").findOne(2000);
        if(uiobject == null)
        {
            console.trace("未找到:android.webkit.WebView");
            throw "未找到:android.webkit.WebView";
            return;
        }
        var mUiCollection = uiobject.find(descContains("查看更多好友"))
        if(mUiCollection == null || mUiCollection.size() == 0)
        {
            mUiCollection = uiobject.find(textContains("查看更多好友"))
        }
        if(mUiCollection.size() == 1)
        {
            if(mUiCollection.get(0).click())
            {
                print("点击查看更多好友");
                return;
            }
            else
            {
                console.trace("查看更多好友点击失败");
                throw "查看更多好友点击失败";
            }
        }
        //检测是否加载完
        if(childNum != uiobject.childCount())
        {
            childNum = uiobject.childCount();
        }
        else
        {
            timeout++;
            if(timeout > 3)
            {
                console.trace("未找到查看更多好友");
                throw "未找到查看更多好友";
            }
        }
        scrollDown();
        scrollDown();
    }
}

module.exports = more_friends;
// more_friends.click_more();
