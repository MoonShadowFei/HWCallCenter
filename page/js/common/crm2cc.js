//打开新的页面
//callerid: 来电号码
//direct: 来电方向
//如果联系人在系统中不存在，则创建联系人,并打开联系人; 存在，则直接打开
function openNewPopupScreen(callerid, feature, uniqueid) {
    var org = Xrm.Page.context.getOrgUniqueName();
    var strUrl = document.location.protocol + "//" + document.location.host + "/" + org;

    //------------------------------ 打开电话联络窗口开始-----------------------------------
    var extraqs = "phoneno=" + callerid + "&feature=" + feature + "&uniqueid=" + uniqueid;
    strNewUrl = strUrl + "/ISV/PhoneCallRecord.aspx?" + extraqs;
    var top = (window.screen.availHeight - 400) / 2;
    var left = (window.screen.availWidth - 800) / 2;
    window.open(strNewUrl, "", 'width=800,height=400,top=60,left=60,toolbar=no,resizable=yes,menubar=no,status=no,location=no,scrollbar=yes');
    //------------------------------- 打开电话联络窗口结束-----------------------------------
}