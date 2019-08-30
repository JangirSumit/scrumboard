$(document).ready(function () {
    $("#iteration_path").keypress(function (event) {
        var keyCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
        if (keyCode == 13) {
            executeQuery();
            return false;
        }
        else {
            return true;
        }
    });
});

function queryAJAXCall(query_string) {
    $(".overlay").show();
    query_string = query_string.replace(/(?:\r\n|\r|\n)/g, ' ')
    var data = { QueryString: query_string }
    $.ajax({
        url: 'Default.aspx/GetQueryDetails',
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ data: data }),
        success: function (data) {
            fillData(data.d.Details);
            $(".overlay").hide();
        },
        error: function (response) {
            $(".overlay").hide();
            alert(response.Message || "Error in query. Please check again.");
        }
    });
}

function getQueryWithIterationPath(itertation_path, area_path) {
    var query = "select [System.Id], [System.WorkItemType], [System.Title], [System.AssignedTo], [System.State], [System.Tags], [Microsoft.VSTS.Scheduling.StoryPoints], [Microsoft.VSTS.Common.StackRank], [System.AreaPath], [System.IterationPath] from WorkItems where [System.IterationPath] under '" + itertation_path + "' and [System.WorkItemType] in ('Bug', 'Task', 'User Story', 'Feature')";
    if (area_path) {
        query += " and [System.AreaPath] under '" + area_path + "'"
    }

    return query;
}

function executeQuery() {
    var itertation_path = $("#iteration_path").val().trim();
    var area_path = $("#area_path").val().trim();

    if (!itertation_path) {
        alert("Please enter Iteration Path");
        return false;
    } else if (itertation_path.toUpperCase() === "TP" || itertation_path.toUpperCase() === "TP\\") {
        alert("So many records in this Iteration Path. Please enter correct path.");
        return false;
    }
    var query = getQueryWithIterationPath(itertation_path, area_path);
    queryAJAXCall(query);
}

function fillData(data) {
    clearData();
    var notDoneItems = $("#notDoneItems");
    var activeItems = $("#activeItems");
    var closedItems = $("#closedItems");
    var inTestingItems = $("#inTestingItems");

    var active = 0, resolved = 0, closed = 0, notDone = 0;

    for (var i = 0; i < data.length; i++) {
        switch (data[i].State) {
            case "Not Done":
                notDoneItems.append(getTemplate(data[i]));
                notDone++;
                break;
            case "Active":
                activeItems.append(getTemplate(data[i]));
                active++;
                break;
            case "Resolved":
                inTestingItems.append(getTemplate(data[i]));
                resolved++;
                break;
            case "Closed":
                closedItems.append(getTemplate(data[i]));
                closed++;
                break;
        }
    }
    if (data.length) {
        appendTotalCounts(active, resolved, closed, notDone);
        showPerCompleted(data.length, closed);
    }
}

function showPerCompleted(total, closed) {
    var per = parseInt(closed * 100 / total);
    $("#myProgress").show();
    $("#sprint_slider").show();
    $("#myBar").html(per + '%').animate({ width: per + '%' }, 2000);
}

function appendTotalCounts(active, resolved, closed, notDone) {
    var notDoneHeader = $("#notDoneHeader");
    var activeHeader = $("#activeHeader");
    var closedHeader = $("#closedHeader");
    var resolvedHeader = $("#resolvedHeader");
    activeHeader.append(" (" + active + ")");
    resolvedHeader.append(" (" + resolved + ")");
    closedHeader.append(" (" + closed + ")");
    notDoneHeader.append(" (" + notDone + ")");
}

function clearData() {
    var notDoneItems = $("#notDoneItems");
    var activeItems = $("#activeItems");
    var closedItems = $("#closedItems");
    var inTestingItems = $("#inTestingItems");

    notDoneItems.html("<h4 id='notDoneHeader' class='tiles-header'>Not Done</h4><hr />");
    activeItems.html("<h4 id='activeHeader' class='tiles-header'>Active</h4><hr />");
    closedItems.html("<h4  id='closedHeader' class='tiles-header'>Closed</h4><hr />");
    inTestingItems.html("<h4  id='resolvedHeader' class='tiles-header'>In Testing</h4><hr />");
}

