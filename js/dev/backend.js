/*! Kontentblocks DevVersion 2015-02-19 */
KB.Backbone.AreaModel = Backbone.Model.extend({
    idAttribute: "id"
});

KB.Backbone.ContextModel = Backbone.Model.extend({
    idAttribute: "id"
});

KB.Backbone.ModuleDefinition = Backbone.Model.extend({
    initialize: function() {
        var that = this;
        this.id = function() {
            if (that.get("settings").category === "template") {
                return that.get("instance_id");
            } else {
                return that.get("settings").class;
            }
        }();
    }
});

KB.Backbone.ModuleModel = Backbone.Model.extend({
    idAttribute: "mid",
    initialize: function() {
        this.listenToOnce(this, "change:envVars", this.subscribeToArea);
        this.listenTo(this, "change:envVars", this.areaChanged);
        this.subscribeToArea();
    },
    destroy: function() {
        this.unsubscribeFromArea();
        this.stopListening();
    },
    setArea: function(area) {
        this.setEnvVar("area", area);
    },
    areaChanged: function() {
        this.View.updateModuleForm();
    },
    subscribeToArea: function(AreaModel) {
        if (!AreaModel) {
            AreaModel = KB.Areas.get(this.get("area"));
        }
        AreaModel.View.attachModuleView(this);
        this.Area = AreaModel;
    },
    unsubscribeFromArea: function() {
        this.Area.View.removeModule(this);
    },
    setEnvVar: function(attr, value) {
        var ev = _.clone(this.get("envVars"));
        ev[attr] = value;
        this.set("envVars", ev);
    }
});

KB.Backbone.Backend.AreaView = Backbone.View.extend({
    initialize: function() {
        this.attachedModuleViews = {};
        this.controlsContainer = jQuery(".add-modules", this.$el);
        this.settingsContainer = jQuery(".kb-area-settings-wrapper", this.$el);
        this.modulesList = jQuery("#" + this.model.get("id"), this.$el);
        this.$placeholder = jQuery(KB.Templates.render("backend/area-item-placeholder", {
            i18n: KB.i18n
        }));
        this.model.View = this;
        this.listenTo(this, "module:attached", this.ui);
        this.listenTo(this, "module:dettached", this.ui);
        this.render();
    },
    events: {
        "click .modules-link": "openModuleBrowser",
        "click .js-area-settings-opener": "toggleSettings",
        mouseenter: "setActive"
    },
    render: function() {
        this.addControls();
        this.ui();
    },
    addControls: function() {
        this.controlsContainer.append(KB.Templates.render("backend/area-add-module", {
            i18n: KB.i18n
        }));
    },
    openModuleBrowser: function(e) {
        e.preventDefault();
        if (!this.ModuleBrowser) {
            this.ModuleBrowser = new KB.Backbone.ModuleBrowser({
                area: this
            });
        }
        this.ModuleBrowser.render();
    },
    toggleSettings: function(e) {
        e.preventDefault();
        this.settingsContainer.slideToggle().toggleClass("open");
        KB.currentArea = this.model;
    },
    setActive: function() {
        KB.currentArea = this.model;
    },
    attachModuleView: function(ModuleModel) {
        this.attachedModuleViews[ModuleModel.id] = ModuleModel.View;
        this.listenTo(ModuleModel, "change:area", this.removeModule);
        this.trigger("module:attached", ModuleModel);
    },
    removeModule: function(ModuleModel) {
        var id;
        id = ModuleModel.id;
        if (this.attachedModuleViews[id]) {
            delete this.attachedModuleViews[id];
            this.stopListening(ModuleModel, "change:area", this.removeModule);
        }
        this.trigger("module:dettached", ModuleModel);
    },
    ui: function() {
        var size;
        size = _.size(this.attachedModuleViews);
        if (size === 0) {
            this.renderPlaceholder();
        } else {
            this.$placeholder.remove();
        }
    },
    renderPlaceholder: function() {
        this.modulesList.before(this.$placeholder);
    }
});

KB.Backbone.Backend.ModuleControlsView = Backbone.View.extend({
    $menuWrap: {},
    $menuList: {},
    initialize: function() {
        this.$menuWrap = jQuery(".menu-wrap", this.$el);
        this.$menuWrap.append(KB.Templates.render("backend/module-menu", {}));
        this.$menuList = jQuery(".module-actions", this.$menuWrap);
    },
    addItem: function(view) {
        if (view.isValid && view.isValid() === true) {
            var $liItem = jQuery("<li></li>").appendTo(this.$menuList);
            var $menuItem = $liItem.append(view.el);
            this.$menuList.append($menuItem);
        }
    }
});

