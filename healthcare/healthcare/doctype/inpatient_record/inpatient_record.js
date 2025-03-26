// Copyright (c) 2018, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.provide("healthcare")

frappe.ui.form.on('Inpatient Record', {
	refresh: async function(frm) {
		if (!frm.doc.admission_service_unit_type) {
			frm.doc.admission_service_unit_type = await healthcare.utils.get_default_service_unit_type()
			frm.refresh_field("admission_service_unit_type")
		}

		if (!frm.doc.admission_service_unit) {
			frm.doc.admission_service_unit = await healthcare.utils.get_default_service_unit()
			frm.refresh_field("admission_service_unit")
		}

		if (!frm.doc.medical_department) {
			frm.doc.medical_department = await healthcare.utils.get_default_department()
			frm.refresh_field("medical_department")
		}

		frm.set_query('primary_practitioner', function() {
			return {
				filters: {
					'department': frm.doc.medical_department
				}
			};
		});

		if (!frm.doc.__islocal) {
			if (frm.doc.status == 'Admitted') {
				frm.add_custom_button(__('Schedule Discharge'), function() {
					schedule_discharge(frm);
				});
			} else if (frm.doc.status == 'Admission Scheduled') {
				frm.add_custom_button(__('Cancel Admission'), function() {
					cancel_ip_order(frm)
				})
				frm.add_custom_button(__('Admit'), function() {
					admit_patient_dialog(frm);
				} );
			} else if (frm.doc.status == 'Discharge Scheduled') {
				frm.add_custom_button(__('Discharge'), function() {
					discharge_patient(frm);
				} );
			}	
		}

		frm.add_custom_button(__("Clinical Note"), function() {
			frappe.route_options = {
				"patient": frm.doc.patient,
				"reference_doc": "Inpatient Record",
				"reference_name": frm.doc.name}
					frappe.new_doc("Clinical Note");
		},__('Create'));

		disable_direct_table_editing("procedures_section")
		disable_direct_table_editing("blood_tests_section")
		disable_direct_table_editing("biopsies_section")
		disable_direct_table_editing("other_tests_section")
	},
	procedure_prescription_on_form_rendered: function() {
		disable_direct_table_editing("procedures_section")
	},
	blood_tests_on_form_rendered: function() {
		disable_direct_table_editing("blood_tests_section")
	},
	biopsies_on_form_rendered: function() {
		disable_direct_table_editing("biopsies_section")
	},
	other_tests_on_form_rendered: function() {
		disable_direct_table_editing("other_tests_section")
	},
	btn_transfer: function(frm) {
		transfer_patient_dialog(frm);
	},
	medico_legal_case: function(frm) {
		if (frm.doc.medico_legal_case === 0) {
			frm.set_value("mlr_number", "")
		}
	},
	btn_add_procedure: function(frm) {
		add_procedure_dialog(frm)
	},
	btn_add_blood_test(frm) {
		add_test_dialog(frm, 'blood_tests')
	},
	btn_add_biopsy(frm) {
		add_test_dialog(frm, 'biopsies')
	},
	btn_add_other_test(frm) {
		add_test_dialog(frm, 'other_tests')
	},
	async btn_book_followup(frm) {
		frappe.new_doc(
			"Patient Appointment",
			{
				department: await healthcare.utils.get_default_department(),
				service_unit: await healthcare.utils.get_default_service_unit(),
				patient: frm.doc.patient,
			},
		)
	},
    async patient(frm) {
    	if (!frm.doc.patient) {
			return
    	}

        const patient = await frappe.db.get_doc(
        	'Patient',
        	null,
        	{
        		uid: frm.doc.uid,
        	}
        );

        if (!patient) {
			return;
        }

		const fields = [
			"occupation",
			"marital_status",
			"allergies",
			"medical_history",
			"medication",
			"surgical_history",
			"tobacco_past_use",
			"tobacco_current_use",
			"alcohol_past_use",
			"alcohol_current_use",
			"surrounding_factors",
			"other_risk_factors",
		];

		frm.doc.occupation = patient.occupation
		frm.doc.marital_status = patient.marital_status
		frm.doc.allergies = patient.allergies
		frm.doc.medical_history = patient.medical_history
		frm.doc.medication = patient.medication
		frm.doc.surgical_history = patient.surgical_history
		frm.doc.tobacco_past_use = patient.tobacco_past_use
		frm.doc.tobacco_current_use = patient.tobacco_current_use
		frm.doc.alcohol_past_use = patient.alcohol_past_use
		frm.doc.alcohol_current_use = patient.alcohol_current_use
		frm.doc.surrounding_factors = patient.surrounding_factors
		frm.doc.other_risk_factors = patient.other_risk_factors

		for (const field of fields) {
        	frm.refresh_field(field);
		}
    },
});

