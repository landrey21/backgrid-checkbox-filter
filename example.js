$(document).ready(function() {

  // Collection
  var Territories = Backbone.PageableCollection.extend({
    state: {pageSize: 15},
    mode: "client"
  });

  var columns = [
    {name: "name", label: "Name", cell: "string", editable:false},
    {name: "code", label: "Code", cell: "string", editable:false},
    {name: "continent_code", label: "Continent", cell: "string", editable:false}
  ];

  // ** Example 1 **
  (function() {
    var territories = new Territories(_.map(_territories, _.clone));

    // Grid
    var grid = new Backgrid.Grid({
      columns: columns,
      collection: territories,
      className: 'backgrid table'
    });
    $grid = grid.render().$el;
    $('#continent_data').append($grid);

    // Paginator
    var paginator = new Backgrid.Extension.Paginator({
      collection: territories
    });
    $paginator = paginator.render().$el;
    $('#continent_data').append($paginator);

    //var initialValues = ['AF','NA'];
    var initialValues = [];

    // Checkbox filter
    var filter = new Backgrid.Extension.CheckboxFilter({
      collection: territories,
      field: 'continent_code',
      initialValues: initialValues,
      checkboxClass: 'backgrid-checkbox-filter',
      checkboxName: 'continent',
      checkboxData: _.map(_continents, function(o) {
        return {label: o.name, value: o.code};}
      )
    });
    $filter = filter.render().$el;
    $('#backgrid_checkbox_filter').empty().html($filter);

  }).call(this);

});