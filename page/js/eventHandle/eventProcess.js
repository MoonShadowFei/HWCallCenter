/**
 * When agent reveive AgentState_SetNotReady_Success or AgentState_Force_SetNotReady
 * We need call this function
 * agent is into busy status
 */
function Proc_agentState_busy(event)
{
	agentStatus_setBusy();
	agentCallInfo_clearCallInfo();
	global_allCallInfo = new HashMap();
}

/**
 * When agent reveive AgentState_Ready or AgentState_Force_Ready or
 *  AgentState_CancelNotReady_Success or AgentState_CancelRest_Success or AgentState_CancelWork_Success
 * We need call this function
 * agent is into idle status
 */
function Proc_agentState_idle(event)
{
	agentStatus_setIdle();
	agentCallInfo_clearCallInfo();
	global_allCallInfo = new HashMap();
}

/**
 * When agent reveive AgentState_SetRest_Success
 * We need call this function
 * agent is into rest status
 */
function Proc_agentState_rest(event)
{
	agentStatus_setRest();
	agentCallInfo_clearCallInfo();
	global_allCallInfo = new HashMap();
}

/**
 * When agent reveive AgentState_SetWork_Success or AgentState_Work
 * We need call this function
 * agent is into rest status
 */
function Proc_agentState_work(event)
{
	agentStatus_setWork();
	agentCallInfo_clearCallInfo();
	global_allCallInfo = new HashMap();
}

/**
 * When agent reveive AgentState_Busy
 * We need call this function
 * agent is into talking status
 * @param event
 */
function Proc_agentState_talking(event)
{
	agentStatus_setTalking();
}


/**
 * When agent's phone is not in talking status and agent callout or a call come in,  
 * agent's phone will be alerting firstly.
 * Now agent can not do any operation.
 * @param event
 */
function Proc_agentEvent_phoneAlerting(event)
{
	
}

/**
 * When manual answer call and a call come in, agent receive the event.
 * agent need to answer the call.
 * @param event
 */
function Proc_agentEvent_Ringing (event)
{
    var callId = event.content.callid;
    global_currentDealCallId = callId;
    eventProcess_queryCallInfoByCallId(callId);
    buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.RINGING);
    agentCallInfo_showCallInfo(callId, CALL_STATUS.ALERTING);
    //crmForm_openNewPopupScreen(event.content.otherPhone, event.content.feature, event.content.callid);


    var callInfo = global_allCallInfo.get(global_currentDealCallId);
    var callFeature = CALL_FEATURE.OTHER;
    var otherParty = callInfo.caller;
    if (callInfo.callfeature != undefined
			&& callInfo.callfeature != null) {
        callFeature = parseInt(callInfo.callfeature);
    }
    switch (callFeature) {
        case CALL_FEATURE.FEATURE_OUT:
            otherParty = callInfo.called;
            break;
        default:
            break;
    }
    crmForm_openNewPopupScreen(otherParty, callFeature, event.content.callid);
}

/**
 * agent has auto answered the call
 * @param event
 */
function Proc_agentEvent_autoAnswer(event)
{
	var callId = event.content.callid;
	global_currentDealCallId = callId;
	eventProcess_queryCallInfoByCallId(callId);
	agentCallInfo_showCallInfo(callId, CALL_STATUS.ALERTING);

	var callInfo = global_allCallInfo.get(global_currentDealCallId);
	var callFeature = CALL_FEATURE.OTHER;
	var otherParty = callInfo.caller;
	if (callInfo.callfeature != undefined
			&& callInfo.callfeature != null) {
	    callFeature = parseInt(callInfo.callfeature);
	}
	switch (callFeature) {
	    case CALL_FEATURE.FEATURE_OUT:
	        otherParty = callInfo.called;
	        break;
	    default:
	        break;
	}
	crmForm_openNewPopupScreen(otherParty, callFeature, event.content.callid);
}


/**
 * Customer Phone is alerting.
 * You can show the customer phone information
 */
function Proc_agentEvent_customerAlerting(event)
{
	var callId = event.content.callid;
	global_currentDealCallId = callId;
	var otherParty =  event.content.otherPhone;
	if (global_currentCalloutCallId == callId)
	{
		//Agent do callout and the customer phone is ringing.
	    agentCallInfo_showCurrentCallInfo(otherParty, CALL_STATUS.ALERTING, CALL_FEATURE.FEATURE_OUT);


	    crmForm_openNewPopupScreen(event.content.otherPhone, CALL_FEATURE.FEATURE_OUT, event.content.callid);
		return;
	}
	if (global_currentInnercallCallId == callId)
	{
		//Agent do callout and the customer phone is ringing.
		agentCallInfo_showCurrentCallInfo(global_currentInnercallAgent, CALL_STATUS.ALERTING, CALL_FEATURE.INTERNAL);
		return;
	}
}