async function add_procedure_dialog(frm){
	const dialog = new frappe.ui.Dialog({
		title: "Add Procedure",
		width: 100,
		fields: [
			{
				fieldtype: 'Link',
				label: 'Clinical Procedure',
				fieldname: 'clinical_procedure_template',
				options: 'Clinical Procedure Template',
				reqd: 1,
			},
			{
				fieldtype: 'Date',
				label: 'Start Date',
				fieldname: 'start_date',
			},
			{
				fieldtype: 'Time',
				label: 'Start Time',
				fieldname: 'start_time',
			},
			{
				fieldtype: 'Link',
				label: 'Healthcare Practitioner',
				options: 'Healthcare Practitioner',
				fieldname: 'practitioner',
			},
			{
				fieldtype: 'Link',
				label: 'Operating Team',
				options: 'Operating Team',
				fieldname: 'team',
			},
			{
				fieldtype: 'Link',
				label: 'Scrub Nurse',
				options: 'Healthcare Practitioner',
				fieldname: 'scrub_nurse',
			},
			{
				fieldtype: 'Link',
				label: 'Anesthesia Type',
				options: 'Anesthesia Type',
				fieldname: 'anesthesia_type',
			},
		],
		primary_action: function() {
			const row = frappe.model.add_child(frm.doc, 'Procedure Prescription', 'procedure_prescription');
			row.procedure = dialog.get_value('clinical_procedure_template');
			row.team = dialog.get_value('team');
			row.healthcare_practitioner = dialog.get_value('practitioner');
			row.scrub_nurse = dialog.get_value('scrub_nurse');
			row.date = dialog.get_value('start_date');
			row.time = dialog.get_value('start_time');
			row.anesthesia_type = dialog.get_value('anesthesia_type');

			frm.refresh_field('procedure_prescription');

			dialog.hide();
		},
	});

	dialog.show();
}

let discharge_patient = function(frm) {
	frappe.call({
		doc: frm.doc,
		method: 'discharge',
		callback: function(data) {
			if (!data.exc) {
				frm.reload_doc();
			}
		},
		freeze: true,
		freeze_message: __('Processing Inpatient Discharge')
	});
};

let admit_patient_dialog = async function(frm) {
	const default_service_unit = await healthcare.utils.get_default_service_unit()

	let dialog = new frappe.ui.Dialog({
		title: 'Admit Patient',
		width: 100,
		fields: [
			{fieldtype: 'Link', label: 'Service Unit Type', fieldname: 'service_unit_type',
				options: 'Healthcare Service Unit Type', default: frm.doc.admission_service_unit_type
			},
			{fieldtype: 'Link', label: 'Service Unit', fieldname: 'service_unit',
				options: 'Healthcare Service Unit', reqd: 1, default: default_service_unit,
			},
			{fieldtype: 'Datetime', label: 'Admission Datetime', fieldname: 'check_in',
				reqd: 1, default: frappe.datetime.now_datetime()
			},
		],
		primary_action_label: __('Admit'),
		primary_action : function(){
			let service_unit = dialog.get_value('service_unit');
			let check_in = dialog.get_value('check_in');
			let expected_discharge = null;
			if (dialog.get_value('expected_discharge')) {
				expected_discharge = dialog.get_value('expected_discharge');
			}
			if (!service_unit && !check_in) {
				return;
			}
			frappe.call({
				doc: frm.doc,
				method: 'admit',
				args:{
					'service_unit': service_unit,
					'check_in': check_in,
					'expected_discharge': expected_discharge
				},
				callback: function(data) {
					if (!data.exc) {
						frm.reload_doc();
					}
				},
				freeze: true,
				freeze_message: __('Processing Patient Admission')
			});
			frm.refresh_fields();
			dialog.hide();
		}
	});

	dialog.show();
};

