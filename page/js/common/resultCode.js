/*
 * 该文件定义了REST接口返回的调用操作的结果码
 */


function ResultCode()
{
	/** 返回类型:成功 */
    this.SUCCESSCODE = "0";
    
    /** -------------------------- 错误码开始 ----------------------------*/
	
	/****************************一般性错误 *************************/
    /**
     * 获取Agent事件的方法错误
     */
	this.AGENT_EVENT_METHOD_ERROR = "000-001";
    
    /**
     * 坐席通过URL传递的参数或者地址错误，不符合定义
     */
    this.AGENT_REST_INVALID = "000-002";
    
    /** Begin add by liujunxia for DTS2012032100369*/
    /**
     * 没有权限调用接口
     */
    this.AGENT_REST_NORIGHT = "000-003";
    /** End add by liujunxia for DTS2012032100369*/
    
    
    /****************************服务端配置错误 *************************/
    this.SERVER_CONFIG_INVALID_WAS_URL = "999-001";
     
    
    
    /****************************在线坐席类错误 *************************/
    /**
     *  签入参数为空或者不合法
     */
    this.AGENT_LOGIN_INVALID_PARA = "100-001";

    /**
     * 坐席已经登录
     */
    this.AGENT_LOGIN_ALREADY_IN = "100-002";
    
    /**
     * 坐席登陆的时候抛ResourceUnavailableException或ProviderUnavailableException异常，又没有具体原因
     */
    this.AGENT_LOGIN_CTI_ERROR = "100-003";
        
    /**
     * 登录过程中，用户名或者密码错误
     */
    this.AGENT_LOGIN_USERNAME_OR_PASSWORD_INVALID = "100-004";
    
    /**
     * 登出参数不合法
     */
    this.AGENT_LOGOUT_INVALID_PARA = "100-005";
    
    /**
     * 坐席没有登录
     */
    this.AGENT_NOT_LOGIN = "100-006";
    
    /**
     * 坐席操作时发生异常，可能是WAS资源错误无法访问或者内部错误产生
     */
    this.AGENT_INNER_ERROR = "100-007";
    
    /**
     * 坐席已经登出
     */
    this.AGENT_LOGOUT_ALREADY_LOGOUT = "100-008";
    
    /**
     * 设置坐席状态错误
     */
    this.AGENT_SET_STATE_ERROR = "100-009";
    
    /**
     * 签出时状态错误
     */
    this.AGENT_LOGOUT_STATUS_ERROR = "100-010";
    
    /**
     * 签入时参数不合法错误
     */
    this.AGENT_LOGIN_INVALID_PARAMETER_ERROR = "100-011";
    
    /**
     *  签入时座席类型错误
     */
    this.AGENT_LOGIN_INVALID_AGENTTYPE = "100-012";
    
    /**
     *  绑定座席电话时电话无效
     */
    this.AGENT_LOGIN_INVALID_PHONE = "100-013";
    
    /**
     * 座席签入的电话不在配置范围内
     */
    this.AGENT_LOGIN_INVALID_PHONE_NOT_CONFIG = "100-014";
    
    /**
     * 坐席已经登录,并且不能被强制踢出(新增,配置文件中能否被强制踢出开关为off的时候返回)
     * add by fxq
     */
    this.AGENT_LOGIN_ALREADY_IN_CAN_NOT_FORCE_LOGIN = "100-015";
    
    /**
     * 座席登录,ip无效
     */
    this.AGENT_LOGIN_INVALID_IP = "100-016";
    
    /********************** 第三方用户操作接口类错误  *****************/

    /**
     * 密码修改失败
     */
    this.THIRDPARTYUSER_MODIFY_PASSWORD_ERROR = "110-002";
    
    /**
     * 旧密码错误
     */
    this.THIRDPARTYUSER_OLD_PASSWORD_ERROR = "110-003";
    
    /**
     * 密码查询失败
     */
    this.THIRDPARTYUSER_QUERY_PASSWORD_ERROR = "110-004";
    
    /**
     * 获取CTI登录信息时密码为空
     */
    this.THIRDPARTYUSER_QUERY_CTIINFO_PASSWORD_EMPTY = "110-005";
    
    /**
     * 获取CTI登录信息时,查询密码鉴权模式失败
     */
    this.THIRDPARTYUSER_QUERY_CTIINFO_GETAUTHTYPE_FAIL = "110-006";
    
    /**
     * 获取CTI登录信息时,密码鉴权失败
     */
    this.THIRDPARTYUSER_QUERY_CTIINFO_AUTH_FAIL = "110-007";
    
    /**
     * 获取CTI登录信息时,查询数据库失败
     */
    this.THIRDPARTYUSER_QUERY_CTIINFO_DB_FAIL = "110-008";
    
    /**
     * 获取CTI登录信息时,无记录
     */
    this.THIRDPARTYUSER_QUERY_CTIINFO_NO_RECORD = "110-009";
    
    /**
     * 用户名查询失败
     */
    this.THIRDPARTYUSER_QUERY_USERNAME_ERROR = "110-010";
    
    /**
     * 用户鉴权模式查询失败
     */
    this.THIRDPARTYUSER_QUERY_AUTHTYPE_ERROR = "110-011";
    
    /**
     * 根据属性查询座席失败
     */
    this.THIRDPARTYUSER_QUERY_AGENT_BY_ATTRIBUTE_ERROR = "110-012";
    
    /**
     * 账号被锁
     */
    this.ACCOUNT_LOCKED = "110-016";
    
    /**
     * 密码修改失败,新旧密码相同
     */
    this.THIRDPARTYUSER_MODIFY_PASSWORD_ERROR_SAME_OLD = "110-017";
    
    /**
     * 密码修改失败,与name相同或者是name的反序
     */
    this.THIRDPARTYUSER_MODIFY_PASSWORD_ERROR_SAME_NAME = "110-018";
    
    /**
     * 密码修改失败,与name相同或者是name的反序
     */
    this.THIRDPARTYUSER_MODIFY_PASSWORD_ERROR_REGULAR = "110-019";
    
    /**
     * 密码修改失败，密码长度不符合，必须在8-30
     */
    this.THIRDPARTYUSER_MODIFY_PASSWORD_ERROR_LEN = "110-020";
    
    /**
     * 用户名或密码错误次数已达到上限, 帐号被锁定
     */
    this.THIRDPARTYUSER_LOCK_ACCOUNT = "110-021";
    
    /**
     * 密码修改失败,新密码与确认密码不同
     */
    this.THIRDPARTYUSER_MODIFY_PASSWORD_ERROR_DIF_REPWD = "110-022";
    
    /****************************语音呼叫类错误 *************************/
    /**
     * 外呼号码错误
     */
    this.VOICECALL_CALL_OUT_PHONE_ERROR = "200-001";
    
    /**
     * 应答时没有呼叫错误
     */
    this.VOICECALL_ANSWER_NOCALL_ERROR = "200-002";
    
    /**
     * 静音时没有呼叫错误
     */
    this.VOICECALL_BEGINMUTE_NOCALL_ERROR = "200-003";
    
    /**
     * 静音时呼叫状态错误
     */
    this.VOICECALL_BEGINMUTE_STATE_ERROR = "200-004";
    
    /**
     * 连接保持时没有呼叫错误
     */
    this.VOICECALL_CONNECTHOLD_NOCALL_ERROR = "200-005";
    
    /**
     * 连接保持时没有保持呼叫错误
     */
    this.VOICECALL_CONNECTHOLD_NOHOLDCALL_ERROR = "200-006";
    
    /**
     * 取消静音时没有呼叫错误
     */
    this.VOICECALL_ENDMUTE_NOCALL_ERROR = "200-007";
    
    /**
     * 取消静音时呼叫状态错误
     */
    this.VOICECALL_ENDMUTE_STATE_ERROR = "200-008";
    
    /**
     * 报音时没有呼叫错误
     */
    this.VOICECALL_REPORTVOICE_NOCALL_ERROR = "200-009";
    
    /**
     * 三方通话时没有呼叫错误
     */
    this.VOICECALL_THREEPARTY_NOCALL_ERROR = "200-010";
    
    /**
     * 三方通话时没有保持呼叫错误
     */
    this.VOICECALL_THREEPARTY_NOHOLDCALL_ERROR = "200-011";
    
    /**
     * 呼叫转移时没有呼叫错误
     */
    this.VOICECALL_TRANFER_NOCALL_ERROR = "200-012";
    
    /**
     * 保持时没有呼叫错误
     */
    this.VOICECALL_HOLD_NOCALL_ERROR = "200-013";
    
    /**
     * 保持时呼叫状态错误
     */
    this.VOICECALL_HOLD_CALLSTATUS_ERROR = "200-014";
    
    /**
     * 取保持时没有保持呼叫错误
     */
    this.VOICECALL_GETHOLD_NOHOLDCALL_ERROR = "200-015";
    
    /**
     * 取保持时呼叫状态错误
     */
    this.VOICECALL_GETHOLD_CALLSTATUS_ERROR = "200-016";
    
    /**
     * 挂断时无呼叫错误
     */
    this.VOICECALL_RELEASE_NOCALL_ERROR = "200-017";
    
    /**
     * 内部咨询时无呼叫错误
     */
    this.VOICECALL_INSULT_NOCALL_ERROR = "200-018";
    
    
    
    
    
    
    /****************************座席班组类错误 *************************/
    /**
     * 查询座席信息无权限错误
     */
    this.AGENTGROUP_GETAGENT_NORIGHT_ERROR = "300-001";
    
    /**
     * 查询座席信息无座席信息错误
     */
    this.AGENTGROUP_GETAGENT_NOAGENT_ERROR = "300-002";
    
    /**
     * 查询座席班组信息无此座席信息错误
     */
    this.AGENTGROUP_GETAGENTGROUP_NOAGENT_ERROR = "300-003";
    
    /**
     * 查询座席班组信息无此座席班组信息错误
     */
    this.AGENTGROUP_GETAGENTGROUP_NOAGENTGROUP_ERROR = "300-004";
    
    /****************************呼叫数据类错误 *************************/
    /**
     * 设置随路数据时无呼叫信息错误
     */
    this.CALLDATA_SETCALLDATA_NOCALL_ERROR = "400-001";
    
    /**
     * 设置随路数据时无信息可设置错误
     */
    this.CALLDATA_SETCALLDATA_NODATA_ERROR = "400-002";
    
    /**
     * 获取保持队列信息时无话务信息
     */
    this.CALLDATA_GETHOLDLIST_NOHOLDCALL_ERROR = "400-003";
    
    /****************************录音回放类错误 *************************/
    /**
     * 快退时状态错误
     */
    this.RP_JUMPBACK_INVALIDSTATUS_ERROR = "500-001";
    
    /**
     * 快进时状态错误
     */
    this.RP_JUMPFORW_INVALIDSTATUS_ERROR = "500-002";
    
    /**
     * 暂停放音时状态错误
     */
    this.RP_PAUSEPLAY_INVALIDSTATUS_ERROR = "500-003";
    
    /**
     * 暂停录音时状态错误
     */
    this.RP_PAUSERECORD_INVALIDSTATUS_ERROR = "500-004";
    
    /**
     * 继续放音时状态错误
     */
    this.RP_RESUMEPLAY_INVALIDSTATUS_ERROR = "500-005";
    
    /**
     * 继续录音时状态错误
     */
    this.RP_RESUMERECORD_INVALIDSTATUS_ERROR = "500-006";
    
    /**
     * 开始放音时状态错误
     */
    this.RP_STARTPLAY_INVALIDSTATUS_ERROR = "500-007";
    
    /**
     * 开始录音时状态错误
     */
    this.RP_STARTECORD_INVALIDSTATUS_ERROR = "500-008";
    
    /**
     * 停止放音时状态错误
     */
    this.RP_STOPPLAY_INVALIDSTATUS_ERROR = "500-009";
    
    /****************************队列设备类错误 *************************/
    /**
     * 查询座席技能队列信息无此座席信息或座席无配置技能错误
     */
    this.QUEUEDEVICE_GETAGENTQUEUE_NOAGENTORNOQUEUE_ERROR = "600-001";
    
    /**
     * 查询指定VDN的技能队列信息无队列配置信息
     */
    this.QUEUEDEVICE_GETVDNQUEUE_NOQUEUE_ERROR = "600-002";
    
    /**
     * 查询座席所在VDN的接入码信息时无配置信息
     */
    this.QUEUEDEVICE_GETVDNINNO_NOINNO_ERROR = "600-003";
    
    /**
     * 查询座席所在VDN的IVR信息时无配置信息
     */
    this.QUEUEDEVICE_GETIVRINNO_NOIVR_ERROR = "600-004";
    
    /**
     * 查询座席所在VDN的技能队列信息无队列配置信息
     */
    this.QUEUEDEVICE_GETAGENTVDNQUEUE_NOQUEUE_ERROR = "600-005";
    
    /*****************************************************************/
    
 
    /**
     * 文字交谈:其它错误
     */
    this.AGENT_TEXTCHAT_DATABASE_SAVEFIAL = "700-100";
    
    this.AGT_CHAT_QUERY_DB_FAILED = "700-014";
    
    /**发送的文字内容中存在敏感词*/
    this.AGT_CHAT_FILTER_WORD = "700-016";
    
    /***沒有屏幕共享的session***********/
    this.AGT_CHAT_ERR_SCREEN_SHARE_NOT_EXIST = "700-017";
    
    /**
     * 后缀名不正确
     */
    this.AGT_CHAT_ERR_FILEPREFIX = "700-023";
    
    /**
     * 文件不是图片
     */
    this.AGT_CHAT_ERR_FILE_NOTPICTURE = "700-024";
    
    
    /********************** 视频类错误 ***********************************/
    
    /** 视频回放异常 */
    this.VIDEO_PLAY_EVENT_EXCEPTION = "800-001";
    
    /********************** 实时质检操作接口类错误 ***********************************/
    
    /** 质检操作时发生NOPROVIDER异常 */
    this.QUALITYCONTROL_NOPROVIDER_EXCEPTION = "900-001";
    
    /** 质检操作时发生没有权限异常 */
    this.QUALITYCONTROL_NORIGHT_EXCEPTION = "900-002";
    
    /** 质检操作时发生ResourceUnavailableException异常 */
    this.QUALITYCONTROL_RESOURCEUNAVAILABLE_EXCEPTION = "900-003";
    
    /** 质检监视时发生没有座席信息 */
    this.QUALITYCONTROL_MONITOR_AGENT_NOAGENT_EXCEPTION = "900-004";
    
    /** 质检操作时发生状态异常 */
    this.QUALITYCONTROL_STATUS_ERROR = "900-005";
    

    
   
    
    /**
     * 超过当前vdn最大座席登录数。
     */
    this.OVER_MAX_LOGIN = "The number of login agents has exceeded that permitted for this VDN.";
    
    /**
     * 超过当前vdn最大视频座席登录数。
     */
    this.OVER_MAX_VIDEO_LOGIN = "The number of video agents who log in to the VDN to which the agent belongs reaches the upper limit.";
}


