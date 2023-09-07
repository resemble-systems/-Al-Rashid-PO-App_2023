import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Spinner } from "reactstrap";
import axios from "axios";
import {
  Row,
  Col,
  Card,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Table,
} from "reactstrap";
import NumberFormat from "react-number-format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import "./NewRequest.css";
import Select from "react-dropdown-select";
import FileUpload from "../content/FileUpload/FileUpload";
import GetDigest from "../../Services/SharePoint/GetDigest";
import GetDepartments from "../../Services/SharePoint/GetDMList";
import CreatePO from "../../Services/SharePoint/CreateListItem";
import CommitAttachmentToDB from "../../Services/AttachmentUpload/CommitAttachments";
import GetListItemByID from "../../Services/SharePoint/GetListItemByID";
import GetTasks from '../../Services/SharePoint/GetTaskListitem';
import GetCurrentUserid from '../../Services/SharePoint/GetCurrentLoinUserID';
import swal from "sweetalert";
import $ from "jquery";
let DisableSubmit;
class NewRequest extends Component {
  constructor() {
    super();
    this.state = {
      GMReviewalStatus:"",
      DisableGMButtons:true,
      redirectMyRequest: false,
      redirectMyTask: false,
      CurrentUserID:null,
      podetails: {
        POItems: [],
        POAdditionalInfo: [],
      },
      Departments: {},
      SelectedDepartment: "",
      AttachmentsReferenceNumber: null,
      TaskDetails: null,
      CurrentTitle: "",
      CurrentId: 0,
      LoadingWorkFlow: true,
      LoadingPMO: true,
    };
  }

  componentDidMount() {
    if (this.props.match.params.mode === "new") {
      this.setState({
        podetails: this.props.location.state.podetails,
      });
      //console.log("WHse",this.props.location.state.podetails.POItems[0].WHse)
      GetDepartments("Department Managers").then((departments) => {
        this.setState({
          Departments: departments,
        });
      });
    } else if (
      this.props.match.params.mode === "Taskview" || this.props.match.params.mode === "TaskviewAuto"
    ) {
      if(this.props.match.params.mode === "TaskviewAuto") {
        if(this.state.CurrentUserID == null)
        GetCurrentUserid().then(u => 
            this.setState({
            CurrentUserID:u,  
            })
        );
      }
      GetListItemByID("Workflow Tasks", this.props.match.params.TaskId).then(
       
        (TD) => {
          console.log(TD)
          
          var check = TD.Body.split("@split")[0].includes("RW");
          var DMCcheck =TD.Body.split("@split")[0].includes("DMC");
          var PMCcheck =TD.Body.split("@split")[0].includes("PMC");
          
          if(PMCcheck===true || DMCcheck===true ){
            this.setState({
               DisableGMButtons:false
              });
          }
         
          this.setState({
            CurrentId: this.props.match.params.TaskId,
            TaskCode: TD.Body,
            ReviewalTask: check,
            PMCcheck:PMCcheck,
            DMCcheck:DMCcheck,
            TaskStatus:TD.Status,
            LoadingWorkFlow: false
          });

          console.log("chk", check);
        }
      );

      GetListItemByID("PMO", this.props.match.params.id).then((PO) => {
        //console.log("date returned",PO)
        this.setState({
          podetails: JSON.parse(PO.POJSONData),
          SelectedDepartment: PO.ozud,
          AttachmentsReferenceNumber: PO.AttachmentReferenceNumber,
          AL01: PO.ApprovalLogRecord,
          RequestStage: PO.PendingWith,
          RequestSatge01: PO.bdck,
          GMReviewalStatus:PO.ReviewalStatus,
          LoadingPMO: false,
          CurrentTitle: this.props.match.params.id
        });
      });
    }
    else if (
      this.props.match.params.mode === "view" 
    ) {
      GetListItemByID("PMO", this.props.match.params.id).then((PO) => {
        console.log("date returned",PO)
        this.setState({
          podetails: JSON.parse(PO.POJSONData),
          SelectedDepartment: PO.ozud,
          AttachmentsReferenceNumber: PO.AttachmentReferenceNumber,
          AL01: PO.ApprovalLogRecord,
          RequestStage: PO.PendingWith,
          RequestSatge01: PO.bdck,
          GMReviewalStatus:PO.ReviewalStatus
        });
      });
    }  
    else if (
      this.props.match.params.mode === "ArchivedPOview" 
    ) {
      GetListItemByID("ArchivedPO", this.props.match.params.id).then((PO) => {
        console.log("date returned",PO)
        this.setState({
          podetails: JSON.parse(PO.POJSONData),
          SelectedDepartment: PO.ozud,
          AttachmentsReferenceNumber: PO.AttachmentReferenceNumber,
          AL01: PO.ApprovalLogRecord,
          RequestStage: PO.PendingWith,
          RequestSatge01: PO.bdck,
         
        });
      });
    }  
  
  }
    
    

