
PHinText = Ember.Application.create({
    rootElement: '#pit',
    name: 'In Text Place Holder',
    ready: function(){
        alert('ready');
    }
});

PHinText.PlaceHolderType = Ember.Object.extend({
    name: null,
    display_name: null,
    format: null,
    display_format: null,
    feilds: [],
    color: 'yellow',
    max: 0
});

PHinText.placeHolderTypesController = Ember.ArrayController.create({
    content: [],
    init: function(){
        // create an instance of the Song model
        var ph_text_type = PHinText.PlaceHolderType.create({
            name: 'text',
			display_name: null,
			format: "{text}",
			display_format: "{text}",
			feilds: ["text"],
			color: null,
			max: 0
        });
        this.pushObject(ph_text_type);
    }
});

PHinText.PlaceHolderElements = Ember.Object.extend({
    name: null,
    value: null
});

PHinText.PlaceHolder = Ember.Object.extend({
    type_name: null,
    name: null,
    values: [],
    ph_text: function() {return 'stub: ph_text';}.property(),
    formated_text: function() {
    	var external_text = '';
        var values = this.get('values');
        values.forEach(function(item) {
            external_text += item.value;
        });
    	return 'stub: ' + external_text;
    }.property('values.@each.value')
});

PHinText.placeHoldersController = Ember.ArrayController.create({
    content: [],
    init: function(){
        // create an instance of the model
        var ph_text_item = PHinText.PlaceHolder.create({
            type_name: 'text',
		    name: 'input1',
		    values: [ PHinText.PlaceHolderElements.create({name: 'text', value: 'http://'}) ],
        });
        this.pushObject(ph_text_item);
    }
});

PHinText.MyText = Ember.TextField.extend({
  //textChangedBinding: 'PHinText.placeHoldersController.formBlurred',
  keyUp: function(evt) {
    //this.set('textChanged', true);
    alert('new val: ' + this.value); //or evt.currentTarget.value
  }
});

alert(PHinText.name);