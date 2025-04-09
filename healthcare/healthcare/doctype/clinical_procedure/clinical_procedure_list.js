frappe.listview_settings['Clinical Procedure'] = {
	refresh: function() {
    	// Hide name filter from Listview
    	$('div:has(>span[data-sort-by="name"])').hide();
    	$('div.list-row-col:has(>span[title^="ID"])').hide();

        $("div.level-right").each(function() {
            $(this).hide();
        })

		if (location.pathname.endsWith("/view/report")) {
			window.location.replace('/app/query-report/OT List')
		}
	},
	get_indicator: function(doc) {
		var colors = {
			'Completed': 'green',
			'In Progress': 'orange',
			'Pending': 'orange',
			'Cancelled': 'grey'
		};
		return [__(doc.status), colors[doc.status], 'status,=,' + doc.status];
	}
};
