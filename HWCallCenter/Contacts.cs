using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk.Client;
using Microsoft.Xrm.Sdk;

namespace HWCallCenter
{
    public class Contact
    {
        public Guid Id{get;set;}
        public string Name{get;set;}
        public string EntityType{get;set;}
        public string EntityTypeName { get; set; }
        public DateTime CreatedOn{get;set;}
        public string Owner{get;set;}
        public EntityReference RefStudent { set; get; }
        public string Email { get; set; }
        public string IdentNo { get; set; }
    }


    public class Contacts
    {
        public List<Contact> ContactsList=new List<Contact>();
        public void GetContacts(string phoneno)
        {
            GetContactsFromEntity(phoneno, "account");
            GetContactsFromEntity(phoneno, "contact");
        }

        private void GetContactsFromEntity(string phoneno, string entityname)
        {
            QueryExpression query = new QueryExpression(entityname);
            //该实体中记录电话号码的字段名
            string phoneattname = string.Empty;
            //该实体中记录姓名的字段名
            string nameatt = string.Empty;
            //该实体中记录主键ID的字段名
            string idatt = string.Empty;
            //记录身份证的字段名
            string identNoatt = string.Empty;
            switch (entityname)
            { 
                    //如果电话字段有多个，则以','隔开
                case "account":
                    phoneattname = "telephone1,new_mobilephone";
                    nameatt = "name";
                    idatt = "accountid";
                    identNoatt = "new_idnumber";
                    break;
                case "contact":
                    phoneattname = "telephone1";
                    nameatt = "name";
                    idatt = "contactid";
                    break;

                default:
                    phoneattname="";
                    break;
            }
            //对于有多个电话号码字段（如手机号码，家庭电话等）的情况，只要一个字段匹配，则认为是该联系人
            string[] atts=phoneattname.Split(',');
            foreach(var att in atts)
            {
                ConditionExpression con = new ConditionExpression();
                con.AttributeName = att;
                con.Operator = ConditionOperator.EndsWith;
                con.Values.Add(phoneno.TrimStart('0'));
                query.Criteria.AddCondition(con);
            }
            query.Criteria.FilterOperator=LogicalOperator.Or;
            query.ColumnSet = new ColumnSet("createdon", nameatt, idatt, "ownerid",identNoatt);
            if (entityname == "new_studentfamily")
            {
                query.ColumnSet = new ColumnSet("createdon", nameatt, idatt, "ownerid","new_midschoolstudent_new_studentfamil");
            }

            IOrganizationService service = CRMService.GetOrganizationService();
            EntityCollection pcontacts = service.RetrieveMultiple(query);
            //如果存在，则添加到符合条件的联系人中
            if (pcontacts.Entities.Count > 0)
            {
                foreach (var pcontact in pcontacts.Entities)
                {
                    Contact tcontact = new Contact();
                    if (entityname == "new_midschoolstudent")
                    {
                        tcontact.EntityTypeName = "中学生源";
                    }
                    else if (entityname == "new_studentfamily")
                    {
                        tcontact.EntityTypeName = "家庭联系人（中学生源）";
                    }
                    tcontact.Id = (Guid)pcontact.Attributes[idatt];
                    tcontact.EntityType = entityname;
                    tcontact.CreatedOn=(DateTime)pcontact.Attributes["createdon"];
                    tcontact.Owner = ((EntityReference)pcontact.Attributes["ownerid"]).Name;
                    if (!string.IsNullOrEmpty(pcontact.Attributes[nameatt].ToString()))
                    {
                        tcontact.Name = pcontact.Attributes[nameatt].ToString();
                    }

                    if (entityname != "new_studentfamily" && pcontact.Contains(identNoatt) && !string.IsNullOrEmpty(pcontact.Attributes[identNoatt].ToString()))
                    {
                        tcontact.IdentNo = pcontact.Attributes[identNoatt].ToString();
                    }
                    if(entityname=="new_studentfamily")
                    {
                        tcontact.RefStudent = ((EntityReference)pcontact.Attributes["new_midschoolstudent_new_studentfamil"]);
                    }
                    ContactsList.Add(tcontact);
                }
            }
        }

    }
}