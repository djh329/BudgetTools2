import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import { Field, FieldArray, reduxForm, formValueSelector, change} from 'redux-form';
import { Link } from 'react-router-dom'

const {dialog} = require('electron').remote;
const path = require('path');

import Collapsible from 'react-collapsible';

import {Modal, Button, Input} from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next';

import ListGenerator from './ListGenerator.js'

import {
  TOTAL,
  CALCULATOR,
  GENERAL
} from '../constants'

import {
  monetary,
} from '../utils/normalization'

import {snakeToTitle} from '../utils'

import {
  openCollapse,
  closeCollapse,
  addCollapse,
  removeCollapse,
  init,
  updateInvalids
} from '../actions'


const isEmpty = function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

const extractValue = function(values, field_name) {
  if(field_name.includes('[')) {
    var objName = field_name.split('[')[0]
    var index =  field_name.split('[')[1].split(']')[0]
    var fieldName = field_name.split('.')[1]
    if (values[objName]) {
      return extractValue(values[objName][index], fieldName)
    }
    return ''
  }
  else if(field_name.includes('.')) {
    var splits = field_name.split('.')
    var objName = splits[0]
    var fieldName = splits[1]
    if (values[objName]) {
      return extractValue(values[objName], fieldName)
    }
  }
  else {
    return values[field_name]
  }
}

//goods[0].hobbies[2].max_funding
const constructName = function(inputField, givenName) {
  if(inputField.includes('[')) {
    var inputLevels = inputField.split('.')
    var name = ''
    inputLevels.forEach((level, index) => {
      if (index<inputLevels.length-1) {
        name+=level + '.'
      }
    })
    return name+givenName
  }
  return givenName
}

class FormGenerator extends Component {

  constructor(props) {
    super(props)
    this.state = {show: false, calculated: {}}
  }

  componentWillReceiveProps(nextProps) {
  if (nextProps.calculated !== this.state.calculated || (nextProps.calculated.totals && nextProps.calculated.totals!==this.state.calculated.totals)) {
    this.setState({ calculated: nextProps.calculated });
  }
}

  renderField(field) {
    const {meta : {touched, error, dispatch}, values, accept, inline, index, jsonFile, thisVar} = field;
    const className = `form-group budgetField ${touched && error ? "has-danger" : ""}`;
    var mainClass;
    var labelClass;
    var inputClass;
    var extraRef = {};
    var extraStyle = {}
    var onChange = field.input.onChange
    var inpLabDivClass = ''
    var other = field.input
    var extraField = <div/>
    var message = <div/>
    switch(field.type) {
      case 'file':
          mainClass = 'form-group row'
          labelClass = 'col-form-label col-sm-4'
          inputClass = 'col-sm-6'
          inpLabDivClass = 'artificialFile'
          other={checked: field.input.value, accept: field.accept}
          extraField=<Field name={field.input.name} component='input' type="hidden"/>
          break;
      case 'checkbox':
          mainClass = 'form-check'
          labelClass = 'form-check-label'
          inputClass = 'form-check-input'
          extraStyle = {paddingLeft: 0}
          break;
      case 'calculated':
          mainClass = 'form-group'
          labelClass = ''
          inputClass = 'form-control'
          // inputClass='form-control'
          var value = extractValue(thisVar.state.calculated, field.input.name)
          // If its a number, cap the value at two decimal places
          if (!isNaN(parseFloat(value))) {
            value = Math.round(value*100)/100
          }
          if (field.monetary && !field.display) {
            value = monetary(value)
          }
          else {
            value = (field.display && typeof field.display == 'function') ? field.display(value) : value
          }
          // Make sure components are automatically set to controlled
          value = value!=undefined ? value : ''
          // var value = values && values.values && extractValue(values.values, field.input.name) ? extractValue(values.values, field.input.name) : 0
          other = {...other, disabled: true, value: value }
          break;
      case 'text':
          mainClass = 'form-group'
          labelClass = ''
          inputClass = 'form-control'
          break;
      default:
          mainClass = 'form-group'
          labelClass = ''
          inputClass = 'form-control'
          break;
    }

    if (field.message) {
      switch(typeof field.message) {
        case 'object':
          message = <ListGenerator list={field.message} depth={2}/>
          break;
        case 'string':
          message = <div>{field.message}</div>
          break;
        default:
          console.log(typeof field.message, field.message)
      }
    }

    var input = <input
    id = {`input_${jsonFile.name}_${field.input.name}`}
    className= {inputClass}
    type={field.type}
    hidden={field.type=='file' && values && values.values && extractValue(values.values, field.input.name)}
    ref={(e) =>{thisVar[`${jsonFile.name}_${field.input.name}_ref`] = e}}
    {...other}
    onChange={onChange}

    />

    if (field.type == 'textarea') {
      input = <textarea className="form-control" rows="5" id="comment" {...other}/>
    }

    if (field.type == 'select' && field.options) {
      var options = field.options.map((option) => <option key={option}> {option} </option>)
      input = <select className='form-control' defaultValue = "Select A Tier" {...other}> <option></option> {options} </select>
    }

    if (field.type=='file' && values && values.values) {
      var current = extractValue(values.values, field.input.name)
      var label_text = 'Please Upload A File'
      if (current) {
        label_text = path.basename(current[0])
      }
      input = <div>
        <Button onClick={() => {
          var paths = dialog.showOpenDialog(undefined, {filters: [{"name": "pdfs", "extensions": ['.pdf', 'pdf']}]})
          dispatch(change(jsonFile.name, field.input.name, paths))
        }}>Upload File</Button>
        <div className='col-sm-4' style={{padding: 0, float: 'right'}}>
        <label style={{marginLeft: 0, paddingLeft: 0, wordWrap: 'normal', wordBreak: 'break-all'}}> {label_text} </label>
        </div>
        </div>
    }


    var paddingLeft = field.type=='checkbox' ? 20 : 0
    var label = <label className={labelClass} style={{minWidth: '50%', paddingLeft: paddingLeft, fontWeight: 'normal'}}>{field.label}</label>

    var inpLab = field.type=='checkbox' ? <div className={inpLabDivClass}>{input}{label}</div> : <div className={inpLabDivClass}>{label}{input}</div>

    return(
      <div style={{paddingTop: '10px', marginBottom: '15px', ...field.style}}>
        <div className={mainClass} style={{margin: 0, ...extraStyle}}>
          {inpLab}
          {extraField}
        </div>
        <div style={{paddingLeft: '20px'}}>{message}</div>
        <div style={{color: 'red'}}>
        {touched ? error : ""}
        </div>
      </div>
      );
  }


