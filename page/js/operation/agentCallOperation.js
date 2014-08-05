/**
 * show the window about call out 
 */
function agentCallOperation_showCallOut()
{
	window.open(WINDOW_LIST.CALLOUT, "AgentCallout", "left=" +  (window.screen.availWidth-400)/2 
			+ ",top=" + (window.screen.availHeight-250)/2
			+ ",width=400,height=250,scrollbars=no,resizable=no,toolbar=no,directories=no,status=no,menubar=no");
}

/**
 * show the window about second dial
 */
function agentCallOperation_showSecondDial()
{
	window.open(WINDOW_LIST.SECONDDIAL, "AgentSecondDial", "left=" +  (window.screen.availWidth-400)/2 
			+ ",top=" + (window.screen.availHeight-250)/2
			+ ",width=400,height=250,scrollbars=no,resizable=no,toolbar=no,directories=no,status=no,menubar=no");
}


/**
 * show the window about transfer
 */
function agentCallOperation_showTransfer()
{
	window.open(WINDOW_LIST.TRANSFER, "AgentTransfer", "left=" +  (window.screen.availWidth-600)/2 
			+ ",top=" + (window.screen.availHeight-500)/2
			+ ",width=600,height=500,scrollbars=no,resizable=no,toolbar=no,directories=no,status=no,menubar=no");
}


/**
 * Show the window about the hold call list 
 */
function agentCallOperation_showUnHold()
{
	window.open(WINDOW_LIST.HOLDLIST, "AgentHoldList", "left=" +  (window.screen.availWidth-400)/2 
			+ ",top=" + (window.screen.availHeight-400)/2
			+ ",width=400,height=400,scrollbars=no,resizable=no,toolbar=no,directories=no,status=no,menubar=no");
}

/**
 * show the window about three-party 
 */
function agentCallOperation_showThreeParty()
{
	window.open(WINDOW_LIST.THREEPARTY, "AgentThreeParty", "left=" +  (window.screen.availWidth-400)/2 
			+ ",top=" + (window.screen.availHeight-400)/2
			+ ",width=400,height=400,scrollbars=no,resizable=no,toolbar=no,directories=no,status=no,menubar=no");
}

/**
 * show the window about inner-call
 */
function agentCallOperation_showInnerCall()
{
	window.open(WINDOW_LIST.INNERCALL, "AgentInnerCall", "left=" +  (window.screen.availWidth-500)/2 
			+ ",top=" + (window.screen.availHeight-500)/2
			+ ",width=500,height=500,scrollbars=no,resizable=no,toolbar=no,directories=no,status=no,menubar=no");
}


/**
 * show the window about inner-help
 */
function agentCallOperation_showInnerHelp()
{
	window.open(WINDOW_LIST.INNERHELP, "AgentInnerHelp", "left=" +  (window.screen.availWidth-500)/2 
			+ ",top=" + (window.screen.availHeight-500)/2
			+ ",width=500,height=500,scrollbars=no,resizable=no,toolbar=no,directories=no,status=no,menubar=no");
}





/**
 *To call out
 *@param phoneNo : the customer phone number
 */
function agentCallOperation_toCallOut(phoneNo)
{
	var retJson = VoiceCall.callout({"agentid":global_agentInfo.agentId,
			$entity:{"called":phoneNo}});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult)
	{	
		global_currentCalloutNumber = phoneNo;
		global_currentCalloutCallId = retJson.result;
	}
	return retResult;
}

/**
 * Second dial
 * @param number: the number of second dial
 * @returns
 */
function agentCallOperation_toSecondDial(number)
{
	var retJson = VoiceCall.secondDial({"agentid":global_agentInfo.agentId, "number":number});
	var retResult = retJson.retcode;
	return retResult;
}



/**
 * To answer call
 */
function agentCallOperation_toAnswer()
{
	var retJson = VoiceCall.answer({"agentid" : global_agentInfo.agentId});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE != retResult)
	{	
		alert("Answer call failed. Retcode : " + retResult);
	}
}

/**
 *To hangup call
 */
function agentCallOperation_toHangUp()
{
	var retJson = VoiceCall.release({"agentid":global_agentInfo.agentId});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult)
	{	
		
	}
	else
	{
		alert("Hangup call failed. Retcode : " + retResult);
	}
}


