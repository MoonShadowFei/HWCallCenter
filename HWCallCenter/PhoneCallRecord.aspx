<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="PhoneCallRecord.aspx.cs" Inherits="HWCallCenter.PhoneCallRecord" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <script src="JS/jquery-1.4.1.min.js" type="text/javascript"></script>
    <title>通话记录</title>
    <style type="text/css">
        body
        {
            background: #F6F8FA;
            font-size: .80em;
            font-family: "Helvetica Neue", "Lucida Grande", "Segoe UI", Arial, Helvetica, Verdana, sans-serif;
            margin: 0px;
            padding: 0px;
            color: #696969;
        }
        a:hover{color:#ff0000;}
        .edit
        {
            text-align:right;
            display:block;
            margin-right:20px;
            margin-top:2px;   
            float:right;
            font-weight:normal;
        }
        .tab
        {
           /*border-bottom:1px dashed #696969;*/
           border-bottom:1px dashed blue;
           width:100%;
           font-size:14px;
           font-weight:bold;
           display:block;
           margin-top:15px;
           cursor:pointer;
           color:Blue;
        }
        .group
        {
           border-bottom:1px solid #ccc;
           width:100%;
           font-size:13px;
           font-weight:bold;
           display:block;
           margin-top:10px;
           color:#000;
        }
        .list
        {
            text-align:left;
            width:100%;
            background-color:#c4c4c4;
            margin-top:2px;
           
        }
        .list td
        {
            background-color:#eff2f6;   
        }
        .td
        {
            margin-bottom:30px;    
        }
        .list th
        {
            text-align:left;
            background-color:#696969;   
            color:#F6F8FA;  
        }
        .op
        {
            width:45px;
            text-align:right;
            margin-right:20px;    
        }
        
        .style1
        {
            width: 150px;
            height: 21px;
        }
        .style2
        {
            width: 347px;
            height: 21px;
        }
    </style>
    <script type="text/javascript">
        var org = "hieu";

        function getQueryStringByName(name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return result[1]
        }
        function ToggleGroup(id) {
            $("#" + id).toggle();
        }
        function NavigatorTo(id) {
            //window.history.href = id;
        }
        function openWindow(url) {
            var top = (window.screen.availHeight - 768) / 2;
            var left = (window.screen.availWidth - 1024) / 2;
            window.open(url + "&rof=false", "", 'width=1024,height=768,top=' + top + ',left=' + left + ',toolbar=no,resizable=yes,menubar=no,status=no,location=no,scrollbar=yes');
            //window.open(url);
        }
        function ChangeChk(ctl) {
            var theBox = ctl;
            var elem = theBox.form.elements;
            for (i = 0; i < elem.length; i++) {
                if (elem[i].type == 'checkbox') {
                    if (elem[i].id == theBox.id) {
                        elem[i].checked = true;
                    }
                    else {
                        elem[i].checked = false;
                    }
                }
            }
        }
        function OpenCreateStudent() {
            var strUrl = document.location.protocol + "//" + document.location.host + "/" + org;
            var pno = getQueryStringByName("phoneno");
            if (pno != null) {
                var extraqs = "new_mobilephone%3D" + pno + "%26new_studentsource%3D2%26new_recuitmenttype%3D0%26new_graduateyear%3D" + new Date().getFullYear();
                var newstrUrl = strUrl + "/main.aspx?etn=new_midschoolstudent&pagetype=entityrecord&extraqs=" + extraqs;
                openWindow(newstrUrl);
            }
        }
    </script>
</head>
<body>
    <form id="form1" runat="server">
    <div >
    <table style="width:800px;border:1px solid #696969;" align="center">
        <tr>
            <td class="style1">来电号码：</td><td class="style2">
                            <asp:Label ID="lblphoneno" runat="server" Text=""></asp:Label></td>
            <td class="style1">通话编号：</td><td class="style2">
                            <asp:Label ID="lblrecordno" runat="server" Text=""></asp:Label></td>
        </tr>
        <tr>
            <td class="style1">方向：</td><td class="style2">
                            <asp:Label ID="lbldirect" runat="server" Text=""></asp:Label></td>
        </tr>
        <tr>
            <td class="style1">区号：</td><td class="style2">
                            <asp:Label ID="lblareano" runat="server" Text=""></asp:Label></td>
            <td class="style1">归属地：</td><td class="style2">
                            <asp:Label ID="lbldistrict" runat="server" Text=""></asp:Label></td>
        </tr>
        <tr>
            <td style="width:150px">选择联系人：</td>
            <td colspan='3'  align=left >
                <div id='divTable'>
                <asp:GridView ID="gvContacts" runat="server" 
                    onrowdatabound="gvContacts_RowDataBound1" EnableViewState="False" 
                    onrowcommand="gvContacts_RowCommand" onrowediting="gvContacts_RowEditing" 
                        AutoGenerateColumns="False">
                    <Columns>
                        <asp:TemplateField>
                            <ItemTemplate>
                                <asp:CheckBox ID="CheckBox1" runat="server" onclick="javascript:ChangeChk(this)"    />
                            </ItemTemplate>
                        </asp:TemplateField>
                        <asp:BoundField DataField="Name" HeaderText="姓名" />
                        <asp:BoundField DataField="IdentNo" HeaderText="身份证号" />
                        <asp:BoundField DataField="EntityTypeName" HeaderText="类型" />
                        <asp:BoundField DataField="Owner" HeaderText="负责人" />
                        <asp:BoundField DataField="CreatedOn" HeaderText="创建时间" />
                    </Columns>
                </asp:GridView>
                </div>
            </td>
            
        </tr>
        <tr>
            <td>
            </td>
            <td>
                <asp:ImageButton ID="ImageButton1" runat="server" OnClientClick="javascript:OpenCreateStudent()" ImageUrl="/_imgs/cmd_add.png"/>
                <asp:ImageButton ID="ImageButton2" runat="server"  
                    ImageUrl="/_imgs/refresh16.gif" onclick="ImageButton2_Click"/>
            </td>
         </tr>
         <tr>
            <td>沟通纪要：</td>
            <td colspan='3'>
                <asp:TextBox ID="tbDescription" runat="server" Rows="5" TextMode="MultiLine" 
                    Width="100%"></asp:TextBox>
            </td>
         </tr>
        
         <tr>
            <td colspan='4' align='center'>
                <asp:Button ID="btnSubmit" runat="server" Text="提交" onclick="btnSubmit_Click" />
            </td>
         </tr>
    </table>       
    </div>
    </form>
</body>
</html>
