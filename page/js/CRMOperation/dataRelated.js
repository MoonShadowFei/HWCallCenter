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