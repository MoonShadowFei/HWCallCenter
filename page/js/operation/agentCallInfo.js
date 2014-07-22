/**
 * Display curent call info
 * @param otherParty 
 * @param callStatus
 * @param callFeature
 */
function agentCallInfo_showCurrentCallInfo(otherParty, callStatus, callFeature)
{
	$("#agentCall_otherParty").text(otherParty);
	$("#agentCall_callStatus").text(callStatus);
	var desc = "";
	switch (callFeature) {
		case CALL_FEATURE.NORMAL:
			desc = "Call-In";
			break;
		case CALL_FEATURE.INTERNAL:
			desc = "Inner-Call";
			break;
		case CALL_FEATURE.FEATURE_OUT:
			desc = "Call-out";
			break;	
		case CALL_FEATURE.PRE_OCCUPY:
			desc = "Preempted";
			break;	
		case CALL_FEATURE.OUTBOUND_VIRTUAL_CALLIN:
			desc = "Predicted";
			break;	
		case CALL_FEATURE.OUTBOUND_PREVIEW:
			desc = "Preview";
			break;	
		case CALL_FEATURE.OUTBOUND_CALLBACK:
			desc = "Call Back";
			break;	
		case CALL_FEATURE.INTERNAL_TWO_HELP:
			desc = "Two-Help";
			break;	
		case CALL_FEATURE.INTERNAL_THREE_HELP:
			desc = "Three-Help";
			break;
		case CALL_FEATURE.CONFERENCE:
			desc = "Conference";
			break;	
		case CALL_FEATURE.TRANSFER_CONFERENCE:
			desc = "Transfer-Conference";
			break;	
		default:
			break;
	}
	$("#agentCall_callFeature").text(desc);
}

/**
 * update call status
 * @param callStatus
 */
function agentCallInfo_updateCallStatus(callStatus)
{
	$("#agentCall_callStatus").text(callStatus);
}


function agentCallInfo_showCallInfo(callId, callStatus)
{

	var callInfo = global_allCallInfo.get(global_currentDealCallId);
	var callFeature = CALL_FEATURE.OTHER;
	var otherParty = callInfo.caller;
	if (callInfo.feature != undefined
			&& callInfo.feature != null)
	{
	    callFeature = parseInt(callInfo.callfeature);
	}
	switch (callFeature) {
		case CALL_FEATURE.FEATURE_OUT:
			otherParty = callInfo.called;
			break;
		default:
			break;
	}
	agentCallInfo_showCurrentCallInfo(otherParty, callStatus, callFeature);
}


function agentCallInfo_clearCallInfo()
{
	$("#agentCall_otherParty").text("");
	$("#agentCall_callStatus").text("");
	$("#agentCall_callFeature").text("");
}