KB.Backbone.Backend.ModuleMenuItemView = Backbone.View.extend({
    tagName: "div",
    className: "",
    isValid: function() {
        return true;
    }
});

KB.Backbone.Backend.ModuleDelete = KB.Backbone.Backend.ModuleMenuItemView.extend({
    className: "kb-delete block-menu-icon",
    initialize: function() {
        _.bindAll(this, "yes", "no");
    },
    events: {
        click: "deleteModule"
    },
    deleteModule: function() {
        KB.Notice.confirm(KB.i18n.EditScreen.notices.confirmDeleteMsg, this.yes, this.no, this);
    },
    isValid: function() {
        if (!this.model.get("predefined") && !this.model.get("disabled") && KB.Checks.userCan("delete_kontentblocks")) {
            return true;
        } else {
            return false;
        }
    },
    yes: function() {
        KB.Ajax.send({
            action: "removeModules",
            _ajax_nonce: KB.Config.getNonce("delete"),
            module: this.model.get("instance_id")
        }, this.success, this);
    },
    no: function() {
        return false;
    },
    success: function(res) {
        if (res.success) {
            KB.Modules.remove(this.model);
            wp.heartbeat.interval("fast", 2);
            this.model.destroy();
        } else {
            KB.Notice.notice("Error while removing a module", "error");
        }
    }
});

KB.Backbone.Backend.ModuleDuplicate = KB.Backbone.Backend.ModuleMenuItemView.extend({
    className: "kb-duplicate block-menu-icon",
    events: {
        click: "duplicateModule"
    },
    duplicateModule: function() {
        KB.Ajax.send({
            action: "duplicateModule",
            module: this.model.get("mid"),
            areaContext: this.model.Area.get("context"),
            _ajax_nonce: KB.Config.getNonce("create"),
            "class": this.model.get("class")
        }, this.success, this);
    },
    isValid: function() {
        if (!this.model.get("predefined") && !this.model.get("disabled") && KB.Checks.userCan("edit_kontentblocks")) {
            return true;
        } else {
            return false;
        }
    },
    success: function(res) {
        var m;
        if (!res.success) {
            KB.Notice.notice("Request Error", "error");
            return false;
        }
        this.parseAdditionalJSON(res.data.json);
        this.model.Area.View.modulesList.append(res.data.html);
        var ModuleModel = KB.Modules.add(res.data.module);
        this.model.Area.View.attachModuleView(ModuleModel);
        KB.Notice.notice("Module Duplicated", "success");
        KB.Ui.repaint("#" + res.data.module.mid);
        KB.Fields.trigger("update");
    },
    parseAdditionalJSON: function(json) {
        if (!KB.payload.Fields) {
            KB.payload.Fields = {};
        }
        _.extend(KB.payload.Fields, json.Fields);
        if (!KB.payload.fieldData) {
            KB.payload.fieldData = {};
        }
        _.extend(KB.payload.fieldData, json.fieldData);
        KB.Payload.parseAdditionalJSON(json);
    }
});

KB.Backbone.Backend.ModuleSave = KB.Backbone.Backend.ModuleMenuItemView.extend({
    initialize: function(options) {
        this.options = options || {};
        this.parentView = options.parent;
        this.listenTo(this.parentView, "kb::module.input.changed", this.getDirty);
        this.listenTo(this.parentView, "kb::module.data.updated", this.getClean);
    },
    className: "kb-save block-menu-icon",
    events: {
        click: "saveData"
    },
    saveData: function() {
        tinyMCE.triggerSave();
        KB.Ajax.send({
            action: "updateModuleData",
            module: this.model.toJSON(),
            data: this.parentView.serialize(),
            _ajax_nonce: KB.Config.getNonce("update")
        }, this.success, this);
    },
    getDirty: function() {
        this.$el.addClass("is-dirty");
    },
    getClean: function() {
        this.$el.removeClass("is-dirty");
    },
    isValid: function() {
        if (this.model.get("master")) {
            return false;
        }
        return !this.model.get("disabled") && KB.Checks.userCan("edit_kontentblocks");
    },
    success: function(res) {
        if (!res || !res.data.newModuleData) {
            _K.error("Failed to save module data.");
        }
        this.parentView.model.set("moduleData", res.data.newModuleData);
        KB.Notice.notice("Data saved", "success");
    }
});

