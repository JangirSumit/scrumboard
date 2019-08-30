using Microsoft.TeamFoundation.Client;
using Microsoft.TeamFoundation.Framework.Client;
using Microsoft.TeamFoundation.WorkItemTracking.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Services;
using System.Web.UI;

namespace NewScrumBoard
{
    public class QueryData
    {
        public string QueryString { get; set; }
    }
    public partial class _Default : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        [WebMethod]
        public static WorkItemDetails GetQueryDetails(QueryData data)
        {
            var request = HttpContext.Current.Request;
            var response = System.Web.HttpContext.Current.Response;

            string browser = request.Browser.Browser.ToLower();
            int majorVersion = request.Browser.MajorVersion;

            string[] urlSegments = request.Url.Segments;

            Uri tfsUri = new Uri("http://tfs:8080/tfs/defaultcollection");

            NetworkCredential credentials = new NetworkCredential("SaxoSvcMossInst", "3kEn6zABSn", "sys");

            TfsTeamProjectCollection teamProject = new TfsTeamProjectCollection(tfsUri, credentials);

            WorkItemStore store = new WorkItemStore(teamProject);

            //string query_text = @"select [System.Id], [System.WorkItemType], [System.Title], [System.AssignedTo], [System.State], [System.Tags], [Microsoft.VSTS.Scheduling.StoryPoints], [Microsoft.VSTS.Common.StackRank], [System.AreaPath], [System.IterationPath] from WorkItems where [System.IterationPath] under 'TP\CE Components and Services\Kangaroo' and [System.WorkItemType] in ('Bug', 'Task', 'User Story') order by [System.State]";

            Query query = new Query(store, data.QueryString);

            WorkItemCollection result = query.RunQuery();

            List<WorkItem> items = new List<WorkItem>();

            for (int i = 0; i < result.Count; i++)
            {
                items.Add(result[i]);
            }

            var images = GetImages(teamProject, items.Select(a => a[CoreField.AssignedTo].ToString()).ToList().Distinct());

            WorkItemDetails workItemDetails = new WorkItemDetails();
            List<WorkItemDetail> details = new List<WorkItemDetail>();

            foreach (var item in items)
            {
                var assignedTo = Convert.ToString(item[CoreField.AssignedTo]);
                string image = images[assignedTo];

                WorkItemDetail workItemDetail = new WorkItemDetail();
                workItemDetail.Avatar = image;
                workItemDetail.WorkItemId = item.Id;
                workItemDetail.Type = Convert.ToString(item[CoreField.WorkItemType]);
                workItemDetail.State = Convert.ToString(item[CoreField.State]);
                workItemDetail.AssignedTo = assignedTo;
                workItemDetail.Title = Convert.ToString(item[CoreField.Title]);
                workItemDetail.Link = "http://tfs:8080/tfs/DefaultCollection/TP/_workitems?id=" + item.Id;
                workItemDetail.Tags = Convert.ToString(item[CoreField.Tags]);
                workItemDetail.History = Convert.ToString(item[CoreField.History]);
                workItemDetail.ChangedDate = Convert.ToString(item[CoreField.ChangedDate]);
                workItemDetail.StackRank = Convert.ToString(item["Microsoft.VSTS.Common.StackRank"]);
                workItemDetail.LastModified = DateTime.Now.Subtract(Convert.ToDateTime(workItemDetail.ChangedDate)).Days;
                workItemDetail.StoryPoints = Convert.ToString(item["Microsoft.VSTS.Scheduling.StoryPoints"]);
                details.Add(workItemDetail);
            }
            workItemDetails.Details = details;

            return workItemDetails;
        }

        private static string GetAvatar(TfsTeamProjectCollection teamProject, string assignedTo)
        {
            string image = "";
            try
            {
                var initials = assignedTo.Substring(assignedTo.IndexOf("(") + 1, assignedTo.IndexOf(")") - assignedTo.IndexOf("(") - 1);
                var identityService = teamProject.ConfigurationServer.GetService<IIdentityManagementService2>();
                TeamFoundationIdentity identity = identityService.ReadIdentity(initials);

                image = "http://tfs:8080/tfs/defaultcollection/_api/_common/IdentityImage?id=" + identity.TeamFoundationId;
            }
            catch
            {
                return image;
            }

            return image;
        }
        private static Dictionary<string, string> GetImages(TfsTeamProjectCollection teamProject, IEnumerable<string> assignies)
        {
            Dictionary<string, string> dictUnique = new Dictionary<string, string>();

            foreach (var assignedTo in assignies)
            {
                dictUnique.Add(assignedTo, GetAvatar(teamProject, assignedTo));
            }

            return dictUnique;
        }
    }



    public class WorkItemDetail
    {
        public int WorkItemId { get; set; }
        public string Title { get; set; }
        public string Avatar { get; set; }
        public string Link { get; set; }
        public string State { get; set; }
        public string Type { get; set; }
        public string AssignedTo { get; set; }
        public string Tags { get; set; }
        public string ChangedDate { get; set; }
        public string History { get; set; }
        public string ITReleaseDate { get; set; }
        public string StackRank { get; set; }
        public string IterationStartDate { get; set; }
        public string IterationEndDate { get; set; }
        public int LastModified { get; set; }
        public string StoryPoints { get; set; }
        public bool ContainsParent { get; set; }
    }

    public class WorkItemDetails
    {
        public List<WorkItemDetail> Details { get; set; }
    }
}