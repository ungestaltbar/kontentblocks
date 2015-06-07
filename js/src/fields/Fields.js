var Fields = {};
// include Backbone events handler
_.extend(Fields, Backbone.Events);
// include custom functions
_.extend(Fields, {
  fields: {}, // 'collection' of fields
  /**
   * Register a fieldtype
   * @param id string Name of field
   * @param object field object
   */
  addEvent: function () {
    this.listenTo(KB, 'kb:ready', this.init);
    this.listenTo(this, 'newModule', this.newModule);
  },
  register: function (id, object) {
    _.extend(object, Backbone.Events);
    this.fields[id] = object;
  },
  registerObject: function (id, object) {
    _.extend(object, Backbone.Events);
    this.fields[id] = object;
  },
  init: function () {
    var that = this;
    _.each(this.fields, function (object) {
      // call init method if available
      if (object.hasOwnProperty('init')) {
        object.init.call(object);
      }
      // call field objects init method on 'update' event
      // fails gracefully if there is no update method
      object.listenTo(that, 'update', object.update);
      object.listenTo(that, 'frontUpdate', object.frontUpdate);
    });
  },
  newModule: function (ModuleView) {
    var that = this;
    // call field objects init method on 'update' event
    // fails gracefully if there is no update method
    ModuleView.listenTo(this, 'update', ModuleView.update);
    ModuleView.listenTo(this, 'frontUpdate', ModuleView.frontUpdate);
    setTimeout(function () {
      that.trigger('update');
    }, 750);
  },

  /**
   * Get method
   * @param id string fieldtype
   * @returns mixed field object or null
   */
  get: function (id) {
    if (this.fields[id]) {
      return this.fields[id];
    } else {
      return null;
    }
  }
});
Fields.addEvent();
module.exports = Fields;