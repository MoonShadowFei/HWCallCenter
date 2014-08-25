<!DOCTYPE html>

<%@ Page Language="c#" Inherits="Microsoft.Crm.Web.MainPage" %>

<%@ Register TagPrefix="loc" Namespace="Microsoft.Crm.Application.Controls.Localization"
    Assembly="Microsoft.Crm.Application.Components.Application" %>
<%@ Register TagPrefix="cnt" Namespace="Microsoft.Crm.Application.Controls" Assembly="Microsoft.Crm.Application.Components.Application" %>
<%@ Register TagPrefix="rbn" Namespace="Microsoft.Crm.Application.Ribbon" Assembly="Microsoft.Crm.Application.Components.Application" %>
<%@ Register TagPrefix="ui" Namespace="Microsoft.Crm.Application.Components.UI" Assembly="Microsoft.Crm.Application.Components.UI" %>
<%@ Register TagPrefix="mnu" Namespace="Microsoft.Crm.Application.Menus" Assembly="Microsoft.Crm.Application.Components.Application" %>
<%@ Import Namespace="Microsoft.Crm.Utility" %>
<%@ Import Namespace="Microsoft.Crm.Application.Pages.Common" %>
<html lang='<% = Microsoft.Crm.Application.Utility.CrmCultureInfo.CurrentUICulture.TwoLetterISOLanguageName %>'>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="SHORTCUT ICON" href="/favicon.ico" />
    <cnt:appheader id="crmHeader" runat="server" />
    <title>
        <loc:text resourceid="Web.default.aspx_16" checkforlive="true" runat="server" />
    </title>
    <link href="/ISV/page/style/style.css" rel="stylesheet" type="text/css" />

    <script type="text/javascript" src="/ISV/page/openjs/jquery-1.6.2.js"></script>

    <script type="text/javascript" src="/ISV/page/openjs/json.js"></script>

    <script type="text/javascript" src="/ISV/page/openjs/jquery.cookie.js"></script>

   <script type="text/javascript" src="http://10.174.5.148:8060/agentgateway/resource-js"></script>

    <script type="text/javascript">
        REST.apiURL = "http://10.174.5.148:8060/agentgateway/resource/";
    </script>

    <script type="text/javascript" src="/ISV/page/js/common/common.js"></script>

    <script type="text/javascript" src="/ISV/page/js/common/constants.js"></script>

    <script type="text/javascript" src="/ISV/page/js/common/agentInfo.js"></script>

    <script type="text/javascript" src="/ISV/page/js/common/callInfo.js"></script>

    <script type="text/javascript" src="/ISV/page/js/common/buttonInfo.js"></script>

    <script type="text/javascript" src="/ISV/page/js/common/hashMap.js"></script>

    <script type="text/javascript" src="/ISV/page/js/common/resultCode.js"></script>

    <script type="text/javascript" src="/ISV/page/js/common/globalVariable.js"></script>

    <script type="text/javascript" src="/ISV/page/js/common/agentConsole.js"></script>

    <script type="text/javascript" src="/ISV/page/js/eventHandle/eventHandle.js"></script>

    <script type="text/javascript" src="/ISV/page/js/eventHandle/eventProcess.js"></script>

    <script type="text/javascript" src="/ISV/page/js/eventHandle/agentStatus.js"></script>

    <script type="text/javascript" src="/ISV/page/js/operation/agentLogin.js"></script>

    <script type="text/javascript" src="/ISV/page/js/operation/agentStatusOperation.js"></script>

    <script type="text/javascript" src="/ISV/page/js/operation/agentCallOperation.js"></script>

    <script type="text/javascript" src="/ISV/page/js/operation/agentCallInfo.js"></script>

    <script type="text/javascript" src="/ISV/page/js/CRMOperation/formStatus.js"></script>

    <script type="text/javascript" src="/ISV/page/js/CRMOperation/dataRelated.js"></script>

