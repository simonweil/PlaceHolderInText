// url = file:///Users/simonweil/Dev/www/PlaceHolderInText/index.html

/*

1. Setup values dynamicly according to the PH type and the value empty - Done!
2. Integrate FancyBox - Done!
3. remove text PH from list of dragging - Done!
4. make a little nicer with CSS - Done!
4.1. use this: http://stackoverflow.com/questions/3392493/adjust-width-of-input-field-to-its-input
5. Turn to CoffeeScript + SCSS (use yeoman.io/brunch.io/other)
6. Turn to an element that can be used in a project
7. remove unneeded logging
8. push to git both like is and as element

*/

PHinText = Ember.Application.create({
    LOG_TRANSITIONS: true, // output routing changes
    //rootElement: '#pit',
    name: 'In Text Place Holder',
    ready: function(){
        PHinText.message('ready');
    },
    message: function function_name (text) {
        console.log(text);
    }
});


/**
 * Drag & Drop Functionality
 */
DragNDrop = Ember.Namespace.create();

DragNDrop.cancel = function(event) {
    event.preventDefault();
    return false;
};

DragNDrop.Draggable = Ember.Mixin.create({
    attributeBindings: ['draggable'],
    draggable: 'true',
    dragStart: function(event) {
        var dataTransfer = event.originalEvent.dataTransfer;
        dataTransfer.setData('viewId', this.get('elementId'));
        dataTransfer.setData('text', '{{{' + this.get('elementId') + '}}}');
        PHinText.message('stub: dragStart event for ' + this.toString());
    }
});

DragNDrop.Droppable = Ember.Mixin.create({
    dragEnter: DragNDrop.cancel,
    dragOver: DragNDrop.cancel,
    drop: function(event) {
        event.preventDefault();
        return false;
    }
});


/**
 * Setup the Router
 */
PHinText.Router.map(function() {
    this.resource('phValues', { path: '/phValues/:ph_id'});
});

PHinText.PhValuesRoute = Ember.Route.extend({
    model: function(params) {
        return PHinText.placeHoldersController.find(params.id).get('values');
    }
});

PHinText.PhValuesView = Ember.View.extend({
    tagName: 'div',
    //template: 'phValues', - is taken automatticly by convesion
    elementId: 'phValuesSet',

    isFbClosing: false,

    fbClass: function () {
        return 'fancybox_' + this.get("elementId");
    }.property('elementId'),

    didInsertElement: function() {
        PHinText.message('debug PhValuesView: in didInsertElement for' + this.toString());
        Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
    },

    processChildElements: function() {
        PHinText.message('debug PhValuesView: in processChildElements for' + this.toString());
        var fb_class = this.get("fbClass"),
            this_view = this;
        
        // need a link button for FancyBox - create it.
        this.$().before('<a class="' + fb_class + '" href="#' + this.get("elementId") + '"></a>');

        // setup the fancybox parameters
        // info: http://fancyapps.com/fancybox/
        // and in source code: https://github.com/fancyapps/fancyBox/blob/master/source/jquery.fancybox.js
        $("." + fb_class).fancybox({
            //openEffect  : 'none',
            //closeEffect : 'none',
            beforeClose  : function () {
                // If the FancyBox is closing because the user pressed the X or the overlay, route back to index.
                // If the FancyBox is closing because the user clicked "close", then the routing was done automatticly ({{LinkTo}} helper) and don't re-route
                if (this_view.get('isFbClosing') === false) {
                    var router = this_view.get('controller.target.router');
                    router.transitionTo('index');
                }
            }
        });

        // fire the click event to show the light box 
        $("." + fb_class).click();
    },

    willDestroyElement: function () {
        PHinText.message('debug PhValuesView: in willDestroyElement for' + this.toString());

        // set that the FancyBox is closing so if initiated by the LinkTo, set to true so the 'beforeClose' of FancyBox will not re-route
        this.set('isFbClosing', true);

        // close the fancybox - needed if the LinkTo was clicked.
        $.fancybox.close();

        // remove the <a> needed for the FancyBox
        $("." + this.get("fbClass")).remove();
    }
});

PHinText.Router.reopen({
  location: 'none'
});

/**
 *
 */
PHinText.PlaceHolderType = Ember.Object.extend({
    name: null,
    display_name: null,
    output_format: null,
    ph_display_format: null,
    fields: [],
    color: 'yellow',
    max: 0
});

