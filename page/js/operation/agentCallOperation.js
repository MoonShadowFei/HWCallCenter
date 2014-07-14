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