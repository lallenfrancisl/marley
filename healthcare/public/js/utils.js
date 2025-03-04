frappe.provide("healthcare")

healthcare.utils = {

async get_default_service_unit() {
	try {
		const unit = await frappe.db.get_doc(
			'Healthcare Service Unit',
			null,
			{
				healthcare_service_unit_name: 'Unit 1',
			}
		)

		return unit?.name || null
	} catch {
		return null	
	}
},

 get_default_department() { 
    return "General and Minimal Access Surgery" 
},
}