PHinText.PlaceHolderTypesController = Ember.ArrayController.extend({
    content: [],
    init: function(){
        // create an instance of the Song model
        var ph_text_type1 = PHinText.PlaceHolderType.create({
            name: 'text',
            display_name: null,
            output_format: "{text}",
            ph_display_format: "{text}",
            fields: ["text"],
            color: null,
            max: 0
        });
        this.add(ph_text_type1);

        var ph_text_type2 = PHinText.PlaceHolderType.create({
            name: 'none',
            display_name: 'No Params',
            output_format: "[NoParams]",
            ph_display_format: "No Params",
            color: 'yellow',
            max: 1
        });
        this.add(ph_text_type2);

        var ph_text_type3 = PHinText.PlaceHolderType.create({
            name: 'one',
            display_name: 'One Parameter',
            output_format: "[one:{param}]",
            ph_display_format: "One Parameter = '{param}'",
            fields: ["param"],
            color: 'green',
            max: 0
        });
        this.add(ph_text_type3);

        var ph_text_type4 = PHinText.PlaceHolderType.create({
            name: 'three',
            display_name: 'Three Parameters',
            output_format: "[person:title={Title},fname={First Name},lname={Last Name}]",
            ph_display_format: "Hello {Title} {First Name} {Last Name}!!",
            fields: ["Title", "First Name", "Last Name"],
            color: 'lightblue',
            max: 0
        });
        this.add(ph_text_type4);
    },

    add: function (item) {
        item.set('isDragging', false);
        this.pushObject(item);
    },

    currentDragItem: Ember.computed(function(key, value) {
        return this.findProperty('isDragging', true);
    }).property('@each.isDragging').cacheable()

});
PHinText.placeHolderTypesController = PHinText.PlaceHolderTypesController.create();



PHinText.PlaceHolderTypeView = Ember.View.extend(DragNDrop.Draggable, {
    tagName: 'li',
    
    click: function(event) {
        PHinText.message('stub: click event for ' + this.toString());
    },


    // .setDragImage (in #dragStart) requires an HTML element as the first argument
    // so you must tell Ember to create the view and it's element and then get the 
    // HTML representation of that element.
    dragIconElement: Ember.View.create({
        attributeBindings: ['src'],
        tagName: 'img',
        src: 'http://twitter.com/api/users/profile_image/twitter'
    }).createElement().get('element'),

    dragStart: function(event) {
        this._super(event);
        // Let the controller know this view is dragging
        this.set('context.isDragging', true);

        // Set the drag image and location relative to the mouse/touch event
        var dataTransfer = event.originalEvent.dataTransfer;
        dataTransfer.setDragImage(this.get('dragIconElement'), 24, 24);
    },

    dragEnd: function(event) {
        // Let the controller know this view is done dragging
        this.set('context.isDragging', false);
        PHinText.message('stub: dragEnd event for ' + this.toString());
    }
});


PHinText.PlaceHolderElements = Ember.Object.extend({
    name: null,
    value: null
});

PHinText.PlaceHolder = Ember.Object.extend({
    id: null,
    type_name: null,
    values: [],
    display_text: function() {
        var re = /{([^}]*)}/g,
            type_name = this.get('type_name'),
            format = PHinText.placeHolderTypesController.get('content').findProperty('name', type_name).get('ph_display_format');

        // http://www.bennadel.com/blog/1742-Using-Regular-Expressions-In-Javascript-A-General-Overview-.htm
        father_this = this;
        to_display_text = format.replace(re, 
            function ($0, $1) {
                PHinText.message('debug: replace ph_display_format in format.replace, for: ' + $0 + ' ' + $1);
                return father_this.get('values').findProperty('name', $1).get('value');
            });

        PHinText.message('debug: display_text (' + type_name + ') - ' + to_display_text + ' - in: ' + this.toString());
        return to_display_text;
    }.property('type_name', 'values.@each.value'),

    formated_text: function() {
        var re = /{([^}]*)}/g,
            type_name = this.get('type_name'),
            format = PHinText.placeHolderTypesController.get('content').findProperty('name', type_name).get('output_format');

        // http://www.bennadel.com/blog/1742-Using-Regular-Expressions-In-Javascript-A-General-Overview-.htm
        father_this = this;
        to_display_text = format.replace(re, 
            function ($0, $1) {
                PHinText.message('debug: replace output_format in format.replace, for: ' + $0 + ' ' + $1);
                return father_this.get('values').findProperty('name', $1).get('value');
            });

        PHinText.message('debug: output_format (' + type_name + ') - ' + to_display_text + ' - in: ' + this.toString());
        return to_display_text;
    }.property('type_name', 'values.@each.value'),

    xxformated_text: function() {
    	var external_text = '';
        var values = this.get('values');
        values.forEach(function(item) {
            external_text += item.value;
        });
    	return 'stub: ' + external_text;
    }.property('values.@each.value')
});