</head>
<noscript>
    <div style="padding: 10px; background-color: #C9C7BA;">
        <span class="warningHeader">
            <loc:text resourceid="Web.default.aspx_22" runat="server" />
        </span>
        <hr size="1" color="#000000">
        <span class="warningDescription">
            <% if (Request.Browser.Browser == "IE") { %>
            <loc:text resourceid="Web.loader.aspx_sec_warning" encoding="None" runat="server"><loc:Argument runat="server"><i><% =Microsoft.Crm.CrmEncodeDecode.CrmHtmlEncode(GenerateServerUrl()) %></i></loc:Argument></loc:text>
            <br>
            <br>
            <loc:text resourceid="Web.default.aspx_Steps" encoding="None" runat="server" />
            <br>
            <br>
            <loc:text resourceid="Web.default.aspx_Step1" encoding="None" runat="server" />
            <br>
            <br>
            <loc:text resourceid="Web.default.aspx_Step2" encoding="None" runat="server" />
            <br>
            <br>
            <loc:text resourceid="Web.default.aspx_Step3" encoding="None" runat="server" />
            <br>
            <br>
            <loc:text resourceid="Web.default.aspx_Step4" encoding="None" runat="server"><loc:Argument runat="server"><i><% =Microsoft.Crm.CrmEncodeDecode.CrmHtmlEncode(GenerateServerUrl()) %></i></loc:Argument></loc:text>
            <% } else { %>
            <loc:text resourceid="Web.loader.nonIE.aspx_sec_warning" encoding="None" runat="server" />
            <% } %>
        </span>
    </div>
</noscript>
<!--[if MSCRMClient]>
<script  type="text/javascript">


