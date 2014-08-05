<!DOCTYPE html>
<%@ Page language="c#" Inherits="Microsoft.Crm.Web.MainPage" %>
<%@ Register TagPrefix="loc" Namespace="Microsoft.Crm.Application.Controls.Localization" Assembly="Microsoft.Crm.Application.Components.Application" %>
<%@ Register TagPrefix="cnt" Namespace="Microsoft.Crm.Application.Controls" Assembly="Microsoft.Crm.Application.Components.Application" %>
<%@ Register TagPrefix="rbn" Namespace="Microsoft.Crm.Application.Ribbon" Assembly="Microsoft.Crm.Application.Components.Application" %>
<%@ Register TagPrefix="ui" Namespace="Microsoft.Crm.Application.Components.UI" Assembly="Microsoft.Crm.Application.Components.UI" %>
<%@ Register TagPrefix="mnu" Namespace="Microsoft.Crm.Application.Menus" Assembly="Microsoft.Crm.Application.Components.Application" %>
<%@ Import Namespace="Microsoft.Crm.Utility" %>
<%@ Import Namespace="Microsoft.Crm.Application.Pages.Common" %>
<html lang='<% = Microsoft.Crm.Application.Utility.CrmCultureInfo.CurrentUICulture.TwoLetterISOLanguageName %>'>
<head>
<META name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="SHORTCUT ICON" href="/favicon.ico" />
<cnt:AppHeader id="crmHeader" runat="server" />
<title><loc:Text ResourceId="Web.default.aspx_16" CheckForLive="true" runat="server"/></title>
<link href="/ISV/page/style/style.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="/ISV/page/openjs/jquery-1.6.2.js"></script>
<script type="text/javascript" src="/ISV/page/openjs/json.js"></script>
<script type="text/javascript" src="/ISV/page/openjs/jquery.cookie.js"></script>
<script type="text/javascript" src="http://58.251.159.113:8080/agentgateway/resource-js"></script>
<script type="text/javascript">
    REST.apiURL = "http://58.251.159.113:8080/agentgateway/resource/";
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

<script type="text/javascript">
    function mouseover(btn) {

        $(btn).css({ "background": "#B1D6F0" });
    }
    function mouseout(btn) {
        $(btn).css({ "background": "#FFFFFF" });
    }
    function agentPanel_showDetailPanel() {
        if ($("#agent_DetailPanel").is(":hidden")) {
            $("#agent_DetailPanel").slideDown("slow");
            $("#agentButton_detailpanel img").attr("src", "/_imgs/arrow_up.jpg");
        } else {
            $("#agent_DetailPanel").slideUp("normal");
            $("#agentButton_detailpanel img").attr("src", "/_imgs/arrow_down.jpg");
        }
    }
    