PHinText.PlaceHoldersController = Ember.ArrayController.extend({
    content: [],

    init: function(){
        // create an instance of the model, a text item
        var ph_text_item = PHinText.PlaceHolder.create({
            type_name: 'text',
		    values: [ PHinText.PlaceHolderElements.create({name: 'text', value: 'http://'}) ],
        });
        this.add(ph_text_item);
    },
    maxId: 0,

    getFullString: function () {
        var output_text = '';
        this.get('content').forEach(function (item) {
            output_text += item.get('formated_text');
        });
        return output_text;
    }.property('content.@each.formated_text'),

    newPlaceHolder: function (ph_type) {
        PHinText.message('debug: creating newPlaceHolder of type "' + ph_type.name + '" for ' + this.toString());

        var ph_item = PHinText.PlaceHolder.create({
            type_name: ph_type.name,
            values: []
        });

        // set the values dynamiclly
        for (i=0; i < ph_type.get('fields').length; i++) {
            ph_item.get('values')[i]=PHinText.PlaceHolderElements.create({name: ph_type.get('fields')[i], value: ''});
        }

        // open a light box to enter Place Holder data
        this.getPlaceHolderData(ph_item);

        return ph_item;
    },

    getPlaceHolderData: function (item) {
        PHinText.message('stub: get placeHolder data using fancyBox and return the item.');
    },

    validatePlaceHolderData: function (item) {
        PHinText.message('stub: validate the placeHolder data and throw errer if bad.');

        return true;
    },

    add: function (item, index) {
        PHinText.message('debug: add item to placeHoldersController');

        // validate Place Holder
        if (!this.validatePlaceHolderData(item)) {
            PHinText.message('Error: validation failed');
            return;
        }

        // add the item to the Controller

        // set id
        this.incrementProperty('maxId');
        var new_id = this.get('maxId');
        item.set('id', new_id);

        // if index is a integer and in the range insert at specific index. 
        if (typeof index === 'number' && index % 1 == 0 && this.get('content').length >= index) {
            if (this.get('content').length > index) {
                console.log("insertAt" + index);
                this.get('content').insertAt(index, item);
            } else {
                console.log("pushObject");
                this.get('content').pushObject(item);
            }
        } else {
            console.log("no index arg");
            this.get('content').pushObject(item);
        }
        
    },

    addPH: function (PHItem_type, textItem, splitTextId) {
        
        var PHItem = this.newPlaceHolder(PHItem_type);

        var splitText_index = this.get('content').indexOf(this.get('content').findProperty('id', splitTextId));
        PHinText.message('debug: addPH placeHoldersController (index: ' + splitText_index + ')');
        this.add(PHItem, splitText_index+1);
        this.add(textItem, splitText_index+2);
    },

    removePH: function (id) {
        PHinText.message('debug: remove from placeHoldersController (id: ' + id + ')');
        var content = this.get('content'),
            ph_item_to_remove = content.findProperty('id', id),
            ph_index = content.indexOf(ph_item_to_remove),
            item_before_ph = content[ph_index-1],
            text_before_ph = item_before_ph.get('values').findProperty('name', 'text').get('value'),
            item_after_ph = content[ph_index+1],
            text_after_ph = item_after_ph.get('values').findProperty('name', 'text').get('value');

        item_before_ph.get('values').findProperty('name', 'text').set('value', text_before_ph + text_after_ph);
        
        this.remove(item_after_ph);
        this.remove(ph_item_to_remove);
    },

    remove: function (item) {
        this.get('content').removeObject(item);
        item.destroy();
    }
});
PHinText.placeHoldersController = PHinText.PlaceHoldersController.create();

