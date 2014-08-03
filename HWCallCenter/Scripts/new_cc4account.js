﻿var t_proxyUrl="http://192.168.1.110:80/agentgateway/resource/";
function agent_callout() {
    var phone = Xrm.Page.getAttribute("telephone1").getValue();
    if (phone == null) {
        phone = Xrm.Page.getAttribute("new_mobilephone").getValue();
        if (phone == null)
            phone = Xrm.Page.getAttribute("telephone2").getValue();
    }
    if (phone == '' || phone == null) {
        alert("There is no available phone number!");
        return;
    }
    REST.apiURL = t_proxyUrl;
    var cstring = $.cookie("agentcookiestring");
    var agentId = $.cookie("cc_agentid");
    cookiestring = cstring;
    var retJson = VoiceCall.callout({
        "agentid": agentId,
        $entity: { "called": phone }
    });
    var retResult = retJson.retcode;
    if (window.parent.global_resultCode.SUCCESSCODE == retResult) {
        window.parent.global_currentCalloutNumber = phone;
        window.parent.global_currentCalloutCallId = retJson.result;
    }
}

function GetEntity(oDataSet, id) {
    var serverUrl = document.location.protocol + "//" + document.location.host + "/" + Xrm.Page.context.getOrgUniqueName();
    var obj = null;
    $.ajax({
        async: false,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: serverUrl + "/XRMServices/2011/OrganizationData.svc/" + oDataSet + "(guid'" + id + "')",
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, textStatus, XmlHttpRequest) {
            obj = data.d;

        }
        /* error: function (XmlHttpRequest, textStatus, errorThrown) {
             alert(XmlHttpRequest.responseText);
         }*/
    });
    return obj;
}

function agent_calloutFromList(ids) {
    if (ids.length == 0) {
        return;
    }
    if (ids.length > 1) {
        alert("You can select only one record！");
        return;
    }
    var entity = GetEntity("AccountSet", ids[0]);
    var phone = entity.new_mobilephone;
    if (phone == null) {
        phone = entity.Telephone1;
    }
    if (phone == '' || phone == null) {
        alert("There is no avaulable phone number!");
        return;
    }
    REST.apiURL = t_proxyUrl;
    var cstring = $.cookie("agentcookiestring");
    var agentId = $.cookie("cc_agentid");
    cookiestring = cstring;
    var retJson = VoiceCall.callout({
        "agentid": agentId,
        $entity: { "called": phone }
    });
    var retResult = retJson.retcode;
    if (window.parent.global_resultCode.SUCCESSCODE == retResult) {
        window.parent.global_currentCalloutNumber = phone;
        window.parent.global_currentCalloutCallId = retJson.result;
    }
}