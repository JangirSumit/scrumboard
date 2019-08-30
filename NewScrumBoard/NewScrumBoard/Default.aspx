<%@ Page Title="Home Page" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="NewScrumBoard._Default" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">

    <div class="jumbotron" style="margin-bottom: 0px; padding: 5px; margin-top: 20px;">
        <div class="form-group row">
            <div class="col-sm-5 margin-2">
                <input type="text" placeholder="Iteration Path | E.g.- TP\CE Components and Services\Mosaic" class="form-control" id="iteration_path" />
            </div>
            <div class="col-sm-5 margin-2">
                <input type="text" placeholder="Area Path | E.g.- TP\CE Components and Services" class="form-control" id="area_path" />
            </div>
            <div class="col-sm-2 margin-2">
                <button type="button" id="getQueryData" class="btn button-background" onclick="executeQuery();">Show</button>
            </div>
        </div>
    </div>
    <div class="row sprint-slider-header" id="sprint_slider">
        <div class="col-md-2 padding-right-0" style="padding-top: 5px;">
            <b>Sprint Progress</b>
        </div>
        <div class="col-md-10">
             <div id="myProgress" title="Calculation : (Total Number of closed work items)/(Total Number of work items)">
                <div id="myBar"></div>
            </div>

            <%--<ul class="timeline" id="timeline">
                <li class="li complete">
                    <div class="timestamp">
                        <span class="author">Abhi Sharma</span>
                        <span class="date">11/15/2014</span>
                    </div>
                    <div class="status">
                        <h4>Shift Created </h4>
                    </div>
                </li>
                <li class="li complete">
                    <div class="timestamp">
                        <span class="author">PAM Admin</span>
                        <span class="date">11/15/2014</span>
                    </div>
                    <div class="status">
                        <h4>Email Sent </h4>
                    </div>
                </li>
                <li class="li complete">
                    <div class="timestamp">
                        <span class="author">Aaron Rodgers</span>
                        <span class="date">11/15/2014</span>
                    </div>
                    <div class="status">
                        <h4>SIC Approval </h4>
                    </div>
                </li>
            </ul>--%>
        </div>
    </div>

    <div class="row" id="data-section">
        <div class="col-md-3" id="notDoneItems">
        </div>
        <div class="col-md-3" id="activeItems">
        </div>
        <div class="col-md-3" id="inTestingItems">
        </div>
        <div class="col-md-3" id="closedItems">
        </div>
    </div>


    <div class="overlay">
        <div class="overlay__inner">
            <div class="overlay__content">
                <div class="container-loader">
                    <div class="item item-1"></div>
                    <div class="item item-2"></div>
                    <div class="item item-3"></div>
                    <div class="item item-4"></div>
                </div>
            </div>
        </div>
    </div>

</asp:Content>
