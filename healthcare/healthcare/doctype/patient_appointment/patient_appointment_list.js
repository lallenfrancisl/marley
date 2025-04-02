/*
(c) ESS 2015-16
*/
frappe.listview_settings["Patient Appointment"] = {
	add_fields: ["patient", "status", "date", "appointment_type"],
	refresh: function () {
		$("div.level-right").each(function () {
			$(this).hide();
		});
	},
	filters: [["status", "=", "Open"]],
	hide_name_column: true,
	get_indicator: function (doc) {
		var colors = {
			Open: "orange",
			Scheduled: "yellow",
			Closed: "green",
			Cancelled: "red",
			Expired: "grey",
			"Checked In": "blue",
			"Checked Out": "orange",
			Confirmed: "green",
			"No Show": "red",
		};
		return [__(doc.status), colors[doc.status], "status,=," + doc.status];
	},
};
