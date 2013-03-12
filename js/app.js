MyApp = Ember.Application.create({
	rootElement: '#app'
});

MyApp.President = Ember.Object.extend({
  firstName: "Barack",
  lastName: "Obama",

  fullName: function() {
    return this.get('firstName') + ' ' + this.get('lastName');

    // Tell Ember.js that this computed property depends on firstName
    // and lastName
  }.property('firstName', 'lastName')
});

MyApp.president = MyApp.President.create();

MyApp.country = Ember.Object.create({
  // Ending a property with 'Binding' tells Ember.js to
  // create a binding to the presidentName property.
  presidentNameBinding: 'MyApp.president.fullName'
});

// Later, after Ember has resolved bindings...
alert(MyApp.country.get('presidentName'));
// "Barack Obama"