let transfer_patient_dialog = function(frm) {
	let dialog = new frappe.ui.Dialog({
		title: 'Transfer Patient',
		width: 100,
		fields: [
			{fieldtype: 'Link', label: 'Leave From', fieldname: 'leave_from', options: 'Healthcare Service Unit', reqd: 1, read_only:1},
			{fieldtype: 'Link', label: 'Service Unit Type', fieldname: 'service_unit_type', options: 'Healthcare Service Unit Type'},
			{fieldtype: 'Link', label: 'Transfer To', fieldname: 'service_unit', options: 'Healthcare Service Unit', reqd: 1},
			{fieldtype: 'Datetime', label: 'Check In', fieldname: 'check_in', reqd: 1, default: frappe.datetime.now_datetime()}
		],
		primary_action_label: __('Transfer'),
		primary_action : function() {
			let service_unit = null;
			let check_in = dialog.get_value('check_in');
			let leave_from = null;
			if(dialog.get_value('leave_from')){
				leave_from = dialog.get_value('leave_from');
			}
			if(dialog.get_value('service_unit')){
				service_unit = dialog.get_value('service_unit');
			}
			if(check_in > frappe.datetime.now_datetime()){
				frappe.msgprint({
					title: __('Not Allowed'),
					message: __('Check-in time cannot be greater than the current time'),
					indicator: 'red'
				});
				return;
			}
			frappe.call({
				doc: frm.doc,
				method: 'transfer',
				args:{
					'service_unit': service_unit,
					'check_in': check_in,
					'leave_from': leave_from
				},
				callback: function(data) {
					if (!data.exc) {
						frm.reload_doc();
					}
				},
				freeze: true,
				freeze_message: __('Process Transfer')
			});
			frm.refresh_fields();
			dialog.hide();
		}
	});

	dialog.fields_dict['leave_from'].get_query = function(){
		return {
			query : 'healthcare.healthcare.doctype.inpatient_record.inpatient_record.get_leave_from',
			filters: {docname:frm.doc.name}
		};
	};
	dialog.fields_dict['service_unit_type'].get_query = function(){
		return {
			filters: {
				'inpatient_occupancy': 1,
				'allow_appointments': 0
			}
		};
	};
	dialog.fields_dict['service_unit'].get_query = function(){
		return {
			filters: {
				'is_group': 0,
				'service_unit_type': dialog.get_value('service_unit_type'),
				'occupancy_status' : 'Vacant'
			}
		};
	};

	dialog.show();

	let not_left_service_unit = null;
	for (let inpatient_occupancy in frm.doc.inpatient_occupancies) {
		if (frm.doc.inpatient_occupancies[inpatient_occupancy].left != 1) {
			not_left_service_unit = frm.doc.inpatient_occupancies[inpatient_occupancy].service_unit;
		}
	}
	dialog.set_values({
		'leave_from': not_left_service_unit
	});
};

var schedule_discharge = function(frm) {
	var dialog = new frappe.ui.Dialog ({
		title: 'Inpatient Discharge',
		size: 'extra-large',
		fields: [
			{
				fieldtype: 'Link',
				label: 'File Duty',
				fieldname: 'discharge_practitioner',
				options: 'Healthcare Practitioner'
			},
			{
				fieldtype: 'Datetime',
				label: 'Date Of Discharge',
				fieldname: 'discharge_ordered_datetime',
				default: frappe.datetime.now_datetime()
			},
			{
				fieldtype: 'Date',
				label: 'Followup Date',
				fieldname: 'followup_date'
			},
			{
				fieldtype: 'Section Break'
			},
			{
				fieldtype: 'Table',
				label: 'Discharge Medications',
				fieldname: 'discharge_medications',
				cannot_add_rows: false,
        		in_place_edit: true,
				fields: [
					{
						fieldtype: 'Data',
						label: 'Drug Name',
						fieldname: 'drug_name',
						in_list_view: 1,
						reqd: 1,
					},
					{
						fieldtype: 'Link',
						label: 'Dosage',
						fieldname: 'dosage',
						options: 'Prescription Dosage',
						in_list_view: 1,
						reqd: 1,
					},
					{
						fieldtype: 'Link',
						label: 'Period',
						fieldname: 'period',
						options: 'Prescription Duration',
						in_list_view: 1,
						reqd: 1,
					}
				],
			},
			{
				fieldtype: 'Text',
				label: 'Discharge Instructions',
				fieldname: 'discharge_instructions'
			},
			{
				fieldtype: 'Section Break',
				label:'Discharge Summary'
			},
			{
				fieldtype: 'Long Text',
				label: 'Discharge Note',
				fieldname: 'discharge_note'
			},
		],
		primary_action_label: __('Order Discharge'),
		primary_action : function() {
			var args = {
				patient: frm.doc.patient,
				discharge_practitioner: dialog.get_value('discharge_practitioner'),
				discharge_ordered_datetime: dialog.get_value('discharge_ordered_datetime'),
				followup_date: dialog.get_value('followup_date'),
				discharge_instructions: dialog.get_value('discharge_instructions'),
				discharge_note: dialog.get_value('discharge_note'),
				discharge_medications: dialog.get_value('discharge_medications'),
			}
			frappe.call ({
				method: 'healthcare.healthcare.doctype.inpatient_record.inpatient_record.schedule_discharge',
				args: {args},
				callback: function(data) {
					if(!data.exc){
						frm.reload_doc();
					}
				},
				freeze: true,
				freeze_message: 'Scheduling Inpatient Discharge'
			});
			frm.refresh_fields();
			dialog.hide();
		}
	});

	dialog.show();
	dialog.$wrapper.find('.modal-dialog').css('width', '800px');
};

