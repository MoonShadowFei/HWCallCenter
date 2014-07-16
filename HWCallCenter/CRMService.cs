using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Xrm.Sdk.Client;
using System.ServiceModel.Description;

namespace HWCallCenter
{
    public class CRMService
    {
        public static OrganizationServiceProxy GetOrganizationService()
        {
            Uri organizationUrl = new Uri(string.Format("{0}/{1}/XRMServices/2011/Organization.svc", AppConfig.ServerUrl, AppConfig.OrgName));
            ClientCredentials credentials = new ClientCredentials();
            credentials.Windows.ClientCredential = new System.Net.NetworkCredential();
            credentials.Windows.ClientCredential = new System.Net.NetworkCredential(AppConfig.UserId, AppConfig.Password, AppConfig.Domain);
            OrganizationServiceProxy organizationServiceProxy = new OrganizationServiceProxy(organizationUrl, null, credentials, null);
            return organizationServiceProxy;
        }

        public static OrganizationServiceProxy GetUserOrganizationService()
        {
            Uri organizationUrl = new Uri(string.Format("{0}/{1}/XRMServices/2011/Organization.svc", AppConfig.ServerUrl, AppConfig.OrgName));
            ClientCredentials credentials = new ClientCredentials();
            credentials.Windows.ClientCredential = System.Net.CredentialCache.DefaultNetworkCredentials;
            OrganizationServiceProxy organizationServiceProxy = new OrganizationServiceProxy(organizationUrl, null, credentials, null);
            organizationServiceProxy.ServiceConfiguration.CurrentServiceEndpoint.Behaviors.Add(new ProxyTypesBehavior());
            return organizationServiceProxy;
        }
    }
}