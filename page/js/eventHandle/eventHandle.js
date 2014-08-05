// GET /agentevent/{agentid:\d{1,5}}
AgentEventDispatcher.getAgentEvent2 = function (_params) {
    var params = _params ? _params : {};
    var request = new REST.Request();
    request.setSpecial(true);
    request.setMethod('GET');
    var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
    uri += '/agentevent/';
    uri += REST.Encoding.encodePathSegment(params.agentid);
    //	uri += '?time=' + new Date().getTime();
    request.setURI(uri);
    if (params.$username && params.$password)
        request.setCredentials(params.$username, params.$password);
    if (params.$accepts)
        request.setAccepts(params.$accepts);
    else
        request.setAccepts('application/json');
    if (params.$contentType)
        request.setContentType(params.$contentType);
    else
        request.setContentType('text/plain');
    if (params.$timeoutHandle) {
        request.setTimeoutHandle(params.$timeoutHandle);
    }
    if (params.$callback) {
        request.execute(params.$callback);
    }
    else {
        var returnValue;
        request.setAsync(false);
        var callback = function (httpCode, xmlHttpRequest, value) {
            returnValue = value;
        };
        request.execute(callback);
        return returnValue;
    }
};

var getEventLisnter_timer = "";
var getEventLisnter = function () {
    AgentEventDispatcher.getAgentEvent2({
        "agentid": global_agentInfo.agentId,
        $callback: function (result, data, entity) {
            try {
                if (entity == undefined || entity == "") {
                    global_heartBeatValue += 1;
                    agentConsole_error("Event result is undefined ! It's " + global_heartBeatValue + " times");
                    if (global_heartBeatValue > 10) {
                        agentConsole_error("Event result is undefined ! It's over " + global_heartBeatValue + " times about losing heart");
                        global_heartBeatValue = 0;
                    }
                    else {
                        getEventLisnter_timer = setTimeout("getEventLisnter()", 500);
                    }
                    return;
                }


                global_heartBeatValue = 0;
                if (entity.retcode != global_resultCode.SUCCESSCODE) {
                    if (entity.retcode == "000-003") {
                        global_noAccessNumber++;
                        agentConsole_error("No auth to visit the interface! It's " + global_noAccessNumber + " times");
                        if (global_noAccessNumber > 5) {
                            agentConsole_error("No auth to visit the interface! It's over 5 times");
                            return;
                        }
                    }
                    if (entity.retcode == "100-006") {
                        agentConsole_error("The current agent has not logined!");
                    }
                    else {
                        getEventLisnter_timer = setTimeout("getEventLisnter()", 500);
                    }
                    return;
                }

                global_noAccessNumber = 0;

                var agentEvents = entity.event;
                if (null == agentEvents || agentEvents.length == 0) {
                    getEventLisnter_timer = setTimeout("getEventLisnter()", 500);
                    return;
                }

                agentEventHandle(agentEvents);
                getEventLisnter();
            }
            catch (err) {
                agentConsole_error(err);
                getEventLisnter_timer = setTimeout("getEventLisnter()", 500);
            }
        },
        $timeoutHandle: function () {
            global_heartBeatValue += 1;
            agentConsole_error("Get event timeout! It's " + global_heartBeatValue + " times");
            if (global_heartBeatValue > 10) {
                global_heartBeatValue = 0;
                agentConsole_error("Get event timeout! It's over 10 times about losing heart");
            }
            else {
                getEventLisnter_timer = setTimeout("getEventLisnter()", 500);
            }
        }
    });
};