/**
 * To hold call
 * Only callin and callout can be held
 */
function agentCallOperation_toHold()
{
	var retJson = VoiceCall.hold({"agentid":global_agentInfo.agentId});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult)
	{	
		
	}
	else
	{
		alert("Hold call failed. Retcode : " + retResult);
	}
}


/**
 * To unhold call
 * @param currentCallId : the callID that will be unhold
 */
function agentCallOperation_toUnHold(currentCallId)
{
	var retJson = VoiceCall.getHold({"agentid":global_agentInfo.agentId, "callid":currentCallId});
	var retResult = retJson.retcode;
	return retResult;
}

/**
 * 
 * To three-party call
 * @param currentCallId : the callID that has be hold
 */
function agentCallOperation_toThreeParty(currentCallId)
{

	var retJson = VoiceCall.confJoin({"agentid": global_agentInfo.agentId,
				  $entity:{"callid":currentCallId}});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult)
	{
		global_currentConferenceType = CALL_FEATURE.CONFERENCE;
	}
	return retResult;
}


/**
 * To inner call
 * @param agentWorkno : the work ID that will be inner-called.
 */
function agentCallOperation_toInnerCall(agentWorkno)
{
	var retJson = VoiceCall.callInner({"agentid":global_agentInfo.agentId,
		$entity:{"called":agentWorkno}});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult)
	{	
		global_currentInnercallAgent = agentWorkno;
		global_currentInnercallCallId = retJson.result;
	}
	return retResult;
}


/**
 * To inner help
 * @param deviceType 1:skill;2 :workno
 * @param mode 1:tow-party;2:three-party
 * @param dstAddress: skillID or workno
 * @returns
 */
function agentCallOperation_toInnerHelp(deviceType, mode, dstAddress)
{
	var retJson = VoiceCall.innerHelp({
		"agentid":global_agentInfo.agentId,
		$entity:{
			"devicetype": deviceType,
			"mode": mode,
			"dstaddress": dstAddress
		}});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult
			&& mode == 2)
	{	
		global_currentConferenceType = CALL_FEATURE.INTERNAL_THREE_HELP;
	}
	return retResult;
}



/**
 * Only callout and callin can metu
 * To metu call
 */
function agentCallOperation_toMetu()
{

	var retJson = VoiceCall.beginMute({"agentid":global_agentInfo.agentId});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult)
	{	//No need to wait any event.
		buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.METU);
		agentCallInfo_updateCallStatus(CALL_STATUS.METU);
	}
	else
	{
		alert("Metu call failed. Retcode : " + retResult);
	}	
}

/**
 * To unmetu call
 */
function agentCallOperation_toUnMetu()
{
	var retJson = VoiceCall.endMute({"agentid":global_agentInfo.agentId});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult)
	{
		//No need to wait any event.	
		buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.TALKING_NORMALCALL);
		agentCallInfo_updateCallStatus(CALL_STATUS.TALKING);
	}
	else{
		alert("Unmetu call failed. Retcode : " + retResult);
	}
}

/**
 * To transfer
 * @param deviceType 	1:to skill; 2:to agent; 3:to IVR;4:to accesscode4; 5: to external
 * @param mode
 * @param address
 * @param mediaability
 * @returns
 */
function agentCallOperation_toTransfer(deviceType, mode, address, mediaability)
{
	var retJson = VoiceCall.transfer({
		"agentid": global_agentInfo.agentId,
		$entity:{
			"devicetype": deviceType,
			"mode": mode,
			"address": address,
			"mediaability": mediaability
		}
	});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult
			&& deviceType == 5
			&& (mode == 3) || (mode == 4))
	{
		global_currentConferenceType = CALL_FEATURE.CONFERENCE;
	}
	return retResult;
}



/**
 * get all hold call list
 * @returns
 */
function agentCallOperation_getHoldList()
{
	return CallData.queryHoldListInfo({"agentid":global_agentInfo.agentId});
}



/**
 * get all online agents
 */
function agentCallOperation_getAllOnlineAgents()
{
	return AgentGroup.queryAllLoginedAgentInfoOnVdn({
		"agentid":global_agentInfo.agentId
	}); 
}