var MS_CRM_CLIENT_OUTLOOK_INSTALLED=true;
</script>
<![endif]-->
<body scroll="no">
    <ui:eventmanager runat="server" id="crmEventManager"></ui:eventmanager>
    <cnt:layoutmanager runat="server" id="crmWindowManager"></cnt:layoutmanager>
    <cnt:cachemanager runat="server" id="crmCacheManager"></cnt:cachemanager>
    <cnt:historymanager runat="server" id="crmHistoryManager"></cnt:historymanager>
    <cnt:navigationmanager runat="server" id="crmNavigationManager"></cnt:navigationmanager>
    <cnt:recentlyviewed runat="server" id="crmRecentlyViewed"></cnt:recentlyviewed>
    <cnt:lookupmru runat="server" id="crmLookupMru"></cnt:lookupmru>
    <div id="crmMasthead" runat="server" tabindex="-1">
        <div class="navStatusArea" id="navStatusArea">
        </div>
        <cnt:navbar id="navBar" runat="server"></cnt:navbar>
        <div class="navBarOverlay" id="navBarOverlay">
        </div>
    </div>
    <div id="crmTopBar" class="ms-crm-TopBarContainer ms-crm-TopBarContainerGlobal" runat="server">
        <div id="callcenterholder" style="z-index: 1000; right: 20px; float: right; margin-right: 100px;">
            <table style="width: 100%;" cellspacing="5px">
                <tr>
                    <td>
                        <div>
                            <ul>
                                <li id="agentPanel_status" style="float: right; margin-left: 10px; height: 20px;
                                    margin-left: 5px; margin-right: 5px; padding-top: 2px; display: none;">
                                    <div style="margin-right: 20px;">
                                        <div style="float: left; width: 120px;">
                                            Hold Calls:&nbsp;&nbsp; <span id="agentCall_holdCallNums"></span>
                                        </div>
                                        <div>
                                            Current Call:&nbsp;&nbsp; <span id="agentCall_otherParty"></span>&nbsp;|&nbsp; <span
                                                id="agentCall_callStatus"></span>&nbsp;|&nbsp; <span id="agentCall_callFeature">
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        <cnt:appmessagebar id="crmAppMessageBar" runat="server"></cnt:appmessagebar>
        <rbn:ribbonmanager id="crmRibbonManager" runat="server"></rbn:ribbonmanager>
        <cnt:userinfo id="crmUserInfo" class="crmUserInfo" runat="server"></cnt:userinfo>
        <div id="contextualActionBar">
            <cnt:recordsetcontrolproxy id="crmRecordSetControlProxy" runat="server" />
            <a tabindex="0" href="javascript:popOutSourceUrl(document.getElementById('popoutButton').getAttribute('sourceUrl'));"
                class="contextualAction" id="popoutButton" style="display: none">
                <img alt="<%= Microsoft.Crm.CrmEncodeDecode.CrmHtmlAttributeEncode(AppResourceManager.Default.GetString("Form_PopOut")) %>"
                    title="<%= Microsoft.Crm.CrmEncodeDecode.CrmHtmlAttributeEncode(AppResourceManager.Default.GetString("Form_PopOut"))%>"
                    src="<%=PopOutImageStripInfo.ImageStripUrl.ToString() %>" class="<%=PopOutImageStripInfo.CssClass %>" />
            </a>
        </div>
    </div>
    <!--add for detail panel -->
    <div>
        <cnt:appnavbar id="crmAppNav" runat="server"></cnt:appnavbar>
        <cnt:splittercontrol id="crmSplitterControl" runat="server"></cnt:splittercontrol>
        <cnt:contentpanel id="crmContentPanel" runat="server"></cnt:contentpanel>
    </div>
    <cnt:appfooter id="crmFooter" runat="server" />
    <div id="agent_popupLogin" class="agent_popup" style="display: none;">
        <div class="agent_popMask">
        </div>
        <div id="agent_loginPopDiv">
            <h2>
                Log in callcenter</h2>
            <form id="agent_login_pop">
            <table style="width: 100%;">
                <tr>
                    <td align="right" width="120">
                        <label for="agentLogin_agentId">
                            WorkNo:</label>
                    </td>
                    <td align="left">
                        <input type="text" maxlength="5" id="agentLogin_agentId" style="width: 110px; border: solid 1px #000;"
                            disabled />
                    </td>
                </tr>
                <tr>
                    <td align="right">
                        <label for="agentLogin_password">
                            Password:</label>
                    </td>
                    <td align="left">
                        <input type="text" maxlength="20" id="agentLogin_password" style="width: 110px; border: solid 1px #000;" />
                    </td>
                </tr>
                <tr>
                    <td align="right">
                        <label for="agentLogin_phonenumber">
                            PhoneNumber:</label>
                    </td>
                    <td align="left">
                        <input type="text" maxlength="24" id="agentLogin_phonenumber" style="width: 110px;
                            border: solid 1px #000;" />
                    </td>
                </tr>
                <tr>
                    <td align="right">
                        <label>
                            LoginStatus:</label>
                    </td>
                    <td align="left">
                        <select id="agentLogin_loginstatus" style="border: solid 1px #000; width: 115px;">
                            <option value="4">Idle</option>
                            <option value="5">ACW</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td align="right">
                        <label>
                            AlwaysOffHook:</label>
                    </td>
                    <td align="left">
                        <select id="agentLogin_releasePhone" style="border: solid 1px #000; width: 115px;">
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                        </select>
                    </td>
                </tr>
            </table>
            <input id="agentLogin_login" class="pop_login" type="button" value="login" onclick="agentLogin_doLogin()" />
            <input class="pop_cancle" type="button" value="cancle" onclick="callcenter_closeLogin()" />
            </form>
        </div>
    </div>
    <div id="agent_voiceTop" class="top_buttonPanel" onclick="callcenter_toggerVoiceControl()"
        style="display: none">
        <span id="agentStatus_status">Idle</span><img src="/_imgs/ArrowUp.png" id="arrow" /></span>
    </div>
    <div id="agent_voiceControlPanel" class="top_buttonList" style="display: none">
        <ul id="Ul1">
            <li id="agentCall_answer" onclick="agentCallOperation_toAnswer(this)" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/answer.jpg" alt="Login" title="Answer" />Answer</li>
            <li id="agentCall_hangup" onclick="agentCallOperation_toHangUp(this)" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/hangup.jpg" alt="Login" title="Hangup" />Hangup</li>
            <li id="agentCall_callout" onclick="agentCallOperation_showCallOut(this)" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                 <img src="/_imgs/callout.jpg" alt="CallOut" title="CallOut" />CallOut</li>
            <li id="agentCall_secondDial" onclick="agentCallOperation_showSecondDial(this)" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/answer.jpg" alt="SecondDial" title="SecondDial" />SecondDial</li>
            <li id="agentCall_hold" onclick="agentCallOperation_toHold(this)" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/hold.jpg" alt="Hold" title="Hold" />Hold</li>
            <li id="agentCall_unHold" onclick="agentCallOperation_showUnHold(this)" style="display: none"
                onmouseover="mouseover(this)" onmouseout="mouseout(this)">
                <img src="/_imgs/unhold.jpg" alt="Unhold" title="Unhold" />Unhold</li>
            <li id="agentCall_transfer" onclick="agentCallOperation_showTransfer(this)" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/transfer.jpg" alt="Transfer" title="Transfer" />Transfer</li>
            <li id="agentCall_innerhelp" onclick="agentCallOperation_showInnerHelp(this)" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/innerhelp.jpg" alt="Innerhelp" title="Innerhelp" />Innerhelp</li>
            <li id="agentCall_innercall" onclick="agentCallOperation_showInnerCall(this)" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/innercall.jpg" alt="Logout" title="Innercall" />Innercall</li>
            <li id="agentCall_threeParty" onclick="agentCallOperation_showThreeParty(this)" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/conference.jpg" alt="Conference" title="Conference" />Conference</li>
            <li id="agentCall_mute" onclick="agentCallOperation_toMetu(this)" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/mute.jpg" alt="Conference" title="Mute" style="width: 18px;" />Mute</li>
            <li id="agentCall_unmute" onclick="agentCallOperation_toUnMetu(this)" style="display: none"
                onmouseover="mouseover(this)" onmouseout="mouseout(this)">
                <img src="/_imgs/unmute.jpg" alt="Conference" title="Unmetu" />Unmetu</li>
            
            <li id="agentStatus_InWork" onclick="agentStatusOperation_toWork(this)" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/inwork.jpg" alt="Inwork" title="Inwork" />
                InWork</li>
            <li id="agentStatus_ExitWork" onclick="agentStatusOperation_toExitWork(this)" style="display: none;"
                onmouseover="mouseover(this)" onmouseout="mouseout(this)">
                <img src="/_imgs/exitwork.jpg" alt="ExitWork" title="ExitWork" />
                ExitWork</li>
            <li id="agentStatus_rest" onclick="agentStatusOperation_showRestWindow(this)" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/rest.jpg" alt="Rest" title="Rest" />
                Rest</li>
            <li id="agentStatus_cancelRest" onclick="agentStatusOperation_toCancelRest(this)"  style="display: none" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/rest.jpg" alt="CancelRest" title="CancelRest" />
                CancelRest</li>
            <li id="agentStatus_sayBusy" onclick="agentStatusOperation_toBusy(this)" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/busy.jpg" alt="Busy" title="Busy" />
                Busy</li>
            <li id="agentStatus_sayIdle" onclick="agentStatusOperation_toIdle(this)" style="display: none;"
                onmouseover="mouseover(this)" onmouseout="mouseout(this)">
                <img src="/_imgs/idle.jpg" alt="Idle" title="Idle" />
                Idle</li>
            <li id="agentLogin_logout" onclick="agentLogin_doLogout()" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/no_logout.jpg" alt="Logout" title="Logout" />
                Logout</li>
            <li id="agentButton_detailpanel" onclick="agentPanel_showDetailPanel()" onmouseover="mouseover(this)"
                onmouseout="mouseout(this)">
                <img src="/_imgs/arrow_down.jpg" alt="Open detail panel" title="" /></li>
        </ul>
    </div>
    <div id="agent_DetailPanel" class="top_detailPanel">
        <div>
            <table cellpadding="1" cellspacing="0" class="content_form_table">
                <tr>
                    <td class="content_form_fieldname">
                        Is Auto Answer
                    </td>
                    <td>
                        <input type="radio" value="0" name="agentSetting_autoAnswer" checked="checked" /><label>Yes</label><input
                            type="radio" value="1" name="agentSetting_autoAnswer" /><label>No</label>
                    </td>
                    <td>
                        <input type="button" value="submit" onclick="agentCallOperation_toSetAutoAnswer()" />
                    </td>
                </tr>
                <tr>
                    <td class="content_form_fieldname">
                        Is Into ACW After Hangup
                    </td>
                    <td>
                        <input type="radio" value="0" name="agentSetting_intoACW" /><label>Yes</label><input
                            type="radio" value="1" name="agentSetting_intoACW" checked="checked" /><label>No</label>
                    </td>
                    <td>
                        <input type="button" value="submit" onclick="agentCallOperation_toSetIntoAcw()" />
                    </td>
                </tr>
            </table>
        </div>
        <div>
            <div>
                Agent Console</div>
            <div>
                <input type="button" value="Clean Log" onclick="agentConsole_cleanLog()" style="border: 0px;"></div>
            <div style="height: 300px; overflow-y: auto; overflow-x: hidden;">
                <table id="agentConsole" cellpadding="1" cellspacing="0" class="content_form_table"
                    style="width: 100%">
                    <colgroup>
                        <col width="150px" />
                    </colgroup>
                    <thead>
                        <tr>
                            <td>
                                Date
                            </td>
                            <td>
                                Message
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <!--add for Webchar Panel -->
    <div id="agent_WebchatPanel">
        <div id="agent_WebchatHeader" style="background-color:#002050">
            <div id="webchat_FormButtons">
                <!--<ul>
                    <li><span id="webchat_CustomInfo"></span></li>
                    <li>
                        
                    </li>
                    <li>
                        <input id="webchat_max" />
                    </li>
                    <li>
                        <input id="webchat_close" />
                    </li>
                </ul>-->
                <div id="webchat_min" onclick="crmForm_webchatTabClick()">
                    <img src="/_imgs/webchat_min.png" alt="" />
                </div>
            </div>
        </div>
        <div id="agent_WebchatContent">
        </div>
        <div id="agent_WebchatFooter">
            <div id="webchat_InputArea">
                <textarea id="webchat_Input" style="overflow-y: scroll; height: 98%;" maxlength="4000"></textarea>
            </div>
            <div id="webchat_Buttons">
                <input type="button" id="webchat_button_endchat" value="EndChat" onclick="agentTextChatControl_toDropChat()" />
                <input type="button" id="webchat_button_send" value="Send" onclick="agentTextChatControl_toSendChat()" />
            </div>
        </div>
    </div>
    <div id="agent_WebchatTab">
        <span onclick="crmForm_webchatTabClick()" style="width: 100%; height: 100%">Webchat</span>
    </div>
    <div>
