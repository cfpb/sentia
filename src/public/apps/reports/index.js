$(function() {

  ////////////////////////////////////////////////////////////////////////////////////////
  // VPCs 

  $('#vpcs').click(function() {
    $("#results").text("");
    show_loader();
    report.vpcs(function(err, title, table_data, options) {
      var table = create_table(title, table_data, options);
      $("#results").text("");
      $("#results").append(table);
    });
  });

  ////////////////////////////////////////////////////////////////////////////////////////
  // External IPs 

  $('#external_ips').click(function() {
    $("#results").text("");
    show_loader();
    report.external_ips(function(err, title, table_data, options) {
      var table = create_table(title, table_data, options);
      $("#results").text("");
      $("#results").append(table);
    });
  });

  ////////////////////////////////////////////////////////////////////////////////////////
  // Instances

  $('#instances').click(function() {
    $("#results").text("");
    show_loader();
    report.instances(function(err, title, table_data, options) {
      var table = create_table(title, table_data, options);
      $("#results").text("");
      $("#results").append(table);
    });

  });

  ////////////////////////////////////////////////////////////////////////////////////////
  // Security Groups

  $('#secgroups').click(function() {
    $("#results").text("");
    show_loader();
    report.security_groups(function(err, title, table_data, options) {
      var table = create_table(title, table_data, options);
      $("#results").text("");
      $("#results").append(table);
    });

  });

  ////////////////////////////////////////////////////////////////////////////////////////
  // Subnets

  $('#subnets').click(function() {
    $("#results").text("");
    show_loader();
    report.subnets(function(err, title, table_data, options) {
      var table = create_table(title, table_data, options);
      $("#results").text("");
      $("#results").append(table);
    });
  });

  ////////////////////////////////////////////////////////////////////////////////////////

});

function show_loader() {
  $("#results").append($("<img>").attr("src", baseUrl + "/public/static/images/loader.gif").css('float', 'left').css('clear', 'both'));
}

// Render 2D array table as HTML table in #results
function create_table(title, table_data, options) {

  var table = $('<table>').addClass('results').addClass('root');

  // header
  title = title.replace(/\//g, '&thinsp;/&thinsp;');
  _.each(options, function(val, key) {
    title = title.replace('{' + key + '}', '<span class="report_param">' + val + '</span>');
  });
  var title_tr = $('<tr>').append($('<th>').attr('colspan', table_data[1].length).addClass('title').html(title));
  var tr = $('<tr>');
  _.each(_.first(table_data), function(field_name) {
    tr.append($('<th>').text(field_name));
  });
  table.append($('<thead>').append(title_tr).append(tr));
  
  // body
  var tbody = $('<tbody>');
  _.each(_.rest(table_data), function(row) {
    var tr = $('<tr>');
    _.each(row, function(field) {
      var elem = render_value(field);
      tr.append($('<td>').append(elem));
    });
    tbody.append(tr);
  });
  
  table.append(tbody);
  table.data('data', table_data); // save data to table to apply post-transformations
  
  return table;
}

// Takes a heterogenous value and returns a jQuery element
function render_value(val) {
  if (val instanceof Table) {
    var table = $('<table>').addClass('results');
    // header
    var tr = $('<tr>');
    _.each(_.first(val.data), function(field_name) {
      tr.append($('<th>').text(field_name));
    });
    table.append($('<thead>').append(tr));
    // body
    var tbody = $('<tbody>');
    _.each(_.rest(val.data), function(row) {
      var tr = $('<tr>');
      _.each(row, function(field) {
        var elem = render_value(field);
        tr.append($('<td>').append(elem));
      });
      tbody.append(tr);
    });
    table.append(tbody);
    return table;
  } else if (val instanceof HTML) {
    return $('<span>').html(val.html);
  } else if (val instanceof Linkable) {
    var link = $('<a>');
    link.data('id', val.id);
    link.text(val.display);
    link.click(function() {
      link.closest('td').addClass('selected')
      var table = link.closest('table.root');
      table.nextAll().remove();

      // Hide all rows other than the one containing selected item
      var origin_td = link.closest('td');
      var origin_tbody = origin_td.closest('table.root > tbody');
      var origin_tr = origin_td.closest('table.root > tbody > tr');
      var not_selected = origin_tbody.children().not(origin_tr);
      not_selected.detach();
      var tbody_hidden = $('<tbody>').addClass('hidden').css('display', 'none');
      tbody_hidden.append(not_selected);
      origin_tbody.parent().append(tbody_hidden);

      show_loader();
      report[val.report].apply(null, val.params.concat(function(err, title, table, options) {
        $('#results').children('img').remove();
        if (err) return console.error(err);
        drilldown(origin_td, title, table, options);
      }));
    });
    return link;
  } else if (_.isArray(val)) {
    if (val.length > 1) {
      var tbody = $('<tbody>');
      _.each(val, function(subval) {
        var trow = $('<tr>');
        trow.append($('<td>').append(render_value(subval)));
        tbody.append(trow);
      });
      return $('<table>').addClass('results').append(tbody);
    } else {
      return render_value(_.first(val));
    }
  } else if (_.isObject(val)) {
    var tbody = $('<tbody>');
    _.each(val, function(subval, subkey) {
      var trow = $('<tr>');
      trow.append($('<th>').html(subkey.replace(/\s/, '&nbsp;')));
      trow.append($('<td>').append(render_value(subval)));
      tbody.append(trow);
    });
    return $('<table>').addClass('results').addClass('keyval').append(tbody);        
  } else if (_.isString(val)) {
    return $('<span>').text(val);
  } else {
    return val;
  }
}

function drilldown(origin_td, title, result_table, options) {
  
  // Create drilldown table, append underneath with spacer
  var origin_table = origin_td.closest('table.root');
  var drilldown_table = create_table(title, result_table, options).addClass('drilldown');
  var spacer = $('<div>').addClass('drilldown-table-spacer');
  $('#results').append(spacer).append(drilldown_table);
  var close_link = $('<a>').addClass('close_link').text('[close]');
  close_link.on('click', function() {
    drilldown_table.remove();
    spacer.remove();
    var hidden_tbody = origin_table.children('tbody.hidden');
    origin_table.children('tbody').first().append(hidden_tbody.children());
    hidden_tbody.remove();
  });
  drilldown_table.find('th.title').append($('<div>').css('float', 'right').append(close_link));
  var set_spacer_width = function() {
    spacer.css('width', Math.floor(Math.min(origin_table.width(), drilldown_table.width())/30)*30);
  };
  $(window).resize(set_spacer_width);
  set_spacer_width();
}

// Constructor of 'Linkable' type
function Linkable(id, display, report, params) {
  this.id = id;
  this.display = display;
  this.report = report;
  this.params = params;
  return this;
}

// Used for asynchronous lookup on other reports
function AJAXLookup(path, id, renderer) {
  this.path = path;
  this.id = id;
  this.renderer = renderer;
  return this;
}

// Constructor of 'Table' type
function Table(table_data) {
  this.data = table_data;
  return this;
}

// Constructor of 'Table' type
function HTML(html) {
  this.html = html;
  return this;
}
