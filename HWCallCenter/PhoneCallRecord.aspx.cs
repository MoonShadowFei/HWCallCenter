﻿using System;
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
                if (!string.IsNullOrEmpty(Request.QueryString["feature"]))
                {
                    string direct = Request.QueryString["feature"];

                    lbldirect.Text = direct;
                }
                if (!string.IsNullOrEmpty(Request.QueryString["phoneno"]))
                {
                    phoneno = Request.QueryString["phoneno"];

                }
                if (!string.IsNullOrEmpty(Request.QueryString["uniqueid"]))
                {
                    lblrecordno.Text = Request.QueryString["uniqueid"];
                }

                //lbldirect.Text = "呼入";
                //lblphoneno.Text = "13475657443";
                Contacts cons = new Contacts();
                lblphoneno.Text = phoneno;
                cons.GetContacts(phoneno);
                gvContacts.DataSource = cons.ContactsList;
                gvContacts.DataBind();
                IOrganizationService service = CRMService.GetUserOrganizationService();
                WhoAmIRequest req = new WhoAmIRequest();
                WhoAmIResponse res = (WhoAmIResponse)service.Execute(req);
                currentUser = service.Retrieve("systemuser", res.UserId, new Microsoft.Xrm.Sdk.Query.ColumnSet()).ToEntityReference();

                btnSubmit.Attributes.Add("onclick", "this.disabled=true;" + this.ClientScript.GetPostBackEventReference(btnSubmit, ""));

            }
        }

        protected void btnSubmit_Click(object sender, EventArgs e)
        {

            {
                var rows = gvContacts.Rows;
                bool selected = false;
                Contact selectedcontact = new Contact();
                foreach (GridViewRow row in rows)
                {
                    if (((CheckBox)row.FindControl("checkbox1")).Checked == true)
                    {
                        selected = true;
                        selectedcontact = (Contact)row.DataItem;
                        selectedcontact = (Contact)(((List<Contact>)gvContacts.DataSource)[row.RowIndex]);

                    }
                }
                if (selected == true)
                {
                    try
                    {
                        Entity phonecall = new Entity("phonecall");
                        //将致电人赋值
                        EntityReference from = new EntityReference(selectedcontact.EntityType, selectedcontact.Id);
                        //将致电人添加到partyList里
                        Entity fromParty = new Entity("activityparty");
                        fromParty.Attributes.Add("partyid",from);
                        EntityCollection collFromParty = new EntityCollection();
                        collFromParty.EntityName = selectedcontact.EntityType;
                        collFromParty.Entities.Add(fromParty);
                        phonecall.Attributes["from"] = collFromParty;

                        //将接听人添加到partyList里
                        EntityReference to = currentUser;
                        Entity toParty = new Entity("activityparty");
                        toParty.Attributes.Add("partyid", to);
                        EntityCollection collToParty = new EntityCollection();
                        collToParty.EntityName = "systemuser";
                        collToParty.Entities.Add(toParty);
                        phonecall.Attributes["to"] = collToParty;

                        phonecall.Attributes["new_ccrecordno"] = lblrecordno.Text;
                        phonecall.Attributes["phonenumber"] = lblphoneno.Text;
                        phonecall.Attributes["description"] = tbDescription.Text;
                        phonecall.Attributes["subject"] = "From CC:" + lblphoneno.Text;
                        //拨入0，拨出1
                        //if (lbldirect.Text == "拨入")
                        //{
                        //    phonecall.Attributes["directioncode"] = false;
                        //}
                        //else if (lbldirect.Text == "拨出")
                        //{
                        //    phonecall.Attributes["directioncode"] = true;

                        //}

                        IOrganizationService service = CRMService.GetUserOrganizationService();
                        Guid phonecallId = service.Create(phonecall);
                        Response.Write("<script type='text/javascript'>alert('提交成功')</script>");
                        ClientScript.RegisterStartupScript(Page.GetType(), "", "<script language=javascript>window.opener=null;window.open('','_self');window.close();</script>");
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }
                }
                else
                {
                    Response.Write("<script type='text/javascript'>alert('请选择联系人或者点击 + 按钮添加新联系人')</script>");
                }
            }
        }

        protected void gvContacts_RowEditing(object sender, GridViewEditEventArgs e)
        {

        }

        protected void gvContacts_RowDataBound1(object sender, GridViewRowEventArgs e)
        {

        }

        protected void gvContacts_RowCommand(object sender, GridViewCommandEventArgs e)
        {

        }

        protected void ImageButton1_Click(object sender, ImageClickEventArgs e)
        {

        }

        protected void ImageButton2_Click(object sender, ImageClickEventArgs e)
        {
            string phoneno = string.Empty;
            if (!string.IsNullOrEmpty(Request.QueryString["phoneno"]))
            {
                phoneno = Request.QueryString["phoneno"];

            }
            Contacts cons = new Contacts();
            lblphoneno.Text = phoneno;
            cons.GetContacts(phoneno);
            gvContacts.DataSource = cons.ContactsList;
            gvContacts.DataBind();
        }
    }
}