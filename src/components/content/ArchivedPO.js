import React, { Component } from 'react'
import { Row,Col,Card, FormGroup,Input,Label } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import GetPOItems from '../../Services/SharePoint/Temporary'
import './NewRequest.css'
import ArchivedPOTable from './ArchivedPOTable'
import { Button } from 'reactstrap';
import SearchPO from '../../Services/SharePoint/GetSearchPO'
import PaginatedPO from '../../Services/SharePoint/GetPaginatedPO'
import FinalPagePO from '../../Services/SharePoint/GetFinalPagePO'

export default class ArchivedPO extends Component {
    constructor(props, contex) {
        super(props, contex);
        this.state = {
            loaded:false,
            PODetails: null,
            PONumber:"",
            RequestStatusFilter:"All",
            DepartmentFilter:"All",
            ApprovalStatusFilter:"All",
            POMakerFilter:"All",
        };
    }

    componentDidMount() {
        this.GetPODetails();
        //setInterval(this.GetPODetails, 1000);
       }
   
       GetPODetails = ()=>{
           
           GetPOItems('ArchivedPO').then(r => 
               this.setState({
                   PODetails:r,
                   loaded:true,
                   LatestPOID:r[0].Id
               })    
           );
           
       }
       
       async filterItems(requestData) {
   
           let result = [];
           for(let item of this.state.PODetails) {
             if(item.chff.indexOf(requestData.PONumber) > -1) {
               result.push(item);
             }
           }
           return Promise.resolve(result);
         }
   
       handleSearchInput=(event)=>{
           this.setState({PONumber: event.target.value});
       }
   
       searchData =() => {
           SearchPO('ArchivedPO',this.state.PONumber).then(r => 
               this.setState({
                   PODetails:r,
                })    
           )
           console.log(this.state.PONumber)
           
       }
   
       resetSearch = ()=>{
           this.GetPODetails();
       }
   
       filterRequestStatus = (event)=>{
           this.setState({
               RequestStatusFilter:event.target.value
           })  
       }
       filterApprovalStatus = (event)=>{
           this.setState({
               ApprovalStatusFilter:event.target.value
           })  
       }
       GetNextPagePO(StartingFrom){
           PaginatedPO('ArchivedPO',StartingFrom).then(r => 
               this.setState({
                   PODetails:r,
               })    
           );
           
        
       }
       GetFinalPagePO(StartingFrom){
        FinalPagePO('ArchivedPO',StartingFrom).then(r => 
            this.setState({
                PODetails:r,
            })    
        );
    }
       filterDepartment = (event)=>{
           this.setState({
               DepartmentFilter:event.target.value
           })  
       }
       filterPOMaker = (event)=>{
           this.setState({
               POMakerFilter:event.target.value
           })  
       }
   