let cancel_ip_order = function(frm) {
	frappe.prompt([
		{
			fieldname: 'reason_for_cancellation',
			label: __('Reason for Cancellation'),
			fieldtype: 'Small Text',
			reqd: 1
		}
	],
	function(data) {
		frappe.call({
			method: 'healthcare.healthcare.doctype.inpatient_record.inpatient_record.set_ip_order_cancelled',
			async: false,
			freeze: true,
			args: {
				inpatient_record: frm.doc.name,
				reason: data.reason_for_cancellation
			},
			callback: function(r) {
				if (!r.exc) frm.reload_doc();
			}
		});
	}, __('Reason for Cancellation'), __('Submit'));
}

function add_test_dialog(frm, fieldname) {
	const dialog = new frappe.ui.Dialog({
		title: "Add Test",
		width: 100,
		fields: [
			{
				fieldtype: 'Link',
				label: 'Test Type',
				fieldname: 'template',
				options: 'Lab Test Template',
				reqd: 1,
			},
		],
		primary_action_label: 'Add',
		primary_action: async function() {
			const template = dialog.get_value('template')

			try {
				const result = await frappe.call({
					method: 'healthcare.healthcare.doctype.inpatient_record.inpatient_record.create_lab_test_from_inpatient_record',
					args: {
						record_name: frm.doc.name,
						template_name: template,
					},
					freeze: true,
					freeze_message: 'Creating Lab Test'
				});


				const row = frappe.model.add_child(frm.doc, 'Lab Test Recording', fieldname);
				row.inpatient_record = frm.doc.name
				row.lab_test = result.message.name

				frm.refresh_field(fieldname);
				await frm.save()

				frappe.set_route(['Form', 'Lab Test', result.message.name])

				dialog.hide()
			} catch (error) {
				console.error(error)		

				dialog.hide()
			}
		},
	});

	dialog.show()
}

function disable_direct_table_editing(section_fieldname, class_hide_list) {
	const wrapper = document.querySelector(`div[data-fieldname="${section_fieldname}"]`)

	// Hide the unwanted buttons in the popup and table
	const elements = class_hide_list || [
		'.grid-insert-row-below',
		'.grid-insert-row',
		'.grid-append-row',
		'.grid-duplicate-row',
		'.grid-add-row',
	] 

	if (wrapper) {
		for (const el of elements) {
			const htmlEls = wrapper.querySelectorAll(el)
			for (const htmlEl of htmlEls) {
				if (htmlEl) {
					htmlEl.style.display = 'none'
				}
			}
		}
	}
}

function cleanup_blood_tests_table() {
	const wrapper = document.querySelector('div[data-fieldname="blood_tests_section"]')

	// Hide the unwanted buttons in the popup and table
	const elements = [
		'.grid-insert-row-below',
		'.grid-insert-row',
		'.grid-append-row',
		'.grid-duplicate-row',
		'.grid-add-row',
	] 

	if (wrapper) {
		for (const el of elements) {
			const htmlEls = wrapper.querySelectorAll(el)
			for (const htmlEl of htmlEls) {
				if (htmlEl) {
					htmlEl.style.display = 'none'
				}
			}
		}
	}
}

