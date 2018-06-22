var durableJson = require('./budgetSections/durable.json');

function validate(values) {
	const errors = {};

	//Validate Input

  console.log("AAHH", values)

  durableJson.repeat.forEach((repeatable) => {
    var name = repeatable.name
    var questions = repeatable.values
    var repeatArrayError = []
    console.log(questions)
    if (values[name]) {
      values[name].forEach((item, index) => {
        var itemErrors = {}
        console.log(item, index)
        questions.forEach((qField) => {
            var fieldName = qField.name
            if(item[fieldName]==undefined || (qField.type=='checkbox' && !item[fieldName])) {
              if(!errors[name]) {
                errors[name]={}
              }
              if(!errors[name][index]) {
                errors[name][index]={}
              }
              errors[name][index][fieldName]=qField.errorMessage ? qField.errorMessage : ""
            }
          })
        })
      }
    })

    durableJson.single.forEach((question) => {
      var name = question.name
      if(values[name]==undefined) {
        errors[name] = question.errorMessage ? question.errorMessage : ""
      }
    })

	//if errors is empty, form is fine to submit
	return errors;

}

export default validate