</body>
</html>

<script type="text/javascript">

    var qs = window.location.search.substr(1);
    var agentInfo = crmData_getUserInfo(Xrm.Page.context.getUserId().toString());
    var homepage = false;
    if (qs == '') //homepage
    {
        homepage = true;
    }
    if (!homepage || !agentInfo.userID) {
        $("#callcenterholder").hide();
        $("#agent_DetailPanel").hide();
    } else {
        var userID = "";
        var agentPhone = "";
        if (agentInfo) {
            userID = agentInfo.userID;
            agentPhone = agentInfo.userPhone;
            $("#agentLogin_agentId").val(userID);
            $("#agentLogin_phonenumber").val(agentPhone);
            $("#agent_popupLogin").show();
        }
    }


    function mouseover(btn) {
        if ($(btn).attr("disabled") == "disabled") return;
        $(btn).css({ "background": "#B1D6F0", "border-left": "solid 1px #000", "border-right": "solid 1px #000" });
    }
    function mouseout(btn) {
        if ($(btn).attr("disabled") == "disabled") return;
        $(btn).css({ "background": "#FFF", "border-left": "solid 1px #fff", "border-right": "solid 1px #fff" });
    }
    function agentPanel_showDetailPanel() {
        if ($("#agent_DetailPanel").is(":hidden")) {
            $("#agent_DetailPanel").slideDown("slow");
            $("#agentButton_detailpanel img").attr("src", "/_imgs/arrow_up.jpg");
            var width = $("#agent_voiceControlPanel").width();
            var right = (screen.availWidth - width) / 2;
            $("#agent_DetailPanel").css("right", right);
        } else {
            $("#agent_DetailPanel").slideUp("normal");
            $("#agentButton_detailpanel img").attr("src", "/_imgs/arrow_down.jpg");

        }
    }

    function callcenter_loginSuccess() {

        $("#agent_popupLogin").hide();
        $("#agent_voiceTop").show();
        callcenter_showVoiceControl();
    }

    function callcenter_closeLogin() {
        $("#agent_popupLogin").hide();
    }

    function callcenter_toggerVoiceControl() {
        if ($("#agent_voiceControlPanel").is(":hidden")) {
            callcenter_showVoiceControl();
            $("#arrow").attr("src", "/_imgs/ArrowUp.png");
        }
        else {
            callcenter_hideVoiceControl();
            $("#agent_DetailPanel").slideUp("normal");
            $("#agentButton_detailpanel img").attr("src", "/_imgs/arrow_down.jpg");
            $("#arrow").attr("src", "/_imgs/ArrowDown.png");
        }
    }

    function callcenter_showVoiceControl() {
        $("#agent_voiceControlPanel").slideDown("slow");
        var width = $("#agent_voiceControlPanel").width();
        var left = (screen.availWidth - width) / 2 - 4;
        $("#agent_voiceControlPanel").css("left", left);
    }

    function callcenter_hideVoiceControl() {
        $("#agent_voiceControlPanel").slideUp("normal");
    }
</script>

