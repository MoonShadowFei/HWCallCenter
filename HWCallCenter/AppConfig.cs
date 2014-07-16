using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HWCallCenter
{
    public class AppConfig
    {
        public static string ServerUrl
        {
            get { return System.Configuration.ConfigurationManager.AppSettings["ServerUrl"].ToString(); }
        }
        public static string OrgName
        {
            get { return System.Configuration.ConfigurationManager.AppSettings["OrgName"].ToString(); }
        }
        public static string UserId
        {
            get { return System.Configuration.ConfigurationManager.AppSettings["AdminUser"].ToString(); }
        }
        public static string Password
        {
            get { return System.Configuration.ConfigurationManager.AppSettings["AdminPassword"].ToString(); }
        }
        public static string Domain
        {
            get { return System.Configuration.ConfigurationManager.AppSettings["Domain"].ToString(); }
        }
    }
}