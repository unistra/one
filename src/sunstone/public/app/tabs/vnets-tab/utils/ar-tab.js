define(function(require) {
  // Dependencies
  var Locale = require('utils/locale');
  var Tips = require('utils/tips');
  var CustomTags = require('utils/form-panels/custom-tags');
  var WizardFields = require('utils/wizard-fields');
  var SecurityGroupsTable = require('tabs/secgroups-tab/datatable');

  var TemplateHTML = require('hbs!./ar-tab');

  function ArTab() {
    return this;
  }

  ArTab.prototype = {
    'html': _generate_ar_tab_content,
    'setup': _setup_ar_tab_content,
    'onShow': _onShow,
    'fill': _fill_ar_tab_data,
    'retrieve': _retrieve_ar_tab_data
  };

  return ArTab;

  function _generate_ar_tab_content(str_ar_tab_id){
    var opts = {
      info: false,
      select: true,
      selectOptions: {"multiple_choice": true}
    };

    this.securityGroupsTable = new SecurityGroupsTable(str_ar_tab_id, opts);

    return TemplateHTML({
          'str_ar_tab_id': str_ar_tab_id,
          'customTagsHTML': CustomTags.html(),
          'securityGroupsTableHTML': this.securityGroupsTable.dataTableHTML
        });
  }

  function _setup_ar_tab_content(ar_section, str_ar_tab_id) {

    this.ar_section = ar_section;

    $('input[name$="ar_type"]',ar_section).change(function(){
      $('div.ar_input', ar_section).hide();

      $('input[wizard_field="IP"]',ar_section).removeAttr('required');

      switch($(this).val()){
      case "IP4":
        $('div.type_ip4', ar_section).show();
        $('input[wizard_field="IP"]',ar_section).attr('required', '');

        break;
      case "IP4_6":
        $('div.type_ip4_6', ar_section).show();
        $('input[wizard_field="IP"]',ar_section).attr('required', '');

        break;
      case "IP6":
        $('div.type_ip6', ar_section).show();
        break;
      case "ETHER":
        $('div.type_ether', ar_section).show();
        break;
      }
    });

    $('input#'+str_ar_tab_id+'_ar_type_ip4',ar_section).prop('checked', true);
    $('input#'+str_ar_tab_id+'_ar_type_ip4',ar_section).change();

    CustomTags.setup($('#'+str_ar_tab_id+'_custom_tags',ar_section));

    this.securityGroupsTable.initialize();

    Tips.setup(ar_section);
  }

  function _onShow(){
    this.securityGroupsTable.refreshResourceTableSelect();
  }

  function _retrieve_ar_tab_data(){
    var data  = {};

    var ar_type = $('input[name$="ar_type"]:checked',this.ar_section).val();

    var fields = [];

    switch(ar_type){
      case "IP4":
        fields = $('div.type_ip4', this.ar_section).children("input");
        break;
      case "IP4_6":
        fields = $('div.type_ip4_6', this.ar_section).children("input");
        break;
      case "IP6":
        fields = $('div.type_ip6', this.ar_section).children("input");
        break;
      case "ETHER":
        fields = $('div.type_ether', this.ar_section).children("input");
        break;
    }

    fields.each(function(){
      var field=$(this);

      if (field.val() != null && field.val().length){ //if has a length
        data[field.attr('name')] = field.val();
      }

    });

    if (!$.isEmptyObject(data)) {
      data["TYPE"] = ar_type;
    }

    $.extend(data, CustomTags.retrieve(this.ar_section));

    var str_ar_tab_id = $('div[name="str_ar_tab_id"]', this.ar_section).attr("str_ar_tab_id");

    var secgroups = this.securityGroupsTable.retrieveResourceTableSelect();
    if (secgroups != undefined && secgroups.length != 0){
      data["SECURITY_GROUPS"] = secgroups.join(",");
    }

    return data;
  }

  function _fill_ar_tab_data(ar_json){
    WizardFields.fill(this.ar_section, ar_json);

    var fields = $('[wizard_field]',this.ar_section);

    fields.each(function(){
      var field = $(this);
      var field_name = field.attr('wizard_field');

      // Delete so these attributes don't end in the custom tags table also
      delete ar_json[field_name];
    });

    delete ar_json["AR_ID"];
    delete ar_json["USED_LEASES"];
    delete ar_json["LEASES"];
    delete ar_json["MAC_END"];
    delete ar_json["IP_END"];
    delete ar_json["IP6_ULA"];
    delete ar_json["IP6_ULA_END"];
    delete ar_json["IP6_GLOBAL"];
    delete ar_json["IP6_GLOBAL_END"];

    if (ar_json["SECURITY_GROUPS"] != undefined &&
        ar_json["SECURITY_GROUPS"].length != 0){

      var secgroups = ar_json["SECURITY_GROUPS"].split(",");

      this.securityGroupsTable.selectResourceTableSelect({ids: secgroups});
    }

    delete ar_json["SECURITY_GROUPS"];

    CustomTags.fill(this.ar_section, ar_json);

    $('input[name$="ar_type"]',this.ar_section).prop("disabled", true);
    $('input[wizard_field="IP"]',this.ar_section).prop("disabled", true);
    $('input[wizard_field="MAC"]',this.ar_section).prop("disabled", true);
  }
});