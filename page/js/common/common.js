/**
 *change html tag to string
 * @param objVal
 * @returns
 */
function htmlEncode(objVal)
{
	var str = objVal+"";
	if(str == '')
	{
		return str;
	}
	str = str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(new RegExp("\"","g"),"&quot;").replace(new RegExp("\'","g"),"&#39;").replace(new RegExp("  ","g")," &nbsp;");
	return str;
}


Date.prototype.format = function(fmt) 
{ //author: meizz 
  var o = { 
    "M+" : this.getMonth()+1,                 
    "d+" : this.getDate(),                    
    "h+" : this.getHours(),                   
    "m+" : this.getMinutes(),                 
    "s+" : this.getSeconds(),                 
    "q+" : Math.floor((this.getMonth()+3)/3), 
    "S"  : this.getMilliseconds()             
  }; 
  if(/(y+)/.test(fmt)) 
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
  for(var k in o) 
    if(new RegExp("("+ k +")").test(fmt)) 
    	fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length))); 
  return fmt; 
};


String.prototype.trim = function() 
{ 
	var value = this.replace(/(^\s*)|(\s*$)/g, "");      
    return value.replace(/(^　*)|(　*$)/g, "");     
}; 