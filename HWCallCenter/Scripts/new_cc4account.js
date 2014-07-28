function agent_callout() {
    var phone = Xrm.Page.getAttribute("telephone1").getValue();
    if (phone == null) {
        phone = Xrm.Page.getAttribute("mobilephone").getValue();
        if (phone == null)
            phone = Xrm.Page.getAttribute("telephone2").getValue();
    }
    if (phone == '' || phone == null) {
        alert("There are no available phone number!");
        return;
    }
    REST.apiURL = "http://192.168.1.110:80/agentgateway/resource/";
    var cstring = $.cookie("agentcookiestring");
    var agentid = $.cookie("cc_agentid");
    cookiestring = cstring;
    var retJson = VoiceCall.callout({
        "agentid": agentId,
        $entity: { "called": phone }
    });
    var retResult = retJson.retcode;
    if (window.parent.global_resultCode.SUCCESSCODE == retResult) {
        window.parent.global_currentCalloutNumber = phoneNo;
        window.parent.global_currentCalloutCallId = retJson.result;
    }
}