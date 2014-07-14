

/**
 * agent into busy status
 */
function agentStatus_setBusy()
{
	global_agentInfo.status = AGENT_STATE.BUSY;
	global_agentInfo.preRest = false;
	global_agentInfo.preBusy = false;
	$("#agentStatus_status").text(AGENT_STATE_DES.BUSY);
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.BUSY);
}

/**
 * agent into idle status
 */
function agentStatus_setIdle()
{
	global_agentInfo.status = AGENT_STATE.IDLE;
	global_agentInfo.preRest = false;
	global_agentInfo.preBusy = false;
	$("#agentStatus_status").text(AGENT_STATE_DES.IDLE);
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.IDLE);
}

/**
 * agent into rest status
 */
function agentStatus_setRest()
{
	global_agentInfo.status = AGENT_STATE.REST;
	global_agentInfo.preRest = false;
	global_agentInfo.preBusy = false;
	$("#agentStatus_status").text(AGENT_STATE_DES.REST);
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.REST);
}

/**
 * agent into acw status
 */
function agentStatus_setWork()
{
	global_agentInfo.status = AGENT_STATE.WORKING;
	global_agentInfo.preRest = false;
	global_agentInfo.preBusy = false;
	$("#agentStatus_status").text(AGENT_STATE_DES.WORKING);
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.WORKING);
}

/**
 * agent into talking status
 */
function agentStatus_setTalking()
{
	global_agentInfo.status = AGENT_STATE.TALKING;
	global_agentInfo.preRest = false;
	global_agentInfo.preBusy = false;
	$("#agentStatus_status").text(AGENT_STATE_DES.TALKING);
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.TALKING);
}



/**
 * when agent click rest button when agent in talking status
 * agent is into pre_rest status
 */
function agentStatus_setPreRestWhenTalking()
{
	global_agentInfo.preRest = true;
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.RESTWHENTALKING);
}

/**
 * When agent click busy button when agent in talking status ,
 * agent is into pre_busy status
 */
function agentStatus_setPreBusyWhenTalking()
{
	global_agentInfo.preBusy = true;
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.BUSYWHENTALKING);
}

/**
 * agent cancel rest when in talking status
 */
function agentStatus_cancelPreRestWhenTalking()
{
	global_agentInfo.preRest = false;
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.CANCELRESTWHENTALKING);
}

/**
 *  agent cancel busy when in talking status
 */
function agentStatus_cancelPreBusyWhenTalking()
{
	global_agentInfo.preBusy = false;
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.CANCELBUSYWHENTALKING);
}

/**
 * when agent click rest button when agent in working status
 * agent is into pre_rest status
 */
function agentStatus_setPreRestWhenWorking()
{
	global_agentInfo.preRest = true;
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.RESTWHENWORKING);
}

/**
 * When agent click busy button when agent in working status ,
 * agent is into pre_busy status
 */
function agentStatus_setPreBusyWhenWorking()
{
	global_agentInfo.preBusy = true;
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.BUSYWHENWORKING);
}


/**
 *  When agent click submit rest button when agent in Idle status ,
 * agent is into pre_rest status
 */
function agentStatus_setPreRestWhenIdle()
{
	global_agentInfo.preRest = true;
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.RESTWHENIDLE);
}


/**
 * When agent click cancel rest button when agent in Idle status ,
 * agent is into idle status
 */
function agentStatus_cancelPreRestWhenIdle()
{
	global_agentInfo.preRest = false;
	buttonInfo_changeButtonStatus(AGENT_BUTTON_STATUS.CANCELRESTWHENIDLE);
}