/**
 * get all skills
 */
function agentCallOperation_getAllSkills()
{
	return QueueDevice.querySkillQueueOnAgentVDN({
		"agentid":global_agentInfo.agentId
	});
}

/**
 * get all ivrs
 */
function agentCallOperation_getAllIVRs()
{
	return QueueDevice.queryIVRInfoOnVdn({
		"agentid": global_agentInfo.agentId
	});
}


/**
 * get all accesscodes
 */
function agentCallOperation_getAllAccessCodes()
{
	return QueueDevice.queryInNoOnVDN({
		"agentid": global_agentInfo.agentId
	});
}

/**
 * set whether auto answer
 */
function agentCallOperation_toSetAutoAnswer()
{
	var value = $("input[name='agentSetting_autoAnswer']:checked").val();
	agentCallOperation_toAutoAnswer(value == 0 ? true : false);
}

/**
 *  set whether auto answer
 * @param flag: true means auto answer
 */
function agentCallOperation_toAutoAnswer(flag)
{
	var retJson = OnlineAgent.setAgentAutoAnswer ({
		"agentid": global_agentInfo.agentId,
		"isautoanswer":flag
	});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE != retResult)
	{
		alert("Set whether auto answer  failed. Retcode : " + retResult);
	}
}

/**
 * set whether into ACW after hangup
 */
function agentCallOperation_toSetIntoAcw()
{
	var value = $("input[name='agentSetting_intoACW']:checked").val();
	agentCallOperation_toIntoAcw(value == 0 ? false : true);
}


/**
 * set whether into ACW after hangup
 * @param flag : true means into IDLE; false means into ACW
 */
function agentCallOperation_toIntoAcw(flag)
{
	var retJson = OnlineAgent.setAgentAutoEnterIdle({
		"agentid" : global_agentInfo.agentId,
		"flag":flag
	});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE != retResult)
	{
		alert("Set whether into ACW after hangup  failed. Retcode : " + retResult);
	}	
}

function agentTextChatOperation_toChatAnswer(callId)
{
    var retJson=TextChat.answer({
        "workno" : global_agentInfo.workno,
        "callid" : callId
    });
    var retResult = retJson.retcode;
    if (global_resultCode.SUCCESSCODE != retResult) {
        alert("Answer TextChat failed. Retcode : " + retResult);
    }
}

function agentTextChatControl_dataRecvedEvent(oneEvent) {
    agentTextChatControl_getChatMessage(oneEvent.content.msgid, oneEvent.content.callid);
}

/**
 * 获取文字交谈的内容
 */