       SearchPO(SearchPONumber){
           console.log(SearchPONumber)
       }
       render() {
           console.log(this.state.LatestPOID)
           const FirstPageItems = this.state.LatestPOID - 250;
           const SecPageItems = FirstPageItems - 250;
           const ThirdPageItems = SecPageItems - 250;
           const FourthPageItem = ThirdPageItems - 250;
           const FifthPageItem =  FourthPageItem - 250;
           const SixthPageItem =  FifthPageItem - 250;
           const SeventhPageItem = SixthPageItem - 250;
           const EightPageItem = SeventhPageItem - 250;
           const NinthPageIte = EightPageItem - 250;
           const TenthPageItem = NinthPageIte - 250;
           const EleventhPageItem = TenthPageItem - 250;
           const TwelthPageItem = EleventhPageItem -250
           //console.log(First250)
           //console.log("PO Details in grid", this.state);
           //console.log("PO Search Input", this.state.PONumber);
           const tableContainer = {width:"100%"};
           const headerStyle = {display:"flex"};
           const parentcontainer = {minWidth:"100%",maxWidth:"100%"};
           let RequestDetails = this.state.PODetails;
           if(this.state.RequestStatusFilter !== "All"){
            RequestDetails = RequestDetails.filter(item => item.RequestStatus === this.state.RequestStatusFilter)
           }
          if(this.state.ApprovalStatusFilter !== "All"){
           RequestDetails = RequestDetails.filter(item => item.ApprovalStatus === this.state.ApprovalStatusFilter)
          }
           if(this.state.DepartmentFilter !== "All"){
               RequestDetails = RequestDetails.filter(item => item.ozud === this.state.DepartmentFilter)
           }
           if(this.state.POMakerFilter !== "All"){
               RequestDetails = RequestDetails.filter(item => item.j3xm === this.state.POMakerFilter)
           }
           let departmentSelect;
           if (this.state.PODetails){
               const distinctDepartments = [...new Set(this.state.PODetails.map(x => x.ozud))]
               //console.log("Dept", distinctDepartments)
               departmentSelect = <Input type="select" name="select" id="exampleSelect" 
               onChange={this.filterDepartment}>
                       <option defaultValue>All</option>
                       {distinctDepartments.map((item,index) =>
                       <option key={index}>{item}</option>                      
                   )};
               </Input>
           }
           let POMakerSelect;
           if (this.state.PODetails){
               const distinctPOMaker = [...new Set(this.state.PODetails.map(x => x.j3xm))]
               //console.log("Dept", distinctDepartments)
               POMakerSelect = <Input type="select" name="select" id="exampleSelect" 
               onChange={this.filterPOMaker}>
                       <option defaultValue>All</option>
                       {distinctPOMaker.map((item,index) =>
                       <option key={index}>{item}</option>                      
                   )};
               </Input>
           }
           return (
           <div style={parentcontainer}>    
                   <Card style={tableContainer} className="mb-3">
                   <Row>
                           <Col style={headerStyle} className="form-header-container" md={12}>
                               <FontAwesomeIcon icon={faSearch} className="mr-2"/>
                               <h5 className="form-header">Filter Purchase Order Requests</h5>
                           </Col>
                   </Row>
                   <form className="form-horizontal">
                           <FormGroup row>
                           <div className="col-md-3">
                               <Label for="exampleSelect" className="mt-2">POMaker</Label>                          
                                   {POMakerSelect}
                               </div>
                               <div className="col-md-9" id="legend">
                               <p  className="mt-2"><span id="ShortF" >PM:</span> Purchase Manager<span id="ShortF">DM:</span> Department Manager<span id="ShortF">GM:</span> General Manager</p>    
                                                     
                                   
                               </div>
                           </FormGroup> 
                           </form>
                   <form className="form-horizontal">
                               <FormGroup row>
                               <div className="col-md-3"> 
                               <Label for="exampleSelect" className="mt-2">Request Status</Label>                         
                                       <Input type="select" name="select" id="exampleSelect" 
                                       onChange={this.filterRequestStatus}>
                                               <option defaultValue>All</option>
                                               <option>Not Started</option>
                                               <option>In Progress</option>
                                               <option>Completed</option>
                                       </Input>
                               </div> 
                               <div className="col-md-3"> 
                               <Label for="exampleSelect" className="mt-2">Approval Status</Label>                         
                                       <Input type="select" name="select" id="exampleSelect" 
                                       onChange={this.filterApprovalStatus}>
                                               <option defaultValue>All</option>
                                               <option>PM-Approved</option>
                                               <option>DM-Approved</option>
                                               <option>AGM Approved</option>
                                               <option>GM-Approved</option>
                                               <option>PM-Rejected</option>
                                               <option>DM-Rejected</option>
                                               <option>GM-Rejected</option>
                                               <option>AGM Rejected</option>
                                               
                                       </Input>
                               </div>
                               <div className="col-md-3">
                               <Label for="exampleSelect" className="mt-2">Department</Label>                          
                                   {departmentSelect}
                               </div>
                                   <div className="col-md-3">
                                       <Label for="exampleSelect" className="mt-2">Search PO</Label>
                                       <div className="input-group-append">
                                       <Input type="text" placeholder="Enter PO Number" value={this.state.PONumber} onChange={this.handleSearchInput} />
                                       <button className="btn btn-sm btn-success mr-2 ml-2 btn-cancel" onClick={this.searchData} type="button">Search</button>
                                       <button className="btn btn-sm btn-danger" onClick={this.resetSearch} type="button">Reset</button>
                                       </div>                                   
                                   </div>                    
                               </FormGroup>
                           </form>    
                               
                   </Card>
                
                <ArchivedPOTable PODetails={RequestDetails}></ArchivedPOTable>
                
                <br></br>
                {/* <Col md={12}>
                        <div id="pagination">
                        <Button size="sm" color="primary">1</Button>{' '}
                        <Button size="sm" color="primary"  onClick={() =>this.GetNextPagePO(SecPageItems)}>2</Button>{' '}
                        <Button size="sm" color="primary" onClick={() =>this.GetNextPagePO(ThirdPageItems)} >3</Button>{' '}
                        <Button size="sm" color="primary" onClick={() =>this.GetNextPagePO(FourthPageItem)} >4</Button>{' '}
                        <Button  size="sm"color="primary" onClick={() =>this.GetNextPagePO(FifthPageItem)}>5</Button>{' '}
                        <Button  size="sm"color="primary" onClick={() =>this.GetNextPagePO(SixthPageItem)} >6</Button>{' '}
                        <Button  size="sm" color="primary" onClick={() =>this.GetNextPagePO(SeventhPageItem)}>7</Button>{' '}
                        <Button  size="sm" color="primary" onClick={() =>this.GetNextPagePO(EightPageItem)}>8</Button>{' '}
                        <Button  size="sm" color="primary" onClick={() =>this.GetNextPagePO(NinthPageIte)}>9</Button>{' '}
                        <Button  size="sm" color="primary" onClick={() =>this.GetNextPagePO(TenthPageItem)}>10</Button>{' '}
                        <Button  size="sm" color="primary" onClick={() =>this.GetNextPagePO(EleventhPageItem)}>11</Button>{' '}
                        <Button  size="sm" color="primary" onClick={() =>this.GetNextPagePO(TwelthPageItem)}>12</Button>{' '}
                        <Button  size="sm" color="primary" onClick={() =>this.GetFinalPagePO(TwelthPageItem)}>13</Button>{' '}
                        
                        </div> 
                        </Col> */}
                        <br></br>
            </div>
        )
    }
}