  renderGoods(goods) {
    var {fields, jsonFile, thisVar, add, remove, values, open, close, dispatch,
      options, init, opened, renderField,
      questions, meta: {error, submitFailed}} = goods
    if(!init[jsonFile.name] && fields.length==0 && opened!=undefined) {
      fields.push({})
      add(jsonFile.name, goods.fields.name, fields.length, init)
    }
    else if(!init) {
      add(jsonFile.name, goods.fields.name, fields.length, init)
    }


    var onOpen = function(index) {
      return (function() {
        open(jsonFile.name, goods.fields.name, index)
      })
    }

    var onClose = function(index) {
      return (function() {
        close(jsonFile.name, goods.fields.name, index)
      })
    }

    var onAdd = function(e) {
        e.preventDefault()
        fields.push({})
        add(jsonFile.name, goods.fields.name)
    }

    var onRemove = function(index) {
      return (function(e) {
        e.preventDefault()
        fields.remove(index)
        remove(jsonFile.name, goods.fields.name, index)
      })
    }

    var onTriggerClick = function(index) {
      if(opened[`${jsonFile.name}_${goods.fields.name}`]) {
        if(opened[`${jsonFile.name}_${goods.fields.name}`][index]) {
          onClose(index)()
        }
        else {
          onOpen(index)()
        }
      }
    }

    return(
      <div>
      <div style={{paddingBottom: '3%'}}>
        {
        fields.map((good,index) => {
          var triggerText = values && values.values && values.values[fields.name] && values.values[fields.name][index] && values.values[fields.name][index].name ? values.values[fields.name][index].name : `${questions.defaultTriggerText} ${index + 1}`
        return(
          <div key={index} className='collapser' style={{paddingBottom: '15px', position: 'relative'}}>
          <Collapsible trigger={triggerText} accordionPosition={index} handleTriggerClick={onTriggerClick}  open={opened[`${jsonFile.name}_${goods.fields.name}`] ? opened[`${jsonFile.name}_${goods.fields.name}`][index] : true} >
          <button className='btn btn-danger' onClick={onRemove(index)} style={{position: 'block', float: 'right', margin: '5px', marginTop: '5px'}}>{questions.removeButton}</button>
          {questions.values.map((question
            , index2) => {

            var {label,
              name,
              normalize,
              type='text',
              defaultValue='',
              calculate,
              monetary,
              display,
              message,
              options,
              accept
            } = question

        return(
          <Field
            key={`${good}.${name}_${index2}`}
            label={label}
            name={`${good}.${name}`}
            type={type}
            thisVar={thisVar}
            jsonFile={jsonFile}
            dispatch={dispatch}
            monetary={monetary}
            options={options}
            display={display}
            calculate={calculate}
            normalize={normalize}
            accept={accept}
            message={message}
            values={values}
            index={index}
            component={renderField}
          />
        )})}
        </Collapsible>
        </div>
      )})
      }
      <div style={{overflow: 'hidden'}}><button className='btn btn-success' type="button" style={{float: 'right'}} onClick={onAdd}>{questions.addButton ? questions.addButton : 'Add'}</button></div>
          </div>
      </div>
    )
  }

