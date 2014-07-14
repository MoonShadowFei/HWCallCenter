
/**
 * agent status constant
 */
var AGENT_STATE = {};
AGENT_STATE.IDLE = 4;//Idle status
AGENT_STATE.TALKING = 7;//Talking status
AGENT_STATE.BUSY = 3;//Busy status
AGENT_STATE.REST = 8;//Rest status
AGENT_STATE.WORKING = 5;//Work status

var AGENT_STATE_DES = {};
AGENT_STATE_DES.IDLE = "Idle";//Idle status
AGENT_STATE_DES.TALKING = "Talking";//Talking status
AGENT_STATE_DES.BUSY = "Busy";//Busy status
AGENT_STATE_DES.REST = "Rest";//Rest status
AGENT_STATE_DES.WORKING = "ACW";//Work status


/*var AGENT_CTI_STATUS = [];
AGENT_CTI_STATUS.LOG_IN = 1;
AGENT_CTI_STATUS.LOG_OUT = 2;
AGENT_CTI_STATUS.NOT_READY = 3;
AGENT_CTI_STATUS.READY = 4;
AGENT_CTI_STATUS.WORK_NOT_READY = 5;
AGENT_CTI_STATUS.WORK_READY = 6;
AGENT_CTI_STATUS.BUSY = 7;
AGENT_CTI_STATUS.REST = 8;*/


/**
 * Call feature
 */
var CALL_FEATURE = {};
CALL_FEATURE.OTHER = -1;                    /** Other */
CALL_FEATURE.NORMAL = 0;                    /** Normal Call in */
CALL_FEATURE.INTERNAL = 6;                  /** Inner Call */
CALL_FEATURE.FEATURE_OUT = 7;               /** Call out */
CALL_FEATURE.PRE_OCCUPY = 41;               /** Preempted */
CALL_FEATURE.OUTBOUND_VIRTUAL_CALLIN = 43;  /** Predicted */
CALL_FEATURE.OUTBOUND_PREVIEW = 44;         /** Preview */
CALL_FEATURE.OUTBOUND_CALLBACK = 45;        /** Call Back */
CALL_FEATURE.INTERNAL_TWO_HELP = 51;        /** Two-Help */
CALL_FEATURE.INTERNAL_THREE_HELP = 52;      /** Three-Help */
CALL_FEATURE.CONFERENCE = 53;               /** Conference*/

CALL_FEATURE.TRANSFER_CONFERENCE = 99;      /** Transfer-Conference*/

var CALL_STATUS = {};
CALL_STATUS.ALERTING = "Alerting";
CALL_STATUS.TALKING = "Talking";
CALL_STATUS.RELEASE = "Release";
CALL_STATUS.HOLD = "Hold";
CALL_STATUS.METU = "Metu";


var WINDOW_LIST = {};
WINDOW_LIST.CALLOUT = "/ISV/page/html/agentCall_callout.html";
WINDOW_LIST.REST = "/ISV/page/html/agentCall_rest.html";
WINDOW_LIST.HOLDLIST = "/ISV/page/html/agentCall_holdlist.html";
WINDOW_LIST.THREEPARTY = "/ISV/page/html/agentCall_threeParty.html";
WINDOW_LIST.INNERCALL = "/ISV/page/html/agentCall_innerCall.html";
WINDOW_LIST.INNERHELP = "/ISV/page/html/agentCall_innerHelp.html";
WINDOW_LIST.TRANSFER = "/ISV/page/html/agentCall_transfer.html";
WINDOW_LIST.SECONDDIAL = "/ISV/page/html/agentCall_secondDial.html";