/**
 * Hold call successfully
 * @param event
 */
function Proc_agentEvent_hold(event)
{
	eventProcess_addHoldCallId(event.content);
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.HOLD);
	if (event.content == global_currentDealCallId)
	{
		agentCallInfo_updateCallStatus(CALL_STATUS.HOLD);
	}
}


/**
 * Talking connect successfully
 * @param event
 */
function Proc_agentEvent_talking(event)
{
	var callId = event.content.callid;
	global_currentDealCallId = callId;
	eventProcess_removeFromHoldList(callId);
	var buttonStatus = AGENT_BUTTON_STATUS.TALKING_DEFAULT;
	var feature = CALL_FEATURE.OTHER;
	var otherParty = event.content.caller;
	if (event.content.feature != undefined
			&& event.content.feature != null)
	{
	    feature = parseInt(event.content.feature);
	}
	switch (feature) {
		case CALL_FEATURE.FEATURE_OUT:
			otherParty = event.content.called;
		case CALL_FEATURE.NORMAL:
		case CALL_FEATURE.PRE_OCCUPY:
		case CALL_FEATURE.OUTBOUND_VIRTUAL_CALLIN:
		case CALL_FEATURE.OUTBOUND_PREVIEW:
		case CALL_FEATURE.OUTBOUND_CALLBACK:
			if (global_currentHoldList.length == 0)
			{
				buttonStatus = AGENT_BUTTON_STATUS.TALKING_NORMALCALL;
			}
			else
			{
				buttonStatus = AGENT_BUTTON_STATUS.TALKING_NORMALCALLAFTERHOLD;
			}
			break;
		case CALL_FEATURE.INTERNAL:
			buttonStatus = AGENT_BUTTON_STATUS.TALKING_INNERCALL;
		    break;
		case CALL_FEATURE.INTERNAL_TWO_HELP:
			buttonStatus = AGENT_BUTTON_STATUS.TALKING_INNER2PARTY;
		    break;
		case CALL_FEATURE.INTERNAL_THREE_HELP:
			buttonStatus = AGENT_BUTTON_STATUS.TALKING_INNER3PARTY;
			break;
		case CALL_FEATURE.CONFERENCE:
			buttonStatus = AGENT_BUTTON_STATUS.TALKING_CONFERENCE;
			break;
		default:
			break;
	}
	buttonInfo_changeButtonStatus(buttonStatus);
	agentCallInfo_showCurrentCallInfo(otherParty, CALL_STATUS.TALKING, feature);
}

/**
 * Three-party talking connnect successfully.
 * @param event
 */
function Proc_agentEvent_conference(event)
{
	global_currentDealCallId = event.content.callid;
	var partner = event.content.partner;
	agentCallInfo_showCurrentCallInfo(partner, CALL_STATUS.TALKING, global_currentConferenceType);
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.TALKING_CONFERENCE);
}

/**
 * call out failed.
 * @param event
 */
function Proc_agentEvent_callOutFail(event)
{
	var callId = event.content;
	if (global_currentCalloutCallId == callId)
	{
		//Call out failed.
		alert("Call out the customer [ " + global_currentCalloutNumber + " ] failed.");
	}
	if (global_currentDealCallId == callId)
	{
		agentCallInfo_clearCallInfo();
	}
}

/**
 * do inner-call failed
 * @param event
 */
function Proc_agentEvent_insideCallFail(event)
{
	var callId = event.content;
	if (global_currentInnercallCallId == callId)
	{
		//Call out failed.
		alert("Inner call agent [ " + global_currentInnercallAgent + " ] failed.");
	}
	if (global_currentDealCallId == callId)
	{
		agentCallInfo_clearCallInfo();
	}
}

/**
 * do inner-help failed
 * @param event
 */
function Proc_agentEvent_consultCallFail(event)
{
	alert("Inner-help failed.");
}


/**
 * Call release
 * @param event
 */
function Proc_agentEvent_callRelease(event)
{
	var callId = event.content.callid;
	eventProcess_removeFromHoldList(callId);

	if (callId ==  global_currentDealCallId)
	{
		//1.1 if the release call is the current call
		agentCallInfo_clearCallInfo();
		if (global_currentHoldList.length >= 1)
		{
			//1.2 if has other hold call
			buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.HOLD);
		}
	}
	else
	{	
		//2.1 if the release call is not the current call
		if (global_currentHoldList.length >= 1)
		{
			//2.2 if has other hold call
			return;
		}
		//2.3 no call is hold
		buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.NOHOLDCALL);
		
	}
}

