// Copyright (c) 2021, healthcare and contributors
// For license information, please see license.txt

frappe.listview_settings['Inpatient Record'] = {
    refresh: function() {
    	// Hide name filter from Listview
    	$("div[data-fieldname = name]").hide();
    },
    // Hide name from Listview
	hide_name_column: true,
	filters: [['status', 'not in', ['Discharged']]],
	get_indicator: function (doc) {
		if (doc.status === 'Admission Scheduled') {
			return [__('Admission Scheduled'), 'red', 'status, =, Admission Scheduled'];
		} else if (doc.status === 'Admitted') {
			return [__('Admitted'), 'blue', 'status, =, Admitted'];
		} else if (doc.status === 'Discharge Scheduled') {
			return [__('Discharge Scheduled'), 'orange', 'status, =, Discharge Scheduled'];
		}  else if (doc.status === 'Discharged') {
			return [__('Discharged'), 'green', 'status, =, Discharged'];
		}
	}
};