function agentTextChatControl_getChatMessage(chatId, callId) {
    //是文本消息
    TextChat.getChatMessage({
        "chatid": chatId,
        "workno": global_agentInfo.workno,
        $callback: function (result, data) {
            var res = JSON.parse(data.responseText);
            var retcode = res.retcode;
            switch (retcode) {
                case global_resultCode.SUCCESSCODE:

                    //消息接收成功
                    var msgData = res.result;
                    var content = msgData.content;
                    //alertDIV(htmlEncode(content));
                    var sender = msgData.sender;
                    var sendDate = msgData.senddate;
                    var curTime = new Date(parseInt(sendDate)).format("hh:mm:ss");
                    var html = "";
                    var type = msgData.contenttype;
                    var preChatMan = $("#li_" + callId).attr("preChatMan");
                    var textImageArray = new HashMap();
                    var msgType = 1;
                    var isShowFace = false;
                    if (type == TEXTCHAT_MESSAGETYPE.TYPE_ATTACHFILE) {
                        //为附件
                        return;
                    }
                    else if (type == TEXTCHAT_MESSAGETYPE.TYPE_IMAGE) {
                        //为图片
                        //获取上一次发言人
                        if (preChatMan == 'other') {
                            //上一次发言人为自己
                            html = "<span class='msg_content'><img src='" + ELPIS_PUBLISH_ADDRESS + "/resource/textchat/" + global_agentInfo.workno + "/getphoto/"
							+ content + "?Guid=" + cookiestring + "' border='0' width='250px' height='250px' style='cursor:pointer' ></span>";
                            agentTextChatControl_continuousChat(callId);
                        }
                        else {
                            if ($("#li_" + callId).attr("isAgent") == "true") {
                                //消息发送方为座席
                                sender = $("#agentTextChatControl_clientOrAgent_a" + callId).text();//getLanguage("ZEUS.TEXTCHAT.ROLE.AGENT", [sender]);
                            }
                            else {
                                sender = $("#agentTextChatControl_clientOrAgent_a" + callId).text();

                            }
                            html = "<div class='customer'><h2><span>" + sender + "&nbsp;" + curTime + "</span></h2></div><div><span class='msg_content'><img src='"
							+ ELPIS_PUBLISH_ADDRESS + "/resource/textchat/" + global_agentInfo.workno + "/getphoto/" + content + "?Guid=" + cookiestring
							+ "' border='0' width='250px' height='250px' style='cursor:pointer'></span></div>";
                            //设置上次发言人为其他
                            $("#li_" + callId).attr("preChatMan", "other");
                            isShowFace = true;
                        }
                    }
                    else {
                        if (content == "") {
                            content = "&nbsp;";
                        }
                        if ($("#li_" + callId).attr("isAgent") == "true") {
                            //消息发送方为座席
                            sender = $("#agentTextChatControl_clientOrAgent_a" + callId).text();//getLanguage("ZEUS.TEXTCHAT.ROLE.AGENT", [sender]);
                            msgType = 4;
                        }
                        else {
                            sender = $("#agentTextChatControl_clientOrAgent_a" + callId).text();

                        }

                        content = content.replace(/<a/gi, "<a target='_blank'");

                        var host = $("#li_" + callId).attr("host");
                        var otherAgent = $("#li_" + callId).attr("otherAgent");

                        var isFrom = "cusomter";
                        if (host == msgData.sender
								|| otherAgent == msgData.sender) {
                            //会议中其他座席发送的消息
                            sender = getLanguage("ZEUS.TEXTCHAT.ROLE.AGENT", [msgData.sender]);
                            isFrom = "agent";
                        }

                        if (isFrom == "cusomter") {
                            if (preChatMan == 'other') {
                                //上一次发言人为客户
                                html = "<span class='msg_content'>" + content + "</span>";
                                agentTextChatControl_continuousChat(callId);
                            }
                            else {
                                html = "<div class='customer'><h2><span>" + sender + "&nbsp;" + curTime
								+ "</span></h2></div><div><span class='msg_content'>" + content + "</span></div>";
                                //设置上次发言人为其他
                                $("#li_" + callId).attr("preChatMan", "other");
                                isShowFace = true;
                            }
                        }
                        else {
                            if (preChatMan == 'otherAgent') {
                                //上一次发言人为其他座席
                                html = "<span class='msg_content'>" + content + "</span>";
                                agentTextChatControl_continuousChat(callId);
                            }
                            else {
                                html = "<div class='agent'><h2><span>" + sender + "&nbsp;" + curTime
								+ "</span></h2></div><div><span class='msg_content'>" + content + "</span></div>";
                                //设置上次发言人为其他
                                $("#li_" + callId).attr("preChatMan", "otherAgent");
                                isShowFace = true;
                            }
                        }
                        var param1 = msgData.param1;
                        if (param1 != undefined && param1 != null && param1 != "") {
                            var imgArray = param1.split(";");

                            for (var i = 0; i < imgArray.length; i++) {
                                textImageArray.put(imgArray[i], imgArray[i]);
                            }
                        }

                    }
                    agentTextChatControl_setUnReadMsgNumber(callId);
                    agentTextChatControl_displayReceiver(callId, html, msgType, isShowFace);

                    $("#agentTextChatControl_divLoad_txtDisplayMsg_" + callId + "_frame").contents().find("img").each(function () {
                        var srcArray = $(this).attr("src").split("/");
                        var src = textImageArray.get(srcArray[srcArray.length - 1]);
                        if (src != "" && src != null && src != undefined) {
                            $(this).attr("src", ELPIS_PUBLISH_ADDRESS + "/resource/textchat/" + global_agentInfo.workno + "/getphoto/" + src + "?Guid=" + cookiestring);
                        }
                    });
                    break;

                    //根据错误码和错误信息，获取提示信息并弹框
                default:
                    global_resultCode.handleErrorCode(retcode, res.message);
                    break;
            }
        }
    });

}