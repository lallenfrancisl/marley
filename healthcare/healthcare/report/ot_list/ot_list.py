# Copyright (c) 2025, earthians Health Informatics Pvt. Ltd. and contributors
# For license information, please see license.txt

# import frappe

def execute(filters=None):
	columns = [
		{
			"label": "SL. No",
		},
		{
			"label": "NAME",
		},
		{
			"label": "ABMMSBY No",
		},
		{
			"label": "AGE/SEX",
		},
		{
			"label": "CR NO",
		},
		{
			"label": "DIAGNOSIS",
		},
		{
			"label": "OPERATION",
		},
	]

	data = [
		{},
	]

	return columns, data
