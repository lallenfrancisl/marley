frappe.listview_settings["Patient"] = {
    refresh: function () {
        // Hide name filter from Listview
        $("div[data-fieldname = name]").hide();

        $("div.level-right").each(function() {
            $(this).hide();
        })

        // Add color to the inpatient status badges too
        $(
            'span[data-filter="inpatient_status,=,Admitted"]',
        ).each(function () {
            $(this).removeClass("gray").addClass("blue");
        });

        $(
            'span[data-filter="inpatient_status,=,Discharged"],span[data-filter="inpatient_status,=,Recovered"]'
        ).each(function () {
            $(this).removeClass("gray").addClass("green");
        });
 
        $('span[data-filter="inpatient_status,=,Discharge Scheduled"]').each(function () {
            $(this).removeClass("gray").addClass("orange");
        });

        $('span[data-filter="inpatient_status,=,Admission Scheduled"]').each(function () {
            $(this).removeClass("gray").addClass("red");
        });
    },
    // Hide name from Listview
    hide_name_column: true,
};
