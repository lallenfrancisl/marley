frappe.provide("healthcare")

healthcare.utils = {
	async get_default_service_unit() {
		return frappe.db.get_single_value("Healthcare Settings", "default_service_unit")
	},

	async get_default_department() { 
		return frappe.db.get_single_value("Healthcare Settings", "default_department")
	},

	async get_default_service_unit_type() {
		return frappe.db.get_single_value("Healthcare Settings", "default_service_unit_type")
	}
}

