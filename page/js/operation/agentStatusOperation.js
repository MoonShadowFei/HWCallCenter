
/**
 * to working status
 */
function agentStatusOperation_toWork()
{
	var retJson = OnlineAgent.sayWork({"agentid":global_agentInfo.agentId});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult)
	{
	}
	else
	{
		alert("change agent status to work status failed. Retcode :" + retResult);
	}

}

/**
 * cancel working status
 */
function agentStatusOperation_toExitWork()
{
	var retJson = OnlineAgent.cancelWork({"agentid":global_agentInfo.agentId});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult)
	{
		
	}
	else
	{
		alert("change agent status to Idle status failed. Retcode :" + retResult);
	}
}



/**
 * to busy status
 */
function agentStatusOperation_toBusy()
{
	var retJson = OnlineAgent.sayBusy({"agentid":global_agentInfo.agentId});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult)
	{	
		if (global_agentInfo.status == AGENT_STATE.TALKING)
		{
			/**
			 * when agent click busy button in talking status, 
			 * agent will recevie AgentState_SetNotReady_Success event until finished talking
			 */
			agentStatus_setPreBusyWhenTalking();
		}
		else if (global_agentInfo.status == AGENT_STATE.WORKING)
		{
			/**
			 * when agent click busy button in working status, 
			 * agent will recevie AgentState_SetNotReady_Success event until exit work
			 */
			agentStatus_setPreBusyWhenWorking();
		}
	}
	else
	{
		alert("change agent status to busy status failed. Retcode :" + retResult);
	}	
}

/**
 * cancel busy status
 */
function agentStatusOperation_toIdle()
{
	var retJson = OnlineAgent.sayFree({"agentid":global_agentInfo.agentId});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult)
	{		
		if (global_agentInfo.status == AGENT_STATE.TALKING)
		{
			/**
			 * agent click idle button in talking status
			 */
			agentStatus_cancelPreBusyWhenTalking();
		}
	}
	else
	{
		alert("cancel busy status failed. Retcode :" + retResult);
	}
}

/**
 * get all rest reason
 */
function agentStatusOperation_getRestReason()
{
	 return AgentGroup.getAgentRestReason({"agentid":global_agentInfo.agentId});
}


/**
 * show rest window
 */
function agentStatusOperation_showRestWindow()
{
	window.open(WINDOW_LIST.REST, "AgentRest", "left=" +  (window.screen.availWidth-400)/2 
			+ ",top=" + (window.screen.availHeight-300)/2
			+ ",width=400,height=300,scrollbars=no,resizable=no,toolbar=no,directories=no,status=no,menubar=no");
}



/**
 * Reqeust rest
 * @param restTime
 * @param restReasonId
 */
function agentStatusOperation_toRest(restTime, restReasonId)
{
	
	var retJson = OnlineAgent.rest({"agentid":global_agentInfo.agentId,
		"time":restTime * 60,
		"restcause":restReasonId});
	var retResult = retJson.retcode;
	
	if(global_resultCode.SUCCESSCODE == retResult)
	{	
		if (global_agentInfo.status == AGENT_STATE.TALKING)
		{
			/**
			 * when agent click busy button in talking status, 
			 * agent will recevie AgentState_SetRest_Success event until finished talking
			 */
			agentStatus_setPreRestWhenTalking();
		}
		else if (global_agentInfo.status == AGENT_STATE.WORKING)
		{
			/**
			 * when agent click busy button in working status, 
			 * agent will recevie AgentState_SetRest_Success event until exit work
			 */
			agentStatus_setPreRestWhenWorking();
		}
		else if (global_agentInfo.status == AGENT_STATE.IDLE)
		{
			agentStatus_setPreRestWhenIdle();
		}
	}
	return retResult;
	
}

/**
 * cancel rest
 */
function agentStatusOperation_toCancelRest()
{
	var retJson = OnlineAgent.cancelRest({"agentid":global_agentInfo.agentId});
	var retResult = retJson.retcode;
	if(global_resultCode.SUCCESSCODE == retResult)
	{			
		
		if (global_agentInfo.status == AGENT_STATE.TALKING)
		{
			/**
			 * agent click idle button in talking status
			 */
			agentStatus_cancelPreRestWhenTalking();
		}
		else if (global_agentInfo.status == AGENT_STATE.IDLE)
		{
			agentStatus_cancelPreRestWhenIdle();
		}
	}
	else
	{
		alert("cancel rest failed. Retcode :" + retResult);
	}
}