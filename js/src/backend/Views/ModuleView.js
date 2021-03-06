//KB.Backbone.Backend.ModuleView
var ModuleControlsView = require('backend/Views/ModuleControls/ControlsView');
var ModuleUiView = require('backend/Views/ModuleUi/ModuleUiView');
var ModuleStatusBarView = require('shared/ModuleStatusBar/ModuleStatusBarView');
var DeleteControl = require('backend/Views/ModuleControls/controls/DeleteControl');
var DuplicateControl = require('backend/Views/ModuleControls/controls/DuplicateControl');
var SaveControl = require('backend/Views/ModuleControls/controls/SaveControl');
var StatusControl = require('backend/Views/ModuleControls/controls/StatusControl');
var MoveControl = require('backend/Views/ModuleUi/controls/MoveControl');
var ToggleControl = require('backend/Views/ModuleUi/controls/ToggleControl');
var FullscreenControl = require('backend/Views/ModuleUi/controls/FullscreenControl');
var DisabledControl = require('backend/Views/ModuleUi/controls/DisabledControl');
var DraftStatus = require('shared/ModuleStatusBar/status/DraftStatus');
var OriginalNameStatus = require('shared/ModuleStatusBar/status/OriginalNameStatus');
var SettingsStatus = require('shared/ModuleStatusBar/status/SettingsStatus');
var LoggedInStatus = require('shared/ModuleStatusBar/status/LoggedInStatus');
var TemplatesStatus = require('shared/ModuleStatusBar/status/TemplateStatus');
var TemplatesEditorStatus = require('shared/ModuleStatusBar/status/TemplateEditorStatus');


