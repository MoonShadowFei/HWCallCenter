using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;

namespace HWCallCenter
{
    public partial class PhoneCallRecord : System.Web.UI.Page
    {
        public EntityReference currentUser;
        protected void Page_Load(object sender, EventArgs e)
        {
            {
                string phoneno = string.Empty;
                if (!string.IsNullOrEmpty(Request.QueryString["direct"]))
                {
                    string direct = Request.QueryString["direct"];
                    if (direct.ToLower() == "in")
                    {
                        lbldirect.Text = "拨入";
                    }
                    if (direct.ToLower() == "out")
                    {
                        lbldirect.Text = "拨出";
                    }

                }
                if (!string.IsNullOrEmpty(Request.QueryString["phoneno"]))
                {
                    phoneno = Request.QueryString["phoneno"];

                }
                if (!string.IsNullOrEmpty(Request.QueryString["uniqueid"]))
                {
                    lblrecordno.Text = Request.QueryString["uniqueid"];
                }
                if (!string.IsNullOrEmpty(Request.QueryString["area"]))
                {
                    lblareano.Text = Request.QueryString["area"];
                }
                if (!string.IsNullOrEmpty(Request.QueryString["city"]) && !string.IsNullOrEmpty(Request.QueryString["province"]))
                {
                    lbldistrict.Text = Request.QueryString["province"] + Request.QueryString["city"];
                }
                lbldirect.Text = "呼入";
                lblphoneno.Text = "13475657443";
                lblareano.Text = "0731";
                lbldistrict.Text = "湖南长沙";
                //Contacts cons = new Contacts();
                //lblphoneno.Text = phoneno;
                //cons.GetContacts(phoneno);
                //gvContacts.DataSource = cons.ContactsList;
                //gvContacts.DataBind();
                IOrganizationService service = CRMService.GetUserOrganizationService();
                WhoAmIRequest req = new WhoAmIRequest();
                WhoAmIResponse res = (WhoAmIResponse)service.Execute(req);
                currentUser = service.Retrieve("systemuser", res.UserId, new Microsoft.Xrm.Sdk.Query.ColumnSet()).ToEntityReference();

                btnSubmit.Attributes.Add("onclick", "this.disabled=true;" + this.ClientScript.GetPostBackEventReference(btnSubmit, ""));

            }
        }
    }
}