  createPOItemHandler = (e) => {
    e.preventDefault();
    if (this.state.SelectedDepartment === "") {
      swal("Department Input is Empty!!");
    } else {
      DisableSubmit = () => {
        this.refs.Btn.setAttribute("disabled", "disabled");
        //console.log("disabled");
        //alert('Disabled');
      };
      let GrandTotalStr = JSON.stringify(this.state.podetails.GrandTotal);
      let GTDecimel = GrandTotalStr.replace(/"/g, "");
      let GTDecimel00 = Math.trunc(GTDecimel);
      let POData = {
        Title: this.state.podetails.PONumber,
        chff: this.state.podetails.PONumber,
        POJSONData: JSON.stringify(this.state.podetails),
        j3xm: this.state.podetails.MakerName,
        zh3a: this.state.podetails.MakerEmail,
        ozud: this.state.SelectedDepartment,
        POVersion: JSON.stringify(this.state.podetails.POVersion),
        AttachmentReferenceNumber: this.state.AttachmentsReferenceNumber,
        yyrh: JSON.stringify(this.state.podetails.GrandTotal),
        Num: GTDecimel00,
        Currency: JSON.stringify(this.state.podetails.Currency),
        WHse:this.state.podetails.POItems[0].WHse
      };
      GetDigest().then((d) =>
        CreatePO("PMO", POData, d)
          .then(CommitAttachmentToDB(this.state.AttachmentsReferenceNumber))
          .then(
            this.setState({
              redirectMyRequest: true,
            })
          )
      );
    }
  };

  onDepartmentChange(v) {
    //console.log("onchange",v[0].Title);
    this.setState({
      SelectedDepartment: v[0].Title,
    });
  }

  CommitAttachment = (RefID) => {
    this.setState({ AttachmentsReferenceNumber: RefID });
  };
  CloseRequest(){
    this.setState({
      redirectMyTask:true
    })
  }
  RespondRequest(Decession, ID) {
    let TaskId= this.props.match.params.mode === "TaskviewAuto"? this.state.CurrentId : ID;
    var Comments =document.getElementById("Comments01").value
    this.setState({
      LoadingPMO: true,
      LoadingWorkFlow: true,
    })
      console.log(Comments)
    GetDigest().then((response) => {
      console.log("latest2222222222",response);
      var dataToPost = {
          TaskOutcome: Decession,
          Status: "Completed",
          Comments:Comments  
        };
//         var soapMessage =
//             '<?xml version="1.0" encoding="utf-8"?>\
// <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
// <soap:Body>\
// <UpdateListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">\
// <listName>WorkflowTasks</listName>\
// <updates>\
// <Batch OnError="Continue" ListVersion="1">\
// <Method ID=' +TaskId +' Cmd="Update">\
// <Field Name="Id">' +TaskId +'</Field>\
// <Field Name="TaskOutcome">' +Decession +'</Field>\
// <Field Name="Comments">' +Comments +'</Field>\
// </Method>\
// </Batch>\
// </updates>\
// </UpdateListItems>\
// </soap:Body>\
// </soap:Envelope>'
//         $.ajax({
//             url: "/_vti_bin/Lists.asmx?WSDL",
            
//             type: "POST",
//             dataType: "xml",
//             data: soapMessage,
//             complete: function (xmlHttpRequest, status) {
//                 if (status == "success") {
//                     var outputData = xmlHttpRequest.responseText;
//                     console.log("outputData", xmlHttpRequest);
//                 } else {
//                 }
//             },
//             contentType: 'text/xml; charset="utf-8"',
//         })
        
        // .then(() => {
        //      this.setState({
        //          redirectMyTask:true
        //        })   })
    
      
     // URL here is the direct uri to the item which can be obtained by doing a GET request for the item and reading data.__metadata.uri from the response
      $.ajax({
        url: `/sites/apps/PMO/_api/Web/Lists/GetByTitle('Workflow Tasks')/Items(${TaskId})`,
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(dataToPost),
        headers: {
          'Content-Type': 'application/json',
          'Accept':'application/json; odata=verbose',
          "X-RequestDigest":response,
          'credentials':'same-origin',
          "X-HTTP-Method": "MERGE",
          "If-Match": "*",

        },
        success: function (data) {
         
        },
        error: function (data) {
          console.log(data);
          debugger;
        },
      });
    }).then(() => {
      if(this.props.match.params.mode === "TaskviewAuto"){
        this.RedirectToNextTask();
      }
      else{
        this.RedirectMyTaskPage();
      }
     })
  }
  RedirectToNextTask=()=>{
    this.setState({
      LoadingPMO: true,
      LoadingWorkFlow: true,
    })
    if(this.props.match.params.mode === "TaskviewAuto"){
      let index = this.state.TaskDetails.findIndex(task => task.Id == this.state.CurrentId && task.Title == this.state.CurrentTitle);
      if(index < this.state.TaskDetails.length-1){
        let nextValue = this.state.TaskDetails[index + 1].Title;
        let nextId = this.state.TaskDetails[index + 1].Id;
        console.log("here2", nextValue, nextId);
        this.setState({
          CurrentTitle: nextValue,
          CurrentId: nextId,
        });
        GetListItemByID("Workflow Tasks", nextId).then(
       
          (TD) => {
            console.log(TD)
            
            var check = TD.Body.split("@split")[0].includes("RW");
            var DMCcheck =TD.Body.split("@split")[0].includes("DMC");
            var PMCcheck =TD.Body.split("@split")[0].includes("PMC");
            
            if(PMCcheck===true || DMCcheck===true ){
              this.setState({
                 DisableGMButtons:false
                });
            }
           
            this.setState({
              TaskCode: TD.Body,
              ReviewalTask: check,
              PMCcheck:PMCcheck,
              DMCcheck:DMCcheck,
              TaskStatus:TD.Status,
              LoadingWorkFlow: false
            });
  
            console.log("chk", check);
          }
        );
  
        GetListItemByID("PMO", nextValue).then((PO) => {
          //console.log("date returned",PO)
          this.setState({
            podetails: JSON.parse(PO.POJSONData),
            SelectedDepartment: PO.ozud,
            AttachmentsReferenceNumber: PO.AttachmentReferenceNumber,
            AL01: PO.ApprovalLogRecord,
            RequestStage: PO.PendingWith,
            RequestSatge01: PO.bdck,
            GMReviewalStatus:PO.ReviewalStatus,
            LoadingPMO: false
          });
        });
      }
      else{
        this.RedirectMyTaskPage();
      }
    }
  }

  RedirectMyTaskPage=()=>{
      this.setState({
        redirectMyTask:true
      });
  }
  render() {
    if(this.state.TaskDetails == null && this.state.CurrentUserID) {
      GetTasks('Workflow Tasks',this.state.CurrentUserID).then(r => 
          this.setState({
              TaskDetails:[...r.filter(item => item.AssignedToId === this.state.CurrentUserID )],
          })
      )
    }
    if (this.state.redirectMyRequest === true) {
      return <Redirect to="/pages/my-requests" />;
    }
    if (this.state.redirectMyTask === true) {
      return <Redirect to="/pages/my-tasks" />;
    }
    let headerStyle = { margin: 0 };
    let poItemsTDStyle = { textAlign: "right" };
    const thstyle = { background: "#eeeeee", fontWeight: "bold" };
    let DepartmentInput;
    let POItems;
    let AdditionalInfo;
    let pobutton = null;
    let FileUpload1 = null;
    let Terms = null;
    let ApprovalButton = null;
    let ApprovalLog = null;
    let GMReviewalStatus =null;
    let ButtonsWidth = this.props.match.params.mode === "TaskviewAuto"? 12 : 12;

    let HoldButton = this.props.match.params.mode === "TaskviewAuto" && this.state.TaskDetails? (
      <Button id="AppButton"
        onClick={() =>
          this.RedirectToNextTask()
        }
      >
        Hold
      </Button>
    ) : null;

    if ((this.props.match.params.mode === "Taskview" || this.props.match.params.mode === "TaskviewAuto") &&
    this.state.TaskStatus !== "Completed") {

      GMReviewalStatus = (
        <>
          {this.state.RequestStage === "General MGR" &&
          this.state.ReviewalTask === false && this.state.DisableGMButtons === true ? (
            <div>
             
             
             
            </div>

            ) : null}
        </>
      )

      ApprovalLog = (
        <>
        
          <Card>
            {this.state.RequestStage === "General MGR" &&
            this.state.ReviewalTask === false &&
            this.state.DisableGMButtons === true ? (
              <div>
                {this.state.GMReviewalStatus == "N/R" ? (
                  <div>
                    <FontAwesomeIcon icon={faBars} className="mr-2" />
                    <h5 className="form-header" id="RWContents">
                      Assistant Manager Reviewal Status
                    </h5>
                    {/* <Button color="danger" id="RWButton">
                      Pending
                    </Button> */}
                    <button type="button" class="btn btn-danger">
                      Pending
                    </button>
                  </div>
                ) : (
                  <div>
                    <FontAwesomeIcon icon={faBars} className="mr-2" />
                    <h5 className="form-header" id="RWContents">
                      Assistant Manager Reviewal Status
                    </h5>
                    <button class="btn btn-success" id="RWButton">
                      Completed
                    </button>
                  </div>
                )}
              </div>
            ) : null}
            <div>
              <FontAwesomeIcon icon={faBars} className="mr-2" />
              <h5 id="ALog" className="form-header">
                Approval Log
              </h5>
            </div>
            <div
              id="VResponse"
              dangerouslySetInnerHTML={{
                __html: this.state.AL01,
              }}
            />
          </Card>
        </>
      );
      ApprovalButton = (
        <>
        <br></br>
        <FormGroup>
        <Label for="exampleText">Comments</Label>
        <Input type="textarea" name="text" id="Comments01" />
      </FormGroup>
      {this.state.RequestStage === "Asst.Gen.MGR" ? (
            <Row>
              <Col md={ButtonsWidth} id="ApprovalButtons">
              {HoldButton}
              <Button id="AppButton"
                onClick={() =>
                  this.RespondRequest("Approve", this.props.match.params.TaskId)
                }
              >
                Approve
              </Button>
              <Button color="danger" id="AppButton"
                onClick={() =>
                  this.RespondRequest("Reject", this.props.match.params.TaskId)
                }
              >
                Reject
              </Button></Col>
              </Row>
) : null}
          {this.state.RequestStage === "Purchase MGR" ? (
            <Row>
                
              <Col md={ButtonsWidth} id="ApprovalButtons">
              {HoldButton}
                <Button id="AppButton"
                  onClick={() =>
                    this.RespondRequest(
                      "Approve",
                      this.props.match.params.TaskId
                    )
                  }
                >
                  Approve
                </Button>
                <Button id="AppButton"
                  onClick={() =>
                    this.RespondRequest(
                      "Quick Approve",
                      this.props.match.params.TaskId
                    )
                  }
                >
                  Quick Approve
                </Button>
                <Button color="danger" id="AppButton" onClick={() =>
                    this.RespondRequest(
                      "Reject",
                      this.props.match.params.TaskId
                    )
                  }>Reject</Button>
                <Button id="AppButton" onClick={() =>
                  this.CloseRequest()
                }>Cancel</Button>
              </Col>
            </Row>
          ) : null}
          {this.state.RequestStage === "General MGR" &&
          this.state.ReviewalTask === false && this.state.DisableGMButtons === true ? (
            <Row>
                <Col md={ButtonsWidth} id="ApprovalButtons">
                {HoldButton}
              <Button id="AppButton"
                onClick={() =>
                  this.RespondRequest("Approve", this.props.match.params.TaskId)
                }
              >
                Approve
              </Button>
              <Button id="AppButton0"
                onClick={() =>
                  this.RespondRequest(
                    "Send Back to Department Manager",
                    this.props.match.params.TaskId
                  )
                }
              >
                Send Back to Department Manager
              </Button>
              <Button id="AppButton0"
                onClick={() =>
                  this.RespondRequest(
                    "Send Back to Purchase Manager",
                    this.props.match.params.TaskId
                  )
                }
              >
                Send Back to Purchase Manager
              </Button>
              <Button  id="AppButton"
                onClick={() =>
                  this.CloseRequest()
                }
              >
                Close
              </Button>
              <Button color="danger" id="AppButton"
                onClick={() =>
                  this.RespondRequest("Reject", this.props.match.params.TaskId)
                }
              >
                Reject
              </Button>
              </Col>
            </Row>
          ) : null}

          {this.state.RequestStage === "Depart. MGR" ? (
            <Row>
                <Col md={ButtonsWidth} id="ApprovalButtons">
                {HoldButton}
              <Button id="AppButton"
                onClick={() =>
                  this.RespondRequest("Approve", this.props.match.params.TaskId)
                }
              >
                Approve
              </Button>
              <Button color="danger" id="AppButton"
                onClick={() =>
                  this.RespondRequest("Reject", this.props.match.params.TaskId)
                }
              >
                Reject
              </Button>
              <Button  id="AppButton"
                onClick={() =>
                  this.CloseRequest()
                }
              >
                Close
              </Button>
              
              </Col>
            </Row>
          ) : null}

          {this.state.ReviewalTask === true ? (
            <Row>
                   <Col md={ButtonsWidth} id="ApprovalButtons">
                   {HoldButton}
              <Button id="AppButton"
                onClick={() =>
                  this.RespondRequest("Review", this.props.match.params.TaskId)
                }
              >
                Review
              </Button>
              <Button  id="AppButton"
                onClick={() =>
                  this.CloseRequest()
                }
              >
                Close
              </Button>
              </Col>
            </Row>
          ) : null}

{this.state.RequestSatge01 === "GMClarification" &&(this.state.DMCcheck === true || this.state.PMCcheck === true)?  (
  <Row>
  <Col md={ButtonsWidth} id="ApprovalButtons">
  {HoldButton}
  <Button id="AppButton"
                onClick={() =>
                  this.RespondRequest("Submit", this.props.match.params.TaskId)
                }
              >
                Submit
              </Button>
              <Button  id="AppButton"
                onClick={() =>
                  this.CloseRequest()
                }
              >
                Close
              </Button>
      </Col>
      </Row>
) : null}    
        </>
      );
    }
    if (
      this.props.match.params.mode === "view" ||
      this.props.match.params.mode === "Taskview" ||
      this.props.match.params.mode === "TaskviewAuto" || 
      this.props.match.params.mode === "ArchivedPOview" 
    ) {
      Terms = (
        <>
          <Row>
            <Col md={12}>
              <Table bordered>
                <tbody>
                  <tr>
                    <th style={thstyle}>Terms and conditions</th>
                  </tr>
                  <tr>
                    <td>{this.state.podetails.TermsAndConditions}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </>
      );
    }
    if (this.props.match.params.mode === "new") {
      pobutton = (
        <>
          <FormGroup row>
            <Col md={12} className="text-right">
              <Button className="mr-2 btn-cancel" color="primary">
                Cancel
              </Button>
              <Button
                ref="Btn"
                color="danger"
                onClick={this.createPOItemHandler}
              >
                Submit
              </Button>
            </Col>
          </FormGroup>
        </>
      );

      DepartmentInput = (
        <Select
          className="po-input"
          clearable
          options={this.state.Departments}
          labelField="Title"
          valueField="Title"
          onChange={(value) => this.onDepartmentChange(value)}
        />
      );
    } else if (
      this.props.match.params.mode === "view" ||
      this.props.match.params.mode === "Taskview" ||
      this.props.match.params.mode === "TaskviewAuto" ||
      this.props.match.params.mode === "ArchivedPOview" 
    ) {
      DepartmentInput = (
        <Input
          className="po-input"
          value={this.state.SelectedDepartment || ""}
          type="text"
          name=""
          id="initiatorDepartment"
          disabled
        />
      );
    }

    if (this.state.podetails.POItems) {
      POItems = this.state.podetails.POItems.map((item) => (
        <tr key={item.SLNO}>
          <th scope="row">{item.SLNO}</th>
          <td>{item.Proj}</td>
          <td>{item.Dept}</td>
          <td>{item.Prod}</td>
          <td>{item.WHse}</td>
          <td>{item.ItemCode}</td>
          <td>{item.Description}</td>
          <td>{item.DelDate}</td>
          <td style={poItemsTDStyle}>{item.code}</td>
          <td style={poItemsTDStyle}>{item.quantity}</td>
          <td style={poItemsTDStyle}>
            <NumberFormat
              value={item.UnitPrice || 0}
              displayType={"text"}
              thousandSeparator={true}
            />
          </td>
          <td style={poItemsTDStyle}>
            <NumberFormat
              value={item.TotalPrice || 0}
              displayType={"text"}
              thousandSeparator={true}
            />
          </td>
        </tr>
      ));
    }
    console.log("Addtional Info", this.state.podetails.POAdditionalInfo.length);
    if (this.state.podetails.POAdditionalInfo) {
      AdditionalInfo = this.state.podetails.POAdditionalInfo.map(
        (item, index) => (
          <tr key={index}>
            <td>{item.SNo}</td>
            <td>{item.Type}</td>
          </tr>
        )
      );
    }

    if (this.state.podetails.POAdditionalInfo.length === 0) {
      AdditionalInfo = (
        <tr>
          <td colSpan="2">No Addtional Info</td>
        </tr>
      );
    }

    if (
      this.props.match.params.mode === "new" ||
      this.state.AttachmentsReferenceNumber !== null
    ) {
      FileUpload1 = (
        <FileUpload
          mode={this.props.match.params.mode}
          handleFileCommit={this.CommitAttachment}
          AttachmentRefID={this.state.AttachmentsReferenceNumber}
        ></FileUpload>
      );
    }
    return (
      <div className="form-container">
        <Card>
          <Form>
            <FormGroup row className="form-header-container">
              <FontAwesomeIcon icon={faBars} className="mr-2" />
              <h5 className="form-header">Purchase Order Details</h5>
            </FormGroup>
            <FormGroup row>
              <Col md={4}>
                <Label for="initiatorName">Maker Name</Label>
                <Input
                  className="po-input"
                  value={this.state.podetails.MakerName || ""}
                  type="text"
                  name="maker-name"
                  id="initiatorDepartment"
                  disabled
                />
              </Col>
              <Col md={4}>
                <Label for="initiatorName">Maker Email</Label>
                <Input
                  className="po-input"
                  value={this.state.podetails.MakerEmail || ""}
                  type="text"
                  name="email"
                  id="initiatorEmail"
                  disabled
                />
              </Col>
              <Col md={4}>
                <Label for="initiatorDepartment">Department</Label>
                {DepartmentInput}
              </Col>
            </FormGroup>

            <FormGroup row>
              <Col md={4}>
                <Label for="createdDate">Created Date</Label>
                <Input
                  className="po-input"
                  defaultValue={this.state.podetails.CreatedDate || ""}
                  type="text"
                  name="date"
                  id="createdDate"
                  disabled
                />
              </Col>

              <Col md={4}>
                <Label for="poNumber">PO Number</Label>
                <Input
                  className="po-input"
                  value={this.state.podetails.PONumber || ""}
                  type="text"
                  name="poNumber"
                  id="poNumber"
                  disabled
                />
              </Col>
              <Col md={4} className="d-flex align-items-center"></Col>
            </FormGroup>
            <FormGroup
              row
              className="form-header-container"
              style={headerStyle}
            >
              <FontAwesomeIcon icon={faBars} className="mr-2" />
              <h5 className="form-header">Item Details</h5>
            </FormGroup>
            <div className="table-responsive-md">
              <Table bordered>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      rowSpan="2"
                      className="th-main align-middle text-center"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      colSpan="4"
                      className="th-main align-middle text-center"
                    >
                      Dimension
                    </th>
                    <th
                      scope="col"
                      rowSpan="2"
                      className="th-main align-middle text-center"
                    >
                      Item Code
                    </th>
                    <th
                      scope="col"
                      rowSpan="2"
                      className="th-main align-middle text-center"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      rowSpan="2"
                      className="th-main align-middle text-center"
                    >
                      Del. Date
                    </th>
                    <th
                      scope="col"
                      rowSpan="2"
                      className="th-main align-middle text-center"
                    >
                      Unit Code
                    </th>
                    <th
                      scope="col"
                      rowSpan="2"
                      className="th-main align-middle text-center"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      rowSpan="2"
                      className="th-main align-middle text-center"
                    >
                      Unit Price
                    </th>
                    <th
                      scope="col"
                      rowSpan="2"
                      className="th-main align-middle text-center"
                    >
                      Total price
                    </th>
                  </tr>
                  <tr>
                    <th scope="col" className="th-sub align-middle text-center">
                      Proj.
                    </th>
                    <th scope="col" className="th-sub align-middle text-center">
                      Dept
                    </th>
                    <th scope="col" className="th-sub align-middle text-center">
                      Prod
                    </th>
                    <th scope="col" className="th-sub align-middle text-center">
                      W.Hse
                    </th>
                  </tr>
                </thead>
                <tbody>{POItems}</tbody>
                <tfoot>
                  <tr>
                    <th colSpan="2">
                      Grand Total ({this.state.podetails.Currency})
                    </th>
                    <th colSpan="9" style={poItemsTDStyle}>
                      {this.state.podetails.GrandTotalWord}
                    </th>
                    <th colSpan="1" style={poItemsTDStyle}>
                      <NumberFormat
                        value={this.state.podetails.GrandTotal || 0}
                        displayType={"text"}
                        thousandSeparator={true}
                        // prefix={`${this.state.podetails.Currency}`}
                      />
                    </th>
                  </tr>
                </tfoot>
              </Table>
            </div>

            <Row>
              <Col md={4}>
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th colSpan="2" style={thstyle}>
                        Supplier Info
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Supplier Name</td>
                      <td>{this.state.podetails.SupplierName}</td>
                    </tr>
                    <tr>
                      <td>Supplier No</td>
                      <td>{this.state.podetails.SupplierNumber}</td>
                    </tr>
                    <tr>
                      <td>Supplier Location</td>
                      <td>{this.state.podetails.SupplierLocation}</td>
                    </tr>
                    <tr>
                      <td>Supplier Email</td>
                      <td>{this.state.podetails.SupplierEmail}</td>
                    </tr>
                    <tr>
                      <td>Supplier Tel</td>
                      <td>{this.state.podetails.SupplierTel}</td>
                    </tr>
                    <tr>
                      <td>Supplier Address</td>
                      <td>{this.state.podetails.SupplierAddress}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={4}>
                <Table bordered>
                  <tbody>
                    <tr>
                      <td colSpan="2" style={thstyle}>
                        Addtional Info
                      </td>
                    </tr>
                    {AdditionalInfo}
                  </tbody>
                </Table>
              </Col>
              <Col md={4}>
                <Table bordered>
                  <tbody>
                    <tr>
                      <td style={thstyle}>Remarks 1</td>
                    </tr>
                    <tr>
                      <td>{this.state.podetails.Remark1}</td>
                    </tr>
                    <tr>
                      <td style={thstyle}>Remarks 2</td>
                    </tr>
                    <tr>
                      <td>{this.state.podetails.Remark2}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
            {Terms}
            {FileUpload1}
            {pobutton}
          </Form>
        </Card>
        {GMReviewalStatus}
        {ApprovalLog}
        {this.state.LoadingWorkFlow && this.state.LoadingPMO && this.props.match.params.mode === "TaskviewAuto"?
          <div className="text-center">
            <Spinner className="mr-3 my-5" animation="border" variant="secondary" />
            <span>Loading Next Task ...</span>
          </div>
          :
          ApprovalButton
        }
      </div>
    );
  }
}

export default NewRequest;
