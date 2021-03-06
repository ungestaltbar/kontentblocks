/**
 * Main Controller
 */
//KB.FlexibleFields.Controller
var ToggleBoxItem = require('fields/controls/flexfields/ToggleBoxItem');
var SectionBoxItem = require('fields/controls/flexfields/SectionBoxItem');
var Factory = require('fields/controls/flexfields/FlexFieldsFactory');
var TinyMCE = require('common/TinyMCE');
var UI = require('common/UI');
var Logger = require('common/Logger');
var FlexFieldsCollection = require('fields/controls/flexfields/FlexFieldsCollection');
var tplSkeleton = require('templates/fields/FlexibleFields/skeleton.hbs');
var I18n = require('common/I18n');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    // setup the flexfield configuration as set in the parent object
    // finally this.Tabs holds an array of all tabs with setup fields reference objects
    this.parentView = options.parentView;
    this.active = false;
    this.Renderer = (this.model.get('renderer') == 'sections') ? SectionBoxItem : ToggleBoxItem;
    this.Fields = new FlexFieldsCollection();
    this.subviews = [];
    this.factory = new Factory({
      controller: this,
      model: this.model
    });
    Logger.Debug.log('Fields: Flexfields2 instance created and initialized'); // tell the developer that I'm here
  },
  events: {
    'click .kb-flexible-fields--js-add-item': 'addItem'
  },
  initialSetup: function () {
    var data, types;
    data = this.model.get('value'); // model equals FieldControlModel, value equals parent obj data for this field key

    types = this.model.get('fields');
    if (!_.isEmpty(data)) {
      _.each(data, function (dataobj, index) {
        if (!dataobj) {
          return;
        }
        if (!dataobj['_meta'].type) {
          dataobj['_meta'].type = 'default';
        }
        if (!types[dataobj['_meta'].type]) {
          return;
        }
        // factor item
        var item = this.factory.factorNewItem(data[dataobj['_meta'].uid], dataobj);
        // build view for item
        var view = new this.Renderer({
          controller: this,
          model: new Backbone.Model(item)
        });
        //collect views
        this.subviews.push(view);
        // render item
        this.$list.append(view.render());
        UI.initTabs();
        KB.Events.trigger('modal.recalibrate');
      }, this);
    }
    UI.initTabs();
    this.$list.sortable({
      handle: '.flexible-fields--js-drag-handle',
      start: function () {
        TinyMCE.removeEditors();
      },
      stop: function () {
        TinyMCE.restoreEditors();
      }
    });
    KB.Events.trigger('modal.recalibrate'); // tell the frontend modal to resize
    this._initialized = true; // flag init state
  },
  duplicateItem: function (model) {
    var itemId = model.get('itemId');
    var title = model.get('title') + ' (Copy)';
    var data = this.model.get('value'); // model equals FieldControlModel, value equals parent obj data for this field key
    if (!data[itemId]) {
      return false;
    }
    var itemData = JSON.parse(JSON.stringify(data[itemId]));
    if (!itemData['_meta']) {
      return false;
    }
    itemData['_meta']['uid'] = null;
    itemData['_meta']['title'] = title;

    var item = this.factory.factorNewItem(itemData, itemData);
    var view = new this.Renderer({
      controller: this,
      model: new Backbone.Model(item)
    });
    //collect views
    this.subviews.push(view);
    // render item
    this.$list.append(view.render());
    UI.initTabs();
    KB.Events.trigger('modal.recalibrate');

  },
  render: function () {
    if (this.active) {
      return null;
    }
    this.$el.append(tplSkeleton({
      i18n: I18n.getString('Refields.flexfields'),
      model: this.model.toJSON()
    }));
    this.setupElements();
    this.initialSetup();
    this.active = true;
  },
  derender: function () {
    this.trigger('derender'); // subviews mights listen
    this.subviews = [];
    this.active = false;
  },
  setupElements: function () {
    this.$list = this.$('.flexible-fields--item-list');
    this.$addButton = this.$('.kb-flexible-fields--js-add-item');
  },
  addItem: function (e) {
    var $btn = jQuery(e.currentTarget);
    var type = $btn.data('kbf-addtype');
    var item = this.factory.factorNewItem(null, {_meta: {type: type}});
    var view = new this.Renderer({
      controller: this,
      model: new Backbone.Model(item)
    });
    this.subviews.push(view);
    this.$list.append(view.render());
    UI.initTabs();
    KB.Events.trigger('modal.recalibrate');
  }
});