PHinText.MyText = Ember.TextField.extend({
    // TODO: remove
    keyUp: function(evt) {
        //this.set('textChanged', true);
        PHinText.message('new val: ' + this.value); //or evt.currentTarget.value
    },

    isDropping: false,
    dragValues: Ember.Object.create({
        view: '',
        text: ''
    }),

    // Make the text box size dynamic
    attributeBindings: ['msize:data-size'], // don't really need this but it's a nice example.
    msize: function () {
        // make the size update after render of the DOM to prevent errors
        Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
        return this.get('value').length;
    }.property('value'),

    processChildElements: function() {
        this.$().change();
    },

    drop: function(event) {
        PHinText.message('stub: drop event for ' + this.toString());

        var viewId = event.originalEvent.dataTransfer.getData('viewId'),
            view = Ember.View.views[viewId];

        // Set view properties
        // Must be within `Ember.run.next` to always work
        Ember.run.next(this, function() {
            view.set('context.isAdded', !view.get('context.isAdded'));
        });

        PHinText.message('stub: Save drag values for use in input event');
        this.set('dragValues.viewId', event.originalEvent.dataTransfer.getData('viewId'));
        this.set('dragValues.text', event.originalEvent.dataTransfer.getData('text'));
        this.set('isDropping', true);


        PHinText.message('stub: caret pos: ' + this.$().get(0).selectionStart);
        PHinText.message('stub: drop text: ' + this.get('value') + ' will: ' + this.$().val());

        return this._super(event);
    },

    input: function (event) {
        PHinText.message('stub: input event for ' + this.toString());
        PHinText.message('stub: input caret pos: ' + this.$().get(0).selectionStart + ' e: ' + this.$().get(0).selectionEnd);
        PHinText.message('stub: input text: ' + this.get('value') + ' will: ' + this.$().val());

        if (this.get('isDropping') === true) {
            PHinText.message('debug: input event - in drop event, split into 2 elements, add a PH and end drop');

            PHinText.message('stub: viewid: ' + this.get('dragValues.viewId') + ' text to find: ' + this.get('dragValues.text'));

            splitText = this.$().val().split(this.get('dragValues.text'));

            PHinText.message('splitText: len' + splitText.length + ' first: ' + splitText[0] + ' last: ' + splitText[1]);

            // the value of the view has changed with the dragged element id - fix it
            Ember.run.next(this, function() {
                this.set('value', splitText[0]);
            });

            var text_item = PHinText.PlaceHolder.create({
                type_name: 'text',
                values: [ PHinText.PlaceHolderElements.create({name: 'text', value: splitText[1]}) ],
            });

            var view = Ember.View.views[this.get('dragValues.viewId')];
            

/*

name: 'text',
display_name: null,
output_format: "{text}",
ph_display_format: "{text}",
fields: ["text"],
color: null,
max: 0

*/

            PHinText.placeHoldersController.addPH(view.get('context'), text_item, this._parentView._parentView.get('context.id'));

            // reset drag state
            this.set('dragValues.viewId', '');
            this.set('dragValues.text', '');
            this.set('isDropping', false);
        } else
            PHinText.message('debug: input event - not in a drop event - do nothing.');
    },

    didInsertElement: function () {
        this.$().autoGrowInput({
            maxWidth: 500,
            minWidth: 2,
            comfortZone: 0
        });
        Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
    }
});


Ember.Handlebars.registerBoundHelper('ifTextPH', function(options) {
    // Make sure the helper is called only for Place Holder Items
    if (this.constructor && 
            this.constructor.toString().split('.')[1] != 'PlaceHolder' &&
            this.constructor.toString().split('.')[1] != 'PlaceHolderType') {
        var message = 'ifTextPH can be called only with a Place Holder item!';
        console.error(message);
        return message;
    }

    var type = this.type_name || this.name;

    // If it's a text item then it should have special treatment
    if (type == 'text') {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

PHinText.PlaceHolderBodyView = Ember.View.extend({
    elementType: 'PHBodyView',
    tagName: 'span',
    classNames: ['ph-body'],
    template: Ember.Handlebars.compile("{{view.parentView.context.display_text}}"),
    
    didInsertElement: function() {
        PHinText.message('debug: get data for PH - didInsertElement in ' + this.toString() + ' (ph id: ' + this.get('parentView.context.id') + ') of view: "' + this.elementId);
        
        var element_color = PHinText.placeHolderTypesController.findProperty("name", this.get('parentView.context.type_name')).get('color');
        this.get('parentView').$().children().css('background-color', element_color);
        this.get('parentView').$().children().css('border', '1px solid lightblue');

        var router = this.get('controller.target.router');
        router.transitionTo('phValues', this.get('parentView.context'));
    },

    willInsertElement: function() {
        PHinText.message('stub: willInsertElement in ' + this.toString());
    }
});

PHinText.RemovePlaceHolderView = Ember.View.extend({
    elementType: 'RemovePHView',
    tagName: 'span',
    classNames: ['ph-rm'],
    template: Ember.Handlebars.compile("x"),

    didInsertElement: function() {
        PHinText.message('stub: didInsertElement in ' + this.toString());
    }
});

PHinText.PlaceHolderViewContainer = Ember.ContainerView.extend({
    tagName: 'span',
    classNames: ['placeholder'],
    childViews: ['ph_remove', 'ph_body'],
    ph_remove: PHinText.RemovePlaceHolderView,
    ph_body: PHinText.PlaceHolderBodyView,
    
    eventManager: Ember.Object.create({
        click: function(event, view){
            if (view.elementType === 'RemovePHView') {
                PHinText.message('debug: click in eventManager of view: "' + view.elementId + '" in ' + this.toString());
                PHinText.placeHoldersController.removePH(view.get('parentView.context.id'));
            } else if (view.elementType === 'PHBodyView') {
                PHinText.message('debug: click in eventManager (ph id: ' + view.get('parentView.context.id') + ') of view: "' + view.elementId + '" in ' + this.toString());
                var router = view.get('controller.target.router');
                router.transitionTo('phValues', view.get('parentView.context'));
            } else {
                PHinText.message('No view asosiated with this click event (view: ' + view.elementId + '" in ' + this.toString() + ')');
            }
        }
    })
});

PHinText.message(PHinText.name);
