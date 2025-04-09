// Copyright (c) 2025, earthians Health Informatics Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.query_reports["OT List"] = {
	"filters": [
		{
			"fieldname": "name",
			"fieldtype": "Data",
			"label": "Name",
			"mandatory": 0,
			"wildcard_filter": 1
		},
		{
			"fieldname": "procedure",
			"fieldtype": "Data",
			"label": "Procedure",
			"mandatory": 0,
			"wildcard_filter": 1
		},
		{
			"fieldname": "date",
			"fieldtype": "Date",
			"label": "Date",
			"mandatory": 0,
		},
		{
			"fieldname": "ed_number",
			"fieldtype": "Data",
			"label": "ED Number",
			"mandatory": 0,
		},
		{
			"fieldname": "ipd_number",
			"fieldtype": "Data",
			"label": "IPD Number",
			"mandatory": 0,
		},
		{
			"fieldname": "diagnosis",
			"fieldtype": "Link",
			"label": "Diagnosis",
			"options": "Diagnosis",
			"mandatory": 0,
		},
	]
};