function agentEventHandle(oneEvent) {
    var eventType = oneEvent.eventType;
    if (eventType != "AgentEvent_ControlWindow_Notify"
		&& eventType != "AgentEvent_Orders_Notify") {
        agentConsole_debug(JSON.stringify(oneEvent));
    }

    switch (eventType) {
        /****************************Agent Status Event****************************/

        case "AgentState_SetNotReady_Success": //Into busy status successfully
        case "AgentState_Force_SetNotReady":   //Forcibly into busy status
            Proc_agentState_busy(oneEvent);
            break;
        case "AgentState_Ready":               //Into Idle status
        case "AgentState_Force_Ready":         //Forcibly Into Idle status
        case "AgentState_CancelNotReady_Success":  //Cancel busy status successfully, and agent into Idle status
        case "AgentState_CancelRest_Success":      //Cancel rest status successfully, and agent into Idle status
        case "AgentState_CancelWork_Success":      //Exit work status successfully, and agent into Idle status
            Proc_agentState_idle(oneEvent);
            break;
        case "AgentState_SetRest_Success":        //Into rest status successfully
            Proc_agentState_rest(oneEvent);
            break;
        case "AgentState_Rest_Timeout":           //Only tell the agent, rest timeout
            break;
        case "AgentState_SetWork_Success":       //Into work status successfully
        case "AgentState_Work":					//After finishing talking, agent into work status
            Proc_agentState_work(oneEvent);
            break;
        case "AgentState_Busy": 				//Into talking status
            Proc_agentState_talking(oneEvent);
            break;

            /****************************Agent Voice Talking Event****************************/
        case "AgentEvent_Customer_Alerting":  //1.Customer phone is alerting. 
            Proc_agentEvent_customerAlerting(oneEvent);
            break;
        case "AgentEvent_Ringing":            //2.When manual answer call and a call come in, agent receive the event.
            Proc_agentEvent_Ringing(oneEvent);
            break;
        case "AgentEvent_Hold":               //3Hold call successfully
            Proc_agentEvent_hold(oneEvent);
            break;
        case "AgentEvent_Talking":            //4.Talking connnect successfully.
            Proc_agentEvent_talking(oneEvent);
            break;
        case "AgentEvent_Conference":         //5.Three-party talking connnect successfully.
            Proc_agentEvent_conference(oneEvent);
            break;
        case "AgentEvent_Call_Out_Fail":       //6.Call out failed
            Proc_agentEvent_callOutFail(oneEvent);
            break;
        case "AgentEvent_Inside_Call_Fail":    //do inner-call failed
            Proc_agentEvent_insideCallFail(oneEvent);
            break;
        case "AgentEvent_Call_Release":        //Call release 
            Proc_agentEvent_callRelease(oneEvent);
            break;
        case "AgentEvent_No_Answer":
            break;
        case "AgentEvent_Customer_Release":        //Customer release call
            Proc_agentEvent_customerRelease(oneEvent);
            break;
        case "AgentEvent_Auto_Answer":         //agent has auto answered the call
            Proc_agentEvent_autoAnswer(oneEvent);
            break;
        case "AgentEvent_Connect_Fail":        //Connect failed event
            break;
        case "AgentEvent_Consult_Fail":       //do inner-help failed
            Proc_agentEvent_consultCallFail(oneEvent);
            break;

            /****************************Other Event****************************/

        case "AgentOther_ShutdownService":  //Agent logout event
            break;
        case "AgentOther_InService":        //Agent log in event
            break;
        case "AgentOther_PhoneAlerting":    //When agent's phone is not in talking status and agent callout or a call come in,  agent's phone will be alerting firstly.
            Proc_agentEvent_phoneAlerting(oneEvent);
            break;
        case "AgentOther_PhoneOffhook":     //Agent pick up phone
            break;
        case "AgentOther_PhoneRelease":     //Agent hangup the phone
            break;
        case "AgentOther_PhoneUnknow":      //the phone unkown status
            break;
        case "AgentOther_All_Agent_Busy":   //All agents are busy
            break;


            /**--------------------------文字交谈事件--------------------------------*/
        case "AgentChat_DataRecved":  //接收文字交谈内容
            Proc_AgentChat_DataRecved(oneEvent);
            break;

        case "AgentChat_Disconnected":
            Proc_AgentChat_Disconnected(oneEvent);
            break;

        case "AgentChat_Connected": //
            Proc_AgentChat_Connected(oneEvent);
            callTime_startComputeTodayCall();
            break;

        case "AgentChat_Ring":  //文件交谈请求事件
            Proc_AgentChat_Ring(oneEvent);
            break;

        case "AgentChat_TransferStart":
            //Proc_AgentChat_TransferStart(oneEvent);
            break;

        case "AgentChat_TransferFailed":
            //Proc_AgentChat_TransferFailed(oneEvent);
            break;

        case "AgentChat_CalloutFailed":
            //Proc_AgentChat_CalloutFailed(oneEvent);
            break;

            //事后处理邮件
        case "AgentChat_DELAY_EMAIL":
            Proc_AgentChat_DelayEmail(oneEvent);
            break
        default:
            //alert("no deal the event:  " + eventType);

    }
}