  componentDidMount() {
    this.props.init(this.props.json.name)
  }

  showModal() {
   this.setState({show: true})
  }

  closeModal(){
   this.setState({show: false})
  }

  checkRepeatErrors = function(e) {
    var invalidFields = []
    const jsonFile = this.props.json
    if(this.props.budget && this.props.budget[jsonFile.name]) {
      const errors = this.props.budget[jsonFile.name].syncErrors
      if(errors) {
        function parseErrorObject(errors, prefix) {
          for (var key in errors) {
            if (typeof errors[key]=='string' && errors[key]!='') {
              invalidFields.push('Error in ' + snakeToTitle(prefix) + ': ' + snakeToTitle(key) + ' - ' + snakeToTitle(errors[key]) + '\n\n')
            }
            else if (typeof errors[key]=='object') {
              if (!isNaN(key)) {
                parseErrorObject(errors[key], prefix + " #" + (parseInt(key)+1))
                this.props.openCollapse(jsonFile.name, prefix, parseInt(key))
              }
              else {
                parseErrorObject(errors[key], prefix + key)
              }
            }
          }
        }
        parseErrorObject=parseErrorObject.bind(this)
        parseErrorObject(errors, "")
      }
    }
    if(invalidFields.length!=0) {
      this.showModal()
    }
    this.props.updateInvalids(jsonFile.name, invalidFields)
    // window.alert(invalidFields)
  }

  onSubmit() {
    this.checkRepeatErrors()
  }


