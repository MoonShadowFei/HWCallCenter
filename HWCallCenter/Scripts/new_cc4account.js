var t_proxyUrl="http://192.168.1.110:80/agentgateway/resource/";
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

function agent_sendEmail() {
    Xrm.Page.data.save().then(function () {
        var param = {};

        param.from = crm_getAttribute("new_fromemail");
        param.to = crm_getAttribute("new_toemail");
        param.cc = crm_getAttribute("new_ccemail");
        param.bcc = crm_getAttribute("new_secretemail");
        param.subject = crm_getAttribute("subject");
        param.htmlcontent = crm_getAttribute("description");
        param.origenMessageId = crm_getAttribute("new_oriemailid");

        REST.apiURL = t_proxyUrl;
        var cstring = $.cookie("agentcookiestring");
        var agentId = $.cookie("cc_agentid");
        cookiestring = cstring;
        var retJson = TextChat.replyEmailWithoutCall({
            "workno": agentId,
            $entity: param,
        });
        var retResult = retJson.retcode;
        switch (retResult) {
            case 0:
                alert("Send the email succeeded!");
            default:
                alert("Get email info  failed. Retcode : " + retResult);
        }
    },
    function () {
        alert("failed to save the email infomation!");
    });
    
}

function crm_getAttribute(attName) {
    var result;
    if (attName && attName != "") {
        result = Xrm.Page.getAttribute(attName).getValue();
        return result;
    } else {
        return "";
    }
}

function agent_replyEmail() {
    var param = {};

    param["new_toemail"] = crm_getAttribute("new_fromemail");
    param["new_fromemail"] = crm_getAttribute("new_toemail");
    param["new_ccemail"] = crm_getAttribute("new_ccemail");
    param["new_secretemail"] = crm_getAttribute("new_secretemail");
    param["new_originalemail"] = Xrm.Page.data.entity.getId();

    param["new_originalemailname"] = Xrm.Page.data.entity.getPrimaryAttributeValue();
    param["subject"] = "Reply:" + crm_getAttribute("subject");
    //param["description"] = crm_getAttribute("description");
    var des = crm_getAttribute("description");
    param["new_oriemailid"] = crm_getAttribute("new_ccid");
    Xrm.Utility.openEntityForm("email", null, param);
}

function setPreEmailDesc() {
    if (Xrm.Page.ui.getFormType()==1&&Xrm.Page.getAttribute("new_oriemailid").getValue() != null && Xrm.Page.getAttribute("new_originalemail").getValue() != null) {
        var preEmailRef = Xrm.Page.getAttribute("new_originalemail").getValue();
        var preEmailId = preEmailRef[0].id;
        var preEmail = GetEntity("EmailSet", preEmailId);
        var desc = preEmail.Description;
        desc = "<br/><hr/>" + desc;
        if (desc != null) {
            Xrm.Page.getAttribute("description").setValue(desc);
        }
    }
}

function setDescOnload() {
    setTimeout("setPreEmailDesc()", 1500);
}