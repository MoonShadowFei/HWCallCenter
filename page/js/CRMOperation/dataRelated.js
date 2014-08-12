function RESTHelper() { }

/* 
   方法简介：通过REST对Dynamics CRM 中的实体进行Create操作。 
   输入参数： 
        createurl:调用Dynamics CRM数据服务的URL字符串。例如："/GH2011/XRMServices/2011/OrganizationData.svc/ContactSet" 
        jsondata：需要进行Create操作的对象，必须进行json序列化。 
   输出参数： 
        true：Create成功。 
        false：Create失败。 
 
*/
RESTHelper.prototype.Create = function (createurl, jsondata) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", createurl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xmlhttp.setRequestHeader("Content-Length", jsondata.length);
    xmlhttp.setRequestHeader("Accept", "application/json");
    xmlhttp.send(jsondata);

    if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 201) {
            return true;

        }
        else {
            return false;
        }
    }//if  
}

function crmData_getUserInfo(userid) {
    var staffID = '';
    var agentPhone = '';
    var org = Xrm.Page.context.getOrgUniqueName();
    var userid = userid.replace(/{/g, '').replace(/}/g, '');
    var serverUrl = document.location.protocol + "//" + document.location.host + "/" + org;
    var remoteUrl = serverUrl + "/XRMServices/2011/OrganizationData.svc/SystemUserSet(guid'" + userid + "')";
    $.ajax({
        async: false,
        type: "GET",
        contentType: "application/json;charset=utf-8",
        datatype: "json",
        url: remoteUrl,
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, textStatus, XmlHttpRequest) {
            var user = data.d;
            staffID = user.new_staffid;
            agentPhone = user.new_agentphone;

        },
        error: function (XmlHttpRequest, textStatus, erroThrown) { alert(textStatus + erroThrown); }
    });
    return { userID: staffID, userPhone: agentPhone };
}

function crmData_createEmail(emailid,from,to,subject,content) {
    var email = {};
    email.new_ccid = emailid;
    if (from) {
        email.new_fromemail = from;
    }
    if (to) {
        email.new_toemail = to;
    }
    if (subject) {
        email.Subject = subject;
    }
    if (content) {
        email.Description = content;
    }
    var org = Xrm.Page.context.getOrgUniqueName();
    var serverUrl = document.location.protocol + "//" + document.location.host + "/" + org;
    var remoteUrl = serverUrl + "/XRMServices/2011/OrganizationData.svc/EmailSet";
    var Helper = new RESTHelper();
    var result = Helper.Create(remoteUrl, JSON.stringify(email));
    return result;
}