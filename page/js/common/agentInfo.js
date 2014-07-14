/**
 *The Agent Info
 */
var AgentInfo = function(agentId, phoneNumber)
{
	this.agentId = agentId;
	this.phoneNumber = phoneNumber;
	this.status = AGENT_STATE.IDLE;
	this.preRest = false;
	this.preBusy = false;
};




