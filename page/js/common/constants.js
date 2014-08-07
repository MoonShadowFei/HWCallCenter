
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

/********************* AddressType地址类型********************************************/
var ADDRESS_TYPE = {};
ADDRESS_TYPE.UNKNOW = "0";
ADDRESS_TYPE.WORKNO = "1";
ADDRESS_TYPE.SESSIONID = "2";
ADDRESS_TYPE.CBNO = "3";
ADDRESS_TYPE.PATHID = "4";
ADDRESS_TYPE.IP = "5";
ADDRESS_TYPE.DN = "6";
ADDRESS_TYPE.URL = "7";
ADDRESS_TYPE.IVR = "8";
ADDRESS_TYPE.AGENTID = "9";
ADDRESS_TYPE.SKILLID = "10";
ADDRESS_TYPE.USERID = "11";
ADDRESS_TYPE.MAILBOX = "12";
ADDRESS_TYPE.SKILLNODENO = "13";
ADDRESS_TYPE.NETCC = "14";
ADDRESS_TYPE.NETAGENT = "15";
ADDRESS_TYPE.ADDRESSTYPEOTHER = "16";
ADDRESS_TYPE.ADDRESSTYPENAMEUSER = "17";

/**********************  文字交谈消息类型  **********************************/
var TEXTCHAT_MESSAGETYPE = {};
TEXTCHAT_MESSAGETYPE.TYPE_TEXT = "TEXT";
TEXTCHAT_MESSAGETYPE.TYPE_IMAGE = "IMAGE";
TEXTCHAT_MESSAGETYPE.TYPE_ATTACHFILE = "ATTACHFILE";
TEXTCHAT_MESSAGETYPE.TYPE_WEIBO = "WEIBO";
TEXTCHAT_MESSAGETYPE.TYPE_QWEIBO = "QWEIBO";
TEXTCHAT_MESSAGETYPE.TYPE_EMAIL = "EMAIL";
TEXTCHAT_MESSAGETYPE.TYPE_ONLINEMESSAGE = "ONLINEMESSAGE";


/********************** 文字交谈的媒体类别 **********************/
var TEXTCHAT_MEDIATYPE = [];
TEXTCHAT_MEDIATYPE[0] = "TEXTCHAT";// "00"; //在线文字聊天
TEXTCHAT_MEDIATYPE[1] = "WEIBO"; //"01" 新浪微博
TEXTCHAT_MEDIATYPE[2] = "ONLINEMESSAGE";//"02"; //在线留言
TEXTCHAT_MEDIATYPE[3] = "EMAIL";// "03"; //邮件
TEXTCHAT_MEDIATYPE[4] = "QWEIBO";//"04"; //腾讯微博
TEXTCHAT_MEDIATYPE[5] = "ROBOT";//"05"; //机器人
TEXTCHAT_MEDIATYPE[6] = "FAXMESSAGE";//"06"; //传真
TEXTCHAT_MEDIATYPE[7] = "VOICEMESSAGE";//"07"; //语音留言
var TEXTCHAT_TYPE = [];
TEXTCHAT_TYPE[0] = "00"; //文本类型
TEXTCHAT_TYPE[1] = "01"; //新浪微博
TEXTCHAT_TYPE[2] = "02"; //在线留言
TEXTCHAT_TYPE[3] = "03"; //邮件
TEXTCHAT_TYPE[4] = "04"; //腾讯微博
TEXTCHAT_TYPE[5] = "05"; //机器人
TEXTCHAT_TYPE[6] = "06"; //传真