KB.Backbone.Backend.ModuleStatus = KB.Backbone.Backend.ModuleMenuItemView.extend({
    initialize: function(options) {
        this.options = options || {};
    },
    className: "module-status block-menu-icon",
    events: {
        click: "changeStatus"
    },
    changeStatus: function() {
        KB.Ajax.send({
            action: "changeModuleStatus",
            module: this.model.get("instance_id"),
            _ajax_nonce: KB.Config.getNonce("update")
        }, this.success, this);
    },
    isValid: function() {
        if (!this.model.get("disabled") && KB.Checks.userCan("deactivate_kontentblocks")) {
            return true;
        } else {
            return false;
        }
    },
    success: function() {
        this.options.parent.$head.toggleClass("module-inactive");
        this.options.parent.$el.toggleClass("activated deactivated");
        KB.Notice.notice("Status changed", "success");
    }
});

KB.Backbone.Backend.ModuleView = Backbone.View.extend({
    $head: {},
    $body: {},
    ModuleMenu: {},
    instanceId: "",
    events: {
        "click.kb1 .kb-toggle": "toggleBody",
        "click.kb2 .kb-toggle": "setOpenStatus",
        mouseenter: "setFocusedModule",
        dblclick: "fullscreen",
        "click .kb-fullscreen": "fullscreen",
        "change .kb-template-select": "viewfileChange",
        "change input,textarea,select": "handleChange",
        "tinymce.change": "handleChange"
    },
    setFocusedModule: function() {
        KB.focusedModule = this.model;
    },
    handleChange: function() {
        this.trigger("kb::module.input.changed", this);
    },
    viewfileChange: function(e) {
        this.model.set("viewfile", e.currentTarget.value);
        this.clearFields();
        this.updateModuleForm();
        this.trigger("KB::backend.module.viewfile.changed");
    },
    initialize: function() {
        this.$head = jQuery(".kb-module__header", this.$el);
        this.$body = jQuery(".kb-module__body", this.$el);
        this.$inner = jQuery(".kb-module__controls-inner", this.$el);
        this.attachedFields = {};
        this.instanceId = this.model.get("instance_id");
        this.ModuleMenu = new KB.Backbone.Backend.ModuleControlsView({
            el: this.$el,
            parent: this
        });
        if (store.get(this.instanceId + "_open")) {
            this.toggleBody();
            this.model.set("open", true);
        }
        this.model.View = this;
        this.setupDefaultMenuItems();
        KB.Views.Modules.on("kb.modules.view.deleted", function(view) {
            view.$el.fadeOut(500, function() {
                view.$el.remove();
            });
        });
    },
    setupDefaultMenuItems: function() {
        this.ModuleMenu.addItem(new KB.Backbone.Backend.ModuleSave({
            model: this.model,
            parent: this
        }));
        this.ModuleMenu.addItem(new KB.Backbone.Backend.ModuleDuplicate({
            model: this.model,
            parent: this
        }));
        this.ModuleMenu.addItem(new KB.Backbone.Backend.ModuleDelete({
            model: this.model,
            parent: this
        }));
        this.ModuleMenu.addItem(new KB.Backbone.Backend.ModuleStatus({
            model: this.model,
            parent: this
        }));
    },
    toggleBody: function(speed) {
        var duration = speed || 400;
        if (KB.Checks.userCan("edit_kontentblocks")) {
            this.$body.slideToggle(duration);
            this.$el.toggleClass("kb-open");
            KB.currentModule = this.model;
        }
    },
    setOpenStatus: function() {
        this.model.set("open", !this.model.get("open"));
        store.set(this.model.get("instance_id") + "_open", this.model.get("open"));
    },
    updateModuleForm: function() {
        KB.Ajax.send({
            action: "afterAreaChange",
            module: this.model.toJSON(),
            _ajax_nonce: KB.Config.getNonce("read")
        }, this.insertNewUpdateForm, this);
    },
    insertNewUpdateForm: function(response) {
        if (response.success) {
            this.$inner.html(response.data.html);
        } else {
            this.$inner.html("empty");
        }
        if (response.data.json.Fields) {
            KB.payload.Fields = _.extend(KB.payload.Fields, response.data.json.Fields);
        }
        KB.Ui.repaint(this.$el);
        KB.Fields.trigger("update");
        this.trigger("kb:backend::viewUpdated");
    },
    fullscreen: function() {
        var that = this;
        this.sizeTimer = null;
        var $stage = jQuery("#kontentblocks-core-ui");
        $stage.addClass("fullscreen");
        var $title = jQuery(".fullscreen--title-wrapper", $stage);
        var $description = jQuery(".fullscreen--description-wrapper", $stage);
        var titleVal = this.$el.find(".block-title").val();
        $title.empty().append("<span class='dashicon fullscreen--close'></span><h2>" + titleVal + "</h2>").show();
        $description.empty().append("<p class='description'>" + this.model.get("settings").description + "</p>").show();
        jQuery(".fullscreen--close").on("click", _.bind(this.closeFullscreen, this));
        this.$el.addClass("fullscreen-module");
        jQuery("#post-body").removeClass("columns-2").addClass("columns-1");
        if (!this.model.get("open")) {
            this.setOpenStatus();
            this.toggleBody();
        }
        this.sizeTimer = setInterval(function() {
            var h = jQuery(".kb-module__controls-inner", that.$el).height() + 150;
            $stage.height(h);
        }, 750);
    },
    closeFullscreen: function() {
        var $stage = jQuery("#kontentblocks-core-ui");
        $stage.removeClass("fullscreen");
        clearInterval(this.sizeTimer);
        this.$el.removeClass("fullscreen-module");
        jQuery("#post-body").removeClass("columns-1").addClass("columns-2");
        jQuery(".fullscreen--title-wrapper", $stage).hide();
        $stage.css("height", "100%");
    },
    serialize: function() {
        var formData, moduleData;
        formData = jQuery("#post").serializeJSON();
        moduleData = formData[this.model.get("instance_id")];
        delete moduleData.areaContext;
        delete moduleData.moduleName;
        this.trigger("kb::module.data.updated");
        return moduleData;
    },
    addField: function(key, obj, arrayKey) {
        if (!_.isEmpty(arrayKey)) {
            this.attachedFields[arrayKey][key] = obj;
        } else {
            this.attachedFields[key] = obj;
        }
    },
    hasField: function(key, arrayKey) {
        if (!_.isEmpty(arrayKey)) {
            if (!this.attachedFields[arrayKey]) {
                this.attachedFields[arrayKey] = {};
            }
            return key in this.attachedFields[arrayKey];
        } else {
            return key in this.attachedFields;
        }
    },
    getField: function(key, arrayKey) {
        if (!_.isEmpty(arrayKey)) {
            return this.attachedFields[arrayKey][key];
        } else {
            return this.attachedFields[key];
        }
    },
    clearFields: function() {
        this.attachedFields = {};
    },
    dispose: function() {}
});

