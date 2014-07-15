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
<link href="page/style/style.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="/ISV/page/openjs/jquery-1.6.2.js"></script>
<script type="text/javascript" src="/ISVpage/openjs/json.js"></script>
<script type="text/javascript" src="http://192.168.1.109:80/agentgateway/resource-js"></script>
<script type="text/javascript">
    REST.apiURL = "http://192.168.1.109:80/agentgateway/resource/";
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

<script type="text/javascript">
    function mouseover(btn) {

        $(btn).css({ "background": "#B1D6F0" });
    }
    function mouseout(btn) {
        $(btn).css({ "background": "#FFFFFF" });
    }
    function agentPanel_showDetailPanel() {
        if ($("#agent_DetailPanel").is(":hidden")) {
            $("#agent_DetailPanel").show();
        } else {
            $("#agent_DetailPanel").hide();
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
    WorkNo<input type="text" maxlength="5" id="agentLogin_agentId" style="width:50px;border:0px;"/>
    Password<input type="text" maxlength="20" id="agentLogin_password" style="width:100px;border:0px;"/>
    PhoneNumber<input type="text" maxlength="24" id="agentLogin_phonenumber" style="width:50px;border:0px;"/>
    <select id="agentLogin_loginstatus">
	    <option value="4">Idle</option>
	    <option value="5">ACW</option>
	</select>
    <select id="agentLogin_releasePhone">
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
<ul>
<li style="float:right;margin-left:10px;height:28px;margin-left:5px;margin-right:5px;">
<span id="agentLogin_logout" onclick="agentLogin_doLogout()" onmouseover="mouseover(this)" onmouseout="mouseout(this)" >
<img src="/_imgs/logout.jpg" alt="外呼" title="点击打开拨号盘外拨电话" style="width:18px;" />
<span >Logout</span>
</span>
</li>
<li style="float:right;margin-left:10px;height:28px;margin-left:5px;margin-right:5px;">
<span id="agentCall_unHold" onclick="agentCallOperation_showUnHold()" onmouseover="mouseover(this)" onmouseout="mouseout(this)" >
<img src="/_imgs/unhold.jpg" alt="外呼" title="点击打开拨号盘外拨电话" style="width:18px;" />
<span >Unhold</span>
</span>
</li>
<li style="float:right;margin-left:10px;height:28px;margin-left:5px;margin-right:5px;">
<span id="agentCall_transfer" onclick="agentCallOperation_showTransfer()" onmouseover="mouseover(this)" onmouseout="mouseout(this)" >
<img src="/_imgs/transfer.jpg" alt="外呼" title="点击打开拨号盘外拨电话" style="width:18px;" />
<span >Transfer</span>
</span>
</li>
<li style="float:right;margin-left:10px;height:28px;margin-left:5px;margin-right:5px;" >
<span id="agentCall_hold" onclick="agentCallOperation_toHold()" onmouseover="mouseover(this)" onmouseout="mouseout(this)"  >
<img src="/_imgs/hold.jpg" alt="外呼" title="点击打开拨号盘外拨电话" style="width:18px;" />
<span >Hold</span>
</span>
</li>
<li style="float:right;margin-left:10px;height:28px;margin-left:5px;margin-right:5px;">
<span id="agentCall_callout" onclick="agentCallOperation_showCallOut()" onmouseover="mouseover(this)" onmouseout="mouseout(this)"  >
<img src="/_imgs/callout.jpg" alt="Callout" title="点击打开拨号盘外拨电话" style="width:18px;" />
<span >Callout</span>
</span>
</li>
<li style="float:right;margin-left:10px;height:28px;margin-left:5px;margin-right:5px;border:1px;">
<span id="agentLogin_login" onclick="agentLogin_doLogin()" onmouseover="mouseover(this)" onmouseout="mouseout(this)"  style="height:28px;cursor:pointer;padding:2px;" >
<img src="/_imgs/logon.jpg" alt="Login" title="点击打开拨号盘外拨电话" style="width:18px"  />
<span style="font-family:Microsoft YaHei,SimSun,Tahoma,Arial;color:#444444;">Login</span>
</span>
</li>
<li style="float:right;margin-left:10px;height:28px;margin-left:5px;margin-right:5px;border:1px;">
<span id="agentButton_detailpanel" onclick="agentPanel_showDetailPanel()" onmouseover="mouseover(this)" onmouseout="mouseout(this)"  style="height:28px;cursor:pointer;padding:2px;" >
<img src="/_imgs/arrow_down.jpg" alt="Login" title="点击打开拨号盘外拨电话" style="width:18px"  />
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
<div id="agent_DetailPanel" style="padding: 2px; border: 1px solid currentColor; top: 100px; width: 500px; height: 400px; right: 100px; float: right; position: absolute; z-index: 100; background-color: rgb(255, 255, 255);border-color:#DDD;">
    <div>Agent Status Button</div>
	<div>
		<input type="button" id="agentStatus_InWork" value="InWrok" style="display: none;" disabled="disabled" onclick="agentStatusOperation_toWork()"/>
		<input type="button" id="agentStatus_ExitWork" value="ExitWork" disabled="disabled" onclick="agentStatusOperation_toExitWork()"/>
		<input type="button" id="agentStatus_rest" value="Rest" disabled="disabled" onclick="agentStatusOperation_showRestWindow()"/>
		<input type="button" id="agentStatus_cancelRest" value="CancelRest" style="display: none;" disabled="disabled" onclick="agentStatusOperation_toCancelRest()"/>
		<input type="button" id="agentStatus_sayBusy" value="Busy" disabled="disabled" onclick="agentStatusOperation_toBusy()" />
		<input type="button" id="agentStatus_sayIdle" value="Idle" style="display: none;" disabled="disabled" onclick="agentStatusOperation_toIdle()"/>
	</div>

</div>

<div>
<cnt:AppNavBar id="crmAppNav" runat="server"></cnt:AppNavBar>
<cnt:SplitterControl id="crmSplitterControl" runat="server"></cnt:SplitterControl>
<cnt:ContentPanel id="crmContentPanel" runat="server"></cnt:ContentPanel>
</div>
<cnt:AppFooter id="crmFooter" runat="server"/>
</body>
</html>
