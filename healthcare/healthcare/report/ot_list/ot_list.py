# Copyright (c) 2025, earthians Health Informatics Pvt. Ltd. and contributors
# For license information, please see license.txt

from frappe import frappe
from bs4 import BeautifulSoup

def execute(filters=None):
	columns = [
		{
			"label": "NAME",
			"fieldname": "name",
			"fieldtype": "Data",
		},
		{
			"label": "ABMMSBY No",
			"fieldname": "abssby_no",
			"fieldtype": "Data",
		},
		{
			"label": "AGE/SEX",
			"fieldname": "age_sex",
			"fieldtype": "Data",
		},
		{
			"label": "IPD No",
			"fieldname": "ipd_no",
			"fieldtype": "Data",
		},
		{
			"label": "DIAGNOSIS",
			"fieldname": "diagnosis",
			"fieldtype": "Data",
		},
		{
			"label": "OPERATION",
			"fieldname": "operations",
			"fieldtype": "Data",
		},
	]

	applied_filters = []

	if (filters.name):
		applied_filters.append(["patient", "LIKE", filters.name])

	if (filters.procedure):
		applied_filters.append(["procedure_template", "LIKE", filters.procedure])

	if (filters.date):
		applied_filters.append(["start_date", "=", filters.date])

	if (filters.ed_number):
		applied_filters.append(["ed_number", "=", filters.ed_number])

	if (filters.ipd_number):
		applied_filters.append(["ipd_number", "=", filters.ipd_number])

	if (filters.diagnosis):
		applied_filters.append(["", "=", filters.ipd_number])

	procedures = frappe.get_list(
		"Clinical Procedure",
		fields="*",
		filters=applied_filters,
	)

	data = []

	for item in procedures:
		patient = frappe.get_doc("Patient", item.patient)

		if not patient:
			continue

		is_inpatient = frappe.db.exists("Inpatient Record", item.inpatient_record)

		operation = f"<strong>{item.procedure_template}</strong>"
		if item.anesthesia_type:
			an_type = frappe.get_doc("Anesthesia Type", item.anesthesia_type)
			operation = f"<strong>{item.procedure_template} under {an_type.title}</strong>"
			

		if is_inpatient:
			ip_record = frappe.get_doc("Inpatient Record", item.inpatient_record)

			name = f"<strong>{patient.patient_name}</strong>"

			if patient.is_hiv or patient.is_hbsag or patient.is_hcv:
				markers = []

				if patient.is_hiv:
					markers.append("HIV")

				if patient.is_hbsag:
					markers.append("HbsAg")

				if patient.is_hcv:
					markers.append("HCV")

				name += f"""
					<div>
						(UNIVERSAL MARKER)<br>
						<strong>{', '.join(markers)}</strong>
					</div>
					<br>
				"""
			else:
				name += "<br><br>"


			if patient.surgical_history:
				name += f"""
					<div>
						{new_lines_to_br(patient.surgical_history)}
					</div>
					<br>
				"""
			
			if patient.medical_history:
				name += f"""
					<div>
						{new_lines_to_br(patient.medical_history)}
					</div>
					<br>
				"""

			if patient.medication:
				name += f"""
					<div>
						{new_lines_to_br(patient.medication)}
					</div>
					<br>
				"""

			if patient.surrounding_factors:
				name += f"""
					<div>
						{new_lines_to_br(patient.surrounding_factors)}
					</div>
					<br>
				"""

			if patient.other_risk_factors:
				name += f"""
					<div>
						{new_lines_to_br(patient.other_risk_factors)}
					</div>
					<br>
				"""
			
			if patient.tobacco_past_use or patient.tobacco_current_use:
				name += f"""
					Tobacco Consumption(Past): {new_lines_to_br(patient.tobacco_past_use)}
					<br>
					Tobacco Consumption(Present): {new_lines_to_br(patient.tobacco_current_use)}
					<br>
				"""

			if patient.alcohol_past_use or patient.alcohol_current_use:
				name += f"""
					Alcohol Consumption(Past): {new_lines_to_br(patient.alcohol_past_use)}
					<br>
					Alcohol Consumption(Present): {new_lines_to_br(patient.alcohol_current_use)}
				"""
			
			other_tests = []
			for recording in ip_record.other_tests:
				test = frappe.get_doc("Lab Test", recording.lab_test)
				other_tests.append(
					f"<strong>{test.template} ({frappe.format(test.result_date, { 'fieldtype': 'Date'})})</strong>: {sanitize(test.custom_result) if test.custom_result else '---'}"
				)

			diagnosis = f'<strong>{(" with ".join(map(lambda x: x.diagnosis, ip_record.diagnosis)) if len(ip_record.diagnosis) else "")}</strong><br>'

			for test in other_tests:
				diagnosis += f"{test}<br>"
			
			data.append({
				"name": patient.patient_name,
				"abssby_no": patient.abssby or "NO",
				"age_sex": f"{patient.age.years}/{patient.sex}",
				"ipd_no": ip_record.cr_number if ip_record else "",
				"diagnosis": (" with ".join(map(lambda x: x.diagnosis, ip_record.diagnosis)) if ip_record and len(ip_record.diagnosis) else ""),
				"operations": item.procedure_template,
				"formatted": {
					"name": name,
					"abssby_no": patient.abssby or "NO",
					"age_sex": f"{patient.age.years}/{abbreviate_sex(patient.sex)}",
					"ipd_no": ip_record.cr_number if ip_record else "", 
					"diagnosis": diagnosis,
					"operations": operation,
				}
			})
		else:
			data.append({
				"name": patient.patient_name,
				"abssby_no": patient.abssby or "NO",
				"age_sex": f"{patient.age.years}/{patient.sex}",
				"ipd_no": "",
				"diagnosis": "",
				"operations": item.procedure_template,
				"formatted": {
					"name": patient.patient_name,
					"abssby_no": patient.abssby or "NO",
					"age_sex": f"{patient.age.years}/{abbreviate_sex(patient.sex)}",
					"ipd_no": "", 
					"diagnosis": "",
					"operations": operation,
				}
			})

	return columns, data, filters

def new_lines_to_br(str):
	return str.replace("\n", "<br>")

def sanitize(str):
	soup = BeautifulSoup(str, "html.parser")
	return soup.get_text()

def abbreviate_sex(str):
	return "".join(map(lambda x: x[0], filter(lambda x: x, str.split()))).upper()