var Checks = require('common/Checks');
var Ajax = require('common/Ajax');
var UI = require('common/UI');
var Config = require('common/Config');
var Payload = require('common/Payload');
module.exports = Backbone.View.extend({
  $head: {}, // header jQuery element
  $body: {}, // module inner jQuery element
  ModuleMenu: {}, // Module action like delete, hide etc...
  instanceId: '',
  events: {
    // show/hide module inner
    // actual module actions are outsourced to individual files
    'mouseenter': 'setFocusedModule',
    'change .kb-template-select': 'viewfileChange',
    'tinymce.change': 'handleChange'

  },
  setFocusedModule: function () {
    KB.focusedModule = this.model;
  },
  handleChange: function () {
    this.trigger('kb::module.input.changed', this);
  },
  viewfileChange: function (e) {
    var $select = jQuery(e.currentTarget);
    this.model.set('viewfile', $select.val());
    this.clearFields();
    this.updateModuleForm();
    this.trigger('KB::backend.module.viewfile.changed');
  },
  initialize: function () {
    // Setup Elements
    this.open = false;
    if (this.model.get('globalModule') === true) {
      this.open = true;
    }
    this.$head = jQuery('.kb-module__header', this.$el);
    this.$body = jQuery('.kb-module__body', this.$el);
    this.$inner = jQuery('.kb-module__controls-inner', this.$el);
    this.$innerForm = jQuery('.kb-module__controls-inner-form', this.$el);
    this.attachedFields = {};
    this.instanceId = this.model.get('mid');
    // create new module actions menu
    this.ModuleMenu = new ModuleControlsView({
      el: this.$el,
      parent: this
    });

    this.ModuleUi = new ModuleUiView({
      el: this.$el,
      parent: this
    });

    this.ModuleStatusBar = new ModuleStatusBarView({
      el: this.$el,
      parent: this
    });


    // set view on model for later reference
    this.model.connectView(this);
    // Setup View
    this.setupDefaultMenuItems();
    this.setupDefaultUiItems();
    this.setupDefaultStatusItems();

    KB.Views.Modules.on('kb.modules.view.deleted', function (view) {
      view.$el.fadeOut(500, function () {
        view.$el.remove();
      });
    });

    this.$('.kb-template-select').select2({
      width:200,
      templateResult: function (state) {
        if (!state.id) {
          return state.text;
        }
        var desc = state.element.dataset.tpldesc;
        return jQuery(
          '<span>' + state.text + '<br><span class="kb-tpl-desc">' + desc + '</span></span>'
        );
      }
    });
  },
  // setup default actions for modules
  // duplicate | delete | change active status
  setupDefaultMenuItems: function () {
    // actual action is handled by individual files
    this.ModuleMenu.addItem(new SaveControl({model: this.model, parent: this}));
    this.ModuleMenu.addItem(new DuplicateControl({model: this.model, parent: this}));
    this.ModuleMenu.addItem(new DeleteControl({model: this.model, parent: this}));
    this.ModuleMenu.addItem(new StatusControl({model: this.model, parent: this}));
    this.trigger('module.view.setup.menu', this.ModuleMenu, this.model, this);
  },
  setupDefaultUiItems: function () {
    this.ModuleUi.addItem(new MoveControl({model: this.model, parent: this}));
    this.ModuleUi.addItem(new ToggleControl({model: this.model, parent: this}));
    this.ModuleUi.addItem(new FullscreenControl({model: this.model, parent: this}));
    this.ModuleUi.addItem(new DisabledControl({model: this.model, parent: this}));
    this.trigger('module.view.setup.ui', this.ModuleUi, this.model, this);
  },
  setupDefaultStatusItems: function () {
    this.ModuleStatusBar.addItem(new SettingsStatus({model: this.model, parent: this}));
    this.ModuleStatusBar.addItem(new DraftStatus({model: this.model, parent: this}));
    this.ModuleStatusBar.addItem(new OriginalNameStatus({model: this.model, parent: this}));
    this.ModuleStatusBar.addItem(new LoggedInStatus({model: this.model, parent: this}));
    this.ModuleStatusBar.addItem(new TemplatesStatus({model: this.model, parent: this}));
    this.ModuleStatusBar.addItem(new TemplatesEditorStatus({model: this.model, parent: this}));
  },
  // get called when a module was dragged to a different area / area context
  updateModuleForm: function () {
    Ajax.send({
      action: 'afterAreaChange',
      module: this.model.toJSON(),
      _ajax_nonce: Config.getNonce('read')
    }, this.insertNewUpdateForm, this);
  },
  insertNewUpdateForm: function (response) {
    if (response.success) {
      this.$innerForm.html(response.data.html);
    } else {
      this.$innerForm.html('empty');
    }
    if (response.data.json.Fields) {
      KB.payload.Fields = _.extend(Payload.getPayload('Fields'), response.data.json.Fields);
      KB.payload.fieldData = _.extend(Payload.getPayload('fieldData'), response.data.json.fieldData);
      KB.FieldControls.add(_.toArray(KB.payload.Fields));
    }
    // re-init UI listeners
    UI.repaint(this.$el);
    KB.Fields.trigger('update');
    this.trigger('kb:backend::viewUpdated');
    this.model.trigger('after.change.area');
  },
  serialize: function () {
    var formData, entityData;
    formData = jQuery('#post').serializeJSON();
    entityData = formData[this.model.get('mid')];
    // remove supplemental data
    // @TODO check if this can be rafcatored to a subarray
    delete entityData.areaContext;
    //delete entityData.viewfile;
    this.trigger('kb::module.data.updated');
    return entityData;
  },
  // deprecated
  // -------------------------------------
  addField: function (key, obj, arrayKey) {
    if (!_.isEmpty(arrayKey)) {
      this.attachedFields[arrayKey][key] = obj;
    } else {
      this.attachedFields[key] = obj;
    }
  },
  hasField: function (key, arrayKey) {
    if (!_.isEmpty(arrayKey)) {
      if (!this.attachedFields[arrayKey]) {
        this.attachedFields[arrayKey] = {};
      }
      return key in this.attachedFields[arrayKey];
    } else {
      return key in this.attachedFields;
    }

  },
  getField: function (key, arrayKey) {
    if (!_.isEmpty(arrayKey)) {
      return this.attachedFields[arrayKey][key];
    } else {
      return this.attachedFields[key];
    }
  },
  clearFields: function () {
    this.attachedFields = {};
  },
  dispose: function () {

  },
  getDirty: function () {

  },
  getClean: function () {

  },
  isOpen: function () {
    return this.open;
  }
});