  render() {
      const jsonFile = this.props.json
      const repeated = jsonFile.repeat ?
      <div className='repeatFields'>
      {jsonFile.repeat.map((questions, index) => {
         return (
          <FieldArray
          name={questions.name}
          jsonFile={jsonFile}
          dispatch={this.props.dispatch}
          key={index}
          values={this.props.budget[jsonFile.name]}
          opened={this.props.opened}
          init={this.props.opened.init}
          renderField={this.renderField}
          questions={questions}
          open={this.props.openCollapse}
          close={this.props.closeCollapse}
          add={this.props.addCollapse}
          remove={this.props.removeCollapse}
          thisVar={this}
          component={this.renderGoods}/>
        )
        })}
        </div>
      : <div/>

      const fields = jsonFile.single && jsonFile.single.length!=0 ?
      <div className='singleFields' style={{marginBottom: '40px'}}>
      {jsonFile.single.map(({label, name, type='text', accept, options}, index2) => {
        return(
          <Field
            key={name}
      			label={label}
      			name={name}
            type={type}
            options={options}
            jsonFile={jsonFile}
            monetary={monetary}
            dispatch={this.props.dispatch}
            values={this.props.budget[jsonFile.name]}
            thisVar={this}
            accept={accept}
      			component={this.renderField}
      		/>
        )})} </div> : <div/>

        var total;
        var max_funding;
        if (this.state.calculated.total==undefined) {
          total = <div/>
        }
        else {
          var total_label = `Total Requested for ${snakeToTitle(jsonFile.name)}: `
          var total_requested = this.state.calculated.total;
          total = <div className='total'>
          {<Field name='total' style={{paddingBottom: 0, marginTop: 10, marginBottom: 5}} monetary={true} value={total_requested} label={total_label} thisVar={this} jsonFile={jsonFile} component={this.renderField} type='calculated'/>}
          </div>

          var max_label = `Max Approved for ${snakeToTitle(jsonFile.name)}: `
          var max_approved = this.state.calculated.total;
          var max_funding = <div className='max_approved'>
          {<Field name='max_funding' style={{paddingTop: 0, marginTop: 0}} monetary={true} value={max_approved} label={max_label} thisVar={this} jsonFile={jsonFile} component={this.renderField} type='calculated'/>}
          </div>
        }

        var links = <div/>
        if(jsonFile.links) {
          links =
          <div style={{marginTop: '10px', border: 'solid 1px', marginBottom: '5px'}}>
          <h4 style={{textAlign: 'center', textDecoration: 'underline', verticalAlign: 'center'}}> Useful Links </h4>
          {jsonFile.links.map(({label, link}) => {
            // Convert link to href
            link = '/' + link
            return (
              <div key={label}><Link className='btn btn-secondary btn-link btn-block' style={{fontSize: '15px'}} to={link}>{label}</Link></div>
            )
          })}
          </div>
        }

        var modal =
        <div>
        <Modal show={this.state.show} onHide={this.closeModal.bind(this)} aria-labelledby='ModalHeader'>
            <Modal.Header closeButton>
                <Modal.Title id='ModalHeader'>Form Errors</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {this.props.opened[`${jsonFile.name}_invalids`] ? this.props.opened[`${jsonFile.name}_invalids`].map((error, index) => {
                  return (<p key={index}>{error}</p>)
                }) : 'No Error'}
            </Modal.Body>
        </Modal>
        </div>


        var total_table = <div/>
        if (jsonFile.type==GENERAL && this.props.calculated.totals) {
            var sections = []
            var total = 0
            for (var key in this.props.calculated.totals) {
              var amount = this.props.calculated.totals[key]
              total += amount
              sections.push({section: snakeToTitle(key), key: key, amount: amount, total: '$' + amount})
            }
            sections.push({section: 'Grand Total', key: 'total', amount: total, total: '$' + total})

            const columns = [{
              dataField: 'section',
              text: 'Budget Section'
            }, {
              dataField: 'total',
              text: 'Section Total'
            }];

            var rowStyle = (row, index) => {
              if (index==sections.length-1) {
                if (total > this.props.calculated.tier_cap) {
                  return ({color: 'red'})
                }
                return ({color: 'green'})
              }
              else {
                if (this.props.configs && this.props.configs[row.key].max && row.amount > this.props.configs[row.key].max) {
                  return ({color: 'red'})
                }
              }
              return {}
            }

            total_table = (
              <div>
              <div className='chart_total'>
              <BootstrapTable keyField='id' data={ sections } rowStyle={rowStyle} columns={ columns }/>
              </div>
              </div>
            )
        }

        switch (jsonFile.type) {
          case CALCULATOR:
            return(
              <div>
                <div className='lower-page'>
                <h1 className='page-title text-center' style={{fontSize: '24px', marginBottom: '15px'}}> {jsonFile.title} </h1>
                {repeated}
                {fields}
                {links}
                </div>
              </div>)
          case GENERAL:
            return(
            <div>
              <div className='lower-page'>
              <h1 className='page-title text-center' style={{fontSize: '24px', marginBottom: '15px'}}> {jsonFile.title} </h1>
                {fields}
                {total_table}
                <Button type="submit" onClick={this.onSubmit.bind(this)} className="btn btn-primary" style={{fontSize: '15px', textShadow: '0px 0px #FFFFFF', fontWeight: 'normal'}}>{jsonFile.save_text ? jsonFile.save_text : 'Save'}</Button>
                <Link to="/" className="btn btn-danger" style={{fontSize: '15px'}}>Cancel</Link>
                {links}
              </div>
              {modal}
            </div>
            );
          default:
            return(
            <div>
              <div className='lower-page'>
              <h1 className='page-title text-center' style={{fontSize: '24px', marginBottom: '15px'}}> {jsonFile.title} </h1>
                {repeated}
                {fields}
                {total}
                {max_funding}
                <Button type="submit" onClick={this.onSubmit.bind(this)} className="btn btn-primary" style={{fontSize: '15px', textShadow: '0px 0px #FFFFFF', fontWeight: 'normal'}}>{jsonFile.save_text ? jsonFile.save_text : 'Save'}</Button>
                <Link to="/" className="btn btn-danger" style={{fontSize: '15px'}}>Cancel</Link>
                {links}
              </div>
              {modal}
            </div>
            );
          }
  	}
}



function mapStateToProps(state) {

  return {
    budget: state.form,
    opened: state.opener,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return bindActionCreators({
    openCollapse,
    closeCollapse,
    addCollapse,
    removeCollapse,
    init,
    updateInvalids
}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(FormGenerator)