/**
 * Customer release call
 * @param event
 */
function Proc_agentEvent_customerRelease(event)
{
	var callId = event.content.callid;
	eventProcess_removeFromHoldList(callId);

	if (callId ==  global_currentDealCallId)
	{
		//1.1 if the release call is the current call
		 agentCallInfo_clearCallInfo();
		if (global_currentHoldList.length >= 1)
		{
			//1.2 if has other hold call
			buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.HOLD);
		}
	}
	else
	{	
		//2.1 if the release call is not the current call
		if (global_currentHoldList.length >= 1)
		{
			//2.2 if has other hold call
			return;
		}
		//2.3 no call is hold
		buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.NOHOLDCALL);
		
	}
}

/**
 * Add callId into hold list
 * @param callId
 */
function eventProcess_addHoldCallId(callId)
{
	global_currentHoldList.push(callId);
	$("#agentCall_holdCallNums").text(global_currentHoldList.length);
}

/**
 * Remove callId from hold list
 * @param callId
 */
function eventProcess_removeFromHoldList(callId)
{
	var tempArray = [];
	var len = global_currentHoldList.length;
	for (var i = 0; i < len; i++)
	{
		if (callId != global_currentHoldList[i])
		{
			tempArray.push(global_currentHoldList[i]);
		}
	}
	global_currentHoldList = tempArray;
	$("#agentCall_holdCallNums").text(global_currentHoldList.length);
}

/**
 * jude whether the call is hold
 * @param callId
 */
function eventProcess_isHoldCall(callId)
{
	var len = global_currentHoldList.length;
	for (var i = 0; i < len; i++)
	{
		if (callId == global_currentHoldList[i])
		{
			return true;
		}
	}
	return false;
}

/**
 * When agent recevice AgentEvent_Ringing or AgentEvent_Auto_Answer event, can use the function to get the call information
 * Query call info from CTI, not include callstartTime and callendTime
 * {"message":"","retcode":"0","result":{"called":"40103","caller":"1008622","callid":"1397104272-3397","calldata":"","orgicallednum":"","callfeature":7,"callskill":"voice"}}
 * @param callId
 */
function eventProcess_queryCallInfoByCallId(callId)
{
	var retJson = CallData.queryCallInfoByCallId({"agentid": global_agentInfo.agentId , "callid": callId});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult)
	{		
		var ctiCallInfo = retJson.result;
		var callInfo = global_allCallInfo.get(ctiCallInfo.callid);
		if (callInfo == null)
		{
			callInfo = new CallInfo();
		}
		callInfo.called = ctiCallInfo.called;
		callInfo.caller = ctiCallInfo.caller;
		callInfo.callId = ctiCallInfo.callid;
		callInfo.calldata = ctiCallInfo.calldata;
		callInfo.orgicallednum = ctiCallInfo.orgicallednum;
		callInfo.callfeature = ctiCallInfo.callfeature;
		callInfo.callskill = ctiCallInfo.callskill;
		global_allCallInfo.put(ctiCallInfo.callid, callInfo);
	}
}

/**
 * When agent recevice AgentEvent_Talking or AgentEvent_Conference or AgentEvent_Customer_Release or AgentEvent_Customer_Release, can use the function to update call time
 * Refresh call time from agentgateway
 * {"message":"","retcode":"0","result":{"called":"6009","caller":"40102","callid":"1397035521-3359","calldata":"","orgicallednum":"","callfeature":0,"callskill":"voice","begintime":1397035525902,"endtime":null,"callskillid":25}}
 *//*
function eventProcess_refreshCallInfo()
{
	var retJson =  CallData.queryCallInfo({"agentid":global_agentInfo.agentId});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult)
	{		
		var ctiCallInfo = retJson.result;
		var callInfo = global_allCallInfo.get(ctiCallInfo.callid);
		if (callInfo == null)
		{
			callInfo = new CallInfo();
		}
		callInfo.called = ctiCallInfo.called;
		callInfo.caller = ctiCallInfo.caller;
		callInfo.callId = ctiCallInfo.callid;
		callInfo.calldata = ctiCallInfo.calldata;
		callInfo.orgicallednum = ctiCallInfo.orgicallednum;
		callInfo.callfeature = ctiCallInfo.callfeature;
		callInfo.callskill = ctiCallInfo.callskill;
		callInfo.callskillid = ctiCallInfo.callskillid;
		callInfo.begintime = ctiCallInfo.begintime;
		callInfo.endtime = ctiCallInfo.endtime;
		global_allCallInfo.put(ctiCallInfo.callid, callInfo);
	}
}*/
