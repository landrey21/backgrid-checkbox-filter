/* **********************************************
 * Backgrid checkbox-filter extension
 * http://github.com/landrey21/backgrid-checkbox-filter
 * Written by Jason Landrey
 * Licensed under the MIT @license
 */
(function() {
  var CheckboxFilter = Backgrid.Extension.CheckboxFilter = Backbone.View.extend({
    tagName: 'div',
    className: 'backgrid-filter',
    events: {
      'change': 'onChange'
    },
    defaults: {
      field: undefined,
      initialValues: [],
      filterId: 'backgrid_checkbox_filter',
      checkboxData: undefined,
      checkboxName: 'backgrid_checkbox_name',
      checkboxClass: 'backgrid-checkbox-filter',
      template: _.template([
        '<div id="<%= id %>"</div>',
        '<a href="javascript:void(0);" class="<%= checkbox_class %>-clear">Clear</a>',
        '<% for (var i=0; i < items.length; i++) { %>',
        '  <div class="<%= checkbox_class %>">',
        '  <label>'+
        '<input type="checkbox" name="<%= checkbox_name %>" value="<%= items[i].value %>"<% if(items[i].checked === true) print(" checked") %>/>'+
        '<span><%= items[i].label %></span>'+
        '</label>',
        '  </div>',
        '</div>',
        '<% } %>'
      ].join("\n")),
      templateData: {},
      makeMatcher: function(values) { // values is an array
        return function(model) {
          if (values.indexOf(model.get(this.field)) != -1) return true;
          return false;
        };
      },
      currentValues: function() {
        var values = $('#'+this.filterId+' .'+this.checkboxClass+' input[type=checkbox]:checked').map(function() {
          return $(this).val();
        }).get();
        return values;
      }
    },

    initialize: function(items) {
      CheckboxFilter.__super__.initialize.apply(this, arguments);

      _.defaults(this, items || {}, this.defaults);
      if (_.isEmpty(this.checkboxData) || !_.isArray(this.checkboxData)) throw "Invalid or missing checkboxData.";
      if (_.isEmpty(this.field) || !this.field.length) throw "Invalid or missing field.";
      if (!_.isEmpty(this.initialValues) && _.isArray(this.initialValues)) this.setInitialValues();

      var collection = this.collection = this.collection.fullCollection || this.collection;
      var shadowCollection = this.shadowCollection = collection.clone();

      this.listenTo(collection, 'add', function (model, collection, items) {
        shadowCollection.add(model, items);
      });
      this.listenTo(collection, 'remove', function (model, collection, items) {
        shadowCollection.remove(model, items);
      });
      this.listenTo(collection, 'sort', function (col) {
        if (this.currentValues().length == 0) shadowCollection.reset(col.models);
      });
      this.listenTo(collection, 'reset', function (col, items) {
        items = _.extend({reindex: true}, items || {});
        if (items.reindex && items.from == null && items.to == null) {
          shadowCollection.reset(col.models);
        }
      });
    },

    render: function() {
      this.templateData['id'] = this.filterId;
      this.templateData['items'] = this.checkboxData;
      this.templateData['checkbox_name'] = this.checkboxName;
      this.templateData['checkbox_class'] = this.checkboxClass;

      this.$el.empty().append(this.template(this.templateData));
      // use defer so the elements are completely rendered before we do jquery stuff on them
      _.defer(() => {
        this.addListeners();
      });
      return this;
    },

    addListeners: function() {
      var elementId = '#' + this.filterId + ' .' + this.checkboxClass;
      $(elementId + '-clear').click(() => {
        $(elementId + ' input[type=checkbox]:checked').prop('checked', false);
        this.onChange();
      });
      $(elementId + '-selectall').click(() => {
        $(elementId + ' input[type=checkbox]').prop('checked', true);
        this.onChange();
      });
      this.onChange();
    },

    setInitialValues: function() {
      var initialValues = this.initialValues;
      this.checkboxData = _.map(this.checkboxData, function(o) {
        var isChecked = (initialValues.indexOf( o.value ) != -1) ? true : false;
        return {label: o.label, value: o.value, checked: isChecked};}
      );
    },

    onChange: function(e) {
      var col       = this.collection,
          values    = this.currentValues(),
          matcher   = _.bind(this.makeMatcher(values), this),
          elementId = '#' + this.filterId + ' .' + this.checkboxClass;

      if (col.pageableCollection)
        col.pageableCollection.getFirstPage({silent: true});

      if ($(elementId + ' input[type=checkbox]:checked').length > 0) {
        col.reset(this.shadowCollection.filter(matcher), {reindex: false});
        $(elementId + '-clear').show();
      } else {
        col.reset(this.shadowCollection.models, {reindex: false});
        $(elementId + '-clear').hide();
      }
    }
  });
}).call(this);