KB.currentModule = {};

KB.currentArea = {};

KB.Views = {
    Modules: new KB.ViewsCollection(),
    Areas: new KB.ViewsCollection(),
    Context: new KB.ViewsCollection()
};

KB.Modules = new Backbone.Collection([], {
    model: KB.Backbone.ModuleModel
});

KB.Areas = new Backbone.Collection([], {
    model: KB.Backbone.AreaModel
});

KB.App = function() {
    function init() {
        KB.Modules.on("add", createModuleViews);
        KB.Areas.on("add", createAreaViews);
        KB.Modules.on("remove", removeModule);
        addViews();
        KB.FieldConfigs = new KB.Backbone.Common.FieldConfigsCollection(_.toArray(KB.payload.Fields));
        KB.Ui.init();
    }
    function addViews() {
        _.each(KB.payload.Areas, function(area) {
            KB.Areas.add(area);
        });
        _.each(KB.payload.Modules, function(module) {
            var m = KB.Modules.add(module);
        });
    }
    function createModuleViews(module) {
        KB.Views.Modules.add(module.get("mid"), new KB.Backbone.Backend.ModuleView({
            model: module,
            el: "#" + module.get("mid")
        }));
        KB.Ui.initTabs();
    }
    function createAreaViews(area) {
        KB.Views.Areas.add(area.get("id"), new KB.Backbone.Backend.AreaView({
            model: area,
            el: "#" + area.get("id") + "-container"
        }));
    }
    function removeModule(model) {
        KB.Views.Modules.remove(model.get("instance_id"));
    }
    return {
        init: init
    };
}(jQuery);

KB.App.init();

jQuery(document).ready(function() {
    if (KB.appData && !KB.appData.config.frontend) {
        KB.Views.Modules.ready();
    }
});