function getTemplate(item) {
    var img_src = item.Avatar;
    var defaultImag = "Content/IdentityImage.svg";
    img_src = img_src || defaultImag;
    var category = "";

    switch (item.Type) {
        case "Bug":
            category = "bug";
            break;
        case "User Story":
            category = "story";
            break;
        case "Task":
            category = "task";
            break;
        case "Feature":
            category = "feature";
            break;
        default:
            category = "";
    }

    var stackRank = "";
    var reminderIcon = "";
    if (item.LastModified > 5 && (item.State != "Closed")) {
        reminderIcon = '<img src="Content/reminder.png" style="width:25px; cursor:pointer;" title="Not updated since last 5 days. Send Reminder!!" onClick="triggerOutlook(this);"/>';
    }

    if (item.StackRank && item.StackRank <= 99) {
        stackRank = '<span class="badge badge-style" title="Stack Rank">' + item.StackRank + '</span>';
    }

    var template = '<div data-type="' + item.Type + '" data-state="' + item.State + '" class="media tile ' + category + '" title="' + item.Type + '"><div class="media-left"><img src=' + img_src + ' class="media-object" style="width:60px">' + stackRank + reminderIcon;
    template += '</div><div class="media-body"><a class="media-heading" target="_blank" href="' + item.Link + '"><b id="workitemId">' + item.WorkItemId + '</b> : ' + item.Title + '</a><p><strong id="assignedTo">' + item.AssignedTo + '</strong></p>';

    if (item.Tags && item.Tags.length) {
        var tags = getTags(item.Tags);
        template += tags;
    }

    template += '</div></div>';
    //template += '<hr />';
    return template;
}

function getTags(tags) {
    var tagsForDependency = ["depend", "related"];
    var tagsForGoals = ["goal", "target", "objective", "aim", "plan"];
    var tagsForBlocked = ["block", "stop"];
    var tagsForPriority = ["priority", "sep"]

    var temp_tags = tags.split('; ');
    var tag = '<p>';

    for (var i = 0; i < temp_tags.length; i++) {
        tag += '<span class="label label-primary tags">' + temp_tags[i] + '</span>'
    }

    tag += "</p>"

    if (tagsForGoals.find((a=>tags.toLowerCase().indexOf(a) >= 0))) {
        tag += '<img src="Content/target.png" style="float: right; margin: 3px;"  title="Targeted">';
    }
    if (tagsForDependency.find((a=>tags.toLowerCase().indexOf(a) >= 0))) {
        tag += '<img src="Content/Dependency.png" style="float: right; width: 40px; margin: 3px;" title="Dependent">';
    }
    if (tagsForBlocked.find((a=>tags.toLowerCase().indexOf(a) >= 0))) {
        tag += '<img src="Content/blocked.png" style="float: right; width: 32px; margin: 3px;" title="Blocked">';
    }

    if (tagsForPriority.find((a=>tags.toLowerCase().indexOf(a) >= 0))) {
        tag += '<img src="Content/priority.png" style="float: right; width: 32px; margin: 3px;" title="High Priority">';
    }

    return tag;
}

function triggerOutlook(obj) {
    var body = "Work item is not updated since last 5 days. Please update work item.";
    var assignedTo = $(obj).closest(".media.tile").find("#assignedTo").text();
    assignedTo = assignedTo.substring((assignedTo.lastIndexOf("(") + 1), assignedTo.lastIndexOf(")"));
    assignedTo += "@saxobank.com"
    var subject = "Reminder :- " + $(obj).closest(".media.tile").find(".media-heading").text();

    window.location.href = "mailto:" + assignedTo + "?body=" + body + "&subject=" + subject;
}

function getMailBody(obj) {
    var data = $(obj).find(".media-heading").text().split(" : ");
    var assignedTo = $(obj).find("#assignedTo").text();
    var type = $(obj).data("type");
    var state = $(obj).data("state");

    var table = '<html><body><table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;width:100%">';
    table += '<tbody><tr height="20" style="height:15.0pt"><td height="20" class="xl65" width="56" style="height:15.0pt;width:42pt">ID</td><td class="xl65" width="210" style="width:158pt">Title</td><td class="xl65" width="138" style="width:104pt">Assigned To</td><td class="xl65" width="66" style="width:50pt">State</td><td class="xl65" width="107" style="width:80pt">Work Item Type</td></tr>';
    table += '<tr height="20" style="height:15.0pt"><td height="20" class="xl66" align="right" style="height:15.0pt"><a href="http://tfs:8080/tfs/DefaultCollection/TP/_workitems?id=' + data[0] + '" target="_parent">' + data[0] + '</a></td><td class="xl67">' + data[1] + '</td><td class="xl67">' + assignedTo + '</td><td class="xl67">' + state + '</td><td class="xl67">' + type + '</td></tr>';
    table += '</table></body></html>';

    return table;
}