</script>
</head>
<noscript>
<div style="padding:10px;background-color:#C9C7BA;">
<span class="warningHeader"><loc:Text ResourceId="Web.default.aspx_22" runat="server"/></span>
<hr size="1" color="#000000">
<span class="warningDescription">
<% if (Request.Browser.Browser == "IE") { %>
<loc:Text ResourceId="Web.loader.aspx_sec_warning" Encoding="None" runat="server"><loc:Argument runat="server"><i><% =Microsoft.Crm.CrmEncodeDecode.CrmHtmlEncode(GenerateServerUrl()) %></i></loc:Argument></loc:Text><br><br>
<loc:Text ResourceId="Web.default.aspx_Steps" Encoding="None" runat="server"/>
<br><br>
<loc:Text ResourceId="Web.default.aspx_Step1" Encoding="None" runat="server"/>
<br><br>

<loc:Text ResourceId="Web.default.aspx_Step2" Encoding="None" runat="server"/>
<br><br>

<loc:Text ResourceId="Web.default.aspx_Step3" Encoding="None" runat="server"/>
<br><br>

<loc:Text ResourceId="Web.default.aspx_Step4" Encoding="None" runat="server"><loc:Argument runat="server"><i><% =Microsoft.Crm.CrmEncodeDecode.CrmHtmlEncode(GenerateServerUrl()) %></i></loc:Argument></loc:Text>
<% } else { %>
<loc:Text ResourceId="Web.loader.nonIE.aspx_sec_warning" Encoding="None" runat="server"/>
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
<ui:EventManager runat="server" id="crmEventManager"></ui:EventManager>
<cnt:LayoutManager runat="server" id="crmWindowManager"></cnt:LayoutManager>
<cnt:CacheManager runat="server" id="crmCacheManager"></cnt:CacheManager>
<cnt:HistoryManager runat="server" id="crmHistoryManager"></cnt:HistoryManager>
<cnt:NavigationManager runat="server" id="crmNavigationManager"></cnt:NavigationManager>
<cnt:RecentlyViewed runat="server" id="crmRecentlyViewed"></cnt:RecentlyViewed>
<cnt:LookupMru runat="server" id="crmLookupMru"></cnt:LookupMru>


<div id="crmMasthead" runat="server" tabindex="-1">
<div class="navStatusArea" id="navStatusArea"></div>
<cnt:navbar id="navBar" runat="server"></cnt:navbar>
<div class="navBarOverlay" id="navBarOverlay"></div>
</div>
<div id="crmTopBar" class="ms-crm-TopBarContainer ms-crm-TopBarContainerGlobal" runat="server">

<div id="callcenterholder" style="z-index:1000;right:20px;float:right;margin-right:100px;">
<table style="width:100%;" cellspacing="5px">
<tr>
    <td>
    <div>
    <ul>
    <li id="agentPanel_login" style="float:right;margin-left:10px;height:20px;margin-left:5px;margin-right:5px;padding-top:2px;">
    WorkNo:<input type="text" maxlength="5" id="agentLogin_agentId" style="width:50px;border:0px;"/>
    Password:<input type="text" maxlength="20" id="agentLogin_password" style="width:70px;border:0px;"/>
    PhoneNumber:<input type="text" maxlength="24" id="agentLogin_phonenumber" style="width:50px;border:0px;"/>
    LoginStatus:<select id="agentLogin_loginstatus" style="border:0px;">
	    <option value="4">Idle</option>
	    <option value="5">ACW</option>
	</select>
    AlwaysOffHook:<select id="agentLogin_releasePhone" style="border:0px;">
        <option value="false">No</option>
        <option value="true">Yes</option>
    </select>
    </li>
<li id="agentPanel_status" style="float:right;margin-left:10px;height:20px;margin-left:5px;margin-right:5px;padding-top:2px;display:none;">
    <!-- Agent status and call information Begin -->
<div style="margin-right: 20px;">
   	<div style="float: left; width: 160px;">Agent Status:&nbsp;&nbsp;<span id="agentStatus_status"></span></div>
   	<div style="float: left; width: 120px;">Hold Calls:&nbsp;&nbsp;
		   	<span id="agentCall_holdCallNums"></span>
	</div>
   	<div>Current Call:&nbsp;&nbsp;
		   	<span id="agentCall_otherParty"></span>&nbsp;|&nbsp;
			<span id="agentCall_callStatus"></span>&nbsp;|&nbsp;
			<span id="agentCall_callFeature"></span>
	</div>
</div>
</li>
</ul>
</div>
</td>
</tr>

<tr>
<td><div>
<ul id="agentPanel_buttonlist">
<li>
<span id="agentButton_detailpanel" onclick="agentPanel_showDetailPanel()" onmouseover="mouseover(this)" onmouseout="mouseout(this)"  style="height:28px;cursor:pointer;padding:2px;" >
<img src="/_imgs/arrow_down.jpg" alt="Open detail panel" title="" style="width:18px"  />
</span>
</li>
<li>
<span id="agentLogin_logout" onclick="agentLogin_doLogout()" onmouseover="mouseover(this)" onmouseout="mouseout(this)" style="display:none;">
<img src="/_imgs/no_logout.jpg" alt="Logout" title="" style="width:18px;" />
<span >Logout</span>
</span>
</li>
<li>
<span id="Span1" onclick="agentCallOperation_toUnMetu()" onmouseover="mouseover(this)" onmouseout="mouseout(this)" style="display:none;">
<img src="/_imgs/unmute.jpg" alt="Conference" title="" style="width:18px;" />
<span >Unmetu</span>
</span>
</li>
<li>
<span id="agentCall_mute" onclick="agentCallOperation_toMetu()" onmouseover="mouseover(this)" onmouseout="mouseout(this)" style="display:none;">
<img src="/_imgs/mute.jpg" alt="Conference" title="" style="width:18px;"  />
<span >Mute</span>
</span>
</li>
<li>
<span id="agentCall_threeParty" onclick="agentCallOperation_showThreeParty()" onmouseover="mouseover(this)" onmouseout="mouseout(this)" style="display:none;">
<img src="/_imgs/conference.jpg" alt="Conference" title="" style="width:18px;" />
<span >Conference</span>
</span>
</li>
<li>
<span id="agentCall_innercall" onclick="agentCallOperation_showInnerCall()" onmouseover="mouseover(this)" onmouseout="mouseout(this)" >
<img src="/_imgs/innercall.jpg" alt="Logout" title="" style="width:18px;" />
<span >Innercall</span>
</span>
</li>
<li>
<span id="agentCall_innerhelp" onclick="agentCallOperation_showInnerHelp()" onmouseover="mouseover(this)" onmouseout="mouseout(this)" style="display:none;">
<img src="/_imgs/innerhelp.jpg" alt="Innerhelp" title="" style="width:18px;" />
<span >Innerhelp</span>
</span>
</li>
<li>
<span id="agentCall_unHold" onclick="agentCallOperation_showUnHold()" onmouseover="mouseover(this)" onmouseout="mouseout(this)" style="display:none;">
<img src="/_imgs/unhold.jpg" alt="Unhold" title="" style="width:18px;" />
<span >Unhold</span>
</span>
</li>
<li>
<span id="agentCall_transfer" onclick="agentCallOperation_showTransfer()" onmouseover="mouseover(this)" onmouseout="mouseout(this)" >
<img src="/_imgs/transfer.jpg" alt="Transfer" title="" style="width:18px;" />
<span >Transfer</span>
</span>
</li>
<li >
<span id="agentCall_hold" onclick="agentCallOperation_toHold()" onmouseover="mouseover(this)" onmouseout="mouseout(this)"  style="display:none;">
<img src="/_imgs/hold.jpg" alt="Hold" title="" style="width:18px;" />
<span >Hold</span>
</span>
</li>
<li >
<span id="agentCall_callout" onclick="agentCallOperation_showCallOut()" onmouseover="mouseover(this)" onmouseout="mouseout(this)"  >
<img src="/_imgs/callout.jpg" alt="Callout" title="" style="width:18px;" />
<span >Callout</span>
</span>
</li>
<li>
<span id="agentCall_hangup" onclick="agentCallOperation_toHangUp()" onmouseover="mouseover(this)" onmouseout="mouseout(this)"  style="height:28px;cursor:pointer;padding:2px;" >
<img src="/_imgs/hangup.jpg" alt="Login" title="" style="width:18px"  />
<span >Hangup</span>
</span>
</li>
<li>
<span id="agentCall_answer" onclick="agentCallOperation_toAnswer()" onmouseover="mouseover(this)" onmouseout="mouseout(this)"  style="height:28px;cursor:pointer;padding:2px;" >
<img src="/_imgs/answer.jpg" alt="Login" title="" style="width:18px"  />
<span >Answer</span>
</span>
</li>
<li>
<span id="agentLogin_login" onclick="agentLogin_doLogin()" onmouseover="mouseover(this)" onmouseout="mouseout(this)"  style="height:28px;cursor:pointer;padding:2px;" >
<img src="/_imgs/logon.jpg" alt="Login" title="" style="width:18px"  />
<span >Login</span>
</span>
</li>

</ul>
</div></td>
</tr>
</table>


</div>

<cnt:AppMessageBar id="crmAppMessageBar" runat="server"></cnt:AppMessageBar>
<rbn:RibbonManager id="crmRibbonManager" runat="server"></rbn:RibbonManager>
<cnt:UserInfo id="crmUserInfo" class="crmUserInfo" runat="server"></cnt:UserInfo>
<div id="contextualActionBar">
<cnt:RecordSetControlProxy id="crmRecordSetControlProxy" runat="server" />
<a tabIndex="0" href="javascript:popOutSourceUrl(document.getElementById('popoutButton').getAttribute('sourceUrl'));"
class="contextualAction" id="popoutButton" style="display: none">
<img alt="<%= Microsoft.Crm.CrmEncodeDecode.CrmHtmlAttributeEncode(AppResourceManager.Default.GetString("Form_PopOut")) %>"
title="<%= Microsoft.Crm.CrmEncodeDecode.CrmHtmlAttributeEncode(AppResourceManager.Default.GetString("Form_PopOut"))%>"
src="<%=PopOutImageStripInfo.ImageStripUrl.ToString() %>"
class="<%=PopOutImageStripInfo.CssClass %>" />
</a>
</div>
</div>

<!--add for detail panel -->
<div id="agent_DetailPanel" style="padding: 8px; border: 1px solid currentColor; top: 100px; width: 500px; height: 400px; right: 100px; float: right; position: absolute; z-index: 100; background-color: rgb(255, 255, 255);border-color:#DDD;display:none;">
    <div>Agent Status Button</div>
	<div>
		<input type="button" id="agentStatus_InWork" value="InWork" style="display: none;" disabled="disabled" onclick="agentStatusOperation_toWork()"/>
		<input type="button" id="agentStatus_ExitWork" value="ExitWork" disabled="disabled" onclick="agentStatusOperation_toExitWork()"/>
		<input type="button" id="agentStatus_rest" value="Rest" disabled="disabled" onclick="agentStatusOperation_showRestWindow()"/>
		<input type="button" id="agentStatus_cancelRest" value="CancelRest" style="display: none;" disabled="disabled" onclick="agentStatusOperation_toCancelRest()"/>
		<input type="button" id="agentStatus_sayBusy" value="Busy" disabled="disabled" onclick="agentStatusOperation_toBusy()" />
		<input type="button" id="agentStatus_sayIdle" value="Idle" style="display: none;" disabled="disabled" onclick="agentStatusOperation_toIdle()"/>
	</div>

    <div>
	<table cellpadding="1" cellspacing="0" class="content_form_table">
		<tr>
			<td class="content_form_fieldname">Is Auto Answer</td>
			<td><input type="radio" value="0" name="agentSetting_autoAnswer" checked="checked" /><label>Yes</label><input type="radio" value="1" name="agentSetting_autoAnswer"/><label>No</label></td>
			<td><input type="button" value="submit" onclick="agentCallOperation_toSetAutoAnswer()"/></td>
		</tr>
		<tr>
			<td class="content_form_fieldname">Is Into ACW After Hangup</td>
			<td><input type="radio" value="0" name="agentSetting_intoACW"/><label>Yes</label><input type="radio" value="1" name="agentSetting_intoACW" checked="checked"/><label>No</label></td>
			<td><input type="button" value="submit" onclick="agentCallOperation_toSetIntoAcw()"/></td>
		</tr>
	</table>
    </div>

    <div>
	<div>Agent Console</div>
	<div><input type="button" value="Clean Log" onclick="agentConsole_cleanLog()" style="border:0px;"></div>
	<div style="height: 300px;overflow-y: auto;overflow-x:hidden;">
		<table id="agentConsole" cellpadding="1" cellspacing="0" class="content_form_table" style="width: 100%">
			<colgroup>
				<col width="150px"/>
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
    <div id="agent_WebchatHeader">
        <div id="webchat_FormButtons">
            <ul>
                <li>
                    <span id="webchat_CustomInfo"></span>
                </li>
                <li>
                    <input id="webchat_min" />
                </li>
                <li>
                    <input id="webchat_max" />
                </li>
                <li>
                    <input id="webchat_close" />
                </li>
            
            </ul>
        </div>
    </div>

    <div id="agent_WebchatContent">

    </div>
    
    <div id="agent_WebchatFooter">
        <div id="webchat_InputArea"></div>
        <div id="webchat_Buttons"></div>
    </div>
</div>
<div id="agent_WebchatTab">
    <span>Webchat</span>
    
</div>

<div>
<cnt:AppNavBar id="crmAppNav" runat="server"></cnt:AppNavBar>
<cnt:SplitterControl id="crmSplitterControl" runat="server"></cnt:SplitterControl>
<cnt:ContentPanel id="crmContentPanel" runat="server"></cnt:ContentPanel>
</div>
<cnt:AppFooter id="crmFooter" runat="server"/>
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
        }
    }
    
    
</script>